import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  X,
  CheckCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getMyProfile } from '../../services/matchService';
import { getCurrentUser } from '../../services/databaseService';
import { getAppConfig } from '../../utils/storage';
import {
  loadChecklistFromFirebase,
  logInteraction
} from '../../services/firebaseService';
import { syncChecklistToCloud } from '../../App';
import {
  TribeAssignments,
  MatchProfile
} from '../../types';
import {
  AssignmentChecklist,
  TribeStatus,
  TribeReport,
  getStoredTribeAssignments,
  persistTribeAssignments,
  getStoredChecklistState,
  persistChecklistState,
  getStoredTribeStatus,
  persistTribeStatus,
  getStoredReports,
  persistReport,
  resetTribeStorage
} from '../../services/tribeStorage';
import { saveShareRecord } from '../../services/shareStorage';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import { ProgressBanner } from '../../components/ProgressBanner';
import { TribalLoadingAnimation } from '../../components/TribalAnimation';


const TribeAssignmentsView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const myProfile = useMemo(() => getMyProfile(), []);
  
  // Verificar si el matching estÃ¡ desbloqueado
  const [tribeProgress, setTribeProgress] = useState({ current: 0, target: 1000 });
  
  useEffect(() => {
    const checkProgress = async () => {
      try {
        const { getFirestoreInstance } = await import('../../services/firebaseService');
        const { doc, getDoc } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (!db) return;
        
        const statsRef = doc(db, 'system_stats', 'global');
        const snapshot = await getDoc(statsRef);
        const data = snapshot.data() || {};
        setTribeProgress({
          current: data.profilesCompleted || 0,
          target: data.profilesTarget || 1000
        });
      } catch (error) {
        console.error('Error verificando progreso:', error);
      }
    };
    checkProgress();
  }, []);
  
  const tribeUnlocked = tribeProgress.current >= tribeProgress.target;
  
  // Si no estÃ¡ desbloqueado, mostrar pantalla de bloqueo
  if (!tribeUnlocked) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-[#6161FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={48} className="text-[#6161FF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#181B34] mb-3">
            Â¡Pronto desbloquearemos tu Tribu!
          </h2>
          <p className="text-[#7C8193] mb-6">
            Estamos esperando llegar a <span className="font-bold text-[#6161FF]">1000 perfiles completos</span> para activar el matching inteligente 10+10.
          </p>
          <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-indigo-700">Rally Activo</span>
              <span className="text-xs text-red-500 font-semibold">â° Cierra pronto</span>
            </div>
            <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner mb-2">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max((tribeProgress.current / tribeProgress.target) * 100, 0.5)}%` }}
              />
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-black text-xl text-indigo-600">{tribeProgress.current}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-bold">{tribeProgress.target}</span>
              <span className="text-xs text-gray-500 ml-2">inscritos</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#6161FF] hover:bg-[#5050DD] text-white py-3 rounded-xl font-semibold transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }
  const [assignments, setAssignments] = useState<TribeAssignments>(() => getStoredTribeAssignments(myProfile.category, myProfile.id));
  const [checklist, setChecklist] = useState<AssignmentChecklist>(() => getStoredChecklistState(assignments));
  const [status, setStatus] = useState<TribeStatus>(() => getStoredTribeStatus());
  const [lastSynced, setLastSynced] = useState<string>(() => new Date().toLocaleString('es-CL'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState<TribeReport[]>(() => getStoredReports());
  const [reportingProfile, setReportingProfile] = useState<MatchProfile | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Estado para modal de cumplimiento
  const [showShareModal, setShowShareModal] = useState<{ profile: MatchProfile, type: 'shared_to' | 'received_from' } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado para modal de AnÃ¡lisis TRIBU X
  const [analysisProfile, setAnalysisProfile] = useState<MatchProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ insight: string; opportunities: string[]; icebreaker: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState({
    current: 0,
    target: 1000,
    remaining: 1000,
    percent: 0
  });
  const [showMilestoneToast, setShowMilestoneToast] = useState<string | null>(null);
  const milestoneRef = useRef<number>(0);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const { getFirestoreInstance } = await import('../../services/firebaseService');
        const { doc, onSnapshot } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (!db) return;

        const statsRef = doc(db, 'system_stats', 'global');
        unsubscribe = onSnapshot(statsRef, snapshot => {
          const data = snapshot.data() || {};
          const current = typeof data.profilesCompleted === 'number' ? data.profilesCompleted : 0;
          const target = typeof data.profilesTarget === 'number' ? data.profilesTarget : 1000;
          const percent = Math.min(100, Math.round((current / target) * 100));
          const remaining = Math.max(0, target - current);

          setGlobalProgress({ current, target, percent, remaining });
          setProgressLoading(false);

          const milestoneStep = 50;
          const previousMilestone = milestoneRef.current;
          const milestoneReached = Math.floor(current / milestoneStep);
          if (milestoneReached > previousMilestone && current < target) {
            milestoneRef.current = milestoneReached;
            const milestoneCount = milestoneReached * milestoneStep;
            setShowMilestoneToast(`ðŸŽ‰ Â¡${milestoneCount} perfiles completos!`);
            setTimeout(() => setShowMilestoneToast(null), 4000);
          }
        }, error => {
          console.error('Error escuchando system_stats/global:', error);
          setProgressLoading(false);
        });
      } catch (error) {
        console.error('Error inicializando escucha de progreso global:', error);
        setProgressLoading(false);
      }
    };

    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const matchingUnlocked = globalProgress.current >= globalProgress.target;
  const milestoneToast = showMilestoneToast && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#181B34] text-white text-sm py-2 px-6 rounded-xl z-50 animate-fadeIn shadow-lg">
      {showMilestoneToast}
    </div>
  );

  // Generar anÃ¡lisis con Azure AI cuando se abre el modal
  useEffect(() => {
    if (!analysisProfile) {
      setAnalysisResult(null);
      return;
    }

    const generateAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const { analyzeCompatibility } = await import('../../services/aiMatchingService');
        const result = await analyzeCompatibility(
          { id: myProfile.id, name: myProfile.name, companyName: myProfile.companyName, city: myProfile.location || '', category: myProfile.category, affinity: myProfile.category },
          { id: analysisProfile.id, name: analysisProfile.name, companyName: analysisProfile.companyName, city: analysisProfile.location || '', category: analysisProfile.category, affinity: analysisProfile.category }
        );

        if (result && result.analysis && result.analysis !== 'AnÃ¡lisis no disponible') {
          setAnalysisResult({
            insight: result.analysis,
            opportunities: result.opportunities || ['ColaboraciÃ³n en redes sociales', 'Referidos mutuos', 'Contenido conjunto'],
            icebreaker: result.icebreaker || `Â¡Hola ${analysisProfile.name.split(' ')[0]}! ðŸ‘‹ Soy parte de tu Tribu Impulsa. Me encanta lo que haces en ${analysisProfile.companyName}. Â¿Exploramos una colaboraciÃ³n? ðŸš€`
          });
        } else {
          // Fallback local
          setAnalysisResult({
            insight: `${analysisProfile.companyName} en ${analysisProfile.category || 'emprendimiento'} y ${myProfile.companyName} tienen audiencias complementarias. Sus clientes podrÃ­an beneficiarse de ambos servicios, creando oportunidades de referidos mutuos.`,
            opportunities: [
              `Sorteo conjunto: ${myProfile.companyName} regala algo de ${analysisProfile.companyName} a sus seguidores`,
              `Live de Instagram donde ambos comparten tips de sus industrias`,
              `Pack especial: Clientes de uno reciben descuento exclusivo en el otro`
            ],
            icebreaker: `Â¡Hola ${analysisProfile.name.split(' ')[0]}! ðŸ‘‹ Soy de ${myProfile.companyName} y te encontrÃ© en Tribu Impulsa. Me parece genial lo que hacen en ${analysisProfile.companyName}. Â¿Te interesarÃ­a explorar una colaboraciÃ³n? ðŸš€`
          });
        }
      } catch {
        // Fallback en caso de error
        setAnalysisResult({
          insight: `${analysisProfile.companyName} y ${myProfile.companyName} tienen potencial de colaboraciÃ³n. Ambos pueden beneficiarse de exponer sus marcas a nuevas audiencias.`,
          opportunities: ['ColaboraciÃ³n en redes sociales', 'Referidos mutuos', 'Contenido conjunto'],
          icebreaker: `Â¡Hola ${analysisProfile.name.split(' ')[0]}! ðŸ‘‹ Soy parte de tu Tribu Impulsa. Â¿Te interesa explorar una colaboraciÃ³n? ðŸš€`
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    generateAnalysis();
  }, [analysisProfile, myProfile]);

  // Cargar checklist desde Firebase al iniciar (sincronizaciÃ³n entre dispositivos)
  useEffect(() => {
    const loadFromFirebase = async () => {
      const firebaseData = await loadChecklistFromFirebase(myProfile.id);
      if (firebaseData && firebaseData.items) {
        // Merge con el checklist local
        setChecklist(prev => {
          const merged: AssignmentChecklist = {
            toShare: { ...prev.toShare },
            shareWithMe: { ...prev.shareWithMe }
          };
          // Aplicar items de Firebase
          Object.entries(firebaseData.items).forEach(([id, value]) => {
            if (id in merged.toShare) merged.toShare[id] = value as boolean;
            if (id in merged.shareWithMe) merged.shareWithMe[id] = value as boolean;
          });
          return merged;
        });
        console.log('âœ… Checklist sincronizado desde Firebase');
      }
    };
    loadFromFirebase();
  }, [myProfile.id]);

  useEffect(() => {
    persistTribeAssignments(assignments, myProfile.id);
  }, [assignments, myProfile.id]);

  useEffect(() => {
    persistChecklistState(checklist);
  }, [checklist]);

  useEffect(() => {
    persistTribeStatus(status);
  }, [status]);

  useEffect(() => {
    if (isSubmittingReport) return;
    setReports(getStoredReports());
  }, [isSubmittingReport]);

  const completion = useMemo(() => {
    const done = Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length;
    const total = assignments.toShare.length + assignments.shareWithMe.length;
    return Math.round((done / Math.max(total, 1)) * 100);
  }, [checklist, assignments]);

  // Estado automÃ¡tico basado en completion
  const isCompleted = completion === 100;
  const statusLabel = isCompleted ? 'Completado' : 'Pendiente';
  const statusStyle = isCompleted
    ? 'bg-[#E6FFF3] text-[#008A4E] border-[#00CA72]'
    : 'bg-[#FFF8E6] text-[#9D6B00] border-[#FFCC00]';

  const handleToggle = (list: keyof AssignmentChecklist, profileId: string) => {
    setChecklist(prev => {
      const next = {
        ...prev,
        [list]: {
          ...prev[list],
          [profileId]: !prev[list][profileId]
        }
      };
      persistChecklistState(next);

      // â˜ï¸ Sincronizar a Firestore (nube)
      syncChecklistToCloud(myProfile.id, next);

      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      resetTribeStorage();
      const nextAssignments = getStoredTribeAssignments(myProfile.category, myProfile.id);
      const nextChecklist = getStoredChecklistState(nextAssignments);
      setAssignments(nextAssignments);
      setChecklist(nextChecklist);
      setStatus('PENDIENTE');
      setLastSynced(new Date().toLocaleString('es-CL'));
      setIsRefreshing(false);
    }, 600);
  };

  // FunciÃ³n para registrar cumplimiento
  const handleShareComplete = (profile: MatchProfile, type: 'shared_to' | 'received_from', url: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    saveShareRecord({
      profileId: profile.id,
      profileName: profile.companyName,
      type,
      contentUrl: url,
      userId: currentUser.id
    });

    // Marcar como completado en el checklist
    const key = type === 'shared_to' ? 'toShare' : 'shareWithMe';
    setChecklist(prev => {
      const next = {
        ...prev,
        [key]: { ...prev[key], [profile.id]: true }
      };

      // â˜ï¸ Sincronizar checklist a Firestore
      syncChecklistToCloud(currentUser.id, next);

      return next;
    });

    // â˜ï¸ Registrar interacciÃ³n en Firestore
    logInteraction(currentUser.id, type, {
      targetId: profile.id,
      targetName: profile.companyName,
      contentUrl: url
    });

    setToastMessage(type === 'shared_to'
      ? `âœ… Registrado: compartiste a ${profile.companyName}`
      : `âœ… Registrado: ${profile.companyName} te compartiÃ³`
    );
    setTimeout(() => setToastMessage(null), 3000);
    setShowShareModal(null);
    setShareUrl('');
  };

  // Copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('ðŸ“‹ Enlace copiado');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const renderList = (title: string, subtitle: string, list: MatchProfile[], key: keyof AssignmentChecklist) => {
    const isToShare = key === 'toShare';
    const whatsappMessage = isToShare
      ? (profile: MatchProfile) => `Hola ${profile.name.split(' ')[0]}! Te acabo de compartir en mis redes. AquÃ­ estÃ¡ el enlace: `
      : (profile: MatchProfile) => `Hola ${profile.name.split(' ')[0]}! Vi que me compartiste, muchas gracias! Me podrÃ­as pasar el enlace?`;

    const completedCount = Object.entries(checklist[key]).filter(([id, done]) => done && list.some(p => p.id === id)).length;

    return (
      <div key={title} className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#181B34]">{title}</h3>
            <p className="text-[#7C8193] text-xs">{subtitle}</p>
          </div>
          <span className="text-sm font-semibold text-[#6161FF]">{completedCount}/{list.length}</span>
        </header>
        <div className="space-y-2">
          {list.map(profile => {
            const isCompleted = checklist[key][profile.id] ?? false;
            return (
              <div key={profile.id} className={`p-4 rounded-xl border transition ${isCompleted
                ? 'bg-[#E6FFF3] border-[#00CA72]/30'
                : 'bg-white border-[#E4E7EF]'
                }`}>
                {/* Row 1: Checkbox + Name + Category Tag */}
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    className="accent-[#00CA72] w-5 h-5 flex-shrink-0 mt-0.5"
                    checked={isCompleted}
                    onChange={() => handleToggle(key, profile.id)}
                  />
                  <div className="flex-1 min-w-0">
                    {/* MARCA/EMPRESA MÃS PROMINENTE */}
                    <h4 className="font-black text-base text-[#181B34] break-words leading-tight mb-0.5">
                      {profile.companyName || 'Sin nombre de empresa'}
                    </h4>
                    <p className="text-xs text-[#7C8193]">por {profile.name}</p>
                    {/* Tags de categorÃ­a y afinidad */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.625rem] font-semibold rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {profile.category || profile.subCategory || 'Emprendimiento'}
                      </span>
                      {profile.instagram && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.625rem] font-medium rounded-full bg-pink-50 text-pink-600">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/></svg>
                          @{profile.instagram.replace('@', '').split('/').pop()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Action buttons - WhatsApp directo al nÃºmero */}
                <div className="flex gap-2 pl-8 flex-wrap">
                  {/* YO DEBO IMPULSAR: "Yo compartÃ­" + "Avisarle" */}
                  {isToShare && (
                    <>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => setShowShareModal({ profile, type: 'shared_to' })}
                          className="text-[0.75rem] px-3 py-2 rounded-lg bg-[#00CA72] text-white font-medium"
                        >
                          Ya compartÃ­
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${(profile.phone || profile.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Â¡Hola ${profile.name.split(' ')[0]}! ðŸ‘‹ Soy parte de tu Tribu Impulsa este mes. Te acabo de compartir en mis redes ðŸš€ Â¿Me cuentas cÃ³mo te va con tu emprendimiento ${profile.companyName}?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.75rem] px-3 py-2 rounded-lg bg-[#25D366] text-white font-medium"
                      >
                        ðŸ’¬ WhatsApp
                      </a>
                    </>
                  )}

                  {/* ME IMPULSAN: WhatsApp para agradecer/preguntar */}
                  {!isToShare && (
                    <a
                      href={`https://wa.me/${(profile.phone || profile.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Â¡Hola ${profile.name.split(' ')[0]}! ðŸ‘‹ Vi que somos parte de la misma Tribu Impulsa este mes. Â¿Ya pudiste compartirme en tus redes? ðŸ™ Â¡Muchas gracias de antemano!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.75rem] px-3 py-2 rounded-lg bg-[#25D366] text-white font-medium"
                    >
                      ðŸ’¬ Enviar WhatsApp
                    </a>
                  )}

                  {/* AnÃ¡lisis Inteligente TRIBU X */}
                  <button
                    type="button"
                    onClick={() => setAnalysisProfile(profile)}
                    className="text-[0.75rem] px-3 py-2 rounded-lg bg-gradient-to-r from-[#6161FF] to-[#A78BFA] text-white font-medium"
                  >
                    ðŸ”® AnÃ¡lisis TRIBU X
                  </button>

                  {/* Ver perfil */}
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${profile.id}`)}
                    className="text-[0.75rem] px-3 py-2 rounded-lg bg-[#E91E63]/10 text-[#E91E63] font-medium"
                  >
                    Ver perfil
                  </button>

                  {/* Reportar */}
                  <button
                    type="button"
                    onClick={() => {
                      setReportingProfile(profile);
                      setReportNote('');
                    }}
                    className="text-[0.75rem] px-3 py-2 rounded-lg border border-[#FB275D]/40 text-[#FB275D]"
                  >
                    Reportar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Detectar si el perfil estÃ¡ incompleto (para mejor matching)
  const currentUser = getCurrentUser();
  const isProfileIncomplete = !currentUser?.scope || !currentUser?.comuna && currentUser?.scope === 'LOCAL' || !currentUser?.selectedRegions?.length && currentUser?.scope === 'REGIONAL';

  // Ya no bloqueamos Mi Tribu - mostramos el contenido con un banner de progreso arriba

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* Toast de notificaciÃ³n */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#181B34] text-white text-sm py-2 px-6 rounded-xl z-50 animate-fadeIn shadow-lg">
          {toastMessage}
        </div>
      )}
      {milestoneToast}

      {/* Banner de progreso Rally 1000 */}
      {!matchingUnlocked && (
        <div className="mx-4 mt-4">
          <ProgressBanner className="px-0" showFomo={true} />
        </div>
      )}

      {/* Banner de perfil incompleto */}
      {isProfileIncomplete && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#FF9500] to-[#FF6B00] rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">âš ï¸</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Completa tu perfil para mejor matching</h3>
              <p className="text-white/80 text-xs mt-1">
                Sin tu ubicaciÃ³n geogrÃ¡fica, el algoritmo no puede encontrar matches cercanos a ti.
              </p>
              <button
                onClick={() => navigate('/my-profile')}
                className="mt-3 px-4 py-2 bg-white text-[#FF6B00] rounded-lg text-xs font-bold hover:bg-white/90 transition"
              >
                Completar ahora â†’
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro de cumplimiento */}
      {showShareModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm"
          onClick={() => { setShowShareModal(null); setShareUrl(''); }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#181B34] mb-2">
              {showShareModal.type === 'shared_to' ? 'ðŸ“¤ Registrar que compartiste' : 'ðŸ“¥ Registrar que te compartieron'}
            </h3>
            <p className="text-sm text-[#7C8193] mb-4">
              {showShareModal.type === 'shared_to'
                ? `Pega el enlace del post donde compartiste a ${showShareModal.profile.companyName}`
                : `Pega el enlace donde ${showShareModal.profile.companyName} te compartiÃ³`
              }
            </p>

            <input
              type="url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
              className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6161FF] mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowShareModal(null); setShareUrl(''); }}
                className="flex-1 py-3 rounded-xl border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB] transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleShareComplete(showShareModal.profile, showShareModal.type, shareUrl)}
                disabled={!shareUrl.trim()}
                className="flex-1 py-3 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>

            <p className="text-[0.625rem] text-[#7C8193] mt-3 text-center">
              Este registro queda guardado para que el admin pueda verificarlo
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de AnÃ¡lisis TRIBU X - FULL SCREEN */}
      {analysisProfile && createPortal(
        <div
          className="fixed inset-0 bg-black/80 flex flex-col z-[99999] backdrop-blur-sm"
          onClick={() => setAnalysisProfile(null)}
        >
          <div
            className="bg-gradient-to-br from-[#F5F7FB] to-white w-full h-full flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header con gradiente fucsia/magenta - fixed */}
            <div className="bg-gradient-to-br from-[#6161FF] via-[#8B5CF6] to-[#C026D3] p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xl">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AnÃ¡lisis TRIBU X</h3>
                    <p className="text-white/80 text-xs truncate max-w-[180px]">{analysisProfile.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAnalysisProfile(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Loading state - AnimaciÃ³n Tribal Ã©pica FULLSCREEN */}
            {isAnalyzing && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a]">
                <TribalLoadingAnimation isLoading={isAnalyzing} duration={4500} />
              </div>
            )}

            {/* Contenido - scrollable (solo cuando no estÃ¡ cargando) */}
            {!isAnalyzing && (
              <div className="p-4 space-y-3 overflow-y-auto flex-1">

                {/* AnÃ¡lisis generado - PREMIUM LAYOUT */}
                {!isAnalyzing && analysisResult && (
                  <>
                    {/* Hero del anÃ¡lisis */}
                    <div className="text-center mb-2">
                      <h1 className="text-xl font-bold text-[#181B34] mb-1">
                        ðŸ”® AnÃ¡lisis de Sinergia
                      </h1>
                      <p className="text-sm text-[#7C8193]">
                        <span className="font-semibold text-[#6161FF]">{analysisProfile.companyName}</span> Ã— <span className="font-semibold text-[#8B5CF6]">Tu Negocio</span>
                      </p>
                    </div>

                    {/* Insight principal - Card destacada */}
                    <div className="bg-white rounded-2xl p-4 border border-[#E4E7EF] shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6161FF] to-[#8B5CF6] flex items-center justify-center">
                          <span className="text-white text-sm">ðŸ’¡</span>
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-[#6161FF]">Insight de IA</h2>
                      </div>
                      <p className="text-sm text-[#434343] leading-relaxed">
                        {analysisResult.insight.split('.').map((sentence, i) => {
                          if (!sentence.trim()) return null;
                          if (i === 0) return <span key={i} className="font-semibold text-[#181B34]">{sentence.trim()}. </span>;
                          return <span key={i}>{sentence.trim()}. </span>;
                        })}
                      </p>
                    </div>

                    {/* Oportunidades - Card con mejor jerarquÃ­a */}
                    <div className="bg-gradient-to-br from-[#6161FF]/5 via-[#8B5CF6]/5 to-[#C026D3]/5 rounded-2xl p-4 border border-[#8B5CF6]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00CA72] to-[#00B366] flex items-center justify-center">
                          <span className="text-white text-sm">ðŸŽ¯</span>
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-[#00CA72]">Oportunidades de ColaboraciÃ³n</h2>
                      </div>
                      <ul className="space-y-3">
                        {analysisResult.opportunities.slice(0, 3).map((opp, i) => {
                          const parts = opp.split(':');
                          const hasTitle = parts.length > 1;
                          return (
                            <li key={i} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00CA72]/20 text-[#00CA72] flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </span>
                              <div className="flex-1">
                                {hasTitle ? (
                                  <>
                                    <p className="font-semibold text-[#181B34] text-sm">{parts[0].trim()}</p>
                                    <p className="text-[#434343] text-xs leading-relaxed">{parts.slice(1).join(':').trim()}</p>
                                  </>
                                ) : (
                                  <p className="text-[#434343] text-sm leading-relaxed">{opp}</p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Rompe el hielo - Card WhatsApp mejorada */}
                    <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 rounded-2xl p-4 border border-[#25D366]/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                          <span className="text-white text-sm">ðŸ’¬</span>
                        </div>
                        <div>
                          <h2 className="text-sm font-bold uppercase tracking-wide text-[#25D366]">Rompe el Hielo</h2>
                          <p className="text-[10px] text-[#7C8193]">Mensaje sugerido por IA</p>
                        </div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-3 mb-3 border-l-4 border-[#25D366]">
                        <p className="text-sm text-[#434343] leading-relaxed italic">
                          "{analysisResult.icebreaker}"
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${(analysisProfile.phone || (analysisProfile as any).whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(analysisResult.icebreaker)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-[#20BA5C] transition shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Enviar mensaje a WhatsApp
                      </a>
                    </div>

                    {/* Footer con tips */}
                    <div className="bg-[#F5F7FB] rounded-xl p-3 border border-[#E4E7EF]">
                      <p className="text-[10px] text-[#7C8193] text-center">
                        <span className="font-semibold text-[#6161FF]">Pro tip:</span> Personaliza el mensaje antes de enviarlo para hacerlo mÃ¡s autÃ©ntico ðŸŽ¯
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      <header className="px-5 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#181B34]">Checklist 10+10</h1>
            <p className="text-sm text-[#7C8193]">Tu reciprocidad mensual</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${statusStyle}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="px-4 py-4 space-y-4">
        {/* Stats Cards - Acciones y Ayuda */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card: Acciones */}
          <div className="bg-[#6161FF] rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-white/80 text-xs font-medium">Acciones</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length}/{assignments.toShare.length + assignments.shareWithMe.length}
            </p>
            <span className="text-white/70 text-xs">
              Pendientes: {(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length)}
            </span>
          </div>

          {/* Card: Ayuda - Amarillo */}
          <div className="bg-[#FFCC00] rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[#181B34]/70 text-xs font-medium">Ayuda</span>
              <div className="w-8 h-8 rounded-full bg-[#181B34]/10 flex items-center justify-center">
                <HelpCircle size={16} className="text-[#181B34]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#181B34]">{reports.length}</p>
            <span className="text-[#181B34]/60 text-xs">Solicitudes enviadas</span>
          </div>
        </div>

        {/* Alert Card - if pending actions */}
        {(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length) > 0 && (
          <div className="bg-[#FB275D] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">
                Â¡{(assignments.toShare.length + assignments.shareWithMe.length) - (Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length)} emprendedores esperan tu colaboraciÃ³n!
              </p>
              <p className="text-white/70 text-xs">ConÃ©ctate con tu Tribu este mes</p>
            </div>
          </div>
        )}

        {/* Success Card - if all completed */}
        {completion === 100 && (
          <div className="bg-[#00CA72] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Â¡Checklist completado!</p>
              <p className="text-white/70 text-xs">Excelente trabajo este mes</p>
            </div>
          </div>
        )}

        {/* Progress Card - Solid color */}
        <div className="bg-[#6161FF] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-xs font-medium">Avance mensual</span>
            <span className="text-white text-xs">{Object.values(checklist.toShare).filter(Boolean).length + Object.values(checklist.shareWithMe).filter(Boolean).length} de {assignments.toShare.length + assignments.shareWithMe.length}</span>
          </div>
          <div className="flex items-end gap-4">
            <h2 className="text-4xl font-bold text-white">{completion}%</h2>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 rounded-lg bg-white border border-[#E4E7EF] text-sm font-medium text-[#181B34] hover:border-[#6161FF] transition"
          >
            Ver matches
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="py-2.5 px-4 rounded-lg bg-white border border-[#E4E7EF] text-sm text-[#7C8193] hover:border-[#6161FF] transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderList('Me impulsan a mÃ­', 'ðŸ“¥ LlÃ¡malos para preguntarles si ya te compartieron', assignments.shareWithMe, 'shareWithMe')}
          {renderList('Yo debo impulsar', 'ðŸ“¤ Comparte sus cuentas en tu IG antes del dÃ­a 20', assignments.toShare, 'toShare')}
        </div>
        {reports.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
            <h3 className="text-sm font-semibold text-[#181B34] mb-3">Reportes enviados</h3>
            <ul className="space-y-3 text-sm">
              {reports.slice(-3).reverse().map((report, idx) => (
                <li key={`${report.targetId}-${idx}`} className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EF]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-[#181B34]">{report.targetName || 'Emprendimiento'}</span>
                      <span className="text-[#7C8193] text-xs ml-2">({report.targetOwner || 'Usuario'})</span>
                    </div>
                    <span className="text-xs text-[#B3B8C6]">{report.timestamp}</span>
                  </div>
                  <p className="text-[#434343] text-sm mb-3">{report.reason}</p>
                  <a
                    href={`https://wa.me/${getAppConfig().whatsappSupport.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`ðŸš¨ REPORTE TRIBU IMPULSA\n\nEmprendimiento: ${report.targetName || 'N/A'}\nResponsable: ${report.targetOwner || 'N/A'}\nMotivo: ${report.reason}\nFecha: ${report.timestamp}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-[#00CA72] text-white rounded-full hover:bg-[#00B366] transition"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-4 h-4 filter invert brightness-200" alt="ws" />
                    Enviar por WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {reportingProfile && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 999999,
            }}
          >
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md space-y-4 shadow-2xl border border-[#E4E7EF]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#181B34]">Reportar a {reportingProfile.companyName}</h3>
                <button onClick={() => setReportingProfile(null)} className="text-[#7C8193] hover:text-[#181B34]"><X size={18} /></button>
              </div>
              <p className="text-sm text-[#7C8193]">Describe brevemente por quÃ© no cumpliÃ³ el compromiso.</p>
              <textarea
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] placeholder-[#B3B8C6] focus:outline-none focus:ring-2 focus:ring-[#6161FF]/30"
                rows={4}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Ej: No etiquetÃ³ en la fecha acordada"
              />
              <button
                disabled={!reportNote.trim() || isSubmittingReport}
                onClick={() => {
                  if (!reportingProfile) return;
                  setIsSubmittingReport(true);
                  const newReport: TribeReport = {
                    targetId: reportingProfile.id,
                    targetName: reportingProfile.companyName,
                    targetOwner: reportingProfile.name,
                    reason: reportNote.trim(),
                    timestamp: new Date().toLocaleString('es-CL')
                  };
                  persistReport(newReport);
                  setReports(prev => [...prev, newReport]);
                  setTimeout(() => {
                    setIsSubmittingReport(false);
                    setReportingProfile(null);
                  }, 300);
                }}
                className="w-full bg-gradient-to-r from-[#FB275D] to-[#FF6B6B] text-white font-semibold py-3 rounded-xl disabled:opacity-40 hover:shadow-lg transition"
              >
                {isSubmittingReport ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>,
          document.body
        )}
      </section>
    </div>
  );
};

// FunciÃ³n para comprimir imagen
const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedBase64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// 5. My Profile View (Editable)
const MyProfileView = ({ fontSize, setFontSize }: { fontSize: 'small' | 'medium' | 'large'; setFontSize: React.Dispatch<React.SetStateAction<'small' | 'medium' | 'large'>> }) => {
  const navigate = useNavigate();
  useSurveyGuard();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(getMyProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const currentUser = getCurrentUser();

  // Estados para selectores de matching (categorÃ­a, afinidad, geografÃ­a)
  const [editScope, setEditScope] = useState<'LOCAL' | 'REGIONAL' | 'NACIONAL'>(currentUser?.scope || 'NACIONAL');
  const [editSelectedRegionForComuna, setEditSelectedRegionForComuna] = useState<string>('');
  const [editSelectedRegions, setEditSelectedRegions] = useState<string[]>(currentUser?.selectedRegions || []);
  const [editComuna, setEditComuna] = useState<string>(currentUser?.comuna || '');
  const [editCategory, setEditCategory] = useState<string>(currentUser?.category || '');
  const [editAffinity, setEditAffinity] = useState<string>(currentUser?.affinity || '');
  const [editRevenue, setEditRevenue] = useState<string>(currentUser?.revenue || '');

  // Comunas filtradas por regiÃ³n seleccionada
  const editComunasDeRegion = editSelectedRegionForComuna
    ? REGIONS.find(r => r.id === editSelectedRegionForComuna)?.comunas || []
    : [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  // Estados para cambio de contraseÃ±a
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Estado para acceso secreto a Red (Directorio)
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [secretCodeError, setSecretCodeError] = useState('');

  // Estado para tamaÃ±o de letra (accesibilidad)
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  const handleSecretAccess = () => {
    if (secretCode === 'TRIBU2026') {
      navigate('/directory');
      setSecretCode('');
      setShowSecretInput(false);
    } else {
      setSecretCodeError('CÃ³digo incorrecto');
      setTimeout(() => setSecretCodeError(''), 2000);
    }
  };

  // FunciÃ³n para cambiar contraseÃ±a
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validaciones
    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseÃ±a actual');
      return;
    }

    // Verificar contraseÃ±a actual
    const user = getCurrentUser();
    if (!user) {
      setPasswordError('Error: usuario no encontrado');
      return;
    }

    // Buscar usuario y verificar contraseÃ±a
    const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    const userIndex = users.findIndex((u: { id: string }) => u.id === user.id);

    if (userIndex === -1) {
      setPasswordError('Error: usuario no encontrado');
      return;
    }

    const currentUserData = users[userIndex];
    if (currentUserData.password !== currentPassword && currentPassword !== 'TRIBU2026') {
      setPasswordError('ContraseÃ±a actual incorrecta');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseÃ±a debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseÃ±as no coinciden');
      return;
    }

    // Actualizar contraseÃ±a en localStorage
    users[userIndex].password = newPassword;
    localStorage.setItem('tribu_users', JSON.stringify(users));

    // Marcar que ya cambiÃ³ su contraseÃ±a (nunca mÃ¡s mostrar popup)
    localStorage.setItem(`password_changed_${user.id}`, 'true');

    // Sincronizar contraseÃ±a con Firebase (persistente entre dispositivos)
    try {
      const { updateUserPassword } = await import('../../services/firebaseService');
      const synced = await updateUserPassword(user.id, newPassword);
      if (synced) {
        console.log('âœ… ContraseÃ±a sincronizada con Firebase');
      }
    } catch (err) {
      console.log('âš ï¸ ContraseÃ±a guardada localmente (Firebase no disponible):', err);
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(false);
    }, 1500);
  };

  // Manejar upload de foto de perfil - SUBE A FIREBASE STORAGE
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('ðŸ“· Subiendo foto a la nube...');

      const { uploadProfileImage, validateImageFile } = await import('../../services/firebaseService');

      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setSaveMessage(`âŒ ${validation.error}`);
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Subir a Firebase Storage (ya comprime automÃ¡ticamente)
      const result = await uploadProfileImage(currentUser.id, file, 'avatar');

      if (result.success && result.url) {
        setProfile({ ...profile, avatarUrl: result.url });

        // TambiÃ©n actualizar en localStorage
        const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
        const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
        if (userIndex !== -1) {
          users[userIndex].avatarUrl = result.url;
          localStorage.setItem('tribu_users', JSON.stringify(users));
        }

        setSaveMessage('âœ… Foto subida correctamente');
      } else {
        setSaveMessage(`âŒ ${result.error || 'Error al subir foto'}`);
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error upload foto:', err);
      setSaveMessage('âŒ Error al subir imagen');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Manejar upload de banner/cover - SUBE A FIREBASE STORAGE
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setSaveMessage('ðŸ–¼ï¸ Subiendo banner a la nube...');

      const { uploadProfileImage, validateImageFile } = await import('../../services/firebaseService');

      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setSaveMessage(`âŒ ${validation.error}`);
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Subir a Firebase Storage
      const result = await uploadProfileImage(currentUser.id, file, 'cover');

      if (result.success && result.url) {
        setProfile({ ...profile, coverUrl: result.url });

        // TambiÃ©n actualizar en localStorage
        const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
        const userIndex = users.findIndex((u: { id: string }) => u.id === currentUser.id);
        if (userIndex !== -1) {
          users[userIndex].coverUrl = result.url;
          localStorage.setItem('tribu_users', JSON.stringify(users));
        }

        setSaveMessage('âœ… Banner subido correctamente');
      } else {
        setSaveMessage(`âŒ ${result.error || 'Error al subir banner'}`);
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error upload banner:', err);
      setSaveMessage('âŒ Error al subir banner');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Agregar etiqueta
  const handleAddTag = () => {
    if (newTag.trim() && !profile.tags.includes(newTag.trim())) {
      setProfile({ ...profile, tags: [...profile.tags, newTag.trim()] });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  // Eliminar etiqueta
  const handleRemoveTag = (tagToRemove: string) => {
    setProfile({ ...profile, tags: profile.tags.filter(t => t !== tagToRemove) });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSaveMessage('ðŸ’¾ Guardando cambios...');

    // Datos a guardar (incluye campos de matching y redes sociales)
    const profileData = {
      name: profile.name,
      companyName: profile.companyName,
      bio: profile.bio,
      businessDescription: (profile as any).businessDescription || currentUser?.businessDescription || '',
      phone: profile.phone || profile.whatsapp || '',
      whatsapp: profile.whatsapp || profile.phone || '',
      // Redes sociales
      instagram: profile.instagram,
      tiktok: (profile as any).tiktok || '',
      facebook: (profile as any).facebook || '',
      twitter: (profile as any).twitter || '',
      website: profile.website,
      // UbicaciÃ³n
      city: profile.location?.split(',')[0]?.trim() || '',
      location: profile.location,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
      tags: profile.tags,
      // Campos de MATCHING - usando los selectores
      category: editCategory || profile.category,
      affinity: editAffinity || (profile as any).affinity || profile.category,
      scope: editScope,
      comuna: editComuna,
      selectedRegions: editSelectedRegions,
      revenue: editRevenue,
    };

    // ðŸ” DEBUG: Verificar quÃ© se estÃ¡ guardando
    console.log('ðŸ’¾ GUARDANDO PERFIL - Campos crÃ­ticos:', {
      bio: {
        value: profileData.bio,
        length: profileData.bio?.length || 0,
        valid: profileData.bio && profileData.bio.length >= 50
      },
      businessDescription: {
        value: profileData.businessDescription,
        length: profileData.businessDescription?.length || 0,
        valid: profileData.businessDescription && profileData.businessDescription.length >= 60
      },
      revenue: {
        value: profileData.revenue,
        valid: Boolean(profileData.revenue)
      }
    });

    // Guardar cambios localmente
    const updated = updateUser(currentUser.id, profileData);

    if (updated) {
      // Sincronizar con Firebase - OBLIGATORIO, con reintentos
      let firebaseSaved = false;
      let retries = 3;

      while (!firebaseSaved && retries > 0) {
        try {
          const { syncProfileToCloud, logInteraction, syncUserToFirebase } = await import('../../services/firebaseService');

          setSaveMessage(`â˜ï¸ Guardando en la nube... (intento ${4 - retries}/3)`);

          // Sincronizar a la colecciÃ³n users (PRINCIPAL)
          await syncUserToFirebase(currentUser.id, profileData);

          // Sincronizar perfil completo
          await syncProfileToCloud({
            id: currentUser.id,
            ...profileData,
            subCategory: profile.subCategory,
          });

          // Registrar la interacciÃ³n
          await logInteraction(currentUser.id, 'profile_updated', {
            fields: Object.keys(profileData),
            timestamp: new Date().toISOString()
          });

          firebaseSaved = true;
          setSaveMessage('âœ… Perfil guardado y sincronizado');

          // ðŸ” DEBUG: Verificar quÃ© se cargÃ³ desde Firebase
          try {
            const firestore = await import('firebase/firestore');
            const { getFirestoreInstance } = await import('../../services/firebaseService');
            const db = getFirestoreInstance();
            if (db) {
              const userDoc = await firestore.getDoc(firestore.doc(db, 'users', currentUser.id));
              const userData = userDoc.data();
              console.log('â˜ï¸ DATOS EN FIREBASE:', {
                bio: userData?.bio,
                businessDescription: userData?.businessDescription,
                revenue: userData?.revenue
              });
            }
          } catch (err) {
            console.error('Error verificando datos en Firebase:', err);
          }

          // Forzar recarga del estado del usuario para actualizar banners
          setCurrentUser(currentUser.id);
          const updatedUser = getCurrentUser();
          if (updatedUser) {
            setProfile(updatedUser);
            // Sincronizar estado de completitud del perfil
            const validation = validateUserProfile(updatedUser);
            if (validation.isComplete !== updatedUser.profileComplete) {
              await syncProfileCompletionState(updatedUser, validation.isComplete);
            }

            // Forzar recarga de datos desde localStorage
            const users = JSON.parse(localStorage.getItem('tribu_users') || '[]');
            const reloadedUser = users.find((u: { id: string }) => u.id === currentUser.id);
            if (reloadedUser) {
              setCurrentUser(reloadedUser);
              setProfile({
                ...reloadedUser,
                location: reloadedUser.city || '',
                tags: reloadedUser.tags || []
              });
              
              // Actualizar estados de ediciÃ³n
              setEditRevenue(reloadedUser.revenue || '');
              setEditCategory(reloadedUser.category || '');
              setEditAffinity(reloadedUser.affinity || '');
              
              console.log('ðŸ”„ Perfil recargado despuÃ©s de guardar');
            }
          }
        } catch (error) {
          retries--;
          console.error(`âŒ Error guardando en Firebase (quedan ${retries} intentos):`, error);
          if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000)); // Esperar 1s antes de reintentar
          }
        }
      }

      if (!firebaseSaved) {
        // Si despuÃ©s de 3 intentos no se guardÃ³, mostrar advertencia CLARA
        setSaveMessage('âš ï¸ Guardado local. Presiona Sincronizar para subir a la nube.');
      }
    } else {
      setSaveMessage('âŒ Error al guardar');
    }

    setTimeout(() => setSaveMessage(null), 3000);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* Header with Cover */}
      <div className="h-72 w-full relative group">
        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F5F7FB]"></div>

        {/* BotÃ³n editar banner - Arriba a la derecha del cover (con safe-area para iPhone) */}
        {isEditing && (
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-14 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all z-40 text-sm"
          >
            <Edit2 size={16} />
            <span className="font-medium">Cambiar banner</span>
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
          onChange={handleBannerUpload}
          className="hidden"
        />

        {/* Top Navigation Actions (con safe-area para iPhone) */}
        <div className="absolute top-14 left-4 right-4 z-30 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <button
            onClick={async () => {
              setSaveMessage('â˜ï¸ Sincronizando con la nube...');
              try {
                const { syncUserToFirebase } = await import('../../services/firebaseService');
                const localUser = getCurrentUser();

                // PASO 1: PRIMERO subir datos locales a Firebase (para no perderlos)
                if (localUser) {
                  setSaveMessage('â¬†ï¸ Subiendo datos locales a la nube...');
                  await syncUserToFirebase(localUser.id, {
                    name: localUser.name,
                    companyName: localUser.companyName,
                    bio: localUser.bio,
                    businessDescription: (localUser as any).businessDescription,
                    phone: localUser.phone,
                    whatsapp: localUser.whatsapp,
                    instagram: localUser.instagram,
                    website: localUser.website,
                    city: localUser.city,
                    category: localUser.category,
                    affinity: localUser.affinity,
                    scope: localUser.scope,
                    comuna: localUser.comuna,
                    selectedRegions: localUser.selectedRegions,
                    revenue: localUser.revenue,
                    avatarUrl: localUser.avatarUrl,
                    coverUrl: localUser.coverUrl,
                  });
                  console.log('âœ… Datos locales subidos a Firebase');
                }

                // PASO 2: Luego descargar datos frescos de Firebase
                setSaveMessage('â¬‡ï¸ Descargando datos de la nube...');
                const session = getStoredSession();
                if (session?.email) {
                  const freshUser = await getUserFromFirebaseByEmail(session.email);
                  if (freshUser) {
                    setCurrentUser(freshUser.id);
                    setProfile(getMyProfile());
                    const user = getCurrentUser();
                    if (user) {
                      setEditScope(user.scope || 'NACIONAL');
                      setEditSelectedRegions(user.selectedRegions || []);
                      setEditComuna(user.comuna || '');
                      setEditCategory(user.category || '');
                      setEditAffinity(user.affinity || '');
                      setEditRevenue(user.revenue || '');
                    }
                    setSaveMessage('âœ… SincronizaciÃ³n completa');
                  } else {
                    setSaveMessage('âš ï¸ No se encontrÃ³ usuario en la nube');
                  }
                }
              } catch (error) {
                console.error('Error sincronizando:', error);
                setSaveMessage('âŒ Error al sincronizar');
              }
              setTimeout(() => setSaveMessage(null), 3000);
            }}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#181B34] hover:bg-white transition-colors border border-[#E4E7EF] flex items-center gap-2 shadow-md"
          >
            <RefreshCw size={18} />
            <span className="text-sm font-medium">Sincronizar</span>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">

          {/* Avatar - Simple, sin cÃ­rculo extra */}
          <div className="relative -mt-20 mb-4 z-20">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <div className="text-center">
                  <Edit2 size={20} className="mx-auto mb-1" />
                  <span className="text-xs">Cambiar foto</span>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Main Info */}
          <div className="text-center mb-4 w-full">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="bg-[#F5F7FB] text-center text-2xl font-bold text-[#181B34] rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                />
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-[#F5F7FB] text-center text-[#434343] font-medium text-lg rounded-lg p-2 w-full outline-none border border-[#E4E7EF] focus:border-[#6161FF] focus:ring-2 focus:ring-[#6161FF]/20"
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">{profile.companyName}</h2>
                <p className="text-[#7C8193] font-medium text-lg">{profile.name}</p>
              </>
            )}

            {/* Badge de categorÃ­a (solo lectura) - mostrar giro principal limpio */}
            {!isEditing && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {/* Giro principal */}
                <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 text-[#6161FF] px-3 py-1.5 rounded-full">
                  {(editCategory || profile.category || '').split(' - ')[0].split('  ')[0] || 'Emprendimiento'}
                </span>
                {/* SubcategorÃ­a si existe */}
                {((editCategory || profile.category || '').includes(' - ') || (editCategory || profile.category || '').includes('  ')) && (
                  <span className="text-xs font-semibold bg-[#00CA72]/10 border border-[#00CA72]/30 text-[#00CA72] px-3 py-1.5 rounded-full">
                    {(editCategory || profile.category || '').split(' - ')[1]?.split('  ')[0] ||
                      (editCategory || profile.category || '').split('  ')[1] || ''}
                  </span>
                )}
              </div>
            )}

            {/* BotÃ³n Editar Perfil - Centrado debajo de categorÃ­a */}
            <div className="mt-4">
              {isEditing ? (
                <div className="flex justify-center gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-medium">
                    <X size={16} /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Guardar
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-full border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 flex items-center gap-2 text-sm font-medium mx-auto">
                  <Edit2 size={14} /> Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Mensaje de guardado */}
          {saveMessage && (
            <div className={`w-full p-3 rounded-xl text-center text-sm font-medium mb-4 ${saveMessage.includes('âœ…') || saveMessage.includes('ðŸ“·')
              ? 'bg-[#E6FFF3] text-[#008A4E] border border-[#00CA72]/30'
              : 'bg-[#FFF0F3] text-[#FB275D] border border-[#FB275D]/30'
              }`}>
              {saveMessage}
            </div>
          )}

          {/* Campos editables del perfil */}
          {isEditing && (
            <div className="w-full mb-6 space-y-4">
              {/* Datos bÃ¡sicos */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Datos BÃ¡sicos</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Nombre del Emprendimiento</label>
                  <input
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    placeholder="Mi Empresa"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Tu Nombre</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">WhatsApp</label>
                  <input
                    value={profile.whatsapp || profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">BiografÃ­a Corta (mÃ­n. 50 caracteres)</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Cuenta un poco sobre ti..."
                    rows={2}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] resize-none"
                  />
                  <p className="text-xs text-[#7C8193] mt-1">{(profile.bio || '').length}/50 caracteres</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">DescripciÃ³n de tu Negocio (mÃ­n. 60 caracteres)</label>
                  <textarea
                    value={(profile as any).businessDescription || ''}
                    onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value } as any)}
                    placeholder="Describe quÃ© hace tu emprendimiento, quÃ© productos/servicios ofreces..."
                    rows={3}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF] resize-none"
                  />
                  <p className="text-xs text-[#7C8193] mt-1">{((profile as any).businessDescription || '').length}/60 caracteres</p>
                </div>
              </div>

              {/* CategorÃ­a y Afinidad - SELECTORES para matching */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">ðŸŽ¯ CategorÃ­a e Intereses (para Matching)</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Giro/CategorÃ­a del Negocio</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  >
                    <option value="">Selecciona tu giro...</option>
                    {[...TRIBE_CATEGORY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Afinidad/Intereses</label>
                  <select
                    value={editAffinity}
                    onChange={(e) => setEditAffinity(e.target.value)}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  >
                    <option value="">Selecciona tu afinidad...</option>
                    {[...AFFINITY_OPTIONS].sort((a, b) => a.localeCompare(b, 'es')).map((aff, idx) => (
                      <option key={idx} value={aff}>{aff}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">FacturaciÃ³n Mensual</label>
                  <select
                    value={editRevenue}
                    onChange={(e) => setEditRevenue(e.target.value)}
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  >
                    <option value="">Selecciona rango...</option>
                    <option value="Menos de $500.000">Menos de $500.000</option>
                    <option value="$500.000 - $2.000.000">$500.000 - $2.000.000</option>
                    <option value="$2.000.000 - $5.000.000">$2.000.000 - $5.000.000</option>
                    <option value="$5.000.000 - $10.000.000">$5.000.000 - $10.000.000</option>
                    <option value="MÃ¡s de $10.000.000">MÃ¡s de $10.000.000</option>
                  </select>
                </div>
              </div>

              {/* GeografÃ­a - SELECTORES para matching */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">ðŸ“ Alcance GeogrÃ¡fico (para Matching)</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Alcance del Servicio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['LOCAL', 'REGIONAL', 'NACIONAL'].map(scope => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => setEditScope(scope as 'LOCAL' | 'REGIONAL' | 'NACIONAL')}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${editScope === scope ? 'bg-[#6161FF] text-white' : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'}`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LOCAL: Selector RegiÃ³n -> Comuna */}
                {editScope === 'LOCAL' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">RegiÃ³n</label>
                      <select
                        value={editSelectedRegionForComuna}
                        onChange={(e) => {
                          setEditSelectedRegionForComuna(e.target.value);
                          setEditComuna(''); // Reset comuna al cambiar regiÃ³n
                        }}
                        className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                      >
                        <option value="">Selecciona regiÃ³n...</option>
                        {REGIONS.map(region => (
                          <option key={region.id} value={region.id}>{region.shortName}</option>
                        ))}
                      </select>
                    </div>
                    {editSelectedRegionForComuna && (
                      <div>
                        <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Comuna</label>
                        <select
                          value={editComuna}
                          onChange={(e) => setEditComuna(e.target.value)}
                          className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                        >
                          <option value="">Selecciona comuna...</option>
                          {editComunasDeRegion.map(comuna => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* REGIONAL: Multi-select de regiones */}
                {editScope === 'REGIONAL' && (
                  <div className="animate-fadeIn">
                    <label className="text-xs font-bold uppercase text-[#7C8193] mb-2 block">Regiones donde operas</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {REGIONS.map(region => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => {
                            if (editSelectedRegions.includes(region.id)) {
                              setEditSelectedRegions(editSelectedRegions.filter(r => r !== region.id));
                            } else {
                              setEditSelectedRegions([...editSelectedRegions, region.id]);
                            }
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${editSelectedRegions.includes(region.id)
                            ? 'bg-[#6161FF] text-white'
                            : 'bg-white border border-[#E4E7EF] text-[#434343] hover:border-[#6161FF]'
                            }`}
                        >
                          {editSelectedRegions.includes(region.id) ? 'âœ“ ' : ''}{region.shortName}
                        </button>
                      ))}
                    </div>
                    {editSelectedRegions.length > 0 && (
                      <p className="text-xs text-[#6161FF] mt-2">{editSelectedRegions.length} regiÃ³n(es) seleccionada(s)</p>
                    )}
                  </div>
                )}

                {editScope === 'NACIONAL' && (
                  <p className="text-sm text-[#7C8193] italic">OperaciÃ³n a nivel nacional - matchearÃ¡s con todos</p>
                )}
              </div>

              {/* Redes sociales */}
              <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#6161FF] tracking-wide">Redes Sociales</h4>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Instagram</label>
                  <input
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@tu_instagram"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">TikTok</label>
                  <input
                    value={(profile as any).tiktok || ''}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value } as any)}
                    placeholder="@tu_tiktok"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Facebook</label>
                  <input
                    value={(profile as any).facebook || ''}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value } as any)}
                    placeholder="facebook.com/tu_pagina"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">X (Twitter)</label>
                  <input
                    value={(profile as any).twitter || ''}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value } as any)}
                    placeholder="@tu_usuario"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#7C8193] mb-1 block">Sitio Web</label>
                  <input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="www.tusitio.cl"
                    className="w-full bg-white text-[#181B34] rounded-lg p-3 outline-none border border-[#E4E7EF] focus:border-[#6161FF]"
                  />
                </div>
              </div>

              {/* Botones Cancelar/Guardar al final del formulario */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E4E7EF] p-4 -mx-4 mt-4 flex justify-center gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-full bg-[#FB275D]/10 text-[#FB275D] hover:bg-[#FB275D]/20 flex items-center gap-2 text-sm font-semibold">
                  <X size={16} /> Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 rounded-full bg-[#00CA72] text-white hover:bg-[#00B366] flex items-center gap-2 text-sm font-semibold disabled:opacity-50 shadow-lg">
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {!isEditing && profile && (
            <div className="flex flex-wrap gap-3 w-full mb-6">
              <a
                href={`https://www.instagram.com/${profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E91E63] via-[#C13584] to-[#F77737] text-white font-semibold hover:opacity-90 transition shadow-md"
              >
                <Instagram size={16} /> Instagram
              </a>
              {(profile as any).tiktok && (
                <a
                  href={`https://www.tiktok.com/@${(profile as any).tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                  TikTok
                </a>
              )}
              {(profile as any).facebook && (
                <a
                  href={`https://facebook.com/${(profile as any).facebook.replace('facebook.com/', '').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </a>
              )}
              {(profile as any).twitter && (
                <a
                  href={`https://x.com/${(profile as any).twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000000] text-white font-semibold hover:bg-[#1a1a1a] transition shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X
                </a>
              )}
              <a
                href={`https://wa.me/${getAppConfig().whatsappSupport.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Conoce a ${profile.companyName} (${profile.category}). Mira su perfil en Tribu Impulsa.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00CA72] text-white font-semibold hover:bg-[#00B366] transition shadow-md"
              >
                <Share2 size={16} /> WhatsApp
              </a>
            </div>
          )}

          {/* Details - Solo visible cuando NO estamos editando */}
          {!isEditing && (
            <div className="space-y-8 w-full text-left">
              <div>
                <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">BiografÃ­a</h3>
                <p className="text-[#434343] leading-relaxed text-lg">
                  {profile.bio}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                  <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF] shrink-0"><MapPin size={20} /></div>
                  <div className="text-sm min-w-0">
                    <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">UbicaciÃ³n</span>
                    <span className="font-medium text-[#181B34]">{profile.location}</span>
                  </div>
                </div>
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF] hover:border-[#00CA72] transition-colors"
                >
                  <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72] shrink-0"><Globe size={20} /></div>
                  <div className="text-sm min-w-0 flex-1">
                    <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">Sitio Web</span>
                    <span className="font-medium text-[#181B34] block truncate">{profile.website}</span>
                  </div>
                  <ArrowRight size={16} className="text-[#7C8193] shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Secciones siempre visibles */}
          <div className="space-y-8 w-full text-left">
            <div>
              <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors flex items-center gap-2">
                    #{tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[#FB275D] hover:text-[#FB275D] ml-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && !showTagInput && (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-sm border border-dashed border-[#6161FF]/40 px-4 py-2 rounded-lg text-[#6161FF] hover:bg-[#6161FF]/10"
                  >
                    + Agregar
                  </button>
                )}
                {isEditing && showTagInput && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Nueva etiqueta"
                      className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-3 py-2 rounded-lg outline-none focus:border-[#6161FF] w-32"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="text-[#00CA72] hover:text-[#00B366]"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => { setShowTagInput(false); setNewTag(''); }}
                      className="text-[#7C8193] hover:text-[#FB275D]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÃ“N MEMBRESÃA */}
            <MembershipSection userId={currentUser?.id || ''} />

            {/* BotÃ³n de Notificaciones Push */}
            <NotificationButton />

            {/* Opciones de cuenta */}
            <div className="pt-4 border-t border-[#E4E7EF] space-y-3">
              {/* TamaÃ±o de letra (Accesibilidad) */}
              <button
                onClick={() => setShowFontSizeModal(true)}
                className="w-full py-3 rounded-xl border border-[#00CA72]/30 text-[#00CA72] hover:bg-[#00CA72]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Type size={16} /> TamaÃ±o de Letra: {fontSize === 'small' ? 'PequeÃ±o' : fontSize === 'medium' ? 'Mediano' : 'Grande'}
              </button>

              {/* Cambiar contraseÃ±a */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Lock size={16} /> Cambiar ContraseÃ±a
              </button>

              {/* Cerrar sesiÃ³n */}
              <button
                onClick={() => {
                  clearStoredSession();
                  localStorage.removeItem('tribu_session');
                  localStorage.removeItem('algorithm_seen');
                  navigate('/');
                }}
                className="w-full py-3 rounded-xl border border-[#FB275D]/30 text-[#FB275D] hover:bg-[#FB275D]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <LogOut size={16} /> Cerrar SesiÃ³n
              </button>

              {/* Acceso secreto a Red/Directorio - Solo visible en desarrollo */}
              {import.meta.env.DEV && (
                <div className="pt-4 border-t border-dashed border-[#E4E7EF]">
                  <button
                    onClick={() => setShowSecretInput(!showSecretInput)}
                    className="text-xs text-[#B3B8C6] hover:text-[#7C8193] transition-colors"
                  >
                    ðŸ” Acceso administrador
                  </button>
                  {showSecretInput && (
                    <div className="mt-2 space-y-2 animate-fadeIn">
                      <input
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSecretAccess()}
                        placeholder="CÃ³digo de acceso..."
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-lg p-2 text-sm"
                      />
                      {secretCodeError && (
                        <p className="text-xs text-[#FB275D]">{secretCodeError}</p>
                      )}
                      <button
                        onClick={handleSecretAccess}
                        className="w-full py-2 rounded-lg bg-[#181B34] text-white text-sm"
                      >
                        Acceder a Red Completa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal cambio de contraseÃ±a */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-[#6161FF]" />
                    Cambiar ContraseÃ±a
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">ContraseÃ±a actual</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="Tu contraseÃ±a actual"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Nueva contraseÃ±a</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="MÃ­nimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#434343] mb-1.5 uppercase">Confirmar nueva contraseÃ±a</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-sm"
                        placeholder="Repetir contraseÃ±a"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-[#FB275D] text-sm">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-[#00CA72] text-sm">âœ… ContraseÃ±a actualizada correctamente</p>
                    )}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowPasswordModal(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setPasswordSuccess(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 py-2.5 rounded-xl bg-[#6161FF] text-white hover:bg-[#5151EE]"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal tamaÃ±o de letra */}
            {showFontSizeModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-[#181B34] mb-4 flex items-center gap-2">
                    <Type size={20} className="text-[#00CA72]" />
                    TamaÃ±o de Letra
                  </h3>
                  <p className="text-sm text-[#7C8193] mb-4">Ajusta el tamaÃ±o del texto para mejor legibilidad</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'small'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-sm font-medium">PequeÃ±o</span>
                      <span className="text-xs text-[#7C8193]">16px</span>
                    </button>
                    <button
                      onClick={() => setFontSize('medium')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'medium'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-base font-medium">Mediano</span>
                      <span className="text-xs text-[#7C8193]">20px</span>
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${fontSize === 'large'
                        ? 'border-[#00CA72] bg-[#00CA72]/10 text-[#00CA72]'
                        : 'border-[#E4E7EF] text-[#434343] hover:border-[#00CA72]/50'
                        }`}
                    >
                      <span className="text-lg font-medium">Grande</span>
                      <span className="text-xs text-[#7C8193]">24px</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFontSizeModal(false)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-[#00CA72] text-white hover:bg-[#00B366] font-medium"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de SecciÃ³n de MembresÃ­a
const MembershipSection = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<{
    status: string;
    paymentDate?: string;
    expiresAt?: string;
    paymentMethod?: string;
    amount?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapMembership = (data: CloudMembership | null, statusFallback?: string) => {
    if (!data) return null;
    return {
      status: data.status || statusFallback || 'invitado',
      paymentDate: data.paymentDate || data.trialStartDate,
      expiresAt: data.expiresAt || data.trialEndDate,
      paymentMethod: data.paymentMethod,
      amount: data.amount
    };
  };

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const hydrate = async () => {
      const localStatus = localStorage.getItem(`membership_status_${userId}`);
      const localPayment = localStorage.getItem(`membership_payment_${userId}`);
      if (localStatus && mounted) {
        const paymentData = localPayment ? JSON.parse(localPayment) : {};
        setMembership({
          status: localStatus,
          paymentDate: paymentData.date,
          paymentMethod: paymentData.method,
          amount: paymentData.amount,
          expiresAt: paymentData.expiresAt
        });
      }

      try {
        const membershipData = await fetchMembershipFromCloud(userId);
        if (!mounted) return;
        if (membershipData) {
          syncMembershipToLocalCache(userId, membershipData);
          setMembership(mapMembership(membershipData));
        } else {
          setMembership(localStatus ? { status: localStatus } : null);
        }
      } catch (error) {
        console.log('Error cargando membresÃ­a:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Formatear fecha
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear precio - Usar precio de configuraciÃ³n como fallback
  const config = getAppConfig();
  const formatPrice = (amount?: number) => {
    const value = amount || config.membershipPrice;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calcular dÃ­as restantes
  const getDaysRemaining = () => {
    if (!membership?.expiresAt) return null;
    const expiry = new Date(membership.expiresAt);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="pt-4 border-t border-[#E4E7EF]">
        <div className="animate-pulse bg-[#F5F7FB] rounded-2xl h-32"></div>
      </div>
    );
  }

  const isMember = membership?.status === 'miembro' || membership?.status === 'admin';
  const isTrial = membership?.status === 'trial';
  const daysRemaining = getDaysRemaining();

  return (
    <div className="pt-4 border-t border-[#E4E7EF]">
      <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">MembresÃ­a</h3>

      <div className={`rounded-2xl p-4 border ${isMember ? 'bg-gradient-to-br from-[#6161FF]/5 to-[#00CA72]/5 border-[#6161FF]/20' : 'bg-[#F5F7FB] border-[#E4E7EF]'}`}>
        {/* Estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMember ? 'bg-[#6161FF]/10' : 'bg-[#7C8193]/10'}`}>
              <Crown size={20} className={isMember ? 'text-[#6161FF]' : 'text-[#7C8193]'} />
            </div>
            <div>
              <p className="font-semibold text-[#181B34]">
                {membership?.status === 'admin' ? 'Administrador' : isMember ? 'Miembro Activo' : 'Invitado'}
              </p>
              <p className="text-xs text-[#7C8193]">
                {isMember ? 'Acceso completo' : 'Acceso limitado'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${membership?.status === 'admin' ? 'bg-[#FFCC00]/20 text-[#B38F00]' :
            isMember ? 'bg-[#00CA72]/20 text-[#008A4E]' : 'bg-[#7C8193]/20 text-[#7C8193]'
            }`}>
            {membership?.status === 'admin' ? 'ADMIN' : isMember ? 'ACTIVO' : 'PENDIENTE'}
          </span>
        </div>

        {/* Detalles si es miembro */}
        {isMember && (
          <div className="space-y-2 text-sm border-t border-[#E4E7EF]/50 pt-3">
            {/* Plan especial para Beta PÃºblica */}
            {membership?.paymentMethod === 'beta_publica' || membership?.paymentMethod === 'trial' || membership?.paymentMethod === 'promo_trial_1_peso' ? (
              <>
                <div className="bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 rounded-xl p-3 mb-2">
                  <p className="text-[#00CA72] font-bold text-center">
                    ðŸŽ‰ Trial Activo - CÃ­rculo Emprendedor
                  </p>
                  <p className="text-xs text-[#7C8193] text-center mt-1">
                    PromociÃ³n Beta Tribu Impulsa
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Activado:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">VÃ¡lido hasta:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Fecha de pago:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.paymentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">MÃ©todo:</span>
                  <span className="text-[#181B34] font-medium capitalize">{membership?.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Monto:</span>
                  <span className="text-[#181B34] font-medium">{formatPrice(membership?.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8193]">Vence:</span>
                  <span className="text-[#181B34] font-medium">{formatDate(membership?.expiresAt)}</span>
                </div>
              </>
            )}
            {daysRemaining !== null && daysRemaining <= 30 && (
              <div className="mt-2 p-2 bg-[#FFCC00]/10 rounded-lg">
                <p className="text-xs text-[#B38F00] font-medium">
                  âš ï¸ Tu membresÃ­a vence en {daysRemaining} dÃ­as
                </p>
              </div>
            )}
          </div>
        )}

        {/* BotÃ³n para invitados */}
        {!isMember && (
          <button
            onClick={() => navigate('/membership')}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00CA72] to-[#00B366] text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Gift size={18} />
            Â¡Probar por $1!
          </button>
        )}

        {/* Administrar suscripciÃ³n - Solo para miembros */}
        {isMember && <SubscriptionManager userId={userId} currentPlan={membership?.paymentMethod || 'mensual'} expiresAt={membership?.expiresAt} />}
      </div>
    </div>
  );
};

// Componente para administrar suscripciÃ³n
const SubscriptionManager = ({ userId, currentPlan, expiresAt }: { userId: string; currentPlan: string; expiresAt?: string }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState<'mensual' | 'semestral' | 'anual'>('mensual');
  const config = getAppConfig();

  // Verificar si el usuario ya usÃ³ el trial de $1 (oportunidad Ãºnica)
  const hasUsedTrial = localStorage.getItem(`trial_used_${userId}`) === 'true' || currentPlan === 'trial' || currentPlan === 'promo_trial';

  // Fecha lÃ­mite para trial: 31 dic 2025
  const TRIAL_END_DATE = new Date('2025-12-31T23:59:59');
  const isTrialAvailable = new Date() <= TRIAL_END_DATE && !hasUsedTrial;

  // Planes disponibles - PRECIOS FINALES
  const PLANS = [
    {
      id: 'mensual',
      name: 'Mensual',
      price: 19990,
      originalPrice: null,
      duration: '1 mes',
      months: 1,
      description: 'RenovaciÃ³n mes a mes',
      badge: null,
      savings: null
    },
    {
      id: 'semestral',
      name: 'Semestral',
      price: 99990, // 6 meses, paga 5
      originalPrice: 119940, // 6 x 19990
      duration: '6 meses',
      months: 6,
      description: 'Â¡1 mes gratis!',
      badge: 'ðŸ”¥ Popular',
      savings: 19950
    },
    {
      id: 'anual',
      name: 'Anual',
      price: 179990, // 12 meses, paga 9
      originalPrice: 239880, // 12 x 19990
      duration: '12 meses',
      months: 12,
      description: 'Â¡3 meses gratis!',
      badge: 'ðŸ’Ž Mejor valor',
      savings: 59890
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Crear preferencia de pago en MercadoPago
  const handleSelectPlan = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);

    try {
      // Obtener email del usuario actual
      const currentUser = getCurrentUser();
      const userEmail = currentUser?.email || '';

      if (!userEmail) {
        alert('Error: No se pudo obtener tu email. Por favor recarga la pÃ¡gina.');
        setIsProcessing(false);
        return;
      }

      // Llamar al endpoint de crear preferencia
      console.log('ðŸ” Iniciando pago MercadoPago (PaywallScreen):', {
        userId,
        userEmail,
        planId: plan.id
      });

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userEmail: userEmail,
          planId: plan.id
        })
      });

      console.log('ðŸ“¥ Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('ðŸ“¦ Response data:', data);

      if (!response.ok) {
        console.error('âŒ Error en respuesta:', data);
        alert(`Error: ${data.error || 'Error desconocido'}\n${data.details ? JSON.stringify(data.details, null, 2) : ''}`);
        return;
      }

      if (data.initPoint) {
        console.log('âœ… Redirigiendo a MercadoPago:', data.initPoint);
        // Redirigir a MercadoPago
        window.location.href = data.initPoint;
      } else {
        console.error('âŒ No se recibiÃ³ initPoint:', data);
        alert('Error: No se pudo crear el pago. Intenta de nuevo o contacta soporte.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexiÃ³n. Intenta de nuevo.');
    }

    setIsProcessing(false);
  };

  // Procesar trial de $1
  const handleTrialSubscription = async () => {
    setIsProcessing(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.email) {
        alert('Error: No se pudo obtener tu email.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userEmail: currentUser.email,
          userName: currentUser.name,
          planId: selectedTrialPlan
        })
      });

      const data = await response.json();

      if (data.initPoint) {
        // Marcar que intentÃ³ usar el trial (se confirmarÃ¡ en webhook)
        localStorage.setItem(`trial_used_${userId}`, 'true');
        window.location.href = data.initPoint;
      } else if (data.error) {
        alert(`Error: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexiÃ³n. Intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  // Cancelar suscripciÃ³n
  const handleCancelSubscription = async () => {
    setIsProcessing(true);

    try {
      const { getFirestoreInstance } = await import('../../services/firebaseService');
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();

      if (db) {
        await updateDoc(doc(db, 'memberships', userId), {
          autoRenew: false,
          cancelledAt: new Date().toISOString(),
          status: 'cancelled_pending' // Mantiene acceso hasta que expire
        });

        localStorage.setItem(`membership_autorenew_${userId}`, 'false');
        alert('Tu suscripciÃ³n no se renovarÃ¡ automÃ¡ticamente. TendrÃ¡s acceso hasta ' +
          (expiresAt ? new Date(expiresAt).toLocaleDateString('es-CL') : 'el fin del perÃ­odo'));
      }
    } catch (error) {
      console.error('Error cancelando:', error);
      alert('Error al cancelar. Contacta soporte.');
    }

    setIsProcessing(false);
    setShowCancelConfirm(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#E4E7EF]/50">
      <button
        onClick={() => setShowPlans(!showPlans)}
        className="w-full py-2.5 rounded-xl border border-[#6161FF]/30 text-[#6161FF] hover:bg-[#6161FF]/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <CreditCard size={16} />
        {showPlans ? 'Cerrar opciones' : 'Administrar SuscripciÃ³n'}
      </button>

      {showPlans && (
        <div className="mt-4 space-y-3 animate-fadeIn">

          {/* Oferta Trial $1 - Solo si estÃ¡ disponible */}
          {isTrialAvailable && (
            <div className="relative rounded-xl border-2 border-[#00CA72] bg-gradient-to-r from-[#00CA72]/10 to-[#6161FF]/10 p-4 mb-4">
              <span className="absolute -top-2.5 left-3 bg-[#00CA72] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                ðŸŽ OFERTA ÃšNICA
              </span>
              <div className="text-center mb-3">
                <p className="text-2xl font-black text-[#00CA72]">$1</p>
                <p className="text-sm text-[#434343] font-medium">1 mes completo de Tribu Impulsa</p>
                <p className="text-xs text-[#7C8193]">DespuÃ©s continÃºa con el plan que elijas</p>
              </div>

              {/* Selector de plan futuro */}
              <div className="flex gap-1 mb-3">
                {(['mensual', 'semestral', 'anual'] as const).map(planId => (
                  <button
                    key={planId}
                    onClick={() => setSelectedTrialPlan(planId)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTrialPlan === planId
                      ? 'bg-[#6161FF] text-white'
                      : 'bg-white border border-[#E4E7EF] text-[#7C8193]'
                      }`}
                  >
                    {planId === 'mensual' ? 'Mensual' : planId === 'semestral' ? '6 meses' : 'Anual'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTrialSubscription}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00CA72] to-[#00B366] text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Procesando...' : 'Â¡Pagar $1 y Comenzar!'}
              </button>
              <p className="text-[9px] text-[#7C8193] text-center mt-2">
                DespuÃ©s de 30 dÃ­as se cobra el plan {selectedTrialPlan}. Cancela cuando quieras.
              </p>
              <p className="text-[8px] text-[#B3B8C6] text-center mt-1">
                *DÃ©bito/prepago no soportan cobros recurrentes (limitaciÃ³n bancos Chile).
              </p>
            </div>
          )}

          <h4 className="text-xs font-bold uppercase text-[#7C8193] tracking-wide">
            {isTrialAvailable ? 'O paga el plan completo' : 'Renovar o Cambiar Plan'}
          </h4>

          {/* Planes */}
          <div className="space-y-2">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-3 transition-all ${plan.badge ? 'border-[#6161FF] bg-[#6161FF]/5' : 'border-[#E4E7EF] bg-white'
                  }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 right-3 bg-[#6161FF] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#181B34]">{plan.name}</p>
                    <p className="text-xs text-[#7C8193]">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    {plan.originalPrice && (
                      <p className="text-xs text-[#7C8193] line-through">{formatPrice(plan.originalPrice)}</p>
                    )}
                    <p className="font-bold text-[#181B34]">{formatPrice(plan.price)}</p>
                    {plan.savings && (
                      <p className="text-[10px] text-[#00CA72] font-medium">Ahorras {formatPrice(plan.savings)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-[#6161FF] to-[#8B5CF6] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : `Pagar con MercadoPago`}
                </button>
              </div>
            ))}
          </div>

          {/* Cancelar suscripciÃ³n */}
          <div className="pt-3 border-t border-dashed border-[#E4E7EF]">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2 text-xs text-[#7C8193] hover:text-[#FB275D] transition-colors"
              >
                Cancelar renovaciÃ³n automÃ¡tica
              </button>
            ) : (
              <div className="bg-[#FB275D]/5 rounded-xl p-3 space-y-2">
                <p className="text-sm text-[#FB275D] font-medium">Â¿Seguro que deseas cancelar?</p>
                <p className="text-xs text-[#7C8193]">
                  MantendrÃ¡s acceso hasta que expire tu perÃ­odo actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-[#E4E7EF] text-[#434343] text-sm"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded-lg bg-[#FB275D] text-white text-sm font-medium disabled:opacity-50"
                  >
                    {isProcessing ? 'Cancelando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// NotificationButton extraÃ­do a ./components/common/NotificationButton.tsx
// MatchAnalysis, getStoredAnalysis, saveAnalysis, generateMatchAnalysisPrompt extraÃ­dos a ./services/matchAnalysisService.ts

const MatchAnalysisSection = ({ profileId, profileData }: { profileId: string; profileData: MatchProfile }) => {
  const [analysis, setAnalysis] = useState<EnrichedAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const myProfile = getMyProfile();

  // Verificar si ya existe anÃ¡lisis guardado al montar
  useEffect(() => {
    const stored = getStoredAnalysis(profileId);
    if (stored) {
      try {
        // Intentar parsear como objeto enriquecido
        const parsed = typeof stored.analysis === 'string' && stored.analysis.startsWith('{')
          ? JSON.parse(stored.analysis)
          : null;
        if (parsed && parsed.insight) {
          setAnalysis(parsed);
        } else {
          // Migrar anÃ¡lisis antiguo a formato nuevo
          setAnalysis({
            insight: stored.analysis,
            opportunities: ['ColaboraciÃ³n en redes sociales', 'Referidos mutuos'],
            icebreaker: `Â¡Hola! Vi tu emprendimiento en Tribu Impulsa y creo que podrÃ­amos colaborar. Â¿Te interesa conversar?`
          });
        }
        setHasGenerated(true);
      } catch {
        setHasGenerated(false);
      }
    }
  }, [profileId]);

  // Generar anÃ¡lisis inteligente local - ESPECÃFICO para cada match
  const generateSmartAnalysis = (me: MatchProfile, target: MatchProfile): EnrichedAnalysis => {
    const sameLocation = me.location === target.location;
    const meCategory = me.category || 'emprendimiento';
    const targetCategory = target.category || 'emprendimiento';
    const meName = me.companyName || me.name;
    const targetName = target.companyName || target.name;

    // Insight ÃšNICO basado en la combinaciÃ³n especÃ­fica de categorÃ­as
    let insight = '';

    // AnÃ¡lisis especÃ­fico por tipo de negocio
    if (targetCategory.includes('Paisajismo') || targetCategory.includes('JardÃ­n')) {
      insight = `${targetName} puede atraer clientes que valoran el bienestar y la naturaleza - exactamente el perfil que busca servicios como los de ${meName}. Una colaboraciÃ³n donde ${targetName} recomiende tus servicios a sus clientes (y viceversa) podrÃ­a generar leads de alta calidad para ambos.`;
    } else if (targetCategory.includes('Belleza') || targetCategory.includes('EstÃ©tica')) {
      insight = `Los clientes de ${targetName} buscan verse y sentirse bien - una audiencia perfecta para ${meName}. PodrÃ­an crear experiencias conjuntas de bienestar o packs que combinen sus servicios para maximizar el valor percibido.`;
    } else if (targetCategory.includes('Marketing') || targetCategory.includes('Digital')) {
      insight = `${targetName} tiene expertise en visibilidad digital que podrÃ­a potenciar la presencia online de ${meName}. A cambio, ${meName} podrÃ­a ser un caso de Ã©xito o referencia para ${targetName}.`;
    } else if (targetCategory.includes('ConsultorÃ­a') || targetCategory.includes('Coaching')) {
      insight = `${targetName} trabaja con emprendedores que podrÃ­an necesitar exactamente lo que ofrece ${meName}. Esta conexiÃ³n podrÃ­a generar referidos de calidad en ambas direcciones.`;
    } else if (targetCategory.includes('Salud') || targetCategory.includes('KinesiologÃ­a')) {
      insight = `${targetName} y ${meName} comparten una audiencia interesada en bienestar integral. Sus clientes naturalmente podrÃ­an beneficiarse de ambos servicios, creando un ecosistema de salud completo.`;
    } else if (targetCategory.includes('GastronomÃ­a') || targetCategory.includes('Alimentos')) {
      insight = `${targetName} tiene acceso a una audiencia que valora experiencias de calidad. Un evento conjunto o colaboraciÃ³n de contenido podrÃ­a exponer ambas marcas a nuevos clientes potenciales.`;
    } else {
      insight = `${targetName} en ${targetCategory} y ${meName} en ${meCategory} tienen audiencias complementarias sin competir directamente. Sus clientes podrÃ­an beneficiarse de ambos servicios, creando oportunidades de referidos mutuos.`;
    }

    if (sameLocation) {
      insight += ` Al estar ambos en ${me.location}, pueden coordinar eventos presenciales o activaciones conjuntas.`;
    }

    // Oportunidades ESPECÃFICAS para este match
    const opportunities = [
      `Sorteo conjunto: ${meName} regala un servicio/producto de ${targetName} a sus seguidores (y viceversa)`,
      `Contenido colaborativo: Live de Instagram donde ambos comparten tips de sus industrias`,
      `Pack especial: Clientes de ${targetName} reciben descuento exclusivo en ${meName}`
    ];

    // Mensaje rompehielos personalizado
    const firstName = target.name?.split(' ')[0] || 'Hola';
    const icebreaker = `Â¡Hola ${firstName}! ðŸ‘‹ Soy de ${meName} y te encontrÃ© en Tribu Impulsa. Me parece que lo que hacen en ${targetName} es genial y creo que nuestras audiencias podrÃ­an beneficiarse mutuamente. Â¿Te interesarÃ­a explorar un sorteo cruzado o alguna colaboraciÃ³n? Â¡Creo que podrÃ­a funcionar muy bien! ðŸš€`;

    return {
      insight,
      opportunities,
      icebreaker
    };
  };

  // FunciÃ³n para generar anÃ¡lisis con delay realista
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);

    // Delay variable de 3-5 segundos para simular "pensando"
    const thinkingTime = 3000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    try {
      // Intentar usar Azure OpenAI primero
      const { analyzeCompatibility } = await import('../../services/aiMatchingService');
      const result = await analyzeCompatibility(
        { id: myProfile.id, name: myProfile.name, companyName: myProfile.companyName, city: myProfile.location || '', category: myProfile.category, affinity: myProfile.category },
        { id: profileData.id, name: profileData.name, companyName: profileData.companyName, city: profileData.location || '', category: profileData.category, affinity: profileData.category }
      );

      // Verificar que el resultado sea vÃ¡lido y no sea el mensaje de error genÃ©rico
      const isValidResult = result &&
        result.analysis &&
        result.analysis !== 'AnÃ¡lisis no disponible' &&
        result.opportunities &&
        result.opportunities.length > 0;

      if (isValidResult) {
        // Usar icebreaker del LLM si existe, o generar uno bÃ¡sico
        const llmIcebreaker = result.icebreaker ||
          `Â¡Hola ${profileData.name.split(' ')[0]}! ðŸ‘‹ Vi tu negocio ${profileData.companyName} y me encantÃ³. Â¿Te interesa explorar una colaboraciÃ³n? ðŸ¤`;

        const enriched: EnrichedAnalysis = {
          insight: result.analysis,
          opportunities: result.opportunities,
          icebreaker: llmIcebreaker
        };
        console.log('âœ… AnÃ¡lisis LLM completo:', enriched);
        setAnalysis(enriched);
        saveAnalysis(profileId, JSON.stringify(enriched));
      } else {
        // LLM no disponible o respuesta invÃ¡lida - usar fallback local inteligente
        throw new Error('Using local fallback');
      }
    } catch {
      // Usar fallback inteligente local (siempre funciona)
      console.log('âœ… Usando anÃ¡lisis local enriquecido');
      const smartAnalysis = generateSmartAnalysis(myProfile, profileData);
      setAnalysis(smartAnalysis);
      saveAnalysis(profileId, JSON.stringify(smartAnalysis));
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };

  // Generar URL de WhatsApp con mensaje pre-escrito
  const getWhatsAppUrl = () => {
    if (!analysis) return '#';
    const phone = profileData.phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(analysis.icebreaker);
    return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  // Estado de carga con animaciÃ³n Ã©pica
  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#6161FF]/20">
        <TribalLoadingAnimation isLoading={true} duration={4500} />
      </div>
    );
  }

  // Mostrar anÃ¡lisis enriquecido
  if (analysis) {
    return (
      <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#181B34] block">AnÃ¡lisis de Compatibilidad</span>
            <span className="text-xs text-[#7C8193]">Generado por Tribu X</span>
          </div>
        </div>

        {/* Insight principal */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#6161FF] mb-2">ðŸ’¡ Insight</h4>
          <p className="text-sm text-[#434343] leading-relaxed">{analysis.insight}</p>
        </div>

        {/* Oportunidades */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF]">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#00CA72] mb-2">ðŸŽ¯ Oportunidades concretas</h4>
          <ul className="space-y-2">
            {analysis.opportunities.map((opp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#434343]">
                <span className="text-[#00CA72] mt-0.5">â€¢</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Romper el hielo */}
        <div className="bg-[#25D366]/10 rounded-xl p-4 border border-[#25D366]/30">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[#25D366] mb-2">ðŸ’¬ Rompe el hielo</h4>
          <p className="text-sm text-[#434343] leading-relaxed mb-3 italic">"{analysis.icebreaker}"</p>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#20BA5C] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Enviar mensaje
          </a>
        </div>
      </div>
    );
  }

  // BotÃ³n para generar anÃ¡lisis
  return (
    <div className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-2xl p-5 border border-[#6161FF]/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-[#181B34] block">Â¿Es buen match?</span>
          <span className="text-xs text-[#7C8193]">Descubre sinergias y oportunidades</span>
        </div>
      </div>
      <button
        onClick={handleGenerateAnalysis}
        className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
      >
        <Sparkles size={18} />
        Analizar compatibilidad
      </button>
    </div>
  );
};

// 5. Full Profile Detail View (Other User)

export default TribeAssignmentsView;

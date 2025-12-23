import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { getMyProfile, generateMockMatches } from '../../services/matchService';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import { getCurrentUser, createReminder, updateOnboardingProgress } from '../../services/databaseService';
import { changeUserPassword, markFirstLoginComplete } from '../../services/realUsersData';
import { validateUserProfile } from '../../utils/validation';
import { OnboardingModal } from '../../components/common/OnboardingModal';
import { PasswordChangeModal } from '../../components/auth/PasswordChangeModal';
import { useConfetti } from '../../components/Confetti';
import { getTribeStatsSnapshot } from '../../services/tribeStorage';
import { ProgressBanner } from '../../components/ProgressBanner';
import { ProfileReminderBanner } from '../../components/common/ProfileReminderBanner';

// Helper para verificar si el onboarding está completo
const isOnboardingComplete = (userId: string): boolean => {
  return localStorage.getItem(`onboarding_complete_${userId}`) === 'true';
};

const markOnboardingComplete = (userId: string): void => {
  localStorage.setItem(`onboarding_complete_${userId}`, 'true');
};


const Dashboard = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  // Use current user profile for icon
  const myProfile = getMyProfile();
  // Generar matches usando usuarios REALES
  const matches = generateMockMatches(myProfile.category, myProfile.id);
  const tribeStats = getTribeStatsSnapshot(myProfile.category, myProfile.id);

  // ðŸŽ‰ Confeti para nuevos registros
  const { triggerConfetti, ConfettiComponent } = useConfetti();
  
  // Detectar si es un registro reciente (dentro de los Ãºltimos 30 segundos)
  useEffect(() => {
    const isNewRegistration = localStorage.getItem('tribu_new_registration');
    if (isNewRegistration) {
      // Disparar confeti
      setTimeout(() => triggerConfetti(), 500);
      // Limpiar el flag
      localStorage.removeItem('tribu_new_registration');
    }
  }, [triggerConfetti]);

  // Onboarding state
  const currentUser = getCurrentUser();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!currentUser) return false;
    return !isOnboardingComplete(currentUser.id);
  });

  // Password change modal for first login
  const [showPasswordChange, setShowPasswordChange] = useState(() => {
    return localStorage.getItem('show_password_change') === 'true';
  });

  const handleOnboardingComplete = () => {
    if (currentUser) {
      updateOnboardingProgress(currentUser.id, 'viewedWelcome');
      updateOnboardingProgress(currentUser.id, 'viewedTribeExplainer');
      updateOnboardingProgress(currentUser.id, 'viewedChecklistTutorial');
      updateOnboardingProgress(currentUser.id, 'viewedProfileSetup');
      createReminder(currentUser.id, 'welcome');
    }
    setShowOnboarding(false);
  };

  const handlePasswordChange = async (newPassword: string) => {
    if (currentUser) {
      changeUserPassword(currentUser.id, newPassword);
      // Marcar que ya cambiÃ³ su contraseÃ±a (nunca mÃ¡s mostrar el popup)
      localStorage.setItem(`password_changed_${currentUser.id}`, 'true');

      // Sincronizar con Firebase
      try {
        const { updateUserPassword } = await import('../../services/firebaseService');
        await updateUserPassword(currentUser.id, newPassword);
      } catch (err) {
        console.log('âš ï¸ ContraseÃ±a guardada localmente');
      }
    }
    localStorage.removeItem('show_password_change');
    setShowPasswordChange(false);
  };

  const handleSkipPasswordChange = () => {
    if (currentUser) {
      markFirstLoginComplete(currentUser.id);
    }
    localStorage.removeItem('show_password_change');
    setShowPasswordChange(false);
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      {/* ðŸŽ‰ Confeti de bienvenida para nuevos registros */}
      <ConfettiComponent />

      {/* Password Change Modal (first login) */}
      {showPasswordChange && !showOnboarding && (
        <PasswordChangeModal onComplete={handlePasswordChange} onSkip={handleSkipPasswordChange} />
      )}

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Banner de perfil incompleto */}
      {!showOnboarding && !showPasswordChange && (!currentUser?.scope || (!currentUser?.comuna && currentUser?.scope === 'LOCAL') || (!currentUser?.selectedRegions?.length && currentUser?.scope === 'REGIONAL')) && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#FF9500] to-[#FF6B00] rounded-xl shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ðŸ“</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Â¿DÃ³nde estÃ¡ tu negocio?</h3>
              <p className="text-white/80 text-xs mt-1">
                Completa tu ubicaciÃ³n para que el algoritmo encuentre matches cercanos a ti.
              </p>
              <button
                onClick={() => navigate('/my-profile')}
                className="mt-3 px-4 py-2 bg-white text-[#FF6B00] rounded-lg text-xs font-bold hover:bg-white/90 transition"
              >
                Completar perfil â†’
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Liquid Glass iOS 26 with safe area */}
      <header className="px-5 pb-5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <div className="w-10 h-10" />

        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-[#181B34]">Hola, {myProfile.name.split(' ')[0]}</h1>
          <p className="text-[#7C8193] text-sm">Tu comunidad de impulso</p>
        </div>

        <button
          onClick={() => navigate('/my-profile')}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E4E7EF] hover:border-[#6161FF] transition-colors"
        >
          <img
            src={myProfile.avatarUrl}
            alt="Me"
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Progreso global hacia 1.000 perfiles */}
      <ProgressBanner tone="light" />

      {/* Banner de recordatorio si perfil incompleto */}
      <ProfileReminderBanner />

      {/* Tip del DÃ­a */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-[#F5F7FB] to-white rounded-xl p-4 border border-[#E4E7EF]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFCC00]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">ðŸ’¡</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#7C8193] mb-1">TIP DEL DÃA</p>
              <p className="text-sm text-[#181B34] leading-relaxed">
                {(() => {
                  const tips = [
                    "Los emprendedores que comparten 3+ veces por semana crecen un 40% mÃ¡s rÃ¡pido en redes.",
                    "Una story mencionando a otro emprendedor genera 2x mÃ¡s engagement que una publicaciÃ³n normal.",
                    "El mejor horario para compartir en Chile es entre 12:00 y 14:00 hrs.",
                    "Agregar una recomendaciÃ³n genuina al compartir aumenta la credibilidad de ambos.",
                    "Los emprendedores con checklist completo reciben 60% mÃ¡s shares de vuelta.",
                    "Responder stories de tu tribu fortalece la relaciÃ³n y genera reciprocidad.",
                    "Un mensaje de agradecimiento despuÃ©s de ser compartido genera conexiones duraderas."
                  ];
                  const dayIndex = new Date().getDate() % tips.length;
                  return tips[dayIndex];
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CÃ³mo Funciona - Onboarding Accesible */}
      <div className="px-4 mb-4">
        <details open className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl border border-[#6161FF]/20 overflow-hidden group">
          <summary className="p-4 cursor-pointer list-none flex items-center justify-between hover:bg-[#6161FF]/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6161FF] to-[#00CA72] flex items-center justify-center">
                <HelpCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#181B34]">Â¿CÃ³mo funciona Tribu Impulsa?</p>
                <p className="text-xs text-[#7C8193]">GuÃ­a rÃ¡pida del sistema 10+10</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#7C8193] group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-4 pb-4 space-y-3 border-t border-[#E4E7EF]/50">
            <div className="pt-3 space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#6161FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Conoce tu Tribu</p>
                  <p className="text-xs text-[#7C8193]">Cada mes recibes 10 emprendedores asignados para impulsar</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#00CA72] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Comparte y Colabora</p>
                  <p className="text-xs text-[#7C8193]">Etiqueta y comparte a tus 10 asignados en tus redes sociales</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#FFCC00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#181B34] text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Recibe Impulso</p>
                  <p className="text-xs text-[#7C8193]">Otros 10 emprendedores diferentes te compartirÃ¡n a ti</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#E91E63] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#181B34]">Crece en Comunidad</p>
                  <p className="text-xs text-[#7C8193]">Mayor visibilidad, networking real y oportunidades de negocio</p>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F7FB] rounded-lg p-3 mt-2">
              <p className="text-xs text-[#7C8193]">
                ðŸ’¡ <span className="font-medium">Tip:</span> ConÃ©ctate por WhatsApp con tu Tribu para coordinar cÃ³mo compartirse mutuamente. Â¡La comunicaciÃ³n es clave!
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Logros y GamificaciÃ³n */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#181B34]">Tus Logros</h2>
          <span className="text-xs text-[#7C8193]">Nivel {Math.min(5, Math.floor(tribeStats.completed / 4) + 1)}</span>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 border border-[#E4E7EF] mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7C8193]">Progreso mensual</span>
            <span className="text-xs font-semibold text-[#6161FF]">{Math.round((tribeStats.completed / Math.max(tribeStats.total, 1)) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#E4E7EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6161FF] to-[#00CA72] rounded-full transition-all duration-500"
              style={{ width: `${(tribeStats.completed / Math.max(tribeStats.total, 1)) * 100}%` }}
            />
          </div>
          <p className="text-[0.625rem] text-[#7C8193] mt-2">
            {tribeStats.total - tribeStats.completed > 0
              ? `${tribeStats.total - tribeStats.completed} acciones mÃ¡s para completar este mes`
              : 'Â¡Felicidades! Completaste todas las acciones'}
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Badge 1: Primera acciÃ³n */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 1 ? 'bg-[#00CA72]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 1 ? 'bg-[#00CA72]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 1 ? 'ðŸš€' : 'ðŸ”’'}</span>
            </div>
            <span className={`text-[0.5625rem] text-center ${tribeStats.completed >= 1 ? 'text-[#00CA72] font-semibold' : 'text-[#B3B8C6]'}`}>
              Primera acciÃ³n
            </span>
          </div>

          {/* Badge 2: 5 shares */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 5 ? 'bg-[#6161FF]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 5 ? 'bg-[#6161FF]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 5 ? 'â­' : 'ðŸ”’'}</span>
            </div>
            <span className={`text-[0.5625rem] text-center ${tribeStats.completed >= 5 ? 'text-[#6161FF] font-semibold' : 'text-[#B3B8C6]'}`}>
              5 shares
            </span>
          </div>

          {/* Badge 3: 10 shares */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.completed >= 10 ? 'bg-[#E91E63]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.completed >= 10 ? 'bg-[#E91E63]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.completed >= 10 ? 'ðŸ”¥' : 'ðŸ”’'}</span>
            </div>
            <span className={`text-[0.5625rem] text-center ${tribeStats.completed >= 10 ? 'text-[#E91E63] font-semibold' : 'text-[#B3B8C6]'}`}>
              En llamas
            </span>
          </div>

          {/* Badge 4: Tribu perfecta */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'bg-[#FFCC00]/10' : 'bg-[#F5F7FB]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'bg-[#FFCC00]' : 'bg-[#E4E7EF]'}`}>
              <span className="text-lg">{tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'ðŸ‘‘' : 'ðŸ”’'}</span>
            </div>
            <span className={`text-[0.5625rem] text-center ${tribeStats.pending === 0 && tribeStats.completed >= 20 ? 'text-[#FFCC00] font-semibold' : 'text-[#B3B8C6]'}`}>
              Tribu perfecta
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Componente de AdministraciÃ³n de MembresÃ­as
const MembershipAdminTab = ({ users }: { users: Array<{ id: string; name: string; email: string; companyName: string }> }) => {
  const [memberships, setMemberships] = useState<Record<string, { status: string; paymentDate?: string; expiresAt?: string; amount?: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'miembro' | 'invitado'>('all');

  // Obtener precio desde configuraciÃ³n
  const config = getAppConfig();
  const MEMBERSHIP_PRICE = config.membershipPrice;

  // Cargar membresÃ­as - PRIORIDAD: Firebase > localStorage
  useEffect(() => {
    const loadMemberships = async () => {
      const membershipData: Record<string, { status: string; paymentDate?: string; expiresAt?: string; amount?: number }> = {};

      // Primero intentar cargar desde Firebase (fuente de verdad)
      let loadedFromFirebase = false;
      try {
        const { getFirestoreInstance } = await import('../../services/firebaseService');
        const { collection, getDocs } = await import('firebase/firestore');
        const db = getFirestoreInstance();
        if (db) {
          const membershipsRef = collection(db, 'memberships');
          const snapshot = await getDocs(membershipsRef);
          snapshot.forEach(doc => {
            const data = doc.data();
            membershipData[doc.id] = {
              status: data.status || 'invitado',
              paymentDate: data.paymentDate,
              expiresAt: data.expiresAt,
              amount: data.amount
            };
            // Sincronizar a localStorage
            localStorage.setItem(`membership_status_${doc.id}`, data.status || 'invitado');
            if (data.status === 'miembro' || data.status === 'admin') {
              localStorage.setItem(`membership_payment_${doc.id}`, JSON.stringify({
                method: data.paymentMethod,
                amount: data.amount,
                date: data.paymentDate,
                expiresAt: data.expiresAt
              }));
            } else {
              localStorage.removeItem(`membership_payment_${doc.id}`);
            }
          });
          loadedFromFirebase = true;
          console.log('âœ… MembresÃ­as cargadas desde Firebase:', Object.keys(membershipData).length);
        }
      } catch (err) {
        console.log('âš ï¸ Error cargando desde Firebase, usando localStorage:', err);
      }

      // Si no se pudo cargar desde Firebase, usar localStorage
      if (!loadedFromFirebase) {
        users.forEach(user => {
          const status = localStorage.getItem(`membership_status_${user.id}`);
          const paymentStr = localStorage.getItem(`membership_payment_${user.id}`);
          const payment = paymentStr ? JSON.parse(paymentStr) : {};

          membershipData[user.id] = {
            status: status || 'invitado',
            paymentDate: payment.date,
            expiresAt: payment.expiresAt,
            amount: payment.amount
          };
        });
      }

      // Asegurar que todos los usuarios tengan entrada
      users.forEach(user => {
        if (!membershipData[user.id]) {
          membershipData[user.id] = { status: 'invitado' };
        }
      });

      setMemberships(membershipData);
      setIsLoading(false);
    };

    loadMemberships();
  }, [users]);

  // Cambiar estado de membresÃ­a manualmente - SINCRONIZACIÃ“N COMPLETA
  const changeMembershipStatus = async (userId: string, newStatus: 'miembro' | 'invitado' | 'admin') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. ACTUALIZAR LOCALSTORAGE
    localStorage.setItem(`membership_status_${userId}`, newStatus);

    if (newStatus === 'miembro' || newStatus === 'admin') {
      const paymentData = {
        method: 'manual_admin',
        amount: MEMBERSHIP_PRICE,
        date: now,
        expiresAt: expiresAt
      };
      localStorage.setItem(`membership_payment_${userId}`, JSON.stringify(paymentData));
    } else {
      // REVOCAR: Limpiar datos de pago
      localStorage.removeItem(`membership_payment_${userId}`);
    }

    // 2. SINCRONIZAR CON FIREBASE + HISTORIAL DE PAGOS
    try {
      const { getFirestoreInstance } = await import('../../services/firebaseService');
      const { doc, setDoc, collection, addDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      if (db) {
        const membershipDoc = {
          id: userId,
          email: user.email,
          status: newStatus,
          updatedBy: 'admin',
          updatedAt: now,
          // Solo incluir datos de pago si es miembro/admin
          ...(newStatus === 'miembro' || newStatus === 'admin' ? {
            paymentMethod: 'manual_admin',
            paymentDate: now,
            amount: MEMBERSHIP_PRICE,
            expiresAt: expiresAt
          } : {
            paymentMethod: null,
            paymentDate: null,
            amount: null,
            expiresAt: null
          })
        };
        await setDoc(doc(db, 'memberships', userId), membershipDoc);

        // REGISTRAR EN HISTORIAL DE PAGOS
        await addDoc(collection(db, 'payment_history'), {
          userId,
          userEmail: user.email,
          userName: user.name,
          companyName: user.companyName,
          action: newStatus === 'miembro' || newStatus === 'admin' ? 'membership_granted' : 'membership_revoked',
          newStatus,
          amount: newStatus === 'miembro' || newStatus === 'admin' ? MEMBERSHIP_PRICE : 0,
          timestamp: now,
          adminAction: true
        });

        console.log(`âœ… Firebase actualizado + historial: ${user.name} â†’ ${newStatus}`);
      }
    } catch (err) {
      console.log('âš ï¸ Error sincronizando membresÃ­a con Firebase:', err);
    }

    // 3. ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
    setMemberships(prev => ({
      ...prev,
      [userId]: {
        status: newStatus,
        ...(newStatus === 'miembro' || newStatus === 'admin' ? {
          paymentDate: now,
          expiresAt: expiresAt,
          amount: MEMBERSHIP_PRICE
        } : {
          paymentDate: undefined,
          expiresAt: undefined,
          amount: undefined
        })
      }
    }));

    alert(`âœ… ${user.name} ahora es ${newStatus.toUpperCase()}`);
  };

  // EstadÃ­sticas - USAR PRECIO DE CONFIGURACIÃ“N
  type MembershipData = { status: string; paymentDate?: string; expiresAt?: string; amount?: number };
  const membershipValues = Object.values(memberships) as MembershipData[];
  const stats = {
    total: users.length,
    miembros: membershipValues.filter(m => m.status === 'miembro').length,
    invitados: membershipValues.filter(m => m.status === 'invitado' || !m.status).length,
    admins: membershipValues.filter(m => m.status === 'admin').length,
    ingresos: membershipValues.filter(m => m.status === 'miembro' || m.status === 'admin').reduce((sum, m) => sum + (m.amount || MEMBERSHIP_PRICE), 0)
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const membership = memberships[user.id];
    if (filter === 'all') return true;
    if (filter === 'miembro') return membership?.status === 'miembro' || membership?.status === 'admin';
    return membership?.status === 'invitado' || !membership?.status;
  });

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#6161FF] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#181B34]">GestiÃ³n de MembresÃ­as</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'miembro' | 'invitado')}
            className="bg-white border border-[#E4E7EF] rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos ({stats.total})</option>
            <option value="miembro">Miembros ({stats.miembros})</option>
            <option value="invitado">Invitados ({stats.invitados})</option>
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#00CA72]"></div>
            <p className="text-[#7C8193] text-sm">Miembros Activos</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.miembros}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#FFCC00]"></div>
            <p className="text-[#7C8193] text-sm">Invitados</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.invitados}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E7EF] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#6161FF]"></div>
            <p className="text-[#7C8193] text-sm">Admins</p>
          </div>
          <p className="text-3xl font-bold text-[#181B34]">{stats.admins}</p>
        </div>
        <div className="bg-gradient-to-br from-[#00CA72]/10 to-[#00CA72]/5 rounded-xl p-5 border border-[#00CA72]/20">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={16} className="text-[#00CA72]" />
            <p className="text-[#00CA72] text-sm font-medium">Ingresos Totales</p>
          </div>
          <p className="text-3xl font-bold text-[#00CA72]">{formatPrice(stats.ingresos)}</p>
        </div>
      </div>

      {/* MercadoPago Config */}
      <div className="bg-gradient-to-r from-[#009EE3]/5 to-[#009EE3]/10 rounded-xl p-5 border border-[#009EE3]/20">
        <h3 className="text-[#009EE3] font-semibold mb-3 flex items-center gap-2">
          <CreditCard size={20} /> ConfiguraciÃ³n MercadoPago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#7C8193] mb-1">Modo:</p>
            <span className="px-3 py-1 rounded-full bg-[#FFCC00]/20 text-[#9D6B00] font-medium">
              ðŸ§ª SANDBOX (Pruebas)
            </span>
          </div>
          <div>
            <p className="text-[#7C8193] mb-1">Public Key (Test):</p>
            <code className="text-xs bg-white/50 px-2 py-1 rounded">TEST-xxxxxxxx-xxxx-xxxx</code>
          </div>
        </div>
        <p className="text-xs text-[#7C8193] mt-3">
          Para producciÃ³n, configura las credenciales reales en el archivo de configuraciÃ³n.
        </p>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#F5F7FB]">
            <tr>
              <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Usuario</th>
              <th className="text-left text-[#7C8193] text-sm font-medium px-4 py-3">Email</th>
              <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Estado</th>
              <th className="text-center text-[#7C8193] text-sm font-medium px-4 py-3">Fecha Pago</th>
              <th className="text-right text-[#7C8193] text-sm font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EF]">
            {filteredUsers.map(user => {
              const membership = memberships[user.id];
              const isMember = membership?.status === 'miembro' || membership?.status === 'admin';

              return (
                <tr key={user.id} className="hover:bg-[#F5F7FB]/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[#181B34] text-sm font-medium">{user.name}</p>
                      <p className="text-[#7C8193] text-xs">{user.companyName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#434343]">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${membership?.status === 'admin' ? 'bg-[#FFCC00]/20 text-[#9D6B00]' :
                      isMember ? 'bg-[#00CA72]/10 text-[#00CA72]' : 'bg-[#7C8193]/10 text-[#7C8193]'
                      }`}>
                      {membership?.status === 'admin' ? 'ðŸ‘‘ Admin' : isMember ? 'âœ“ Miembro' : 'Invitado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-[#434343]">
                    {membership?.paymentDate
                      ? new Date(membership.paymentDate).toLocaleDateString('es-CL')
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!isMember && (
                        <button
                          onClick={() => changeMembershipStatus(user.id, 'miembro')}
                          className="text-xs bg-[#00CA72]/10 text-[#00CA72] px-2 py-1 rounded hover:bg-[#00CA72]/20"
                        >
                          Activar
                        </button>
                      )}
                      {isMember && membership?.status !== 'admin' && (
                        <>
                          <button
                            onClick={() => changeMembershipStatus(user.id, 'admin')}
                            className="text-xs bg-[#FFCC00]/10 text-[#9D6B00] px-2 py-1 rounded hover:bg-[#FFCC00]/20"
                          >
                            â†’ Admin
                          </button>
                          <button
                            onClick={() => changeMembershipStatus(user.id, 'invitado')}
                            className="text-xs bg-[#FB275D]/10 text-[#FB275D] px-2 py-1 rounded hover:bg-[#FB275D]/20"
                          >
                            Revocar
                          </button>
                        </>
                      )}
                      {membership?.status === 'admin' && (
                        <button
                          onClick={() => changeMembershipStatus(user.id, 'miembro')}
                          className="text-xs bg-[#7C8193]/10 text-[#7C8193] px-2 py-1 rounded hover:bg-[#7C8193]/20"
                        >
                          â†’ Miembro
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

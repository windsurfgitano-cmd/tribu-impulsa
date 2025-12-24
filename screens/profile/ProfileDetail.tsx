import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Instagram,
  Globe,
  MapPin,
  Briefcase,
  MessageCircle,
  Share2,
  X
} from 'lucide-react';
import { MatchProfile } from '../../types';
import { getProfileById } from '../../services/matchService';
import { useSurveyGuard } from '../../hooks/useSurveyGuard';
import { BrandBadge } from '../../components/BrandBadge';


const ProfileDetail = () => {
  useSurveyGuard();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MatchProfile | undefined>(undefined);

  const instagramHandle = profile?.instagram?.replace('@', '') || '';
  const shareMessage = profile ? encodeURIComponent(`Conoce a ${profile.companyName} (${profile.category}). Mira su perfil en Tribu Impulsa.`) : '';

  useEffect(() => {
    if (id) {
      const p = getProfileById(id);
      setProfile(p);
    }
  }, [id]);

  if (!profile) return <div className="text-center mt-20 text-[#7C8193]">Cargando perfil...</div>;

  return (
    <div className="pb-24 animate-slideUp bg-[#F5F7FB] min-h-screen">
      {/* Header / Cover Image */}
      <div className="h-72 w-full relative">
        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F5F7FB]"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-full text-[#181B34] hover:bg-white transition-colors z-20 border border-[#E4E7EF] shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl !overflow-visible px-6 pb-8 border border-[#E4E7EF] shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">

          {/* Avatar simple sin logo overlay */}
          <div className="-mt-20 mb-6 z-20">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
          </div>

          {/* Main Info - Flows naturally */}
          <div className="text-center mb-8 w-full">
            <h2 className="text-3xl font-bold text-[#181B34] mb-1 tracking-tight">{profile.companyName}</h2>
            <p className="text-[#7C8193] font-medium text-lg">{profile.name}</p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="text-xs font-semibold bg-[#6161FF]/10 border border-[#6161FF]/30 px-4 py-1.5 rounded-full text-[#6161FF]">
                {profile.category}
              </span>
              <span className="text-xs font-semibold bg-[#00CA72]/10 border border-[#00CA72]/30 px-4 py-1.5 rounded-full text-[#00CA72]">
                {profile.subCategory}
              </span>
            </div>
          </div>

          <div className="space-y-8 w-full text-left">
            <div>
              <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Sobre Nosotros</h3>
              <p className="text-[#434343] leading-relaxed text-lg">
                {profile.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                <div className="bg-[#6161FF]/10 p-2 rounded-lg text-[#6161FF]"><MapPin size={20} /></div>
                <div className="text-sm">
                  <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">UbicaciÃ³n</span>
                  <span className="font-medium text-[#181B34]">{profile.location}</span>
                </div>
              </div>
              <div className="bg-[#F5F7FB] p-4 rounded-2xl flex items-center gap-4 border border-[#E4E7EF]">
                <div className="bg-[#00CA72]/10 p-2 rounded-lg text-[#00CA72]"><Calendar size={20} /></div>
                <div className="text-sm">
                  <span className="block text-[#7C8193] text-[0.625rem] mb-0.5 uppercase tracking-wide">Fundada</span>
                  <span className="font-medium text-[#181B34]">{profile.foundingYear}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Enlaces</h3>
              <div className="flex flex-col gap-3">
                {/* Sitio Web - siempre visible */}
                {profile.website ? (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]"
                  >
                    <Globe size={20} className="text-[#6161FF] group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                    <Globe size={20} className="text-[#B3B8C6]" />
                    <span className="font-medium text-sm italic">Sitio web no registrado</span>
                  </div>
                )}

                {/* Instagram - siempre visible */}
                {profile.instagram ? (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-[#434343] hover:text-[#E91E63] transition-colors bg-gradient-to-r from-[#F5F7FB] to-[#FFF0F5] p-4 rounded-2xl border border-[#E91E63]/30 group hover:border-[#E91E63]"
                  >
                    <div className="bg-gradient-to-br from-[#E91E63] via-[#C13584] to-[#F77737] p-2 rounded-lg">
                      <Instagram size={18} className="text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium text-sm">{profile.instagram}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                    <div className="bg-[#E4E7EF] p-2 rounded-lg">
                      <Instagram size={18} className="text-[#B3B8C6]" />
                    </div>
                    <span className="font-medium text-sm italic">Instagram no registrado</span>
                  </div>
                )}

                {/* Email de contacto - siempre visible */}
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-4 text-[#434343] hover:text-[#6161FF] transition-colors bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF] group hover:border-[#6161FF]"
                  >
                    <div className="bg-[#6161FF]/10 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-[#6161FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm truncate">{profile.email}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 text-[#7C8193] bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EF]">
                    <div className="bg-[#E4E7EF] p-2 rounded-lg">
                      <svg className="w-5 h-5 text-[#B3B8C6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm italic">Email no registrado</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-[#7C8193] mb-3 tracking-[0.2em]">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="text-sm bg-[#F5F7FB] border border-[#E4E7EF] px-4 py-2 rounded-lg text-[#434343] hover:border-[#6161FF] hover:text-[#6161FF] transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* SecciÃ³n de AnÃ¡lisis de Match - Tribu X */}
            <MatchAnalysisSection profileId={profile.id} profileData={profile} />

            <button className="w-full bg-gradient-to-r from-[#00CA72] to-[#4AE698] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02]">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6 filter invert brightness-200" alt="ws" />
              Contactar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Activity View - Sistema de notificaciones tribales
// 20 tipos de actividades:
// 1. share_reminder - Recordatorio de compartir
// 2. report_warning - Alguien te reportÃ³
// 3. report_received - Recibiste un reporte de alguien
// 4. thanks_received - Alguien te dio gracias
// 5. like_received - Alguien te dio like
// 6. shared_you - Alguien te compartiÃ³
// 7. new_assignment - Nueva asignaciÃ³n tribal
// 8. month_start - Inicio de mes
// 9. mid_month - Recordatorio mitad de mes
// 10. month_end - Fin de mes
// 11. streak_achieved - Racha lograda
// 12. compliance_low - Cumplimiento bajo
// 13. compliance_high - Cumplimiento excelente
// 14. new_member - Nuevo miembro en la comunidad
// 15. profile_viewed - Alguien vio tu perfil
// 16. tribe_updated - Tu tribu fue actualizada
// 17. welcome - Bienvenida
// 18. tip - Consejo del dÃ­a
// 19. achievement - Logro desbloqueado
// 20. system - Mensaje del sistema

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  color: string;
  actionUrl?: string;
  archivedAt?: string;  // Para actividades archivadas
}

const ACTIVITY_CONFIG: Record<string, { icon: string; color: string; priority: number }> = {
  share_reminder: { icon: 'ðŸ“¤', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  report_warning: { icon: 'âš ï¸', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  report_received: { icon: 'ðŸ“‹', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  thanks_received: { icon: 'ðŸ’œ', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 2 },
  like_received: { icon: 'â¤ï¸', color: 'bg-[#FB275D]/10 text-[#E91E63]', priority: 2 },
  shared_you: { icon: 'ðŸ”„', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  new_assignment: { icon: 'ðŸŽ¯', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 0 },
  month_start: { icon: 'ðŸ“…', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  mid_month: { icon: 'â°', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  month_end: { icon: 'ðŸ', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  streak_achieved: { icon: 'ðŸ”¥', color: 'bg-[#FF6B35]/10 text-[#FF6B35]', priority: 2 },
  compliance_low: { icon: 'ðŸ“‰', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  compliance_high: { icon: 'ðŸ†', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 2 },
  new_member: { icon: 'ðŸ‘‹', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 3 },
  profile_viewed: { icon: 'ðŸ‘€', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 3 },
  tribe_updated: { icon: 'ðŸ”„', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 1 },
  welcome: { icon: 'ðŸŽ‰', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 0 },
  tip: { icon: 'ðŸ’¡', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 3 },
  achievement: { icon: 'ðŸ…', color: 'bg-[#FFD700]/10 text-[#B8860B]', priority: 2 },
  system: { icon: 'ðŸ“¢', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 2 }
};

// ============================================
// SISTEMA DE ACTIVIDADES PERSISTENTE (POR USUARIO)
// ============================================
const ACTIVITIES_KEY = 'tribu_activities';
const ARCHIVED_KEY = 'tribu_activities_archived';

// Obtener actividades del localStorage (especÃ­ficas por usuario)
const getStoredActivities = (): ActivityItem[] => {
  if (typeof window === 'undefined') return [];
  const storageKey = getUserStorageKey(ACTIVITIES_KEY);
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { return []; }
  }
  // Primera vez para este usuario - generar actividades iniciales
  const initial = generateInitialActivities();
  localStorage.setItem(storageKey, JSON.stringify(initial));
  return initial;
};

// Guardar actividades (especÃ­ficas por usuario)
const persistActivities = (activities: ActivityItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(ACTIVITIES_KEY), JSON.stringify(activities));
};

// Obtener actividades archivadas (especÃ­ficas por usuario)
const getArchivedActivities = (): ActivityItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(getUserStorageKey(ARCHIVED_KEY));
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
};

// Archivar una actividad (NO borrar)
const archiveActivity = (activity: ActivityItem) => {
  if (typeof window === 'undefined') return;
  const archived = getArchivedActivities();
  archived.push({ ...activity, archivedAt: new Date().toISOString() });
  localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(archived));
};

// Restaurar actividad archivada
const restoreActivity = (id: string): ActivityItem | null => {
  const archived = getArchivedActivities();
  const activity = archived.find(a => a.id === id);
  if (activity) {
    const updated = archived.filter(a => a.id !== id);
    localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(updated));
    return activity;
  }
  return null;
};

// Generar actividades iniciales
const generateInitialActivities = (): ActivityItem[] => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.split(' ')[0] || 'Emprendedor';

  return [
    {
      id: `act_${Date.now()}_1`,
      type: 'welcome',
      title: `Â¡Bienvenido/a ${userName}!`,
      description: 'Tu comunidad de emprendedores te espera. Revisa tu tribu 10+10 y comienza a compartir.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: 'ðŸŽ‰',
      color: 'bg-[#00CA72]/10 text-[#00CA72]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_2`,
      type: 'new_assignment',
      title: 'Tu tribu estÃ¡ lista',
      description: 'Tienes 10 cuentas para impulsar y 10 que te impulsarÃ¡n. Â¡RevÃ­salas!',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: 'ðŸŽ¯',
      color: 'bg-[#6161FF]/10 text-[#6161FF]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_3`,
      type: 'tip',
      title: 'Consejo: Historias > Posts',
      description: 'Las historias de Instagram tienen mÃ¡s alcance. Comparte contenido de tu tribu en historias.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: 'ðŸ’¡',
      color: 'bg-[#FFCC00]/10 text-[#9D6B00]'
    }
  ];
};

// Crear nueva actividad (para uso del sistema)
const createActivity = (type: string, title: string, description: string, actionUrl?: string): ActivityItem => {
  const config = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.system;
  const activity: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    timestamp: new Date().toLocaleDateString('es-CL'),
    isRead: false,
    icon: config.icon,
    color: config.color,
    actionUrl
  };

  // Persistir inmediatamente
  const activities = getStoredActivities();
  activities.unshift(activity);
  persistActivities(activities);

  return activity;
};

const ActivityView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>(() => getStoredActivities());
  const [archivedActivities, setArchivedActivities] = useState<ActivityItem[]>(() => getArchivedActivities());
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedItem, setExpandedItem] = useState<ActivityItem | null>(null);

  // Persistir cambios
  useEffect(() => {
    persistActivities(activities);
  }, [activities]);

  const filteredActivities = filter === 'unread'
    ? activities.filter(a => !a.isRead)
    : filter === 'archived'
      ? archivedActivities
      : activities;

  const unreadCount = activities.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Archivar en vez de borrar
  const handleArchive = (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (activity) {
      archiveActivity(activity);
      setActivities(prev => prev.filter(a => a.id !== id));
      setArchivedActivities(getArchivedActivities());
    }
  };

  // Restaurar actividad archivada
  const handleRestore = (id: string) => {
    const activity = restoreActivity(id);
    if (activity) {
      setActivities(prev => [activity, ...prev]);
      setArchivedActivities(getArchivedActivities());
    }
  };

  return (
    <div className="pb-32 animate-fadeIn min-h-screen bg-[#F5F7FB]">
      <header className="px-6 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-[#E4E7EF] shadow-sm"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold flex items-center gap-2 text-[#181B34]">
            <Bell className="text-[#6161FF]" /> Actividad
            {unreadCount > 0 && (
              <span className="bg-[#FB275D] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#6161FF] hover:underline"
              >
                Marcar leÃ­do
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'all' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'unread' ? 'bg-[#6161FF] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
              }`}
          >
            Sin leer ({unreadCount})
          </button>
          {archivedActivities.length > 0 && (
            <button
              onClick={() => setFilter('archived')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === 'archived' ? 'bg-[#7C8193] text-white' : 'bg-[#F5F7FB] text-[#7C8193]'
                }`}
            >
              Archivadas ({archivedActivities.length})
            </button>
          )}
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">ðŸ“­</div>
            <p className="text-[#7C8193]">No hay actividades {filter === 'unread' ? 'sin leer' : ''}</p>
          </div>
        ) : (
          filteredActivities.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-2xl flex gap-4 items-start group hover:shadow-md transition-all border cursor-pointer ${item.isRead ? 'border-[#E4E7EF]' : 'border-[#6161FF]/30 bg-[#6161FF]/5'
                }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Abrir modal para ver completo
                setExpandedItem(item);
              }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${item.isRead ? 'text-[#434343]' : 'text-[#181B34]'}`}>
                    {item.title}
                  </h3>
                  <span className="text-[0.625rem] text-[#7C8193] whitespace-nowrap">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#7C8193] leading-relaxed line-clamp-2">{item.description}</p>
                <span className="text-[0.625rem] text-[#6161FF] mt-1 inline-block">Tocar para ver mÃ¡s â†’</span>
              </div>
              {filter === 'archived' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRestore(item.id); }}
                  className="text-[#00CA72] hover:text-[#008A4E] transition p-1 text-xs"
                >
                  Restaurar
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[#7C8193] hover:text-[#FB275D] transition p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para ver actividad completa */}
      {expandedItem && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-[99999] flex items-end justify-center animate-fadeIn backdrop-blur-sm"
          onClick={() => {
            markAsRead(expandedItem.id);
            setExpandedItem(null);
          }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slideUp max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${expandedItem.color}`}>
                {expandedItem.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#181B34]">{expandedItem.title}</h2>
                <p className="text-xs text-[#7C8193]">{expandedItem.timestamp}</p>
              </div>
              <button
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className="text-[#7C8193] hover:text-[#181B34] p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="text-sm text-[#434343] leading-relaxed whitespace-pre-wrap mb-6">
              {expandedItem.description}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {expandedItem.actionUrl && (
                <button
                  onClick={() => {
                    markAsRead(expandedItem.id);
                    navigate(expandedItem.actionUrl!);
                    setExpandedItem(null);
                  }}
                  className="flex-1 bg-[#6161FF] text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  Ir a ver â†’
                </button>
              )}
              <button
                onClick={() => {
                  markAsRead(expandedItem.id);
                  setExpandedItem(null);
                }}
                className={`${expandedItem.actionUrl ? '' : 'flex-1'} px-6 py-3 rounded-xl font-medium border border-[#E4E7EF] text-[#7C8193] hover:bg-[#F5F7FB] transition`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Directory View - Lista de todos los emprendedores
const DirectoryView = () => {
  useSurveyGuard();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const allUsers = getAllUsers().filter(u => u.email !== 'admin@tribuimpulsa.cl');
  const myProfile = getMyProfile();

  // Obtener matches recomendados
  const matches = useMemo(() => {
    if (!myProfile) return [];
    return generateMockMatches(myProfile.category, myProfile.id).slice(0, 8);
  }, [myProfile]);

  const filteredUsers = allUsers.filter(user =>
    user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-32 min-h-screen bg-[#F5F7FB]">
      <header className="px-5 pb-4 sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/20"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      >
        <h1 className="text-xl font-bold text-[#181B34]">Red de Emprendedores</h1>
        <p className="text-sm text-[#7C8193]">{allUsers.length} emprendimientos activos</p>

        {/* Search with glass effect */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Buscar por nombre o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6161FF] pl-10"
          />
          <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8193]" />
        </div>
      </header>

      {/* Recomendados para ti - Al inicio */}
      {matches.length > 0 && !searchQuery && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#181B34]">â­ Recomendados para ti</h2>
            <span className="text-xs text-[#7C8193]">{matches.length} matches</span>
          </div>

          <div className="space-y-2 mb-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gradient-to-r from-[#6161FF]/5 to-[#00CA72]/5 rounded-xl p-4 border border-[#6161FF]/20 hover:border-[#6161FF] transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={match.targetProfile.avatarUrl}
                    alt={match.targetProfile.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-[#6161FF]/30"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#181B34] truncate text-sm">{match.targetProfile.companyName}</h3>
                        <p className="text-xs text-[#7C8193] truncate">{match.targetProfile.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${match.affinityScore > 90 ? 'bg-[#00CA72]/20 text-[#00CA72]' : 'bg-[#6161FF]/20 text-[#6161FF]'}`}>
                        {match.affinityScore}%
                      </span>
                    </div>
                    <p className="text-[0.6875rem] text-[#7C8193] mt-1 truncate">{match.reason}</p>

                    <button
                      onClick={() => navigate(`/profile/${match.targetProfile.id}`)}
                      className="mt-2 text-[0.625rem] font-semibold text-[#E91E63] bg-[#E91E63]/10 px-3 py-1 rounded-full hover:bg-[#E91E63]/20 transition-colors"
                    >
                      Ver perfil â†’
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-[#E4E7EF] mb-4"></div>
          <h2 className="text-base font-semibold text-[#181B34] mb-3">Todos los emprendimientos</h2>
        </div>
      )}

      <div className={`px-4 ${matches.length > 0 && !searchQuery ? '' : 'py-4'} space-y-3`}>
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => navigate(`/profile/${user.id}`)}
            className="bg-white rounded-2xl p-4 border border-[#E4E7EF] hover:border-[#6161FF] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              {/* Avatar con borde de marca */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.companyName || user.name || 'User')}&background=6161FF&color=fff&bold=true`}
                  alt={user.companyName || user.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* MARCA/EMPRESA PROMINENTE */}
                <h3 className="font-black text-base text-[#181B34] truncate leading-tight group-hover:text-[#6161FF] transition-colors">
                  {user.companyName || user.name}
                </h3>
                <p className="text-xs text-[#7C8193] truncate">por {user.name}</p>
                
                {/* CategorÃ­a y afinidad */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {user.category}
                  </span>
                  {user.affinity && (
                    <span className="text-[0.625rem] font-medium bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">
                      ðŸŽ¯ {user.affinity}
                    </span>
                  )}
                </div>
              </div>
              
              <ChevronRight size={20} className="text-[#B3B8C6] flex-shrink-0 group-hover:text-[#6161FF] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#7C8193]">No se encontraron emprendimientos</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Tutorial Steps Component - Sin emojis, iconos profesionales
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Â¡Conoce a tu Tribu!',
    subtitle: 'Bienvenido/a a la comunidad de emprendedores',
    content: 'ðŸŽ¯ Tribu Impulsa es una red de apoyo mutuo donde emprendedores se impulsan entre sÃ­.\n\nCada mes recibes TU TRIBU: un grupo de emprendedores seleccionados especialmente para ti.',
    iconType: 'zap',
    color: 'from-[#6161FF] to-[#00CA72]'
  },
  {
    id: 'howItWorks',
    title: 'Â¿CÃ³mo funciona?',
    subtitle: 'Es simple: dar y recibir',
    content: 'ðŸ“¤ YO DOY: Compartes el contenido de 10 emprendedores en tus redes sociales (historias, posts, etc.)\n\nðŸ“¥ YO RECIBO: 10 emprendedores diferentes comparten TU contenido en sus redes\n\nÂ¡AsÃ­ todos ganamos exposiciÃ³n!',
    iconType: 'users',
    color: 'from-[#00CA72] to-[#4AE698]'
  },
  {
    id: 'matching',
    title: 'Matching Inteligente',
    subtitle: 'El algoritmo trabaja por ti',
    content: 'ðŸ§  Nuestro algoritmo te conecta con emprendedores:\n\nâœ“ Complementarios a tu negocio (no competencia)\nâœ“ De la zona geogrÃ¡fica que tÃº hayas elegido\nâœ“ Con intereses y afinidades similares\n\nEl 1Â° de cada mes recibes una NUEVA Tribu.',
    iconType: 'zap',
    color: 'from-[#A78BFA] to-[#C9A8FF]'
  },
  {
    id: 'checklist',
    title: 'Tu Checklist Mensual',
    subtitle: 'MantÃ©n el control de tus colaboraciones',
    content: 'âœ… Paso 1: Ve a "Checklist" en el menÃº\nâœ… Paso 2: Revisa tus 10+10 asignaciones\nâœ… Paso 3: Comparte y marca "Ya compartÃ­"\nâœ… Paso 4: EscrÃ­beles por WhatsApp\n\nSi alguien no cumple, puedes reportarlo.',
    iconType: 'check',
    color: 'from-[#FFCC00] to-[#FFE066]'
  },
  {
    id: 'start',
    title: 'Â¡Listo para empezar!',
    subtitle: 'Tu Tribu te estÃ¡ esperando',
    content: 'ðŸš€ Ya tienes todo lo que necesitas:\n\n1. Revisa tu Tribu del mes\n2. Comparte a tus 10 asignados\n3. ConÃ©ctate por WhatsApp\n4. Â¡Crece junto a la comunidad!\n\nÂ¿Empezamos?',
    iconType: 'user',
    color: 'from-[#E91E63] to-[#FF6B9D]'
  }
];

// Iconos SVG para el onboarding (mÃ¡s profesionales que emojis)
const OnboardingIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    zap: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[type] || icons.zap;
};

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Usar portal para renderizar fuera del contenedor scrolleable
  // Estilos completamente inline para mÃ¡xima prioridad
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp">
        {/* Progress */}
        <div className="flex gap-1 p-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${i <= currentStep ? 'bg-gradient-to-r from-[#6161FF] to-[#00CA72]' : 'bg-[#E4E7EF]'
                }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
            <OnboardingIcon type={step.iconType} />
          </div>

          <h2 className="text-2xl font-bold text-[#181B34] text-center mb-1">{step.title}</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">{step.subtitle}</p>

          <div className="bg-[#F5F7FB] rounded-xl p-4 mb-6">
            <p className="text-[#434343] text-sm whitespace-pre-line">{step.content}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 text-[#7C8193] hover:text-[#181B34] transition text-sm"
            >
              Saltar tutorial
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Siguiente' : 'Â¡Comenzar!'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal de cambio de contraseÃ±a para primer login
const PasswordChangeModal = ({ onComplete, onSkip }: { onComplete: (newPass: string) => void; onSkip: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      setError('La contraseÃ±a debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseÃ±as no coinciden');
      return;
    }
    onComplete(newPassword);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className="animate-slideUp"
      >
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FFCC00] to-[#FFE066] flex items-center justify-center text-3xl shadow-lg">
            ðŸ”
          </div>
          <h2 className="text-xl font-bold text-[#181B34] text-center mb-2">Â¡Bienvenido/a a Tribu!</h2>
          <p className="text-[#7C8193] text-center text-sm mb-4">
            Por seguridad, te recomendamos cambiar tu contraseÃ±a
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Nueva contraseÃ±a</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="MÃ­nimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#434343] mb-1">Confirmar contraseÃ±a</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E4E7EF] rounded-xl p-3 text-[#181B34] focus:ring-2 focus:ring-[#6161FF]/30 focus:border-[#6161FF]"
                placeholder="Repite tu contraseÃ±a"
              />
            </div>

            {error && <p className="text-[#FB275D] text-sm text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-[#6161FF] to-[#00CA72] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              Guardar nueva contraseÃ±a
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 text-[#7C8193] hover:text-[#181B34] text-sm transition"
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileDetail;

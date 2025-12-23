// services/activityStorage.ts
// Sistema de actividades persistente (por usuario)

import { getUserStorageKey } from '../utils/storage';
import { getCurrentUser } from './databaseService';

export interface ActivityItem {
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

export const ACTIVITY_CONFIG: Record<string, { icon: string; color: string; priority: number }> = {
  share_reminder: { icon: '📤', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  report_warning: { icon: '⚠️', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  report_received: { icon: '📋', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  thanks_received: { icon: '💜', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 2 },
  like_received: { icon: '❤️', color: 'bg-[#FB275D]/10 text-[#E91E63]', priority: 2 },
  shared_you: { icon: '🔄', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  new_assignment: { icon: '🎯', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 0 },
  month_start: { icon: '📅', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 1 },
  mid_month: { icon: '⏰', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 1 },
  month_end: { icon: '🏁', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  streak_achieved: { icon: '🔥', color: 'bg-[#FF6B35]/10 text-[#FF6B35]', priority: 2 },
  compliance_low: { icon: '📉', color: 'bg-[#FB275D]/10 text-[#FB275D]', priority: 0 },
  compliance_high: { icon: '🏆', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 2 },
  new_member: { icon: '👋', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 3 },
  profile_viewed: { icon: '👀', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 3 },
  tribe_updated: { icon: '🔄', color: 'bg-[#6161FF]/10 text-[#6161FF]', priority: 1 },
  welcome: { icon: '🎉', color: 'bg-[#00CA72]/10 text-[#00CA72]', priority: 0 },
  tip: { icon: '💡', color: 'bg-[#FFCC00]/10 text-[#9D6B00]', priority: 3 },
  achievement: { icon: '🏅', color: 'bg-[#FFD700]/10 text-[#B8860B]', priority: 2 },
  system: { icon: '📢', color: 'bg-[#7C8193]/10 text-[#7C8193]', priority: 2 }
};

const ACTIVITIES_KEY = 'tribu_activities';
const ARCHIVED_KEY = 'tribu_activities_archived';

// Generar actividades iniciales
export const generateInitialActivities = (): ActivityItem[] => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.split(' ')[0] || 'Emprendedor';

  return [
    {
      id: `act_${Date.now()}_1`,
      type: 'welcome',
      title: `¡Bienvenido/a ${userName}!`,
      description: 'Tu comunidad de emprendedores te espera. Revisa tu tribu 10+10 y comienza a compartir.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '🎉',
      color: 'bg-[#00CA72]/10 text-[#00CA72]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_2`,
      type: 'new_assignment',
      title: 'Tu tribu está lista',
      description: 'Tienes 10 cuentas para impulsar y 10 que te impulsarán. ¡Revísalas!',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '🎯',
      color: 'bg-[#6161FF]/10 text-[#6161FF]',
      actionUrl: '/tribe'
    },
    {
      id: `act_${Date.now()}_3`,
      type: 'tip',
      title: 'Consejo: Historias > Posts',
      description: 'Las historias de Instagram tienen más alcance. Comparte contenido de tu tribu en historias.',
      timestamp: new Date().toLocaleDateString('es-CL'),
      isRead: false,
      icon: '💡',
      color: 'bg-[#FFCC00]/10 text-[#9D6B00]'
    }
  ];
};

// Obtener actividades del localStorage (específicas por usuario)
export const getStoredActivities = (): ActivityItem[] => {
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

// Guardar actividades (específicas por usuario)
export const persistActivities = (activities: ActivityItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserStorageKey(ACTIVITIES_KEY), JSON.stringify(activities));
};

// Obtener actividades archivadas (específicas por usuario)
export const getArchivedActivities = (): ActivityItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(getUserStorageKey(ARCHIVED_KEY));
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
};

// Archivar una actividad (NO borrar)
export const archiveActivity = (activity: ActivityItem): void => {
  if (typeof window === 'undefined') return;
  const archived = getArchivedActivities();
  archived.push({ ...activity, archivedAt: new Date().toISOString() });
  localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(archived));
};

// Restaurar actividad archivada
export const restoreActivity = (id: string): ActivityItem | null => {
  const archived = getArchivedActivities();
  const activity = archived.find(a => a.id === id);
  if (activity) {
    const updated = archived.filter(a => a.id !== id);
    localStorage.setItem(getUserStorageKey(ARCHIVED_KEY), JSON.stringify(updated));
    return activity;
  }
  return null;
};

// Crear nueva actividad (para uso del sistema)
export const createActivity = (type: string, title: string, description: string, actionUrl?: string): ActivityItem => {
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


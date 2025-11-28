// Database Service - Tribu Impulsa
// Gestiona almacenamiento local y exportación a Google Drive

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Datos personales
  name: string;
  email: string;
  phone: string;
  // Emprendimiento
  companyName: string;
  city: string;
  sector?: string; // Comuna si es local
  // Redes sociales
  instagram: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  otherChannel?: string;
  // Clasificación negocio (GIRO/RUBRO primero)
  category: string;      // Giro/Rubro del negocio
  affinity: string;      // Con qué tipo de negocios quiere conectar
  scope: 'LOCAL' | 'REGIONAL' | 'NACIONAL';
  // Datos adicionales
  revenue?: string;
  // Estado
  status: 'pending' | 'active' | 'suspended';
  surveyCompleted: boolean;
  tribeAssigned: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'tribe_assigned' | 'report_received' | 'match_new' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface Interaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'share_completed' | 'report' | 'message';
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  note?: string;
}

export interface TribeAssignment {
  id: string;
  month: string; // "2025-11"
  userId: string;
  toShareIds: string[];
  shareWithMeIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  completedActions: Record<string, boolean>;
  createdAt: string;
}

// Keys para localStorage
const DB_KEYS = {
  USERS: 'tribu_users',
  NOTIFICATIONS: 'tribu_notifications',
  INTERACTIONS: 'tribu_interactions',
  TRIBE_ASSIGNMENTS: 'tribu_assignments',
  CURRENT_USER: 'tribu_current_user',
  EXPORT_HISTORY: 'tribu_export_history'
};

// ================== USERS ==================
export const getAllUsers = (): UserProfile[] => {
  const raw = localStorage.getItem(DB_KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
};

export const getUserById = (id: string): UserProfile | undefined => {
  return getAllUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): UserProfile | undefined => {
  return getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const createUser = (userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'surveyCompleted' | 'tribeAssigned'>): UserProfile => {
  const users = getAllUsers();
  const newUser: UserProfile = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    surveyCompleted: true,
    tribeAssigned: false
  };
  users.push(newUser);
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser.id);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<UserProfile>): UserProfile | null => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  return users[index];
};

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem(DB_KEYS.CURRENT_USER, userId);
};

export const getCurrentUser = (): UserProfile | null => {
  const userId = localStorage.getItem(DB_KEYS.CURRENT_USER);
  if (!userId) return null;
  return getUserById(userId) || null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(DB_KEYS.CURRENT_USER);
};

// ================== NOTIFICATIONS ==================
export const getAllNotifications = (): Notification[] => {
  const raw = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
  return raw ? JSON.parse(raw) : [];
};

export const getUserNotifications = (userId: string): Notification[] => {
  return getAllNotifications().filter(n => n.userId === userId);
};

export const getUnreadNotifications = (userId: string): Notification[] => {
  return getUserNotifications(userId).filter(n => !n.read);
};

export const createNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
  const notifications = getAllNotifications();
  const newNotification: Notification = {
    ...data,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };
  notifications.push(newNotification);
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return newNotification;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getAllNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications = getAllNotifications();
  notifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// ================== INTERACTIONS ==================
export const getAllInteractions = (): Interaction[] => {
  const raw = localStorage.getItem(DB_KEYS.INTERACTIONS);
  return raw ? JSON.parse(raw) : [];
};

export const createInteraction = (data: Omit<Interaction, 'id' | 'createdAt' | 'status'>): Interaction => {
  const interactions = getAllInteractions();
  const newInteraction: Interaction = {
    ...data,
    id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  interactions.push(newInteraction);
  localStorage.setItem(DB_KEYS.INTERACTIONS, JSON.stringify(interactions));
  
  // Crear notificación para el destinatario
  const fromUser = getUserById(data.fromUserId);
  if (data.type === 'share_completed') {
    createNotification({
      userId: data.toUserId,
      type: 'match_new',
      title: '¡Acción completada!',
      message: `${fromUser?.companyName || 'Un miembro'} ha compartido tu contenido`,
      data: { interactionId: newInteraction.id }
    });
  } else if (data.type === 'report') {
    createNotification({
      userId: data.toUserId,
      type: 'report_received',
      title: 'Nuevo reporte recibido',
      message: `Has recibido un reporte de ${fromUser?.companyName || 'un miembro'}`,
      data: { interactionId: newInteraction.id, note: data.note }
    });
  }
  
  return newInteraction;
};

export const updateInteractionStatus = (id: string, status: Interaction['status']): void => {
  const interactions = getAllInteractions();
  const index = interactions.findIndex(i => i.id === id);
  if (index !== -1) {
    interactions[index].status = status;
    localStorage.setItem(DB_KEYS.INTERACTIONS, JSON.stringify(interactions));
  }
};

// ================== EXPORT TO CSV/JSON ==================
export const exportUsersToCSV = (): string => {
  const users = getAllUsers();
  if (users.length === 0) return '';

  const headers = [
    'ID', 'Fecha Registro', 'Nombre', 'Email', 'Teléfono', 'Empresa', 
    'Ciudad', 'Sector', 'Instagram', 'Facebook', 'TikTok', 'Website',
    'Categoría (Giro)', 'Afinidad', 'Alcance', 'Facturación', 'Estado'
  ];

  const rows = users.map(u => [
    u.id,
    new Date(u.createdAt).toLocaleDateString('es-CL'),
    u.name,
    u.email,
    u.phone,
    u.companyName,
    u.city,
    u.sector || '',
    u.instagram,
    u.facebook || '',
    u.tiktok || '',
    u.website || '',
    u.category,
    u.affinity,
    u.scope,
    u.revenue || '',
    u.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const exportAllDataToJSON = (): string => {
  const data = {
    exportedAt: new Date().toISOString(),
    users: getAllUsers(),
    notifications: getAllNotifications(),
    interactions: getAllInteractions(),
    stats: {
      totalUsers: getAllUsers().length,
      activeUsers: getAllUsers().filter(u => u.status === 'active').length,
      totalInteractions: getAllInteractions().length,
      pendingReports: getAllInteractions().filter(i => i.type === 'report' && i.status === 'pending').length
    }
  };
  return JSON.stringify(data, null, 2);
};

export const downloadAsFile = (content: string, filename: string, type: 'csv' | 'json'): void => {
  const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Log export
  const history = JSON.parse(localStorage.getItem(DB_KEYS.EXPORT_HISTORY) || '[]');
  history.push({ filename, exportedAt: new Date().toISOString() });
  localStorage.setItem(DB_KEYS.EXPORT_HISTORY, JSON.stringify(history));
};

// ================== GOOGLE DRIVE INTEGRATION ==================
// Genera un link para subir manualmente a Google Drive
export const generateGoogleDriveUploadLink = (): string => {
  // Este link abre Google Drive para subir archivo
  return 'https://drive.google.com/drive/my-drive';
};

// Exporta todo y prepara para Google Drive
export const exportForGoogleDrive = (): { csv: string; json: string; instructions: string } => {
  const timestamp = new Date().toISOString().split('T')[0];
  const csv = exportUsersToCSV();
  const json = exportAllDataToJSON();
  
  // Descargar ambos archivos
  downloadAsFile(csv, `tribu_usuarios_${timestamp}.csv`, 'csv');
  downloadAsFile(json, `tribu_backup_${timestamp}.json`, 'json');
  
  const instructions = `
📁 Archivos exportados:
- tribu_usuarios_${timestamp}.csv (para ver en Google Sheets)
- tribu_backup_${timestamp}.json (backup completo)

📤 Para subir a Google Drive:
1. Abre: ${generateGoogleDriveUploadLink()}
2. Arrastra los archivos descargados
3. Comparte la carpeta con Doraluz y Dafna

✅ Exportación completada: ${new Date().toLocaleString('es-CL')}
  `;
  
  return { csv, json, instructions };
};

// ================== STATS ==================
export const getDashboardStats = () => {
  const users = getAllUsers();
  const interactions = getAllInteractions();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    thisMonthUsers: users.filter(u => u.createdAt.startsWith(currentMonth)).length,
    totalInteractions: interactions.length,
    completedShares: interactions.filter(i => i.type === 'share_completed').length,
    pendingReports: interactions.filter(i => i.type === 'report' && i.status === 'pending').length,
    resolvedReports: interactions.filter(i => i.type === 'report' && i.status === 'completed').length
  };
};

// ================== CUMPLIMIENTO ==================
export interface UserCompliance {
  userId: string;
  userName: string;
  companyName: string;
  toShareTotal: number;
  toShareCompleted: number;
  shareWithMeTotal: number;
  shareWithMeCompleted: number;
  percentageComplete: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastActivity?: string;
}

export const getUserCompliance = (userId: string): UserCompliance | null => {
  const user = getUserById(userId);
  if (!user) return null;
  
  const checklistKey = `tribeChecklist_${userId}`;
  const checklist = JSON.parse(localStorage.getItem(checklistKey) || '{}');
  
  const toShareChecked = Object.entries(checklist)
    .filter(([key, val]) => key.startsWith('toShare_') && val === true).length;
  const shareWithMeChecked = Object.entries(checklist)
    .filter(([key, val]) => key.startsWith('shareWithMe_') && val === true).length;
  
  const total = 20; // 10 + 10
  const completed = toShareChecked + shareWithMeChecked;
  const percentage = Math.round((completed / total) * 100);
  
  let status: UserCompliance['status'] = 'critical';
  if (percentage >= 80) status = 'excellent';
  else if (percentage >= 60) status = 'good';
  else if (percentage >= 30) status = 'warning';
  
  const interactions = getAllInteractions().filter(i => i.fromUserId === userId);
  const lastActivity = interactions.length > 0 
    ? interactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
    : undefined;
  
  return {
    userId,
    userName: user.name,
    companyName: user.companyName,
    toShareTotal: 10,
    toShareCompleted: toShareChecked,
    shareWithMeTotal: 10,
    shareWithMeCompleted: shareWithMeChecked,
    percentageComplete: percentage,
    status,
    lastActivity
  };
};

export const getAllUsersCompliance = (): UserCompliance[] => {
  const users = getAllUsers();
  return users
    .map(u => getUserCompliance(u.id))
    .filter((c): c is UserCompliance => c !== null)
    .sort((a, b) => b.percentageComplete - a.percentageComplete);
};

export const getComplianceStats = () => {
  const compliances = getAllUsersCompliance();
  const total = compliances.length || 1;
  
  return {
    excellent: compliances.filter(c => c.status === 'excellent').length,
    good: compliances.filter(c => c.status === 'good').length,
    warning: compliances.filter(c => c.status === 'warning').length,
    critical: compliances.filter(c => c.status === 'critical').length,
    averageCompliance: Math.round(compliances.reduce((sum, c) => sum + c.percentageComplete, 0) / total),
    totalUsers: total
  };
};

// ================== REPORTES MEJORADOS ==================
export interface Report {
  id: string;
  fromUserId: string;
  targetUserId: string;
  reason: string;
  status: 'pending' | 'in_review' | 'resolved' | 'sanctioned' | 'dismissed';
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

const REPORTS_KEY = 'tribu_reports';

export const getAllReports = (): Report[] => {
  const raw = localStorage.getItem(REPORTS_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const createReport = (fromUserId: string, targetUserId: string, reason: string): Report => {
  const reports = getAllReports();
  const newReport: Report = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromUserId,
    targetUserId,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  reports.push(newReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  // También crear notificación para admins
  createNotification({
    userId: 'admin',
    type: 'system',
    title: 'Nuevo reporte recibido',
    message: `Se ha creado un nuevo reporte que requiere revisión`,
    data: { reportId: newReport.id }
  });
  
  return newReport;
};

export const updateReportStatus = (
  reportId: string, 
  status: Report['status'], 
  adminNotes?: string
): Report | null => {
  const reports = getAllReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) return null;
  
  reports[index] = {
    ...reports[index],
    status,
    adminNotes: adminNotes || reports[index].adminNotes,
    resolvedAt: ['resolved', 'sanctioned', 'dismissed'].includes(status) 
      ? new Date().toISOString() 
      : undefined,
    resolvedBy: 'admin'
  };
  
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  // Notificar al reportador
  const fromUser = getUserById(reports[index].fromUserId);
  if (fromUser) {
    createNotification({
      userId: fromUser.id,
      type: 'system',
      title: 'Actualización de tu reporte',
      message: `Tu reporte ha sido ${status === 'resolved' ? 'resuelto' : status === 'sanctioned' ? 'procesado con sanción' : 'revisado'}`,
      data: { reportId }
    });
  }
  
  // Si hay sanción, actualizar status del usuario
  if (status === 'sanctioned') {
    updateUser(reports[index].targetUserId, { status: 'suspended' });
  }
  
  return reports[index];
};

export const getReportsByStatus = (status: Report['status']): Report[] => {
  return getAllReports().filter(r => r.status === status);
};

// ================== RECORDATORIOS ==================
export const createReminder = (userId: string, type: 'tribe_new' | 'mid_month' | 'end_month' | 'welcome') => {
  const user = getUserById(userId);
  if (!user) return;
  
  const messages: Record<string, { title: string; message: string }> = {
    welcome: {
      title: '¡Bienvenido/a a Tribu Impulsa! 🎉',
      message: 'Tu cuenta está lista. Explora tu tribu y empieza a conectar con otros emprendedores.'
    },
    tribe_new: {
      title: '¡Tu nueva tribu está lista! 🚀',
      message: 'Ya puedes ver tus 10+10 asignaciones del mes. ¡Hora de compartir!'
    },
    mid_month: {
      title: '¡Vas a mitad de mes! 💪',
      message: `Llevas buen ritmo. Revisa tu checklist y sigue conectando.`
    },
    end_month: {
      title: '¡Último recordatorio del mes! ⏰',
      message: 'Quedan pocos días para completar tus acciones. ¡No te quedes atrás!'
    }
  };
  
  const msg = messages[type];
  createNotification({
    userId,
    type: 'reminder',
    title: msg.title,
    message: msg.message
  });
};

export const sendBulkReminder = (type: 'mid_month' | 'end_month') => {
  const users = getAllUsers().filter(u => u.status === 'active');
  users.forEach(u => createReminder(u.id, type));
  return users.length;
};

// ================== ONBOARDING ==================
const ONBOARDING_KEY = 'tribu_onboarding';

export interface OnboardingProgress {
  viewedWelcome: boolean;
  viewedTribeExplainer: boolean;
  viewedChecklistTutorial: boolean;
  viewedProfileSetup: boolean;
  completedAt?: string;
}

export const getOnboardingProgress = (userId: string): OnboardingProgress => {
  const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
  return all[userId] || {
    viewedWelcome: false,
    viewedTribeExplainer: false,
    viewedChecklistTutorial: false,
    viewedProfileSetup: false
  };
};

export const updateOnboardingProgress = (userId: string, step: keyof OnboardingProgress): void => {
  const all = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
  if (!all[userId]) {
    all[userId] = {
      viewedWelcome: false,
      viewedTribeExplainer: false,
      viewedChecklistTutorial: false,
      viewedProfileSetup: false
    };
  }
  all[userId][step] = true;
  
  // Check if all steps complete
  const progress = all[userId] as OnboardingProgress;
  if (progress.viewedWelcome && progress.viewedTribeExplainer && 
      progress.viewedChecklistTutorial && progress.viewedProfileSetup) {
    all[userId].completedAt = new Date().toISOString();
  }
  
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all));
};

export const isOnboardingComplete = (userId: string): boolean => {
  return !!getOnboardingProgress(userId).completedAt;
};

// ================== DISTRIBUCIÓN POR RUBRO ==================
export const getCategoryDistribution = () => {
  const users = getAllUsers();
  const distribution: Record<string, number> = {};
  
  users.forEach(u => {
    const cat = u.category || 'Sin categoría';
    distribution[cat] = (distribution[cat] || 0) + 1;
  });
  
  return Object.entries(distribution)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / users.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};

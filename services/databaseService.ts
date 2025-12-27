// Database Service - Tribu Impulsa
// Gestiona almacenamiento local y exportación a Google Drive

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt?: string;
  // Datos personales
  name: string;
  email: string;
  phone: string;
  password?: string; // Para auth temporal
  termsAccepted?: boolean;
  // Emprendimiento
  companyName: string;
  city: string;
  sector?: string; // Comuna si es local
  bio?: string; // Descripción corta del negocio
  businessDescription?: string; // Propuesta de valor
  // Redes sociales
  instagram: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  otherChannel?: string;
  whatsapp?: string;
  // Clasificación negocio (GIRO/RUBRO primero)
  category: string | string[];  // Giro/Rubro del negocio (puede ser múltiple)
  affinity: string;      // Con qué tipo de negocios quiere conectar
  scope?: 'LOCAL' | 'REGIONAL' | 'NACIONAL';
  // Geografía detallada
  comuna?: string;           // Para alcance LOCAL
  selectedRegions?: string[]; // Para alcance REGIONAL (array de IDs de región)
  // Perfil visual
  avatarUrl?: string;
  companyLogoUrl?: string;
  coverUrl?: string;
  // Métricas
  followers?: number;
  revenue?: string;
  // Estado
  status: 'pending' | 'active' | 'suspended';
  surveyCompleted?: boolean;
  tribeAssigned?: boolean;
  onboardingComplete?: boolean;
  profileComplete?: boolean;
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
  // ✅ VALIDACIÓN DE EMAIL DUPLICADO ANTES DE CREAR
  const existingByEmail = getUserByEmail(userData.email);
  if (existingByEmail) {
    console.error('❌ INTENTO DE CREAR USUARIO DUPLICADO:', userData.email);
    throw new Error(`Email ${userData.email} ya está registrado`);
  }
  
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
  
  console.log('✅ Creando usuario:', newUser.email, 'ID:', newUser.id);
  
  users.push(newUser);
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser.id);
  
  // ⚠️ ELIMINADO: syncUserToFirebaseAuto - Ya no usamos Firebase, solo Supabase
  // La sincronización a Supabase se hace desde MyProfileView.tsx y realUsersData.ts
  
  return newUser;
};

// ⚠️ ELIMINADA: syncUserToFirebaseAuto - Ya no usamos Firebase
// Esta función causaba llamadas innecesarias a Firebase cuando deberíamos usar solo Supabase.
// La sincronización a Supabase se maneja desde MyProfileView.tsx y realUsersData.ts
/*
const syncUserToFirebaseAuto = async (user: UserProfile): Promise<void> => {
  console.log('📤 [SYNC] Iniciando sincronización para:', user.email);
  
  try {
    console.log('📤 [SYNC] Importando módulos Supabase...');
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    
    console.log('📤 [SYNC] Obteniendo instancia de Supabase...');
    const db = getFirestoreInstance();

    if (!db) {
      console.error('❌ [SYNC] Supabase NO disponible - db es null/undefined');
      throw new Error('Supabase instance is null');
    }
    
    console.log('✅ [SYNC] Supabase disponible');

    // 🔥 PASO 1: Crear en Supabase Authentication (respaldo en Firebase)
    try {
      const auth = getAuth();
      if (user.password) {
        console.log('🔐 [SYNC] Creando en Supabase Authentication...');
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          user.email, 
          user.password
        );
        console.log('✅ [SYNC] Auth creado - UID:', userCredential.user.uid);
      } else {
        console.warn('⚠️ [SYNC] Usuario sin contraseña, saltando Auth');
      }
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ [SYNC] Email ya existe en Auth (OK)');
      } else {
        console.error('❌ [SYNC] Error en Auth:', authError.code, authError.message);
      }
    }

    // 🔥 PASO 2: Guardar en Supabase DB
    console.log('📦 [SYNC] Guardando en Supabase /users/' + user.id);
    console.log('📦 [SYNC] Datos a guardar:', {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName
    });
    
    const userDoc = doc(db, 'users', user.id);
    console.log('📦 [SYNC] Documento referencia creada');
    
    await setDoc(userDoc, {
      ...user,
      updatedAt: serverTimestamp(),
      syncedAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ [SYNC] ¡ÉXITO! Usuario guardado en Supabase:', user.email);
    console.log('✅ [SYNC] Verifica en: https://console.firebase.google.com/u/0/project/tribu-impulsa/firestore/data/users/' + user.id);
  } catch (error: any) {
    console.error('❌ [SYNC] ERROR CRÍTICO en sincronización:');
    console.error('❌ [SYNC] Tipo:', error.constructor.name);
    console.error('❌ [SYNC] Mensaje:', error.message);
    console.error('❌ [SYNC] Code:', error.code);
    console.error('❌ [SYNC] Stack:', error.stack);
    console.error('❌ [SYNC] Error completo:', error);
    throw error;
  }
};
*/

export const updateUser = (id: string, updates: Partial<UserProfile>): UserProfile | null => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  // Agregar timestamp de actualización
  const now = new Date().toISOString();
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: now
  };
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  
  // ⚠️ ELIMINADO: syncUserToFirebaseAuto - Ya no usamos Firebase, solo Supabase
  // La sincronización a Supabase se hace desde MyProfileView.tsx
  
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

// Sincronizar notificaciones desde Firebase (llamar al cargar la app)
export const syncNotificationsFromFirebase = async (userId: string): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    if (!db) return;
    
    const notifRef = collection(db, 'notifications');
    const q = query(notifRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    const localNotifs = getAllNotifications();
    const localIds = localNotifs.map(n => n.id);
    let addedCount = 0;
    
    snapshot.forEach(doc => {
      const firebaseNotif = doc.data() as Notification;
      if (!localIds.includes(firebaseNotif.id)) {
        localNotifs.push(firebaseNotif);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(localNotifs));
      console.log(`📬 ${addedCount} notificaciones sincronizadas desde Firebase`);
    }
  } catch (err) {
    console.log('⚠️ Error sincronizando notificaciones:', err);
  }
};

export const getUserNotifications = (userId: string): Notification[] => {
  return getAllNotifications().filter(n => n.userId === userId);
};

export const getUnreadNotifications = (userId: string): Notification[] => {
  return getUserNotifications(userId).filter(n => !n.read);
};

export const createNotification = async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
  const notifications = getAllNotifications();
  const newNotification: Notification = {
    ...data,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };
  notifications.push(newNotification);
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  
  // TAMBIÉN guardar en Firebase para cross-device
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, collection } = await import('firebase/firestore');
    const db = getFirestoreInstance();
    if (db) {
      await setDoc(doc(collection(db, 'notifications'), newNotification.id), newNotification);
      console.log('📬 Notificación guardada en Firebase:', newNotification.title);
    }
  } catch (err) {
    console.log('⚠️ Error guardando notificación en Firebase:', err);
  }
  
  return newNotification;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getAllNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    
    // 🔥 SINCRONIZAR A FIREBASE
    syncNotificationReadToFirebase(id).catch(err =>
      console.error('⚠️ Error sincronizando notificación leída:', err)
    );
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications = getAllNotifications();
  const notifIds: string[] = [];
  
  notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      notifIds.push(n.id);
    }
  });
  
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  
  // 🔥 SINCRONIZAR A FIREBASE
  if (notifIds.length > 0) {
    syncAllNotificationsReadToFirebase(notifIds).catch(err =>
      console.error('⚠️ Error sincronizando notificaciones leídas:', err)
    );
  }
};

// 🔥 Función para sincronizar notificación leída a Firebase
const syncNotificationReadToFirebase = async (notificationId: string): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: new Date().toISOString()
    });

    console.log('✅ Notificación marcada como leída en Firebase');
  } catch (error) {
    console.error('❌ Error sincronizando notificación leída:', error);
    throw error;
  }
};

// 🔥 Función para sincronizar múltiples notificaciones leídas a Firebase
const syncAllNotificationsReadToFirebase = async (notificationIds: string[]): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, updateDoc, writeBatch } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    const batch = writeBatch(db);
    const readAt = new Date().toISOString();

    notificationIds.forEach(id => {
      const notifRef = doc(db, 'notifications', id);
      batch.update(notifRef, { read: true, readAt });
    });

    await batch.commit();
    console.log(`✅ ${notificationIds.length} notificaciones marcadas como leídas en Firebase`);
  } catch (error) {
    console.error('❌ Error sincronizando notificaciones leídas:', error);
    throw error;
  }
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
  
  // 🔥 SINCRONIZAR A FIREBASE
  syncInteractionToFirebase(newInteraction).catch(err =>
    console.error('⚠️ Error sincronizando interacción:', err)
  );
  
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
    
    // 🔥 SINCRONIZAR A FIREBASE
    syncInteractionUpdateToFirebase(id, status).catch(err =>
      console.error('⚠️ Error sincronizando actualización de interacción:', err)
    );
  }
};

// 🔥 Funciones para sincronizar interacciones a Firebase
const syncInteractionToFirebase = async (interaction: Interaction): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    await setDoc(doc(db, 'interactions', interaction.id), {
      ...interaction,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Interacción sincronizada a Firebase');
  } catch (error) {
    console.error('❌ Error sincronizando interacción:', error);
    throw error;
  }
};

const syncInteractionUpdateToFirebase = async (id: string, status: string): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    await updateDoc(doc(db, 'interactions', id), {
      status,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Estado de interacción actualizado en Firebase');
  } catch (error) {
    console.error('❌ Error actualizando interacción:', error);
    throw error;
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
  
  // 🔥 SINCRONIZAR A FIREBASE
  syncReportToFirebase(newReport).catch(err =>
    console.error('⚠️ Error sincronizando reporte:', err)
  );
  
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
  
  const resolvedAt = ['resolved', 'sanctioned', 'dismissed'].includes(status) 
    ? new Date().toISOString() 
    : undefined;
  
  reports[index] = {
    ...reports[index],
    status,
    adminNotes: adminNotes || reports[index].adminNotes,
    resolvedAt,
    resolvedBy: 'admin'
  };
  
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  
  // 🔥 SINCRONIZAR A FIREBASE
  syncReportUpdateToFirebase(reportId, status, adminNotes, resolvedAt).catch(err =>
    console.error('⚠️ Error sincronizando actualización de reporte:', err)
  );
  
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

// 🔥 Funciones para sincronizar reportes a Firebase
const syncReportToFirebase = async (report: Report): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    await setDoc(doc(db, 'reports', report.id), {
      ...report,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Reporte sincronizado a Firebase');
  } catch (error) {
    console.error('❌ Error sincronizando reporte:', error);
    throw error;
  }
};

const syncReportUpdateToFirebase = async (
  reportId: string,
  status: string,
  adminNotes?: string,
  resolvedAt?: string
): Promise<void> => {
  try {
    const { getFirestoreInstance } = await import('./firebaseService');
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestoreInstance();

    if (!db) return;

    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (resolvedAt) updateData.resolvedAt = resolvedAt;

    await updateDoc(doc(db, 'reports', reportId), updateData);

    console.log('✅ Reporte actualizado en Firebase');
  } catch (error) {
    console.error('❌ Error actualizando reporte:', error);
    throw error;
  }
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

// Detectar usuarios duplicados
export const detectDuplicateUsers = (): {
  byEmail: { email: string; count: number; users: string[] }[];
  byCompany: { company: string; count: number; users: string[] }[];
  byInstagram: { instagram: string; count: number; users: string[] }[];
  total: number;
  duplicates: number;
} => {
  const users = getAllUsers();
  
  // Por email
  const emailMap: Record<string, string[]> = {};
  users.forEach(u => {
    const email = u.email?.toLowerCase().trim();
    if (email && email.length > 0) {
      if (!emailMap[email]) emailMap[email] = [];
      emailMap[email].push(`${u.companyName} (${u.id})`);
    }
  });
  
  // Por nombre de empresa
  const companyMap: Record<string, string[]> = {};
  users.forEach(u => {
    const company = u.companyName?.toLowerCase().trim();
    if (company && company.length > 0) {
      if (!companyMap[company]) companyMap[company] = [];
      companyMap[company].push(`${u.email} (${u.id})`);
    }
  });
  
  // Por Instagram
  const igMap: Record<string, string[]> = {};
  users.forEach(u => {
    const ig = u.instagram?.toLowerCase().replace('@', '').trim();
    if (ig && ig.length > 0) {
      if (!igMap[ig]) igMap[ig] = [];
      igMap[ig].push(`${u.companyName} (${u.id})`);
    }
  });
  
  const byEmail = Object.entries(emailMap)
    .filter(([_, arr]) => arr.length > 1)
    .map(([email, users]) => ({ email, count: users.length, users }));
  
  const byCompany = Object.entries(companyMap)
    .filter(([_, arr]) => arr.length > 1)
    .map(([company, users]) => ({ company, count: users.length, users }));
  
  const byInstagram = Object.entries(igMap)
    .filter(([_, arr]) => arr.length > 1)
    .map(([instagram, users]) => ({ instagram, count: users.length, users }));
  
  console.log('📊 ANÁLISIS DE DUPLICADOS:');
  console.log(`Total usuarios: ${users.length}`);
  console.log(`Emails duplicados: ${byEmail.length}`, byEmail);
  console.log(`Empresas duplicadas: ${byCompany.length}`, byCompany);
  console.log(`Instagram duplicados: ${byInstagram.length}`, byInstagram);
  
  return {
    byEmail,
    byCompany,
    byInstagram,
    total: users.length,
    duplicates: byEmail.length + byCompany.length + byInstagram.length
  };
};

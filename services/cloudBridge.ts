// Cloud Bridge - Servicio unificado de datos
// Permite usar localStorage O Firestore según configuración

import * as localDB from './databaseService';
import * as cloudDB from './firestoreService';
import { UserProfile } from './databaseService';
import { CloudUser } from './firestoreService';

// ============================================
// CONFIGURACIÓN
// ============================================

// Cambiar a true para usar Firestore
const USE_FIRESTORE = true;

// Estado de conexión
let firestoreConnected = false;
let connectionError: string | null = null;

// ============================================
// VERIFICAR CONEXIÓN
// ============================================

export const checkCloudConnection = async (): Promise<boolean> => {
  if (!USE_FIRESTORE) {
    console.log('📦 Usando localStorage (modo offline)');
    return true;
  }

  try {
    // Intentar leer config del sistema
    const config = await cloudDB.getSystemConfig();
    firestoreConnected = true;
    connectionError = null;
    console.log('☁️ Conectado a Firestore');
    return true;
  } catch (error) {
    firestoreConnected = false;
    connectionError = (error as Error).message;
    console.error('❌ Error conectando a Firestore:', error);
    return false;
  }
};

export const isCloudMode = (): boolean => USE_FIRESTORE && firestoreConnected;
export const getConnectionError = (): string | null => connectionError;

// ============================================
// CONVERSIÓN DE TIPOS
// ============================================

const cloudToLocal = (cloudUser: CloudUser): UserProfile => ({
  id: cloudUser.id,
  email: cloudUser.email,
  name: cloudUser.name,
  companyName: cloudUser.companyName,
  phone: cloudUser.phone,
  instagram: cloudUser.instagram,
  city: cloudUser.city,
  category: cloudUser.category,
  affinityChoices: cloudUser.affinity ? [cloudUser.affinity] : [],
  status: cloudUser.status,
  role: cloudUser.role,
  avatarUrl: cloudUser.avatarUrl,
  companyLogoUrl: cloudUser.companyLogoUrl,
  coverUrl: cloudUser.coverUrl,
  bio: cloudUser.bio,
  website: cloudUser.website,
  whatsapp: cloudUser.whatsapp,
  createdAt: cloudUser.createdAt?.toDate?.() || new Date(),
  updatedAt: cloudUser.updatedAt?.toDate?.() || new Date()
});

const localToCloud = (localUser: UserProfile): Partial<CloudUser> => ({
  id: localUser.id,
  email: localUser.email,
  name: localUser.name,
  companyName: localUser.companyName,
  phone: localUser.phone,
  instagram: localUser.instagram,
  city: localUser.city,
  category: localUser.category,
  affinity: localUser.affinityChoices?.[0] || '',
  status: localUser.status as 'active' | 'suspended' | 'pending',
  role: localUser.role as 'user' | 'admin',
  avatarUrl: localUser.avatarUrl,
  companyLogoUrl: localUser.companyLogoUrl,
  coverUrl: localUser.coverUrl,
  bio: localUser.bio,
  website: localUser.website,
  whatsapp: localUser.whatsapp
});

// ============================================
// AUTENTICACIÓN
// ============================================

export const login = async (email: string, password: string): Promise<UserProfile | null> => {
  if (isCloudMode()) {
    const cloudUser = await cloudDB.loginWithEmail(email, password);
    return cloudUser ? cloudToLocal(cloudUser) : null;
  } else {
    // Usar validación local
    const { loadRealUsers, validateCredentials, getUserByEmail } = await import('./realUsersData');
    loadRealUsers();
    const isValid = validateCredentials(email, password);
    if (isValid) {
      const user = getUserByEmail(email);
      if (user) {
        localDB.setCurrentUser(user);
        return user;
      }
    }
    return null;
  }
};

export const logout = async (): Promise<void> => {
  if (isCloudMode()) {
    await cloudDB.logout();
  }
  localDB.setCurrentUser(null);
  localStorage.removeItem('tribu_session');
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  if (isCloudMode()) {
    const authUser = cloudDB.getCurrentAuthUser();
    if (authUser) {
      const cloudUser = await cloudDB.getUserById(authUser.uid);
      return cloudUser ? cloudToLocal(cloudUser) : null;
    }
    return null;
  } else {
    return localDB.getCurrentUser();
  }
};

// ============================================
// USUARIOS
// ============================================

export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (isCloudMode()) {
    const cloudUsers = await cloudDB.getAllUsers();
    return cloudUsers.map(cloudToLocal);
  } else {
    return localDB.getAllUsers();
  }
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  if (isCloudMode()) {
    const cloudUser = await cloudDB.getUserById(userId);
    return cloudUser ? cloudToLocal(cloudUser) : null;
  } else {
    return localDB.getAllUsers().find(u => u.id === userId) || null;
  }
};

export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  if (isCloudMode()) {
    return await cloudDB.updateUser(userId, localToCloud(updates as UserProfile));
  } else {
    const result = localDB.updateUser(userId, updates);
    return !!result;
  }
};

// ============================================
// REPORTES
// ============================================

export const createReport = async (report: {
  reporterId: string;
  targetUserId: string;
  reason: string;
  note?: string;
}): Promise<boolean> => {
  if (isCloudMode()) {
    const result = await cloudDB.createReport({
      ...report,
      status: 'pending'
    });
    return !!result;
  } else {
    const result = localDB.createReport(report);
    return !!result;
  }
};

export const getAllReports = async () => {
  if (isCloudMode()) {
    return await cloudDB.getAllReports();
  } else {
    return localDB.getAllReports();
  }
};

// ============================================
// NOTIFICACIONES
// ============================================

export const getUserNotifications = async (userId: string) => {
  if (isCloudMode()) {
    return await cloudDB.getUserNotifications(userId);
  } else {
    return localDB.getUserNotifications(userId);
  }
};

export const createNotification = async (notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
}): Promise<boolean> => {
  if (isCloudMode()) {
    return await cloudDB.createNotification({
      userId: notification.userId,
      type: notification.type as 'welcome' | 'reminder' | 'report' | 'assignment' | 'system',
      title: notification.title,
      message: notification.message,
      read: false
    });
  } else {
    const result = localDB.createNotification(notification);
    return !!result;
  }
};

// ============================================
// ESTADÍSTICAS
// ============================================

export const getSystemStats = async () => {
  if (isCloudMode()) {
    return await cloudDB.getSystemStats();
  } else {
    return localDB.getDashboardStats();
  }
};

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

export const getSystemConfig = async () => {
  if (isCloudMode()) {
    return await cloudDB.getSystemConfig();
  }
  return null;
};

export const setSystemConfig = async (config: Parameters<typeof cloudDB.setSystemConfig>[0]) => {
  if (isCloudMode()) {
    return await cloudDB.setSystemConfig(config);
  }
  return false;
};

// ============================================
// INICIALIZACIÓN
// ============================================

export const initializeCloud = async (): Promise<boolean> => {
  const connected = await checkCloudConnection();
  
  if (connected && USE_FIRESTORE) {
    // Inicializar config del sistema si no existe
    await cloudDB.initializeSystemConfig();
  }
  
  return connected;
};

// ============================================
// MIGRACIÓN
// ============================================

export const migrateLocalToCloud = async (): Promise<number> => {
  if (!isCloudMode()) {
    console.log('❌ No conectado a Firestore');
    return 0;
  }
  
  return await cloudDB.migrateFromLocalStorage();
};

// Exportar todo
export default {
  // Conexión
  checkCloudConnection,
  isCloudMode,
  getConnectionError,
  initializeCloud,
  
  // Auth
  login,
  logout,
  getCurrentUser,
  
  // Usuarios
  getAllUsers,
  getUserById,
  updateUser,
  
  // Reportes
  createReport,
  getAllReports,
  
  // Notificaciones
  getUserNotifications,
  createNotification,
  
  // Stats
  getSystemStats,
  
  // Config
  getSystemConfig,
  setSystemConfig,
  
  // Migración
  migrateLocalToCloud
};

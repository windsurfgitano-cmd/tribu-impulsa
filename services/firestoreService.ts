// Firestore Service - Tribu Impulsa
// Base de datos cloud para sincronización en tiempo real

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

// ============================================
// CONFIGURACIÓN FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
  authDomain: "tribu-impulsa.firebaseapp.com",
  projectId: "tribu-impulsa",
  storageBucket: "tribu-impulsa.firebasestorage.app",
  messagingSenderId: "348097115578",
  appId: "1:348097115578:web:115960bb81563050d01983"
};

// Inicializar Firebase (evitar duplicados)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

// ============================================
// TIPOS
// ============================================

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  companyName: string;
  phone: string;
  whatsapp?: string;
  instagram: string;
  website?: string;
  city: string;
  sector?: string;
  category: string;
  affinity: string;
  bio?: string;
  businessDescription?: string;
  avatarUrl?: string;
  companyLogoUrl?: string;
  coverUrl?: string;
  followers?: number;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  fcmToken?: string;
  onboardingComplete: boolean;
}

export interface CloudTribeAssignment {
  id: string;
  month: string; // "2025-11"
  userId: string;
  toShare: string[]; // IDs de usuarios a los que debe compartir
  shareWithMe: string[]; // IDs de usuarios que le compartirán
  createdAt: Timestamp;
}

export interface CloudChecklist {
  id: string;
  month: string;
  userId: string;
  toShare: Record<string, boolean>; // userId -> completed
  shareWithMe: Record<string, boolean>;
  updatedAt: Timestamp;
}

export interface CloudReport {
  id: string;
  reporterId: string;
  targetUserId: string;
  reason: string;
  note?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'sanctioned' | 'dismissed';
  adminNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CloudNotification {
  id: string;
  userId: string;
  type: 'welcome' | 'reminder' | 'report' | 'assignment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

// ============================================
// COLECCIONES
// ============================================

const COLLECTIONS = {
  USERS: 'users',
  ASSIGNMENTS: 'assignments',
  CHECKLISTS: 'checklists',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  CONFIG: 'config'
};

// ============================================
// CONFIGURACIÓN DEL SISTEMA (Azure OpenAI, etc.)
// ============================================

export interface SystemConfig {
  azureOpenAI: {
    endpoint: string;
    apiKey: string;
    model: string;
  };
  features: {
    aiMatchingEnabled: boolean;
    pushNotificationsEnabled: boolean;
  };
  updatedAt: Timestamp;
}

// Cache local de config para no hacer muchas lecturas
let cachedConfig: SystemConfig | null = null;
let configLastFetch = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minuto

export const getSystemConfig = async (): Promise<SystemConfig | null> => {
  try {
    // Usar cache si es reciente
    if (cachedConfig && Date.now() - configLastFetch < CONFIG_CACHE_TTL) {
      return cachedConfig;
    }

    const docRef = doc(db, COLLECTIONS.CONFIG, 'system');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      cachedConfig = docSnap.data() as SystemConfig;
      configLastFetch = Date.now();
      return cachedConfig;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo config:', error);
    return null;
  }
};

export const setSystemConfig = async (config: Partial<SystemConfig>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.CONFIG, 'system');
    await setDoc(docRef, {
      ...config,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    // Invalidar cache
    cachedConfig = null;
    configLastFetch = 0;
    
    return true;
  } catch (error) {
    console.error('Error guardando config:', error);
    return false;
  }
};

// Inicializar config con valores por defecto si no existe
export const initializeSystemConfig = async (): Promise<void> => {
  const existing = await getSystemConfig();
  if (!existing) {
    await setSystemConfig({
      azureOpenAI: {
        endpoint: '',
        apiKey: '',
        model: 'gpt-5.1-chat'
      },
      features: {
        aiMatchingEnabled: false,
        pushNotificationsEnabled: true
      }
    });
  }
};

// ============================================
// AUTENTICACIÓN
// ============================================

export const loginWithEmail = async (email: string, password: string): Promise<CloudUser | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUserById(userCredential.user.uid);
    
    if (user) {
      // Actualizar último login
      await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
        lastLoginAt: Timestamp.now()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
};

export const registerWithEmail = async (
  email: string, 
  password: string, 
  userData: Partial<CloudUser>
): Promise<CloudUser | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const newUser: CloudUser = {
      id: userCredential.user.uid,
      email,
      name: userData.name || '',
      companyName: userData.companyName || '',
      phone: userData.phone || '',
      instagram: userData.instagram || '',
      city: userData.city || '',
      category: userData.category || '',
      affinity: userData.affinity || '',
      status: 'active',
      role: 'user',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      onboardingComplete: false,
      ...userData
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, newUser.id), newUser);
    
    return newUser;
  } catch (error) {
    console.error('Error en registro:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentAuthUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// USUARIOS
// ============================================

export const getUserById = async (userId: string): Promise<CloudUser | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CloudUser;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<CloudUser | null> => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CloudUser;
    }
    return null;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<CloudUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudUser));
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
};

export const getActiveUsers = async (): Promise<CloudUser[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudUser));
  } catch (error) {
    console.error('Error obteniendo usuarios activos:', error);
    return [];
  }
};

export const updateUser = async (userId: string, updates: Partial<CloudUser>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return false;
  }
};

export const createUser = async (userData: Omit<CloudUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudUser | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.USERS));
    const newUser: CloudUser = {
      ...userData,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(docRef, newUser);
    return newUser;
  } catch (error) {
    console.error('Error creando usuario:', error);
    return null;
  }
};

// Listener en tiempo real para usuarios
export const subscribeToUsers = (callback: (users: CloudUser[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudUser));
    callback(users);
  });
};

// ============================================
// ASIGNACIONES DE TRIBU
// ============================================

export const getCurrentMonthAssignments = async (userId: string): Promise<CloudTribeAssignment | null> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('userId', '==', userId),
      where('month', '==', currentMonth)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CloudTribeAssignment;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error);
    return null;
  }
};

export const saveAssignment = async (assignment: Omit<CloudTribeAssignment, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.ASSIGNMENTS));
    await setDoc(docRef, {
      ...assignment,
      id: docRef.id,
      createdAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error guardando asignación:', error);
    return false;
  }
};

export const generateAllAssignments = async (): Promise<number> => {
  try {
    const users = await getActiveUsers();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const batch = writeBatch(db);
    let count = 0;
    
    for (const user of users) {
      // Verificar si ya tiene asignación este mes
      const existing = await getCurrentMonthAssignments(user.id);
      if (existing) continue;
      
      // Generar asignaciones (10+10)
      const otherUsers = users.filter(u => u.id !== user.id);
      
      // Priorizar por afinidad complementaria
      const scored = otherUsers.map(other => ({
        user: other,
        score: calculateCompatibility(user, other)
      })).sort((a, b) => b.score - a.score);
      
      const toShare = scored.slice(0, 10).map(s => s.user.id);
      const shareWithMe = scored.slice(10, 20).map(s => s.user.id);
      
      const docRef = doc(collection(db, COLLECTIONS.ASSIGNMENTS));
      batch.set(docRef, {
        id: docRef.id,
        month: currentMonth,
        userId: user.id,
        toShare,
        shareWithMe,
        createdAt: Timestamp.now()
      });
      
      count++;
    }
    
    await batch.commit();
    console.log(`✅ Generadas ${count} asignaciones para ${currentMonth}`);
    return count;
  } catch (error) {
    console.error('Error generando asignaciones:', error);
    return 0;
  }
};

// Calcular compatibilidad entre usuarios
const calculateCompatibility = (user1: CloudUser, user2: CloudUser): number => {
  let score = 0;
  
  // Penalizar si son competencia directa (misma categoría exacta)
  if (user1.category === user2.category) {
    score -= 50;
  }
  
  // Bonus si la afinidad de uno coincide con categoría del otro
  if (user1.affinity && user2.category.includes(user1.affinity.split(' ')[0])) {
    score += 30;
  }
  if (user2.affinity && user1.category.includes(user2.affinity.split(' ')[0])) {
    score += 30;
  }
  
  // Bonus si están en la misma ciudad
  if (user1.city === user2.city) {
    score += 15;
  }
  
  // Randomización para evitar siempre los mismos matches
  score += Math.random() * 20;
  
  return score;
};

// ============================================
// CHECKLIST
// ============================================

export const getChecklist = async (userId: string, month?: string): Promise<CloudChecklist | null> => {
  try {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const q = query(
      collection(db, COLLECTIONS.CHECKLISTS),
      where('userId', '==', userId),
      where('month', '==', targetMonth)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CloudChecklist;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo checklist:', error);
    return null;
  }
};

export const updateChecklist = async (
  userId: string, 
  targetUserId: string, 
  list: 'toShare' | 'shareWithMe', 
  completed: boolean
): Promise<boolean> => {
  try {
    const month = new Date().toISOString().slice(0, 7);
    let checklist = await getChecklist(userId, month);
    
    if (!checklist) {
      // Crear checklist nuevo
      const docRef = doc(collection(db, COLLECTIONS.CHECKLISTS));
      checklist = {
        id: docRef.id,
        month,
        userId,
        toShare: {},
        shareWithMe: {},
        updatedAt: Timestamp.now()
      };
      await setDoc(docRef, checklist);
    }
    
    // Actualizar el item específico
    const updateData: Record<string, unknown> = {
      [`${list}.${targetUserId}`]: completed,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(doc(db, COLLECTIONS.CHECKLISTS, checklist.id), updateData);
    return true;
  } catch (error) {
    console.error('Error actualizando checklist:', error);
    return false;
  }
};

// ============================================
// REPORTES
// ============================================

export const createReport = async (report: Omit<CloudReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudReport | null> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.REPORTS));
    const newReport: CloudReport = {
      ...report,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(docRef, newReport);
    return newReport;
  } catch (error) {
    console.error('Error creando reporte:', error);
    return null;
  }
};

export const getAllReports = async (): Promise<CloudReport[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.REPORTS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudReport));
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }
};

export const updateReportStatus = async (
  reportId: string, 
  status: CloudReport['status'],
  adminNote?: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now()
    };
    
    if (adminNote) {
      updateData.adminNote = adminNote;
    }
    
    await updateDoc(doc(db, COLLECTIONS.REPORTS, reportId), updateData);
    return true;
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    return false;
  }
};

// ============================================
// NOTIFICACIONES
// ============================================

export const createNotification = async (notification: Omit<CloudNotification, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const docRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
    await setDoc(docRef, {
      ...notification,
      id: docRef.id,
      createdAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error creando notificación:', error);
    return false;
  }
};

export const getUserNotifications = async (userId: string, unreadOnly = false): Promise<CloudNotification[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudNotification));
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marcando notificación:', error);
    return false;
  }
};

// Listener en tiempo real para notificaciones
export const subscribeToNotifications = (userId: string, callback: (notifications: CloudNotification[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CloudNotification));
    callback(notifications);
  });
};

// ============================================
// ESTADÍSTICAS Y ADMIN
// ============================================

export const getSystemStats = async () => {
  try {
    const users = await getAllUsers();
    const reports = await getAllReports();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Contar checklists completados
    const checklistsSnap = await getDocs(
      query(collection(db, COLLECTIONS.CHECKLISTS), where('month', '==', currentMonth))
    );
    
    let totalCompleted = 0;
    let totalItems = 0;
    
    checklistsSnap.docs.forEach(doc => {
      const data = doc.data();
      const toShareCompleted = Object.values(data.toShare || {}).filter(Boolean).length;
      const shareWithMeCompleted = Object.values(data.shareWithMe || {}).filter(Boolean).length;
      totalCompleted += toShareCompleted + shareWithMeCompleted;
      totalItems += Object.keys(data.toShare || {}).length + Object.keys(data.shareWithMe || {}).length;
    });
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      totalReports: reports.length,
      completionRate: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      currentMonth
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      pendingReports: 0,
      totalReports: 0,
      completionRate: 0,
      currentMonth: ''
    };
  }
};

// ============================================
// MIGRACIÓN DESDE LOCALSTORAGE
// ============================================

export const migrateFromLocalStorage = async (): Promise<number> => {
  try {
    // Obtener usuarios del localStorage actual
    const localUsers = JSON.parse(localStorage.getItem('tribu_users') || '[]');
    
    if (localUsers.length === 0) {
      console.log('No hay usuarios locales para migrar');
      return 0;
    }
    
    const batch = writeBatch(db);
    let count = 0;
    
    for (const user of localUsers) {
      const docRef = doc(db, COLLECTIONS.USERS, user.id);
      
      // Verificar si ya existe
      const existing = await getDoc(docRef);
      if (existing.exists()) continue;
      
      batch.set(docRef, {
        ...user,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: user.status || 'active',
        role: user.email === 'admin@tribuimpulsa.cl' ? 'admin' : 'user',
        onboardingComplete: true
      });
      
      count++;
    }
    
    await batch.commit();
    console.log(`✅ Migrados ${count} usuarios a Firestore`);
    return count;
  } catch (error) {
    console.error('Error en migración:', error);
    return 0;
  }
};

// ============================================
// CAPACIDAD DEL SISTEMA
// ============================================

/*
📊 LÍMITES DE FIRESTORE (Plan Spark - Gratuito):
- 1 GB de almacenamiento
- 50,000 lecturas/día
- 20,000 escrituras/día
- 20,000 eliminaciones/día

📈 ESTIMACIÓN PARA TRIBU IMPULSA:

Con 100 usuarios activos:
- Login: 100 lecturas/día
- Dashboard: ~500 lecturas/día (5 por usuario)
- Checklist: ~200 escrituras/día
- Notificaciones: ~100 escrituras/día

TOTAL: ~1,000 operaciones/día = MUY dentro del límite

Con 1,000 usuarios activos:
- Login: 1,000 lecturas/día
- Dashboard: ~5,000 lecturas/día
- Checklist: ~2,000 escrituras/día
- Notificaciones: ~1,000 escrituras/día

TOTAL: ~9,000 operaciones/día = Aún dentro del límite

🎯 CAPACIDAD ESTIMADA:
- Plan Gratuito: Hasta 2,000-3,000 usuarios activos diarios
- Plan Blaze (pago por uso): Ilimitado

💾 ALMACENAMIENTO:
- Cada usuario: ~2KB de datos
- 1,000 usuarios = ~2MB
- 10,000 usuarios = ~20MB
- Límite 1GB = ~500,000 usuarios teóricos
*/

export default {
  // Auth
  loginWithEmail,
  registerWithEmail,
  logout,
  getCurrentAuthUser,
  onAuthChange,
  
  // Users
  getUserById,
  getUserByEmail,
  getAllUsers,
  getActiveUsers,
  updateUser,
  createUser,
  subscribeToUsers,
  
  // Assignments
  getCurrentMonthAssignments,
  saveAssignment,
  generateAllAssignments,
  
  // Checklist
  getChecklist,
  updateChecklist,
  
  // Reports
  createReport,
  getAllReports,
  updateReportStatus,
  
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
  
  // Admin
  getSystemStats,
  migrateFromLocalStorage
};

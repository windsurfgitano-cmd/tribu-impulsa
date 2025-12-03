// Firebase Service - Tribu Impulsa
// Configuración de Firebase, Firestore y Cloud Messaging

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Configuración de Firebase - Tribu Impulsa
// Nota: Las API keys de Firebase son seguras para exponer en el frontend
// La seguridad se maneja con Firebase Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
  authDomain: "tribu-impulsa.firebaseapp.com",
  projectId: "tribu-impulsa",
  storageBucket: "tribu-impulsa.firebasestorage.app",
  messagingSenderId: "348097115578",
  appId: "1:348097115578:web:115960bb81563050d01983"
};

// VAPID Key para Web Push (Cloud Messaging)
const VAPID_KEY = "BIhxjd_diMAgmMBrqvYxISkqe_vEKy3GYqK0tgNQOFlMQ37K_b0UhqmXAFXDjIayCDcAtBmLLktE50Gxn5tFLUE";

// Instancias de Firebase
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let db: Firestore | null = null;

// Verificar si Firebase está configurado
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId
  );
};

// Inicializar Firebase
export const initializeFirebase = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase no está configurado. Agrega las variables de entorno.');
    return null;
  }

  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error);
      return null;
    }
  }

  return app;
};

// Obtener instancia de Firestore
export const getFirestoreInstance = (): Firestore | null => {
  if (!app) {
    initializeFirebase();
  }
  if (!app) return null;

  if (!db) {
    try {
      db = getFirestore(app);
      console.log('✅ Firestore inicializado');
    } catch (error) {
      console.error('❌ Error obteniendo Firestore:', error);
      return null;
    }
  }
  return db;
};

// ============================================
// SINCRONIZACIÓN DE PERFILES CON FIRESTORE
// ============================================

interface ProfileData {
  id: string;
  name: string;
  companyName: string;
  category: string;
  subCategory?: string;
  location?: string;
  bio?: string;
  instagram?: string;
  website?: string;
  avatarUrl?: string;
  coverUrl?: string;
  tags?: string[];
  phone?: string;
  email?: string;
  updatedAt?: unknown;
}

// Sincronizar perfil local a Firestore
export const syncProfileToCloud = async (profile: ProfileData): Promise<boolean> => {
  const firestore = getFirestoreInstance();
  if (!firestore) {
    console.warn('Firestore no disponible - guardando solo localmente');
    return false;
  }

  try {
    const profileRef = doc(firestore, 'profiles', profile.id);
    await setDoc(profileRef, {
      ...profile,
      updatedAt: serverTimestamp(),
      syncedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ Perfil ${profile.id} sincronizado a la nube`);
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando perfil:', error);
    return false;
  }
};

// Obtener perfil desde Firestore
export const getProfileFromCloud = async (profileId: string): Promise<ProfileData | null> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return null;

  try {
    const profileRef = doc(firestore, 'profiles', profileId);
    const snapshot = await getDoc(profileRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as ProfileData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo perfil de la nube:', error);
    return null;
  }
};

// Actualizar campo específico del perfil
export const updateProfileField = async (
  profileId: string, 
  field: string, 
  value: unknown
): Promise<boolean> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return false;

  try {
    const profileRef = doc(firestore, 'profiles', profileId);
    await updateDoc(profileRef, {
      [field]: value,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Campo ${field} actualizado para ${profileId}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando campo:', error);
    return false;
  }
};

// Obtener todos los perfiles desde Firestore
export const getAllProfilesFromCloud = async (): Promise<ProfileData[]> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return [];

  try {
    const profilesRef = collection(firestore, 'profiles');
    const snapshot = await getDocs(profilesRef);
    
    const profiles: ProfileData[] = [];
    snapshot.forEach(doc => {
      profiles.push({ id: doc.id, ...doc.data() } as ProfileData);
    });
    
    console.log(`✅ ${profiles.length} perfiles obtenidos de la nube`);
    return profiles;
  } catch (error) {
    console.error('❌ Error obteniendo perfiles:', error);
    return [];
  }
};

// Sincronizar foto de perfil (URL)
export const syncProfilePhoto = async (profileId: string, photoUrl: string): Promise<boolean> => {
  return updateProfileField(profileId, 'avatarUrl', photoUrl);
};

// Sincronizar cambios de checklist/tribu
export const syncChecklistProgress = async (
  userId: string, 
  checklistData: { completed: number; total: number; items: Record<string, boolean> }
): Promise<boolean> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return false;

  try {
    const progressRef = doc(firestore, 'progress', userId);
    await setDoc(progressRef, {
      ...checklistData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando progreso:', error);
    return false;
  }
};

// Cargar progreso del checklist desde Firebase
export const loadChecklistFromFirebase = async (
  userId: string
): Promise<{ completed: number; total: number; items: Record<string, boolean> } | null> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return null;

  try {
    const progressRef = doc(firestore, 'progress', userId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const data = progressDoc.data();
      console.log('☁️ Checklist cargado desde Firebase:', data.completed, '/', data.total);
      return {
        completed: data.completed || 0,
        total: data.total || 0,
        items: data.items || {}
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error cargando checklist:', error);
    return null;
  }
};

// Registrar interacción (para analytics)
export const logInteraction = async (
  userId: string,
  action: string,
  details: Record<string, unknown>
): Promise<void> => {
  const firestore = getFirestoreInstance();
  if (!firestore) return;

  try {
    const interactionRef = doc(collection(firestore, 'interactions'));
    await setDoc(interactionRef, {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
};

// Obtener instancia de Messaging
export const getMessagingInstance = (): Messaging | null => {
  if (!app) {
    initializeFirebase();
  }

  if (!app) return null;

  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('❌ Error obteniendo Messaging:', error);
      return null;
    }
  }

  return messaging;
};

// Solicitar permiso de notificaciones y obtener token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return null;
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return null;
    }

    // Obtener token de FCM
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.warn('Messaging no disponible');
      return null;
    }

    if (!VAPID_KEY) {
      console.warn('VAPID_KEY no configurado');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
    
    if (token) {
      console.log('✅ Token FCM obtenido');
      // Guardar token en localStorage para enviarlo al backend
      localStorage.setItem('fcm_token', token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('❌ Error solicitando permiso:', error);
    return null;
  }
};

// Escuchar mensajes cuando la app está en primer plano
export const onForegroundMessage = (callback: (payload: unknown) => void): (() => void) | null => {
  const messagingInstance = getMessagingInstance();
  
  if (!messagingInstance) {
    console.warn('Messaging no disponible para escuchar mensajes');
    return null;
  }

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log('📩 Mensaje recibido en primer plano:', payload);
    callback(payload);
  });

  return unsubscribe;
};

// Obtener el token guardado
export const getSavedFCMToken = (): string | null => {
  return localStorage.getItem('fcm_token');
};

// Eliminar token (para logout)
export const clearFCMToken = (): void => {
  localStorage.removeItem('fcm_token');
};

// Enviar notificación local (fallback cuando no hay Firebase)
export const sendLocalNotification = (title: string, body: string, icon?: string): void => {
  if (!('Notification' in window)) {
    console.warn('Notificaciones no soportadas');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'tribu-notification',
      requireInteraction: false
    });
  }
};

// Estado de las notificaciones
export const getNotificationStatus = (): {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  hasToken: boolean;
  firebaseConfigured: boolean;
} => {
  return {
    supported: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'unsupported',
    hasToken: !!getSavedFCMToken(),
    firebaseConfigured: isFirebaseConfigured()
  };
};

// Guardar token de un usuario específico (para enviar push después)
export const saveUserFCMToken = (userId: string, token: string): void => {
  const tokens = JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
  tokens[userId] = { token, savedAt: new Date().toISOString() };
  localStorage.setItem('fcm_user_tokens', JSON.stringify(tokens));
};

// Obtener tokens de todos los usuarios
export const getAllUserFCMTokens = (): Record<string, { token: string; savedAt: string }> => {
  return JSON.parse(localStorage.getItem('fcm_user_tokens') || '{}');
};

// Contar usuarios con notificaciones activas
export const countUsersWithPush = (): number => {
  const tokens = getAllUserFCMTokens();
  return Object.keys(tokens).length;
};

// Simular envío de push (en producción usarías Firebase Admin SDK desde un backend)
export const sendPushToUser = (userId: string, title: string, body: string): boolean => {
  const tokens = getAllUserFCMTokens();
  const userToken = tokens[userId];
  
  if (!userToken) {
    console.warn(`Usuario ${userId} no tiene token de push`);
    return false;
  }
  
  // En producción, aquí enviarías a tu backend que usa Firebase Admin SDK
  // Por ahora, mostramos notificación local si estamos en el mismo navegador
  console.log(`📤 Push enviado a usuario ${userId}:`, { title, body, token: userToken.token.slice(0, 20) + '...' });
  
  // Mostrar notificación local como demostración
  sendLocalNotification(title, body);
  
  return true;
};

// Enviar push a todos los usuarios con tokens
export const sendPushToAll = (title: string, body: string): number => {
  const tokens = getAllUserFCMTokens();
  let sent = 0;
  
  for (const userId of Object.keys(tokens)) {
    if (sendPushToUser(userId, title, body)) {
      sent++;
    }
  }
  
  console.log(`📤 Push masivo enviado a ${sent} usuarios`);
  return sent;
};

// ============================================
// FIREBASE STORAGE - UPLOAD DE IMÁGENES
// ============================================

// Configuración de límites
const IMAGE_CONFIG = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB máximo
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.8, // 80% calidad JPEG
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

// Comprimir y redimensionar imagen
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Redimensionar si es muy grande
        if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
          const ratio = Math.min(IMAGE_CONFIG.maxWidth / width, IMAGE_CONFIG.maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`📸 Imagen comprimida: ${Math.round(blob.size / 1024)}KB (${width}x${height})`);
              resolve(blob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          IMAGE_CONFIG.quality
        );
      };
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

// Validar archivo antes de subir
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' };
  }
  if (file.size > IMAGE_CONFIG.maxSizeBytes) {
    return { valid: false, error: `Imagen muy grande. Máximo ${IMAGE_CONFIG.maxSizeBytes / 1024 / 1024}MB` };
  }
  return { valid: true };
};

// Subir imagen de perfil a Firebase Storage
export const uploadProfileImage = async (
  userId: string, 
  file: File,
  type: 'avatar' | 'cover' = 'avatar'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Validar
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Inicializar Firebase si no está
    if (!app) initializeFirebase();
    if (!app) {
      return { success: false, error: 'Firebase no disponible' };
    }
    
    // Comprimir imagen
    const compressedBlob = await compressImage(file);
    
    // Subir a Storage
    const storage = getStorage(app);
    const fileName = `${type}_${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profiles/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });
    
    // Obtener URL pública
    const downloadUrl = await getDownloadURL(storageRef);
    
    // Actualizar perfil en Firestore
    if (db) {
      const field = type === 'avatar' ? 'avatarUrl' : 'coverUrl';
      await updateDoc(doc(db, 'users', userId), {
        [field]: downloadUrl,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`✅ Imagen ${type} subida para usuario ${userId}`);
    return { success: true, url: downloadUrl };
    
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    return { success: false, error: 'Error al subir imagen. Intenta de nuevo.' };
  }
};

// Obtener configuración de imágenes (para mostrar en UI)
export const getImageConfig = () => ({
  maxSizeMB: IMAGE_CONFIG.maxSizeBytes / 1024 / 1024,
  maxDimensions: `${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}`,
  allowedFormats: 'JPG, PNG, WebP'
});

export default {
  initializeFirebase,
  isFirebaseConfigured,
  requestNotificationPermission,
  onForegroundMessage,
  getSavedFCMToken,
  clearFCMToken,
  sendLocalNotification,
  getNotificationStatus,
  // Firestore sync
  syncProfileToCloud,
  getProfileFromCloud,
  updateProfileField,
  getAllProfilesFromCloud,
  syncProfilePhoto,
  syncChecklistProgress,
  loadChecklistFromFirebase,
  logInteraction,
  // Storage
  uploadProfileImage,
  validateImageFile,
  getImageConfig
};

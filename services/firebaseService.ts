// Firebase Service - Tribu Impulsa
// Configuración de Firebase y Cloud Messaging para notificaciones push

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// VAPID Key para Web Push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Instancias de Firebase
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

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

export default {
  initializeFirebase,
  isFirebaseConfigured,
  requestNotificationPermission,
  onForegroundMessage,
  getSavedFCMToken,
  clearFCMToken,
  sendLocalNotification,
  getNotificationStatus
};

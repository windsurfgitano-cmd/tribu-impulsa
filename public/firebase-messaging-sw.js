// Firebase Cloud Messaging Service Worker
// Este archivo maneja las notificaciones push cuando la app está en segundo plano

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuración de Firebase - Tribu Impulsa
const firebaseConfig = {
  apiKey: "AIzaSyDWdi5OUpZmGuS_qLtyCSF-EXffSF3heJA",
  authDomain: "tribu-impulsa.firebaseapp.com",
  projectId: "tribu-impulsa",
  storageBucket: "tribu-impulsa.firebasestorage.app",
  messagingSenderId: "348097115578",
  appId: "1:348097115578:web:115960bb81563050d01983"
};

// Inicializar Firebase
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Manejar notificaciones en segundo plano
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje en segundo plano:', payload);

    const notificationTitle = payload.notification?.title || 'Tribu Impulsa';
    const notificationOptions = {
      body: payload.notification?.body || 'Tienes una nueva notificación',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'tribu-notification',
      data: payload.data,
      actions: [
        {
          action: 'open',
          title: 'Ver'
        },
        {
          action: 'dismiss',
          title: 'Cerrar'
        }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Click en notificación:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Abrir o enfocar la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/dashboard');
        }
      })
  );
});

// Evento de instalación del SW
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando firebase-messaging-sw.js');
  self.skipWaiting();
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] firebase-messaging-sw.js activado');
  event.waitUntil(clients.claim());
});

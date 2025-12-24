// Service Worker - Tribu Impulsa PWA
// Versionado automático: el timestamp se inyecta en build time
const CACHE_VERSION = '__BUILD_TIMESTAMP__';
const CACHE_NAME = `tribu-impulsa-${CACHE_VERSION}`;

// Si el navegador tiene problemas internos con CacheStorage (pasa a veces en Chrome/Windows),
// desactivamos caching para evitar romper la instalación/actualización del SW.
let CACHE_DISABLED = false;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        CACHE_DISABLED = true;
        console.warn('[SW] CacheStorage no disponible, continuando sin caché:', err);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - Limpieza agresiva de cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] 🚀 Activando nueva versión:', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('tribu-impulsa-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] ⚠️ Eliminando caché antigua:', name);
              return caches.delete(name);
            })
        );
      })
      .catch((err) => {
        CACHE_DISABLED = true;
        console.warn('[SW] No se pudo listar/eliminar cachés, continuando:', err);
      })
      .then(() => {
        console.log('[SW] ✅ Cachés antiguas eliminadas, tomando control...');
        return self.clients.claim();  // Toma control inmediato de todas las pestañas
      })
      .then(() => {
        // Notificar a todos los clientes que hay nueva versión disponible
        console.log('[SW] 📢 Notificando actualización a clientes...');
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ 
              type: 'SW_UPDATED',
              version: CACHE_VERSION 
            });
          });
        });
      })
  );
});

// Fetch - Estrategia diferenciada: Network First para UI, NO cache para Firebase
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests (excepto para cachear fuentes de Google)
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('fonts.googleapis.com') &&
      !event.request.url.includes('fonts.gstatic.com')) {
    return;
  }

  // Detectar si es un asset estático de UI (HTML/CSS/JS/imágenes)
  const isUIAsset = event.request.url.match(/\.(html|css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/i) ||
                    event.request.url.includes('fonts.googleapis.com') ||
                    event.request.url.includes('fonts.gstatic.com');

  // Detectar si es una llamada a Firebase/Firestore (NO cachear - datos siempre frescos)
  const isFirebaseCall = event.request.url.includes('firebaseio.com') ||
                         event.request.url.includes('firestore.googleapis.com') ||
                         event.request.url.includes('cloudfunctions.net');

  if (isFirebaseCall) {
    // Firebase: siempre network, NUNCA cachear (datos de usuarios)
    event.respondWith(fetch(event.request));
  } else if (isUIAsset) {
    // UI Assets: Network First - siempre intentar obtener versión fresca
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si CacheStorage está deshabilitado, no intentamos escribir en caché
          if (!CACHE_DISABLED) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            }).catch((err) => {
              CACHE_DISABLED = true;
              console.warn('[SW] CacheStorage falló, desactivando caché:', err);
            });
          }
          return response;
        })
        .catch(() => {
          // Network falló, usar caché como fallback (PWA offline)
          if (CACHE_DISABLED) {
            return new Response('Offline', { status: 503 });
          }
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Sirviendo desde caché (offline):', event.request.url);
              return cachedResponse;
            }
            // Si no está en caché y es navegación, devolver index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
  } else {
    // Otros recursos: Network only
    event.respondWith(fetch(event.request));
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  const data = event.data?.json() || {
    title: 'Tribu Impulsa',
    body: 'Tienes nuevas actualizaciones',
    icon: '/icons/icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data || {}
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow('/');
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-interactions') {
    event.waitUntil(syncPendingInteractions());
  }
});

async function syncPendingInteractions() {
  // This would sync pending localStorage data when online
  console.log('[SW] Syncing pending interactions...');
  // For now, just log - actual implementation would POST to backend
}

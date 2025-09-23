// AI Notulist Service Worker for PWA functionality
const CACHE_NAME = 'ai-notulist-v2';  // Bumped version to force update
const urlsToCache = [
  '/',
  '/manifest.json',
  // NOTE: Removed /meetings/new and other auth-critical pages to prevent cache issues
];

// Critical paths that must NEVER be cached (always go to network)
const NEVER_CACHE_PATHS = [
  '/login',
  '/meetings/new',
  '/consent/',
  '/api/auth/',
  '/api/meetings'
];

// Install event - cache important resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // CRITICAL: Never cache authentication, consent, or API routes
  const url = new URL(event.request.url);
  const isNeverCachePath = NEVER_CACHE_PATHS.some(path => url.pathname.startsWith(path));
  
  if (isNeverCachePath) {
    console.log('[SW] NEVER CACHE - Going directly to network:', event.request.url);
    // Always go to network for these critical paths
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip API requests (they need network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync for audio uploads (if network is available later)
self.addEventListener('sync', (event) => {
  if (event.tag === 'audio-upload') {
    event.waitUntil(
      // Handle any pending audio uploads when connection is restored
      console.log('[SW] Background sync triggered for audio uploads')
    );
  }
});

// Handle push notifications (for future meeting reminders)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from AI Notulist',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Meeting',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AI Notulist', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
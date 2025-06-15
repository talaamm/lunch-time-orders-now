
const CACHE_NAME = 'oasis-lounge-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'ADMIN_SETTINGS_CHANGED') {
    // Send message to all clients about admin settings change
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'ADMIN_SETTINGS_UPDATE',
          data: event.data.settings
        });
      });
    });
  }
});

// Push notification event
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png',
      badge: '/favicon.ico',
      tag: 'meal-ready',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Order'
        }
      ],
      data: {
        url: data.url
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', function(event) {
  console.log('Notification was closed:', event);
});

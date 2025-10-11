// Note Counter Service Worker
// Version 10.2.1

const CACHE_NAME = 'note-counter-v10.2.1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/components/DenominationCounter.tsx',
  '/src/components/SimpleCalculator.tsx',
  '/src/components/HistoryTab.tsx',
  '/src/components/CalculatorTab.tsx',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync tasks
  return Promise.resolve();
}

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Note Counter notification',
    icon: 'https://yashpatil.vercel.app/assets/images/projectimg/countnote.png',
    badge: 'https://yashpatil.vercel.app/assets/images/projectimg/countnote.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Note Counter',
        icon: 'https://yashpatil.vercel.app/assets/images/projectimg/countnote.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: 'https://yashpatil.vercel.app/assets/images/projectimg/countnote.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Note Counter', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('https://notecounter.shop/')
    );
  }
});

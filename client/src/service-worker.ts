
/// <reference lib="webworker" />

// This service worker can be customized
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open('bodytransform-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/static/css/main.css',
        '/static/js/main.js'
      ]);
    })
  );
});

// Cache first, then network strategy
self.addEventListener('fetch', (event: any) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls - we want fresh data
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((res) => {
        return caches.open('bodytransform-v1').then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});

// Clean up old caches when service worker is activated
self.addEventListener('activate', (event: any) => {
  const cacheWhitelist = ['bodytransform-v1'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

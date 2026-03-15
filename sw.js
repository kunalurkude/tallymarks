const CACHE_NAME = 'tally-pro-v3';

// The files we want to save offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Note: if you add icon files, you can add './icon-192.png' and './icon-512.png' here too!
];

// Install Event: Save files to cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Serve files from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If the file is in the cache, return it immediately
      if (response) {
        return response;
      }
      
      // Otherwise, fetch it from the internet
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid, first-party resources
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response and save it to the cache for next time
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
        // Fallback if both cache and network fail
        console.log('Fetch failed; returning offline page instead.');
    })
  );
});

// Activate Event: Clean up old caches when you update the app
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

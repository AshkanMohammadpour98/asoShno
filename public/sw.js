const CACHE_NAME = 'aso-shno-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/offline',
  '/logo/logo.png',
  '/logo/main-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and sensitive paths
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/login/') ||
    url.pathname.startsWith('/signup/') ||
    url.pathname.startsWith('/profile/') ||
    url.pathname.startsWith('/checkout/') ||
    url.pathname.startsWith('/track/') ||
    url.pathname.startsWith('/_next/data/') // Sensitive Next.js data
  ) {
    return;
  }

  // Network-first for everything else to ensure fresh data
  // but fallback to cache for images/fonts if offline
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return null;
        });
      })
  );
});

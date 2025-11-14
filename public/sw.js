// Service Worker for OnTour PWA
// Provides offline support and aggressive caching for performance

const CACHE_VERSION = 'ontour-v2';
const RUNTIME_CACHE = 'ontour-runtime-v2';
const STATIC_CACHE = 'ontour-static-v2';

// Critical assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html'
];

// Cache duration strategies (in seconds)
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60,      // 7 days for static assets (JS, CSS)
  images: 30 * 24 * 60 * 60,     // 30 days for images
  api: 5 * 60,                    // 5 minutes for API calls
  fonts: 365 * 24 * 60 * 60      // 1 year for fonts
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.error('[SW] Precaching failed:', err);
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_VERSION && 
                     cacheName !== RUNTIME_CACHE && 
                     cacheName !== STATIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (except fonts/CDN)
  if (url.origin !== location.origin && !url.pathname.match(/\.(woff2?|ttf|eot)$/)) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first with short cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE, CACHE_DURATION.api));
    return;
  }

  // Firebase requests - network only (real-time data)
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets (JS, CSS) - cache first with long duration
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, CACHE_DURATION.static));
    return;
  }

  // Images - cache first with very long duration
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, CACHE_DURATION.images));
    return;
  }

  // Fonts - cache first with longest duration
  if (url.pathname.match(/\.(woff2?|ttf|eot)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, CACHE_DURATION.fonts));
    return;
  }

  // Navigation requests - network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cached) => {
              if (cached) return cached;
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

// Cache strategies
async function cacheFirstStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    const cacheTime = new Date(cached.headers.get('sw-cache-time') || 0);
    const now = new Date();
    const age = (now - cacheTime) / 1000;
    
    if (age < maxAge) {
      console.log('[SW] Cache hit (fresh):', request.url);
      return cached;
    }
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const blob = await clonedResponse.blob();
      const cachedResponse = new Response(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
      console.log('[SW] Cached:', request.url);
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, using stale cache:', request.url);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Network failed, using cache:', request.url);
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

// Message handler
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');

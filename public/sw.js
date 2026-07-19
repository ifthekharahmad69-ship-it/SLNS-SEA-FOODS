// Service Worker for SLNS Fresh Sea Foods — Customer + Admin PWAs
// Strategy:
//   - API routes: Network first (always fresh data)
//   - Images:     Cache first (faster loading)
//   - Pages/CSS/JS: Stale-while-revalidate
//   - Offline:    Show fallback page

const CACHE_VERSION = 'v1';
const CUSTOMER_CACHE = `customer-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Core files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/shop/fish',
  '/shop/prawns',
  '/shop/crabs',
  '/cart',
  '/track',
  '/offline',
];

// ── Install: Pre-cache core app shell ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CUSTOMER_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Don't fail install if some URLs aren't available offline
        console.log('[SW] Some precache URLs failed — continuing anyway');
      });
    })
  );
  // Activate immediately without waiting
  self.skipWaiting();
});

// ── Activate: Clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CUSTOMER_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Smart caching strategy ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-same-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 1. API routes → Network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline — please check connection' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // 2. Images → Cache first, fall back to network
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/) ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('firebasestorage.googleapis.com')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // 3. Admin routes → Network only (always needs fresh auth)
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/login')) {
    event.respondWith(fetch(request));
    return;
  }

  // 4. Everything else → Stale-while-revalidate (fast + fresh)
  event.respondWith(
    caches.open(CUSTOMER_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        // Return cached immediately, update cache in background
        return cached || networkFetch.catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return cache.match('/offline') || cache.match('/');
          }
        });
      })
    )
  );
});

// ── Push Notifications (for future WhatsApp-style alerts) ───────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'SLNS Fresh Sea Foods', {
      body: data.body || '',
      icon: '/icons/customer-192.png',
      badge: '/icons/customer-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

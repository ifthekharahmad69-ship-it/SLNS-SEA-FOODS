// ── SLNS Fresh Sea Foods — Unified Service Worker ──────────────────────────
// Combines PWA caching + OneSignal push notifications in ONE file.
// Having two SW files at the same scope caused push to never fire.
//
// IMPORTANT: OneSignal MUST be told to use this file via serviceWorkerPath.

// Import OneSignal's push handler FIRST so it can register its push listener
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_VERSION = 'v3'; // bumped — forces cache refresh on all devices
const CUSTOMER_CACHE = `customer-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Core files to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/shop/fish',
  '/shop/prawns',
  '/shop/crabs',
  '/cart',
  '/track',
  '/offline',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CUSTOMER_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        console.log('[SW] Some precache URLs failed — continuing');
      })
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
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

// ── Fetch: smart caching strategy ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-same-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 1. API → network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline — check connection' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // 2. Images → cache first
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

  // 3. Admin/login → network only
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/login')) {
    event.respondWith(fetch(request));
    return;
  }

  // 4. Everything else → stale-while-revalidate
  event.respondWith(
    caches.open(CUSTOMER_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || networkFetch.catch(() => {
          if (request.mode === 'navigate') {
            return cache.match('/offline') || cache.match('/');
          }
        });
      })
    )
  );
});

// NOTE: push and notificationclick are handled by OneSignalSDK.sw.js above

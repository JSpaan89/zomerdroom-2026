/**
 * Service Worker — Reisgids Europa 2026
 *
 * Strategy:
 *  - Cache-first for app shell (HTML, manifest, icons, avatars)
 *  - Network-first met cache-fallback voor Wikipedia hero images
 *  - Geen caching voor Google Maps / booking.com (altijd live)
 */

const VERSION = 'v1.0.0';
const APP_CACHE = `reisgids-app-${VERSION}`;
const RUNTIME_CACHE = `reisgids-runtime-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './avatars/jarno.png',
  './avatars/erica.png',
  './avatars/leonora.png',
  './avatars/roan.png',
];

// ----- Install: pre-cache the app shell -----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('SW: pre-cache faalde voor een asset:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ----- Activate: clean up old caches -----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ----- Fetch: routing -----
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin requests that we don't want to cache
  if (url.hostname.includes('google.com') ||
      url.hostname.includes('booking.com') ||
      url.hostname.includes('maps.googleapis')) {
    return; // let browser handle directly
  }

  // App shell (same-origin) → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          // Optionally cache successful responses
          if (res && res.ok && (req.destination === 'image' || req.destination === 'document')) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Wikipedia / Wikimedia hero images → cache-first met long TTL
  if (url.hostname.includes('wikimedia.org') ||
      url.hostname.includes('wikipedia.org')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(req).then((cached) =>
          cached || fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached)
        )
      )
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

/**
 * Service Worker — Zomerdroom 2026
 *
 * Strategy (v2.1+):
 *  - **Network-first for HTML** (documents) -> cache fallback -> ensures users always
 *    get the freshest index.html when online, without needing to clear cache.
 *  - **Cache-first for static assets** (icons, avatars, manifest) -> instant load.
 *  - **Cache-first for Wikimedia images** with long TTL -> no flicker on revisit.
 *  - **No caching** for Google Maps / booking.com -> always live.
 *  - skipWaiting + clients.claim -> new SW takes over immediately.
 *  - Listens for SKIP_WAITING message so the page can force activation.
 */

const VERSION = 'v3.27.0';
const APP_CACHE = `zomerdroom-app-${VERSION}`;
const RUNTIME_CACHE = `zomerdroom-runtime-${VERSION}`;

const APP_SHELL = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './avatars/jarno.png',
  './avatars/erica.png',
  './avatars/leonora.png',
  './avatars/roan.png',
  './assets/king-hill/jarno.png',
  './assets/king-hill/erica.png',
  './assets/king-hill/leonora.png',
  './assets/king-hill/roan.png',
  // backgrounds worden lazy gecached bij eerst-bezoek (runtime cache),
  // niet in APP_SHELL zodat een ontbrekende .jpg de hele precache niet breekt
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('SW: pre-cache faalde voor een asset:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('message', (e) => {
  if (e.data && e.data.action === 'SKIP_WAITING') self.skipWaiting();
});

function isHtmlRequest(req, url) {
  if (req.mode === 'navigate') return true;
  if (req.destination === 'document') return true;
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) return true;
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) return true;
  return false;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin we don't manage
  if (url.hostname.includes('google.com') ||
      url.hostname.includes('booking.com') ||
      url.hostname.includes('maps.googleapis')) {
    return;
  }

  // Same-origin requests
  if (url.origin === self.location.origin) {
    // HTML documents -> NETWORK-FIRST so updates land instantly
    if (isHtmlRequest(req, url)) {
      event.respondWith(
        fetch(req, { cache: 'no-store' })
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
            }
            return res;
          })
          .catch(() =>
            caches.match(req).then((cached) => cached || caches.match('./index.html'))
          )
      );
      return;
    }

    // Static same-origin (icons, avatars, manifest, etc.) -> CACHE-FIRST
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          if (res && res.ok && req.destination === 'image') {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Wikimedia hero images -> CACHE-FIRST (rarely change)
  if (url.hostname.includes('wikimedia.org') ||
      url.hostname.includes('wikipedia.org') ||
      url.hostname.includes('upload.wikimedia.org')) {
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

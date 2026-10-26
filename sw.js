// Offline support: app shell is cached on install; fonts are cached as they are used.
const VERSION = "pegp-1.5.0";   // keep in step with js/version.js
const SHELL = [
  "./", "index.html", "css/style.css", "manifest.webmanifest",
  "js/version.js", "js/i18n.js", "js/store.js", "js/srs.js", "js/map.js", "js/cards.js", "js/grammar.js", "js/quiz.js", "js/reader.js", "js/views.js", "js/words.js", "js/app.js",
  "data/questions.js", "data/lessons.js", "data/words.js", "data/greece-map.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  if (sameOrigin) {
    // network first (revalidating past the HTTP cache) so updates arrive; fall back to cache offline
    e.respondWith(
      fetch(req, { cache: "no-cache" }).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
    );
  } else {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
      }))
    );
  }
});

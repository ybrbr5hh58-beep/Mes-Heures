// Service worker : l'application fonctionne hors ligne une fois ouverte une première fois.
// Les données (IndexedDB) ne sont jamais touchées par les mises à jour.
const VERSION = 'd43c413a3f';
const CACHE = `mhe-${VERSION}`;
const ASSETS = ["./","index.html","app-LEUZQDEV.js","app-SZYSGVOI.css","manifest.webmanifest","pdf.min.mjs","pdf.worker.min.mjs","apple-touch-icon.png","icon-192.png","icon-512.png","icon-maskable-512.png"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mhe-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Réseau d'abord pour récupérer les mises à jour, cache si hors ligne.
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok) caches.open(CACHE).then((c) => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html', { ignoreSearch: true })),
    );
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});

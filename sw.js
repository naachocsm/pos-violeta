const CACHE_NAME = 'pos-violeta-v2';
const ARCHIVOS_BASE = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_BASE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nombres) =>
            Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Cache-first: si ya está guardado, se usa eso (funciona sin internet).
// Si no está y hay red, se pide y se guarda para la próxima vez.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((respuestaCache) => {
            if (respuestaCache) return respuestaCache;
            return fetch(event.request)
                .then((respuestaRed) => {
                    const copia = respuestaRed.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
                    return respuestaRed;
                })
                .catch(() => caches.match('./index.html'));
        })
    );
});

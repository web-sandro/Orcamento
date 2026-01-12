const CACHE = "orcamento-dev-v4";

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 🚫 NÃO cacheia HTML
self.addEventListener("fetch", event => {
    if (event.request.destination === "document") {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request))
    );
});

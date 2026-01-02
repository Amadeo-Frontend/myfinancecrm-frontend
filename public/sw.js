self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Rede preferencial; sem cache agressivo para evitar desatualizar dados financeiros.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

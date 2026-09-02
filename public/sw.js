const staticCache = "siga-static-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isStaticAsset = url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || ["script", "style", "font", "image"].includes(event.request.destination));
  if (!isStaticAsset) return;

  event.respondWith(
    fetch(event.request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(staticCache);
        cache.put(event.request, response.clone());
      }
      return response;
    }).catch(async () => (await caches.match(event.request)) ?? Response.error()),
  );
});

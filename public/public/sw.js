const CACHE_NAME = "paphone-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "📦 ออเดอร์ใหม่!";
  const options = {
    body: data.body || "มีการแจ้งเตือนใหม่",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    tag: data.tag || "notification-" + Date.now(),
    data: { url: data.url || "/admin" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";
  event.waitUntil(clients.openWindow(url));
});

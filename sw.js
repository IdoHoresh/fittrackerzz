// FitTrack Service Worker

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive notification requests from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "showNotification") {
    const { title, body, tag, icon } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: icon || undefined,
      badge: icon || undefined,
      dir: "rtl",
      lang: "he",
      renotify: true,
      requireInteraction: false
    });
  }
});

// Click notification → focus/open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if found
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow("/");
    })
  );
});

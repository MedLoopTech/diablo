self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "Sehat/90", body: "You have a new update." };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/" },
      requireInteraction: data.requireInteraction ?? false,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      const match = cs.find((c) => c.url.includes(self.location.origin) && "focus" in c);
      if (match) return match.focus();
      return clients.openWindow(e.notification.data.url || "/");
    })
  );
});

// Service Worker for handling push notifications and offline functionality
// Supports: Chrome, Firefox, Safari, Edge, and all modern browsers

// Log service worker activation
console.log('✅ Service Worker loaded - Push notifications enabled');

self.addEventListener("push", (event) => {
  console.log("🔔 Push event received:", event);

  if (!event.data) {
    console.warn("⚠️ Push event has no data");
    return;
  }

  let notificationData = {
    title: "Radha Swami",
    body: "New notification",
    icon: "/logo.png",
    badge: "/logo.png",
  };

  try {
    const data = event.data.json();
    notificationData = {
      title: data.title || notificationData.title,
      body: data.body || notificationData.body,
      icon: data.icon || notificationData.icon,
      badge: data.badge || notificationData.badge,
      tag: data.tag || "notification",
      data: data.data || {},
    };
  } catch (error) {
    console.error("Error parsing push data:", error);
    notificationData.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: notificationData.data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("❌ Notification closed:", event.notification.title);
});

self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("install", () => {
  console.log("📦 Service Worker installing");
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

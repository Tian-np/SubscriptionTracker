/* SubTracker Service Worker — รับ Web Push และแสดง notification บน iPhone/Android */

self.addEventListener('push', (event) => {
  let payload = { title: 'SubTracker', body: 'มีการแจ้งเตือนใหม่' };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch {
    payload.body = event.data?.text() ?? payload.body;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: payload.tag ?? 'subtracker',
      data: payload.data ?? { url: '/' },
      requireInteraction: payload.requireInteraction ?? false,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

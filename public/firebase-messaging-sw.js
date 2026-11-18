// MarketMitra Firebase Cloud Messaging (FCM) & Web Push Service Worker
/* eslint-disable no-undef */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for incoming background push events
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  // Handle both standard FCM nested notification object and direct data payload
  const notification = data.notification || {};
  const customData = data.data || {};

  const title =
    notification.title ||
    customData.title ||
    'MarketMitra APMC Price Alert';

  const body =
    notification.body ||
    customData.body ||
    'Real-time mandi price alert for your tracked crops.';

  const icon =
    notification.icon ||
    customData.icon ||
    '/icon-192.png';

  const badge =
    notification.badge ||
    customData.badge ||
    '/favicon.png';

  const url =
    customData.url ||
    notification.click_action ||
    data.fcmOptions?.link ||
    '/markets';

  const tag =
    notification.tag ||
    customData.dedupeKey ||
    customData.notification_id ||
    'marketmitra-price-alert';

  const options = {
    body,
    icon,
    badge,
    tag,
    data: {
      url,
      timestamp: Date.now(),
      ...customData,
    },
    vibrate: [150, 60, 150],
    requireInteraction: true,
    actions: [
      {
        action: 'view_market',
        title: 'View Mandi Prices',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle user clicking the push notification or its actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/markets';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab with MarketMitra is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || client.url.includes('/markets') || client.url.includes('/dashboard')) {
            client.focus();
            if ('navigate' in client && targetUrl) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

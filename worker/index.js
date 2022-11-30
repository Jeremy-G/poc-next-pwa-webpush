'use strict'

const channel = new BroadcastChannel("notifications");

self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data.text());
  event.waitUntil(
    registration.showNotification(data.title, {
      body: data.message,
      icon: 'favicon.ico'
    })
  );
  channel.postMessage(data);
});
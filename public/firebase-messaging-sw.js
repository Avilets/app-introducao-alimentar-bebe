// Service Worker para lidar com as mensagens em segundo plano do Firebase Cloud Messaging (FCM)
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB1nbCWmjYMVgD1IUjh_rJJjWmDLzZhJqk",
  authDomain: "rotina-alimentar-bebe-ba885.firebaseapp.com",
  projectId: "rotina-alimentar-bebe-ba885",
  storageBucket: "rotina-alimentar-bebe-ba885.firebasestorage.app",
  messagingSenderId: "332588796006",
  appId: "1:332588796006:web:d93c9c0d79aef0c19f85a7"
});

const messaging = firebase.messaging();

// Listener executado quando uma notificação por push chega com o app fechado ou em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Notificação recebida em segundo plano:", payload);

  const notificationTitle = payload.notification?.title || "Rotina Alimentar Bebê";
  const notificationOptions = {
    body: payload.notification?.body || "Lembrete de rotina do bebê!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

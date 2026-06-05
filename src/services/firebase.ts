import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configurações do Firebase obtidas do arquivo .env com fallbacks públicos seguros
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1nbCWmjYMVgD1IUjh_rJJjWmDLzZhJqk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rotina-alimentar-bebe-ba885.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rotina-alimentar-bebe-ba885",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rotina-alimentar-bebe-ba885.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "332588796006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:332588796006:web:d93c9c0d79aef0c19f85a7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth
export const auth = getAuth(app);

// Inicializa o Firestore com cache offline persistente habilitado
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Inicializa o Messaging de forma condicional/segura
export const getMessagingInstance = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (err) {
    console.error('Erro ao verificar suporte do Firebase Messaging:', err);
  }
  return null;
};

export default app;

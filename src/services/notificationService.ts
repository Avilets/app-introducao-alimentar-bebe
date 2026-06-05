import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, getMessagingInstance } from './firebase';

/**
 * Solicita permissões de notificação, registra o Service Worker específico do FCM,
 * obtém o token do dispositivo e o salva no Firestore do usuário.
 */
export const requestFCMToken = async (userId: string): Promise<string> => {
  try {
    // 1. Verificar suporte a notificações e service workers no navegador
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      throw new Error('Este navegador ou dispositivo não suporta notificações por push nativas.');
    }

    // 2. Solicitar a permissão de notificações do navegador
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('A permissão de notificações foi negada ou bloqueada nas configurações.');
    }

    // 3. Registrar o service worker do Firebase Messaging
    const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`);
    await navigator.serviceWorker.ready;
    
    // 4. Obter a instância do Firebase Messaging
    const messaging = await getMessagingInstance();
    if (!messaging) {
      throw new Error('O Firebase Messaging não pôde ser inicializado neste navegador.');
    }

    // 5. Obter a chave VAPID das variáveis de ambiente com fallback público seguro
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BDnIVry-Yu7T3Afo7Uj6r-I71U63UNTmd4j4_JCf-6sbqN4sLipWw5cTZj-viEJHh9-ig6SnNNOnH1SMrOlo96E";
    console.log('[FCM Debug] Chave VAPID carregada:', vapidKey);
    console.log('[FCM Debug] Comprimento da chave VAPID:', vapidKey ? vapidKey.length : 0);
    
    if (!vapidKey) {
      throw new Error('Chave VAPID do Firebase não encontrada no arquivo .env.');
    }

    // 6. Solicitar o token do dispositivo
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey
    });

    if (!token) {
      throw new Error('Não foi possível obter o token de notificação do Firebase.');
    }

    // 7. Salvar o token no Firestore em: users/{userId}/notificationTokens/{tokenId}
    // Usamos um ID determinístico baseado no token para evitar registros duplicados do mesmo aparelho
    const tokenId = btoa(token.slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '_');
    
    const tokenDocRef = doc(db, 'users', userId, 'notificationTokens', tokenId);
    
    await setDoc(tokenDocRef, {
      token,
      platform: 'web-pwa',
      userAgent: navigator.userAgent,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });

    return token;
  } catch (error) {
    console.error('Erro no fluxo de obtenção do token FCM:', error);
    throw error;
  }
};

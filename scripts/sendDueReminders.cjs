const admin = require('firebase-admin');

// 1. Carregar variáveis de ambiente dos Secrets
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountJson) {
  console.error('ERRO CRÍTICO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT não configurada.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  console.error('ERRO CRÍTICO: Falha ao interpretar JSON da FIREBASE_SERVICE_ACCOUNT:', err.message);
  process.exit(1);
}

// 2. Inicializar o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId || serviceAccount.project_id
});

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Helper para verificar se dois timestamps estão no mesmo dia local do fuso do servidor.
 */
const isSameDay = (ts1, ts2) => {
  if (!ts1 || !ts2) return false;
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Helper para calcular o próximo disparo com base no modo do lembrete.
 */
function calculateNextTrigger(reminder, now) {
  if (reminder.mode === 'timer') {
    const minutes = reminder.intervalMinutes || 120;
    return now + minutes * 60 * 1000;
  }

  if (reminder.mode === 'fixed' && reminder.fixedTime) {
    const [hoursStr, minutesStr] = reminder.fixedTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const targetDate = new Date(now);
    targetDate.setHours(hours, minutes, 0, 0);

    // Se o horário de hoje já passou, agenda para amanhã
    if (targetDate.getTime() <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate.getTime();
  }

  return now + 60 * 60 * 1000;
}

// 3. Execução Principal do Processo de Disparo
async function run() {
  console.log('--- Iniciando Job de Envio de Lembretes Vencidos ---');
  const now = Date.now();

  try {
    // Buscar todos os usuários
    const usersSnap = await db.collection('users').get();
    console.log(`Total de usuários encontrados: ${usersSnap.size}`);

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userEmail = userDoc.data().email || 'E-mail não cadastrado';
      console.log(`\nProcessando Usuário ID: ${userId} (${userEmail})`);

      // 3.1. Buscar lembretes do usuário
      const remindersRef = db.collection('users').doc(userId).collection('reminders');
      const remindersSnap = await remindersRef.get();
      
      const dueReminders = [];
      remindersSnap.forEach((docSnap) => {
        const reminder = { id: docSnap.id, ...docSnap.data() };
        const triggerTime = reminder.nextDueAt || reminder.nextTriggerAt || 0;

        // Filtro de elegibilidade:
        // - Deve estar ativo
        // - Deve ter trigger válido
        // - Horário de disparo deve ser igual ou menor que agora
        // - Não pode ter sido notificado hoje para o mesmo trigger
        if (
          reminder.active &&
          triggerTime > 0 &&
          triggerTime <= now &&
          !(reminder.lastNotifiedAt && isSameDay(reminder.lastNotifiedAt, now))
        ) {
          dueReminders.push(reminder);
        }
      });

      console.log(`Lembretes vencidos identificados: ${dueReminders.length}`);
      if (dueReminders.length === 0) continue;

      // 3.2. Buscar tokens FCM ativos do usuário
      const tokensRef = db.collection('users').doc(userId).collection('notificationTokens');
      const tokensSnap = await tokensRef.where('active', '==', true).get();
      
      const activeTokens = [];
      const tokenDocsMap = {}; // token -> tokenId
      tokensSnap.forEach((docSnap) => {
        const t = docSnap.data();
        if (t.token) {
          activeTokens.push(t.token);
          tokenDocsMap[t.token] = docSnap.id;
        }
      });

      console.log(`Tokens FCM ativos encontrados: ${activeTokens.length}`);
      if (activeTokens.length === 0) {
        console.log(`Usuário ${userId} não possui tokens registrados ou ativos. Ignorando disparos.`);
        continue;
      }

      // 3.3. Processar o envio de cada lembrete vencido
      for (const reminder of dueReminders) {
        console.log(`\nEnviando notificação para o lembrete: "${reminder.title}" (${reminder.type})`);

        // Determinar Título e Mensagem de acordo com o Tipo de Lembrete
        let notificationTitle = '';
        let notificationBody = reminder.notes || 'Hora de cuidar do bebê!';

        switch (reminder.type) {
          case 'feeding':
            notificationTitle = 'Hora da mamada';
            notificationBody = reminder.title;
            break;
          case 'fruit':
            notificationTitle = 'Hora da frutinha';
            notificationBody = reminder.title;
            break;
          case 'meal':
            notificationTitle = 'Hora da refeição';
            notificationBody = reminder.title;
            break;
          case 'other':
          default:
            notificationTitle = reminder.title;
            notificationBody = reminder.notes || 'Lembrete da rotina do bebê!';
            break;
        }

        const message = {
          tokens: activeTokens,
          notification: {
            title: notificationTitle,
            body: notificationBody
          },
          data: {
            reminderId: reminder.id || '',
            type: reminder.type || 'other'
          },
          android: {
            notification: {
              clickAction: 'FLUTTER_NOTIFICATION_CLICK',
              color: '#f97316'
            }
          }
        };

        try {
          const response = await messaging.sendEachForMulticast(message);
          console.log(`Sucesso: ${response.successCount} notificações enviadas. Falhas: ${response.failureCount}.`);

          // Limpar tokens falhos (inválidos ou desinstalados)
          if (response.failureCount > 0) {
            for (let i = 0; i < response.responses.length; i++) {
              const resp = response.responses[i];
              if (!resp.success) {
                const tokenFailed = activeTokens[i];
                const tokenId = tokenDocsMap[tokenFailed];
                const error = resp.error;

                console.warn(`Falha no token: ${tokenFailed.slice(0, 15)}... - Código: ${error.code}`);
                
                // Se o token expirou ou não está registrado, desativa-o no Firestore
                if (
                  error.code === 'messaging/registration-token-not-registered' ||
                  error.code === 'messaging/invalid-registration' ||
                  error.code === 'messaging/invalid-argument'
                ) {
                  try {
                    await tokensRef.doc(tokenId).update({
                      active: false,
                      updatedAt: now
                    });
                    console.log(`Token ${tokenId} foi desativado no Firestore.`);
                  } catch (dbErr) {
                    console.error(`Falha ao desativar token ${tokenId} no Firestore:`, dbErr.message);
                  }
                }
              }
            }
          }

          // 3.4. Atualizar Lembrete (reagendamento e marcas de controle)
          let nextDueAt = 0;
          let active = reminder.active;

          if (reminder.mode === 'timer') {
            nextDueAt = calculateNextTrigger(reminder, now);
          } else { // fixed
            if (reminder.repeatDaily) {
              nextDueAt = calculateNextTrigger(reminder, now);
            } else {
              // Lembrete único: desativa após o disparo
              active = false;
              nextDueAt = 0;
            }
          }

          await remindersRef.doc(reminder.id).update({
            lastNotifiedAt: now,
            notificationStatus: 'sent',
            nextDueAt: nextDueAt,
            nextTriggerAt: nextDueAt,
            active: active,
            updatedAt: now
          });
          console.log(`Lembrete "${reminder.title}" atualizado: ativo=${active}, próximo disparo=${new Date(nextDueAt).toLocaleTimeString()}`);

        } catch (sendErr) {
          console.error(`Erro ao processar envio do lembrete ${reminder.id}:`, sendErr.message);
          
          // Registrar falha no documento do lembrete no Firestore
          try {
            await remindersRef.doc(reminder.id).update({
              lastNotifiedAt: now,
              notificationStatus: 'failed',
              updatedAt: now
            });
          } catch (dbErr) {
            console.error(`Falha ao salvar status de erro no lembrete:`, dbErr.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro geral durante a execução do Job:', error);
  }

  console.log('\n--- Fim do Job de Notificações ---');
}

run();

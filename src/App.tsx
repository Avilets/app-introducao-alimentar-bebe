import { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import type { TabName } from './components/layout/BottomNav';

// Screens
import LoginScreen from './screens/LoginScreen';
import BabyProfileScreen from './screens/BabyProfileScreen';
import TodayScreen from './screens/TodayScreen';
import FeedBreastScreen from './screens/FeedBreastScreen';
import FeedFruitScreen from './screens/FeedFruitScreen';
import FeedMealScreen from './screens/FeedMealScreen';
import HistoryScreen from './screens/HistoryScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';
import PediatricianScreen from './screens/PediatricianScreen';

// Types
import type { Baby, FeedingLog, FruitLog, MealLog, FeedingType, Reminder } from './types';

// Firebase Services
import { subscribeToAuthChanges, logoutUser } from './services/authService';
import { subscribeToBaby, saveBaby } from './services/babyService';
import { subscribeToFeedings, saveFeedingLog, deleteFeedingLog } from './services/feedingService';
import { subscribeToFruits, saveFruitLog, deleteFruitLog } from './services/fruitService';
import { subscribeToMeals, saveMealLog, deleteMealLog } from './services/mealService';
import {
  subscribeToReminders,
  saveReminder,
  deleteReminder,
  completeReminder,
  toggleReminderActive
} from './services/reminderService';
import { requestFCMToken } from './services/notificationService';
import { Capacitor } from '@capacitor/core';
import {
  scheduleReminderNotification,
  cancelReminderNotification,
  requestLocalNotificationPermission
} from './services/localNotificationService';

// Mock DB helpers (for Guest/Demo mode)
import {
  getStoredBaby,
  saveStoredBaby,
  getStoredLogs,
  saveStoredLogs,
  getStoredReminders,
  saveStoredReminders,
  getStoredPediatricianNotes,
  saveStoredPediatricianNotes
} from './config/mockData';
import { getPediatricianNotes, savePediatricianNotes } from './services/pediatricianService';

type ScreenName = 'login' | 'baby-profile' | 'today' | 'history' | 'reminders' | 'pediatrician' | 'settings' | 'feed-breast' | 'feed-fruit' | 'feed-meal';

function App() {
  // Authentication states
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('rt_user'));
  const [uid, setUid] = useState<string | null>(null);

  // Firestore specific states
  const [feedings, setFeedings] = useState<FeedingLog[]>([]);
  const [fruits, setFruits] = useState<FruitLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);

  // Main Database states
  const [baby, setBaby] = useState<Baby | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pediatricianNotes, setPediatricianNotes] = useState<string>('');

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('today');
  const [previousTab, setPreviousTab] = useState<ScreenName>('today');

  // 1. Listen to Firebase Auth Session Changes
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser.email);
        setUid(firebaseUser.uid);
      } else {
        // Check if demo user session exists in localStorage
        const localUser = localStorage.getItem('rt_user');
        if (localUser === 'pais.demo@rotinabebe.com.br') {
          setUser(localUser);
          setUid('demo-uid');
        } else {
          setUser(null);
          setUid(null);
          setCurrentScreen('login');
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Manage Listeners (real Firebase or local storage fallback)
  useEffect(() => {
    if (!uid) return;

    if (uid === 'demo-uid') {
      // Guest/Demo local mode
      const storedBaby = getStoredBaby();
      setBaby(storedBaby);
      setReminders(getStoredReminders());
      setPediatricianNotes(getStoredPediatricianNotes());

      // Parse legacy localStorage mock data format into the new types
      const localLogs = getStoredLogs();
      const localFeedings = localLogs
        .filter(l => l.type === 'breast' || l.type === 'formula' || l.type === 'mixed' || l.type === 'water')
        .map(l => ({
          id: l.id,
          babyId: l.babyId,
          type: (l.type === 'breast' ? 'breast' : l.type === 'water' ? 'water' : 'formula') as FeedingType,
          datetime: new Date(l.timestamp).toISOString().split('.')[0].slice(0, 16),
          amountMl: l.details.breastFormulaMl || l.details.waterMl || undefined,
          durationMinutes: (l.details.breastLeftMinutes || 0) + (l.details.breastRightMinutes || 0) || undefined,
          notes: l.notes || '',
          createdAt: l.timestamp,
          updatedAt: l.timestamp
        }));

      const localFruits = localLogs
        .filter(l => l.type === 'fruit')
        .map(l => ({
          id: l.id,
          babyId: l.babyId,
          fruitName: l.details.fruitName || 'Banana',
          datetime: new Date(l.timestamp).toISOString().split('.')[0].slice(0, 16),
          quantity: (l.details.acceptance === 'excellent' ? 'muito' : l.details.acceptance === 'poor' ? 'muito pouco' : 'bem') as any,
          reaction: (l.details.acceptance === 'poor' ? 'recusou' : 'aceitou') as any,
          notes: l.notes || '',
          createdAt: l.timestamp,
          updatedAt: l.timestamp
        }));

      const localMeals = localLogs
        .filter(l => l.type === 'meal')
        .map(l => ({
          id: l.id,
          babyId: l.babyId,
          category: 'legume' as any,
          foodName: l.details.mealFoods?.join(', ') || 'Refeição Salgada',
          datetime: new Date(l.timestamp).toISOString().split('.')[0].slice(0, 16),
          quantity: (l.details.acceptance === 'excellent' ? 'muito' : l.details.acceptance === 'poor' ? 'muito pouco' : 'bem') as any,
          texture: 'amassado' as any,
          reaction: (l.details.acceptance === 'poor' ? 'recusou' : 'aceitou') as any,
          notes: l.notes || '',
          createdAt: l.timestamp,
          updatedAt: l.timestamp
        }));

      setFeedings(localFeedings);
      setFruits(localFruits);
      setMeals(localMeals);
      
      if (!storedBaby) {
        setCurrentScreen((prev) => prev !== 'baby-profile' ? 'baby-profile' : prev);
      } else {
        setCurrentScreen((prev) => prev === 'login' ? 'today' : prev);
      }
      return;
    }

    // Real Cloud Firebase mode
    const unsubBaby = subscribeToBaby(uid, (b) => {
      setBaby(b);
      // If user has no baby profile, automatically force profile creation
      if (!b) {
        setCurrentScreen((prev) => prev !== 'baby-profile' ? 'baby-profile' : prev);
      } else {
        setCurrentScreen((prev) => prev === 'login' ? 'today' : prev);
      }
    });

    const unsubFeedings = subscribeToFeedings(uid, (f) => setFeedings(f));
    const unsubFruits = subscribeToFruits(uid, (fr) => setFruits(fr));
    const unsubMeals = subscribeToMeals(uid, (m) => setMeals(m));
    const unsubReminders = subscribeToReminders(uid, (r) => setReminders(r));

    // Carrega as anotações do pediatra uma vez no início da sessão do usuário
    getPediatricianNotes(uid).then(notes => setPediatricianNotes(notes));

    return () => {
      unsubBaby();
      unsubFeedings();
      unsubFruits();
      unsubMeals();
      unsubReminders();
    };
  }, [uid]);

  // 3. Loop de verificação de lembretes em segundo plano
  useEffect(() => {
    const notifiedIds = new Set<string>();

    const checkInterval = setInterval(() => {
      if (Capacitor.isNativePlatform()) return;
      const now = Date.now();
      
      reminders.forEach((reminder) => {
        if (
          reminder.active &&
          reminder.nextTriggerAt > 0 &&
          reminder.nextTriggerAt <= now &&
          (!reminder.lastCompletedAt || reminder.lastCompletedAt < reminder.nextTriggerAt)
        ) {
          const uniqueEventKey = `${reminder.id}-${reminder.nextTriggerAt}`;
          
          if (!notifiedIds.has(uniqueEventKey)) {
            notifiedIds.add(uniqueEventKey);
            
            // 1. Notificação nativa do sistema (se autorizado)
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(reminder.title, {
                  body: reminder.notes || 'Hora de cuidar do bebê!',
                  icon: `${import.meta.env.BASE_URL}favicon.svg`,
                  vibrate: [200, 100, 200]
                } as any);
              } catch (e) {
                console.error('Erro ao disparar notificação nativa:', e);
              }
            }
            
            // 2. Fallback sonoro (Web Audio API)
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (soundError) {
              // Bloqueado pelas regras de interação do navegador
            }

            // 3. Fallback visual no próprio app
            alert(`⏰ Lembrete: ${reminder.title}\n${reminder.notes || 'Hora de cuidar do bebê!'}`);
          }
        }
      });
    }, 10000); // Executa a cada 10 segundos

    return () => clearInterval(checkInterval);
  }, [reminders]);

  // 4. Configurar ouvinte do FCM em primeiro plano (quando o app estiver aberto)
  useEffect(() => {
    if (!uid || uid === 'demo-uid') return;

    let unsubMessaging = () => {};

    const setupForegroundListener = async () => {
      try {
        const { onMessage } = await import('firebase/messaging');
        const { getMessagingInstance } = await import('./services/firebase');
        const messaging = await getMessagingInstance();
        
        if (messaging) {
          unsubMessaging = onMessage(messaging, (payload) => {
            console.log('FCM Mensagem recebida em primeiro plano:', payload);
            if (payload.notification) {
              alert(`🔔 ${payload.notification.title}\n${payload.notification.body}`);
            }
          });
        }
      } catch (err) {
        console.warn('Erro ao configurar listener em primeiro plano do FCM:', err);
      }
    };

    setupForegroundListener();

    return () => {
      unsubMessaging();
    };
  }, [uid]);

  // Auth Handlers
  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('rt_user', email);
    setUser(email);
    setUid(email === 'pais.demo@rotinabebe.com.br' ? 'demo-uid' : null);
  };

  const handleLogout = async () => {
    try {
      if (uid && uid !== 'demo-uid') {
        await logoutUser();
      }
      setUser(null);
      setUid(null);
      localStorage.removeItem('rt_user');
      setCurrentScreen('login');
    } catch (error) {
      alert('Erro ao sair da conta.');
    }
  };

  // Baby profile handlers
  const handleSaveBaby = async (updatedBaby: Baby) => {
    if (uid === 'demo-uid') {
      setBaby(updatedBaby);
      saveStoredBaby(updatedBaby);
      setCurrentScreen('today');
    } else if (uid) {
      try {
        const payload = {
          ...updatedBaby,
          id: baby?.id
        };
        await saveBaby(uid, payload);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar os dados do bebê no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  // Log handlers (Separate saves per database entity)
  const handleSaveFeeding = async (details: Omit<FeedingLog, 'babyId' | 'createdAt' | 'updatedAt'>) => {
    const logData = {
      babyId: 'baby-1',
      ...details
    };

    if (uid === 'demo-uid') {
      const newLog: FeedingLog = {
        id: `log-${Date.now()}`,
        ...logData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newLog, ...feedings];
      setFeedings(updated);
      saveStoredLogs([...updated, ...fruits, ...meals] as any);
      setCurrentScreen('today');
    } else if (uid) {
      try {
        await saveFeedingLog(uid, logData);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar mamada no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleSaveFruit = async (details: Omit<FruitLog, 'babyId' | 'createdAt' | 'updatedAt'>) => {
    const logData = {
      babyId: 'baby-1',
      ...details
    };

    if (uid === 'demo-uid') {
      const newLog: FruitLog = {
        id: `log-${Date.now()}`,
        ...logData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newLog, ...fruits];
      setFruits(updated);
      saveStoredLogs([...feedings, ...updated, ...meals] as any);
      setCurrentScreen('today');
    } else if (uid) {
      try {
        await saveFruitLog(uid, logData);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar registro de fruta no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleSaveMeal = async (details: Omit<MealLog, 'babyId' | 'createdAt' | 'updatedAt'>) => {
    const logData = {
      babyId: 'baby-1',
      ...details
    };

    if (uid === 'demo-uid') {
      const newLog: MealLog = {
        id: `log-${Date.now()}`,
        ...logData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newLog, ...meals];
      setMeals(updated);
      saveStoredLogs([...feedings, ...fruits, ...updated] as any);
      setCurrentScreen('today');
    } else if (uid) {
      try {
        await saveMealLog(uid, logData);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar refeição no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleAddWater = async (ml: number) => {
    // Current local datetime in YYYY-MM-DDTHH:MM
    const now = new Date();
    const datetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const logData = {
      babyId: 'baby-1',
      type: 'water' as const,
      datetime,
      amountMl: ml
    };

    if (uid === 'demo-uid') {
      const newLog: FeedingLog = {
        id: `log-${Date.now()}`,
        ...logData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updated = [newLog, ...feedings];
      setFeedings(updated);
      saveStoredLogs([...updated, ...fruits, ...meals] as any);
    } else if (uid) {
      try {
        await saveFeedingLog(uid, logData);
      } catch (error) {
        console.error(error);
        alert('Erro ao registrar água no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteLog = async (id: string, logType: 'feeding' | 'fruit' | 'meal') => {
    if (window.confirm('Deseja realmente excluir este registro?')) {
      if (uid === 'demo-uid') {
        if (logType === 'feeding') {
          const updated = feedings.filter(f => f.id !== id);
          setFeedings(updated);
          saveStoredLogs([...updated, ...fruits, ...meals] as any);
        } else if (logType === 'fruit') {
          const updated = fruits.filter(fr => fr.id !== id);
          setFruits(updated);
          saveStoredLogs([...feedings, ...updated, ...meals] as any);
        } else if (logType === 'meal') {
          const updated = meals.filter(m => m.id !== id);
          setMeals(updated);
          saveStoredLogs([...feedings, ...fruits, ...updated] as any);
        }
      } else if (uid) {
        try {
          if (logType === 'feeding') {
            await deleteFeedingLog(uid, id);
          } else if (logType === 'fruit') {
            await deleteFruitLog(uid, id);
          } else if (logType === 'meal') {
            await deleteMealLog(uid, id);
          }
        } catch (error) {
          alert('Erro ao excluir registro no Firestore.');
        }
      }
    }
  };

  // Reminder handlers
  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (uid === 'demo-uid') {
      const nextActive = !reminder.active;
      const triggerAt = nextActive 
        ? (reminder.mode === 'timer' 
            ? Date.now() + (reminder.intervalMinutes || 120) * 60 * 1000
            : (() => {
                const [h, m] = (reminder.fixedTime || '08:00').split(':');
                const d = new Date();
                d.setHours(Number(h), Number(m), 0, 0);
                if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
                return d.getTime();
              })())
        : 0;
      const updated = reminders.map(r => r.id === id ? { ...r, active: nextActive, nextTriggerAt: triggerAt } : r);
      setReminders(updated);
      saveStoredReminders(updated);

      // Sincroniza notificação local no modo simulado
      const updatedReminder = updated.find(r => r.id === id);
      if (updatedReminder) {
        await scheduleReminderNotification(updatedReminder);
      }
    } else if (uid) {
      try {
        await toggleReminderActive(uid, reminder);
      } catch (error) {
        console.error(error);
        alert('Erro ao alterar status do lembrete: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleAddReminder = async (newRem: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'nextTriggerAt'> & { id?: string }) => {
    if (uid === 'demo-uid') {
      if (newRem.id) {
        // Editar lembrete simulado
        const updated = reminders.map(r => r.id === newRem.id ? {
          ...r,
          ...newRem,
          updatedAt: Date.now(),
          nextTriggerAt: newRem.active 
            ? (newRem.mode === 'timer' 
                ? Date.now() + (newRem.intervalMinutes || 120) * 60 * 1000
                : (() => {
                    const [h, m] = (newRem.fixedTime || '08:00').split(':');
                    const d = new Date();
                    d.setHours(Number(h), Number(m), 0, 0);
                    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
                    return d.getTime();
                  })())
            : 0
        } as Reminder : r);
        setReminders(updated);
        saveStoredReminders(updated);

        // Sincroniza notificação local no modo simulado
        const updatedReminder = updated.find(r => r.id === newRem.id);
        if (updatedReminder) {
          await scheduleReminderNotification(updatedReminder);
        }
      } else {
        // Criar novo lembrete simulado
        const triggerAt = newRem.active 
          ? (newRem.mode === 'timer' 
              ? Date.now() + (newRem.intervalMinutes || 120) * 60 * 1000
              : (() => {
                  const [h, m] = (newRem.fixedTime || '08:00').split(':');
                  const d = new Date();
                  d.setHours(Number(h), Number(m), 0, 0);
                  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
                  return d.getTime();
                })())
          : 0;

        const reminder: Reminder = {
          ...newRem as any,
          id: `rem-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          nextTriggerAt: triggerAt
        };
        const updated = [...reminders, reminder].sort((a, b) => a.nextTriggerAt - b.nextTriggerAt);
        setReminders(updated);
        saveStoredReminders(updated);

        // Sincroniza notificação local no modo simulado
        await scheduleReminderNotification(reminder);
      }
    } else if (uid) {
      try {
        await saveReminder(uid, newRem);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar lembrete no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleCompleteReminder = async (reminder: Reminder) => {
    if (uid === 'demo-uid') {
      const now = Date.now();
      let nextActive = reminder.active;
      let triggerAt = 0;

      if (reminder.mode === 'timer') {
        triggerAt = now + (reminder.intervalMinutes || 120) * 60 * 1000;
      } else {
        if (reminder.repeatDaily) {
          const [h, m] = (reminder.fixedTime || '08:00').split(':');
          const d = new Date();
          d.setHours(Number(h), Number(m), 0, 0);
          if (d.getTime() <= now) d.setDate(d.getDate() + 1);
          triggerAt = d.getTime();
        } else {
          nextActive = false;
        }
      }
      
      const updated = reminders.map(r => r.id === reminder.id ? {
        ...r,
        active: nextActive,
        lastCompletedAt: now,
        nextTriggerAt: triggerAt,
        updatedAt: now
      } : r);
      setReminders(updated);
      saveStoredReminders(updated);

      // Sincroniza notificação local no modo simulado
      const updatedReminder = updated.find(r => r.id === reminder.id);
      if (updatedReminder) {
        await scheduleReminderNotification(updatedReminder);
      }
    } else if (uid) {
      try {
        await completeReminder(uid, reminder);
      } catch (error) {
        console.error(error);
        alert('Erro ao marcar lembrete como concluído: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      saveStoredReminders(updated);

      // Cancela a notificação local correspondente
      await cancelReminderNotification(id);
    } else if (uid) {
      try {
        await deleteReminder(uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir lembrete: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleSavePediatricianNotes = async (newNotes: string) => {
    setPediatricianNotes(newNotes);
    if (uid === 'demo-uid') {
      saveStoredPediatricianNotes(newNotes);
    } else if (uid) {
      await savePediatricianNotes(uid, newNotes);
    }
  };

  const handleActivatePushNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      const granted = await requestLocalNotificationPermission();
      if (!granted) {
        throw new Error('Permissão de notificação local negada pelo usuário.');
      }
      return;
    }

    if (uid === 'demo-uid') {
      // Simulação para o modo demonstração/convidado
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permissão de notificação negada pelo usuário (simulado).');
        }
      }
      return;
    }

    if (uid) {
      await requestFCMToken(uid);
    } else {
      throw new Error('Usuário não autenticado.');
    }
  };

  // Render correct sub-screen component
  const renderScreen = () => {
    if (!user) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    if (!baby || currentScreen === 'baby-profile') {
      return (
        <BabyProfileScreen
          initialBaby={baby}
          onSave={handleSaveBaby}
        />
      );
    }

    switch (currentScreen) {
      case 'login':
      case 'today':
        return (
          <TodayScreen
            baby={baby}
            feedings={feedings}
            fruits={fruits}
            meals={meals}
            reminders={reminders}
            onNavigate={(screen) => {
              setPreviousTab('today');
              setCurrentScreen(screen as ScreenName);
            }}
            onAddWaterLog={handleAddWater}
            onDeleteLog={(id) => {
              // Find which logType it is in local state arrays
              const isFeeding = feedings.some(f => f.id === id);
              const isFruit = fruits.some(fr => fr.id === id);
              const isMeal = meals.some(m => m.id === id);
              
              if (isFeeding) handleDeleteLog(id, 'feeding');
              else if (isFruit) handleDeleteLog(id, 'fruit');
              else if (isMeal) handleDeleteLog(id, 'meal');
            }}
            onCompleteReminder={handleCompleteReminder}
            onToggleReminder={handleToggleReminder}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            feedings={feedings}
            fruits={fruits}
            meals={meals}
            onDeleteLog={handleDeleteLog}
          />
        );
      case 'reminders':
        return (
          <RemindersScreen
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onCompleteReminder={handleCompleteReminder}
          />
        );
      case 'pediatrician':
        return (
          <PediatricianScreen
            baby={baby!}
            feedings={feedings}
            fruits={fruits}
            meals={meals}
            initialNotes={pediatricianNotes}
            onSaveNotes={handleSavePediatricianNotes}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            userEmail={user}
            onEditBaby={() => {
              setPreviousTab('settings');
              setCurrentScreen('baby-profile');
            }}
            onLogout={handleLogout}
            onActivatePush={handleActivatePushNotifications}
          />
        );
      case 'feed-breast':
        return (
          <FeedBreastScreen
            onSave={handleSaveFeeding}
            onCancel={() => setCurrentScreen('today')}
          />
        );
      case 'feed-fruit':
        return (
          <FeedFruitScreen
            onSave={handleSaveFruit}
            onCancel={() => setCurrentScreen('today')}
          />
        );
      case 'feed-meal':
        return (
          <FeedMealScreen
            onSave={handleSaveMeal}
            onCancel={() => setCurrentScreen('today')}
          />
        );
      default:
        return <div className="p-4">Tela não encontrada.</div>;
    }
  };

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'today':
        return 'Rotina Alimentar Bebê';
      case 'history':
        return 'Histórico';
      case 'reminders':
        return 'Lembretes';
      case 'pediatrician':
        return 'Relatório do Pediatra';
      case 'settings':
        return 'Configurações';
      case 'feed-breast':
        return 'Registrar Mamada';
      case 'feed-fruit':
        return 'Registrar Fruta';
      case 'feed-meal':
        return 'Registrar Refeição';
      case 'baby-profile':
        return baby ? 'Editar Bebê' : 'Cadastrar Bebê';
      default:
        return 'Rotina Alimentar Bebê';
    }
  };

  const showNav = user && baby && ['today', 'history', 'reminders', 'pediatrician', 'settings'].includes(currentScreen);
  const showBack = user && baby && ['feed-breast', 'feed-fruit', 'feed-meal', 'baby-profile'].includes(currentScreen);

  const handleBack = showBack ? () => {
    if (currentScreen === 'baby-profile') {
      setCurrentScreen(previousTab);
    } else {
      setCurrentScreen('today');
    }
  } : undefined;

  return (
    <AppShell>
      {user && (
        <TopBar
          title={getHeaderTitle()}
          babyName={baby?.name}
          onBack={handleBack}
          onProfileClick={showNav ? () => {
            setPreviousTab(currentScreen);
            setCurrentScreen('baby-profile');
          } : undefined}
        />
      )}
      
      <main className="flex-1 overflow-y-auto pb-6">
        {renderScreen()}
      </main>

      {showNav && (
        <BottomNav
          activeTab={currentScreen as TabName}
          onTabChange={(tab) => setCurrentScreen(tab as ScreenName)}
        />
      )}
    </AppShell>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
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
import GrowthScreen from './screens/GrowthScreen';
import { VaccinesScreen } from './screens/VaccinesScreen';
import AlimentacaoScreen from './screens/AlimentacaoScreen';
import SleepScreen from './screens/SleepScreen';
import DiaperScreen from './screens/DiaperScreen';
import MedicationScreen from './screens/MedicationScreen';
import MoreScreen from './screens/MoreScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfUseScreen from './screens/TermsOfUseScreen';
import DataSavedScreen from './screens/DataSavedScreen';
import ImportantInfoScreen from './screens/ImportantInfoScreen';

// Types
import type { 
  Baby, FeedingLog, FruitLog, MealLog, FeedingType, Reminder, 
  GrowthRecord, VaccineRecord, CustomVaccine,
  SleepRecord, DiaperRecord, Medication, MedicationLog
} from './types';

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
import { subscribeToGrowthRecords, saveGrowthRecord, deleteGrowthRecord } from './services/growthService';
import { 
  subscribeToVaccineRecords, 
  subscribeToCustomVaccines, 
  saveVaccineRecord, 
  deleteVaccineRecord, 
  saveCustomVaccine, 
  deleteCustomVaccine 
} from './services/vaccineService';
import { subscribeToSleepRecords, saveSleepRecord, deleteSleepRecord } from './services/sleepService';
import { subscribeToDiaperRecords, saveDiaperRecord, deleteDiaperRecord } from './services/diaperService';
import { 
  subscribeToMedications, subscribeToMedicationLogs, 
  saveMedication, deleteMedication, 
  saveMedicationLog, deleteMedicationLog,
  calculateReminderTimes
} from './services/medicationService';
import { requestFCMToken } from './services/notificationService';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import {
  scheduleReminderNotification,
  cancelReminderNotification,
  requestLocalNotificationPermission
} from './services/localNotificationService';

// Family Sharing Services & UI
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  subscribeToUserProfile,
  subscribeToFamilyMembers,
  subscribeToFamilyInvites,
  createFamily,
  migrateUserDataToFamily
} from './services/familyService';
import FamilyScreen from './screens/FamilyScreen';
import { deleteAllUserData, deleteUserAccount } from './services/privacyService';
import type { FamilyMember, FamilyInvite, UserProfile } from './types';

// Mock DB helpers (for Guest/Demo mode)
import {
  getStoredBaby,
  saveStoredBaby,
  getStoredLogs,
  saveStoredLogs,
  getStoredReminders,
  saveStoredReminders,
  getStoredPediatricianNotes,
  saveStoredPediatricianNotes,
  getStoredGrowthRecords,
  saveStoredGrowthRecords,
  getStoredVaccineRecords,
  saveStoredVaccineRecords,
  getStoredCustomVaccines,
  saveStoredCustomVaccines,
  getStoredSleepRecords,
  saveStoredSleepRecords,
  getStoredDiaperRecords,
  saveStoredDiaperRecords,
  getStoredMedications,
  saveStoredMedications,
  getStoredMedicationLogs,
  saveStoredMedicationLogs
} from './config/mockData';
import { getPediatricianNotes, savePediatricianNotes } from './services/pediatricianService';

type ScreenName = 'login' | 'baby-profile' | 'today' | 'history' | 'growth' | 'vaccines' | 'reminders' | 'pediatrician' | 'settings' | 'feed-breast' | 'feed-fruit' | 'feed-meal' | 'feedings' | 'sleep' | 'diapers' | 'medications' | 'more' | 'privacy-policy' | 'terms-of-use' | 'data-saved' | 'important-info' | 'family-sharing';

function App() {
  // Authentication states
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('rt_user'));
  const [uid, setUid] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Deletion locks
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Family Sharing states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeFamilyId, setActiveFamilyId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<'admin' | 'cuidador' | 'leitura' | undefined>(undefined);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyInvites, setFamilyInvites] = useState<FamilyInvite[]>([]);

  // Firestore specific states
  const [feedings, setFeedings] = useState<FeedingLog[]>([]);
  const [fruits, setFruits] = useState<FruitLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [customVaccines, setCustomVaccines] = useState<CustomVaccine[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [diaperRecords, setDiaperRecords] = useState<DiaperRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);

  // Main Database states
  const [baby, setBaby] = useState<Baby | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pediatricianNotes, setPediatricianNotes] = useState<string>('');

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('today');
  const [previousTab, setPreviousTab] = useState<ScreenName>('today');

  // State to hold feeding log currently being edited
  const [editingFeeding, setEditingFeeding] = useState<FeedingLog | null>(null);

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
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Manage Listeners (real Firebase or local storage fallback)
  useEffect(() => {
    if (!uid || isDeletingAccount) {
      setUserProfile(null);
      setActiveFamilyId(undefined);
      setUserRole(undefined);
      return;
    }

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
      setGrowthRecords(getStoredGrowthRecords());
      setVaccineRecords(getStoredVaccineRecords());
      setCustomVaccines(getStoredCustomVaccines());
      setSleepRecords(getStoredSleepRecords());
      setDiaperRecords(getStoredDiaperRecords());
      setMedications(getStoredMedications());
      setMedicationLogs(getStoredMedicationLogs());
      setUserRole('admin');
      
      if (!storedBaby) {
        setCurrentScreen((prev) => prev !== 'baby-profile' ? 'baby-profile' : prev);
      } else {
        setCurrentScreen((prev) => prev === 'login' ? 'today' : prev);
      }
      return;
    }

    // Real Cloud Firebase mode
    // Primeiro, assina o perfil do usuário no Firestore
    const unsubProfile = subscribeToUserProfile(uid, async (profile) => {
      setUserProfile(profile);

      if (!profile) {
        // Se o perfil do usuário no Firestore ainda não existir, cria um padrão
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          email: user,
          displayName: user?.split('@')[0] || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }, { merge: true });
        return;
      }

      const famId = profile.activeFamilyId;
      if (!famId) {
        // Auto-cria a família padrão se não houver activeFamilyId
        try {
          await createFamily(uid, profile.email);
        } catch (e) {
          console.error('Erro ao auto-criar família para perfil:', e);
        }
        return;
      }

      setActiveFamilyId(famId);
    });

    return () => {
      unsubProfile();
    };
  }, [uid, user, isDeletingAccount]);

  // 2B. Escuta os dados da família quando activeFamilyId for resolvido
  useEffect(() => {
    if (!uid || uid === 'demo-uid' || !activeFamilyId || isDeletingAccount) return;

    // A. Resolve o papel do usuário na família ativa
    const memberDocRef = doc(db, 'families', activeFamilyId, 'members', uid);
    const unsubRole = onSnapshot(memberDocRef, (snap) => {
      if (snap.exists()) {
        setUserRole(snap.data().role || 'leitura');
      } else {
        setUserRole('leitura'); // Fallback seguro
      }
    }, (error) => {
      console.error('Erro ao assinar papel do membro:', error);
      setUserRole('leitura');
    });

    // B. Assina membros e convites
    const unsubMembers = subscribeToFamilyMembers(activeFamilyId, setFamilyMembers);
    const unsubInvites = subscribeToFamilyInvites(activeFamilyId, setFamilyInvites);

    // C. Assina todas as subcoleções do bebê pertencentes à família
    const unsubBaby = subscribeToBaby(activeFamilyId, (b) => {
      setBaby(b);
      // Se não houver bebê cadastrado, força o preenchimento do perfil do bebê
      if (!b) {
        setCurrentScreen((prev) => prev !== 'baby-profile' ? 'baby-profile' : prev);
      } else {
        setCurrentScreen((prev) => prev === 'login' ? 'today' : prev);
      }
    });

    const unsubFeedings = subscribeToFeedings(activeFamilyId, (f) => setFeedings(f));
    const unsubFruits = subscribeToFruits(activeFamilyId, (fr) => setFruits(fr));
    const unsubMeals = subscribeToMeals(activeFamilyId, (m) => setMeals(m));
    const unsubReminders = subscribeToReminders(activeFamilyId, (r) => setReminders(r));
    const unsubGrowth = subscribeToGrowthRecords(activeFamilyId, (g) => setGrowthRecords(g));
    const unsubVaccineRecords = subscribeToVaccineRecords(activeFamilyId, (vr) => setVaccineRecords(vr));
    const unsubCustomVaccines = subscribeToCustomVaccines(activeFamilyId, (cv) => setCustomVaccines(cv));
    const unsubSleep = subscribeToSleepRecords(activeFamilyId, (s) => setSleepRecords(s));
    const unsubDiaper = subscribeToDiaperRecords(activeFamilyId, (d) => setDiaperRecords(d));
    const unsubMedications = subscribeToMedications(activeFamilyId, (m) => setMedications(m));
    const unsubMedicationLogs = subscribeToMedicationLogs(activeFamilyId, (ml) => setMedicationLogs(ml));

    // Carrega notas do pediatra
    getPediatricianNotes(activeFamilyId).then(notes => setPediatricianNotes(notes));

    return () => {
      unsubRole();
      unsubMembers();
      unsubInvites();
      unsubBaby();
      unsubFeedings();
      unsubFruits();
      unsubMeals();
      unsubReminders();
      unsubGrowth();
      unsubVaccineRecords();
      unsubCustomVaccines();
      unsubSleep();
      unsubDiaper();
      unsubMedications();
      unsubMedicationLogs();
    };
  }, [uid, activeFamilyId, isDeletingAccount]);

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

  // 3.5. Sincronizar notificações locais nativas quando a lista de lembretes mudar (ex: modificado/adicionado por outro membro da família)
  const prevReminderIdsRef = useRef<string[]>([]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const syncNotifications = async () => {
      const currentIds = reminders.map(r => r.id).filter((id): id is string => !!id);
      
      // 1. Cancelar notificações de lembretes que foram removidos
      const removedIds = prevReminderIdsRef.current.filter(id => !currentIds.includes(id));
      for (const id of removedIds) {
        await cancelReminderNotification(id);
      }
      
      // 2. Agendar/atualizar notificações para os lembretes atuais ativos
      for (const reminder of reminders) {
        await scheduleReminderNotification(reminder);
      }
      
      prevReminderIdsRef.current = currentIds;
    };

    syncNotifications();
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

  // 5. Configurar ouvinte do botão Voltar físico do Android (Capacitor)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleHardwareBack = () => {
      // Telas raiz que devem sair do app
      if (currentScreen === 'today' || currentScreen === 'login') {
        return true;
      }

      // Se estiver no cadastro inicial do bebê e não tiver bebê cadastrado ainda
      if (currentScreen === 'baby-profile' && !baby) {
        return true;
      }

      // Formulários / Telas de Registro
      if (['feed-breast', 'feed-fruit', 'feed-meal', 'sleep', 'diapers', 'medications'].includes(currentScreen)) {
        setCurrentScreen(previousTab || 'today');
        return false;
      }

      // Telas de configuração / suporte
      if (['family-sharing', 'privacy-policy', 'terms-of-use', 'data-saved', 'important-info'].includes(currentScreen)) {
        setCurrentScreen('settings');
        return false;
      }

      // Abas secundárias do menu inferior / More
      if (['history', 'growth', 'vaccines', 'reminders', 'pediatrician', 'settings', 'more'].includes(currentScreen)) {
        setCurrentScreen('today');
        return false;
      }

      setCurrentScreen('today');
      return false;
    };

    let backButtonListener: any = null;

    const setupListener = async () => {
      try {
        backButtonListener = await CapApp.addListener('backButton', () => {
          const exitApp = handleHardwareBack();
          if (exitApp) {
            CapApp.exitApp();
          }
        });
      } catch (e) {
        console.warn('Erro ao registrar backButton listener:', e);
      }
    };

    setupListener();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [currentScreen, previousTab, baby]);

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
    } catch (error) {
      console.error('Erro ao efetuar logout no Firebase:', error);
    } finally {
      // Garantir limpeza total do estado local da aplicação
      setUser(null);
      setUid(null);
      setBaby(null);
      setFeedings([]);
      setFruits([]);
      setMeals([]);
      setGrowthRecords([]);
      setVaccineRecords([]);
      setCustomVaccines([]);
      setSleepRecords([]);
      setDiaperRecords([]);
      setMedications([]);
      setMedicationLogs([]);
      setReminders([]);
      setPediatricianNotes('');
      localStorage.removeItem('rt_user');
      setCurrentScreen('login');
    }
  };

  const handleDeleteAccount = async () => {
    const currentUserUid = uid;
    if (!currentUserUid || currentUserUid === 'demo-uid') {
      throw new Error('Nenhum usuário ativo encontrado.');
    }

    setIsDeletingAccount(true);

    try {
      // 1. Apaga todos os registros do Firestore
      await deleteAllUserData(currentUserUid, activeFamilyId);
      
      // 2. Apaga a conta de usuário no Firebase Auth
      await deleteUserAccount();
    } catch (error) {
      // Se falhar (ex: requires-recent-login), restaura o flag para reativar os listeners e permitir que tente novamente
      setIsDeletingAccount(false);
      throw error;
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
        await saveBaby(activeFamilyId || uid, payload);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar os dados do bebê no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  // Log handlers (Separate saves per database entity)
  const handleSaveFeeding = async (details: Omit<FeedingLog, 'babyId' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const logData = {
      babyId: 'baby-1',
      ...details
    };

    if (uid === 'demo-uid') {
      const newLog: FeedingLog = {
        id: logData.id || `log-${Date.now()}`,
        ...logData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: FeedingLog[];
      if (logData.id) {
        updated = feedings.map(f => f.id === logData.id ? newLog : f);
      } else {
        updated = [newLog, ...feedings];
      }
      setFeedings(updated);
      saveStoredLogs([...updated, ...fruits, ...meals] as any);
      setEditingFeeding(null);
      setCurrentScreen('today');
    } else if (uid) {
      try {
        await saveFeedingLog(activeFamilyId || uid, logData);
        setEditingFeeding(null);
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
        await saveFruitLog(activeFamilyId || uid, logData);
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
        await saveMealLog(activeFamilyId || uid, logData);
        setCurrentScreen('today');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar refeição no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleSaveSleepRecord = async (details: Omit<SleepRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const newRecord: SleepRecord = {
        id: recordData.id || `slp-${Date.now()}`,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: SleepRecord[];
      if (recordData.id) {
        updated = sleepRecords.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...sleepRecords];
      }
      setSleepRecords(updated);
      saveStoredSleepRecords(updated);
    } else if (uid) {
      try {
        await saveSleepRecord(activeFamilyId || uid, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar registro de sono no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteSleepRecord = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = sleepRecords.filter(r => r.id !== id);
      setSleepRecords(updated);
      saveStoredSleepRecords(updated);
    } else if (uid) {
      try {
        await deleteSleepRecord(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir registro de sono.');
      }
    }
  };

  const handleSaveDiaperRecord = async (details: Omit<DiaperRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const newRecord: DiaperRecord = {
        id: recordData.id || `dia-${Date.now()}`,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: DiaperRecord[];
      if (recordData.id) {
        updated = diaperRecords.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...diaperRecords];
      }
      setDiaperRecords(updated);
      saveStoredDiaperRecords(updated);
    } else if (uid) {
      try {
        await saveDiaperRecord(activeFamilyId || uid, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar registro de fralda no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteDiaperRecord = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = diaperRecords.filter(r => r.id !== id);
      setDiaperRecords(updated);
      saveStoredDiaperRecords(updated);
    } else if (uid) {
      try {
        await deleteDiaperRecord(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir registro de fralda.');
      }
    }
  };

  const handleSaveMedication = async (details: Omit<Medication, 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const newRecord: Medication = {
        id: recordData.id || `med-${Date.now()}`,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: Medication[];
      if (recordData.id) {
        updated = medications.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...medications];
      }
      setMedications(updated);
      saveStoredMedications(updated);

      // Clean up previous reminders for this medication
      const filteredReminders = reminders.filter(r => r.medicationId !== newRecord.id);
      
      let nextReminders = [...filteredReminders];

      if (newRecord.active && newRecord.enableReminder !== false) {
        const times = calculateReminderTimes(newRecord);
        const addedReminders: Reminder[] = [];
        
        for (let i = 0; i < times.length; i++) {
          const time = times[i];
          const [h, m] = time.split(':');
          const d = new Date();
          d.setHours(Number(h), Number(m), 0, 0);
          if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
          
          const remPayload: Reminder = {
            id: `rem-med-${newRecord.id}-${i}-${Date.now()}`,
            babyId: newRecord.babyId,
            type: 'medicamento',
            title: `${newRecord.name} (${newRecord.dose} ${newRecord.unit})`,
            mode: 'fixed',
            fixedTime: time,
            repeatDaily: newRecord.frequencyType !== 'dose única',
            active: true,
            medicationId: newRecord.id,
            notes: newRecord.notes || `Administrar ${newRecord.name}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nextTriggerAt: d.getTime(),
            nextDueAt: d.getTime()
          };
          addedReminders.push(remPayload);
        }

        nextReminders = [...nextReminders, ...addedReminders].sort((a, b) => a.nextTriggerAt - b.nextTriggerAt);
        
        // Schedule local notification for each new reminder
        for (const rem of addedReminders) {
          await scheduleReminderNotification(rem);
        }
      }
      
      setReminders(nextReminders);
      saveStoredReminders(nextReminders);
    } else if (uid) {
      try {
        await saveMedication(activeFamilyId || uid, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar medicamento no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = medications.filter(r => r.id !== id);
      setMedications(updated);
      saveStoredMedications(updated);

      const updatedReminders = reminders.filter(r => r.medicationId !== id);
      setReminders(updatedReminders);
      saveStoredReminders(updatedReminders);
    } else if (uid) {
      try {
        await deleteMedication(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir medicamento.');
      }
    }
  };

  const handleSaveMedicationLog = async (details: Omit<MedicationLog, 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const newRecord: MedicationLog = {
        id: recordData.id || `med-log-${Date.now()}`,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: MedicationLog[];
      if (recordData.id) {
        updated = medicationLogs.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...medicationLogs];
      }
      setMedicationLogs(updated);
      saveStoredMedicationLogs(updated);
    } else if (uid) {
      try {
        await saveMedicationLog(activeFamilyId || uid, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar administração de medicamento no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteMedicationLog = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = medicationLogs.filter(r => r.id !== id);
      setMedicationLogs(updated);
      saveStoredMedicationLogs(updated);
    } else if (uid) {
      try {
        await deleteMedicationLog(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir registro de administração.');
      }
    }
  };

  const handleSaveGrowthRecord = async (details: Omit<GrowthRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const newRecord: GrowthRecord = {
        id: recordData.id || `gro-${Date.now()}`,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: GrowthRecord[];
      if (recordData.id) {
        updated = growthRecords.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...growthRecords];
      }
      setGrowthRecords(updated);
      saveStoredGrowthRecords(updated);
    } else if (uid) {
      try {
        await saveGrowthRecord(activeFamilyId || uid, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar registro de crescimento no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteGrowthRecord = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = growthRecords.filter(r => r.id !== id);
      setGrowthRecords(updated);
      saveStoredGrowthRecords(updated);
    } else if (uid) {
      try {
        await deleteGrowthRecord(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir registro de crescimento no Firestore.');
      }
    }
  };

  const handleSaveVaccineRecord = async (details: Omit<VaccineRecord, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> => {
    const recordData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const generatedId = recordData.id || `vac-rec-${Date.now()}`;
      const newRecord: VaccineRecord = {
        id: generatedId,
        ...recordData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: VaccineRecord[];
      if (recordData.id) {
        updated = vaccineRecords.map(r => r.id === recordData.id ? newRecord : r);
      } else {
        updated = [newRecord, ...vaccineRecords];
      }
      setVaccineRecords(updated);
      saveStoredVaccineRecords(updated);
      return generatedId;
    } else {
      try {
        return await saveVaccineRecord(activeFamilyId || uid!, recordData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar registro de vacina no Firestore: ' + (error instanceof Error ? error.message : String(error)));
        throw error;
      }
    }
  };

  const handleDeleteVaccineRecord = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = vaccineRecords.filter(r => r.id !== id);
      setVaccineRecords(updated);
      saveStoredVaccineRecords(updated);
    } else if (uid) {
      try {
        await deleteVaccineRecord(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir registro de vacina no Firestore.');
      }
    }
  };

  const handleSaveCustomVaccine = async (details: Omit<CustomVaccine, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> => {
    const customData = {
      ...details,
      babyId: baby?.id || details.babyId || 'baby-1'
    };

    if (uid === 'demo-uid') {
      const generatedId = customData.id || `custom-vac-${Date.now()}`;
      const newCustom: CustomVaccine = {
        id: generatedId,
        ...customData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      let updated: CustomVaccine[];
      if (customData.id) {
        updated = customVaccines.map(c => c.id === customData.id ? newCustom : c);
      } else {
        updated = [...customVaccines, newCustom];
      }
      setCustomVaccines(updated);
      saveStoredCustomVaccines(updated);
      return generatedId;
    } else {
      try {
        return await saveCustomVaccine(activeFamilyId || uid!, customData);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar vacina personalizada no Firestore: ' + (error instanceof Error ? error.message : String(error)));
        throw error;
      }
    }
  };

  const handleDeleteCustomVaccine = async (id: string) => {
    if (uid === 'demo-uid') {
      const updated = customVaccines.filter(c => c.id !== id);
      setCustomVaccines(updated);
      saveStoredCustomVaccines(updated);
    } else if (uid) {
      try {
        await deleteCustomVaccine(activeFamilyId || uid, id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir vacina personalizada no Firestore.');
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
        await saveFeedingLog(activeFamilyId || uid, logData);
      } catch (error) {
        console.error(error);
        alert('Erro ao registrar água no Firestore: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleDeleteLog = async (id: string, logType: 'feeding' | 'fruit' | 'meal' | 'sleep' | 'diaper' | 'medication') => {
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
        } else if (logType === 'sleep') {
          const updated = sleepRecords.filter(s => s.id !== id);
          setSleepRecords(updated);
          saveStoredSleepRecords(updated);
        } else if (logType === 'diaper') {
          const updated = diaperRecords.filter(d => d.id !== id);
          setDiaperRecords(updated);
          saveStoredDiaperRecords(updated);
        } else if (logType === 'medication') {
          const updated = medicationLogs.filter(ml => ml.id !== id);
          setMedicationLogs(updated);
          saveStoredMedicationLogs(updated);
        }
      } else if (uid) {
        try {
          if (logType === 'feeding') {
            await deleteFeedingLog(activeFamilyId || uid, id);
          } else if (logType === 'fruit') {
            await deleteFruitLog(activeFamilyId || uid, id);
          } else if (logType === 'meal') {
            await deleteMealLog(activeFamilyId || uid, id);
          } else if (logType === 'sleep') {
            await deleteSleepRecord(activeFamilyId || uid, id);
          } else if (logType === 'diaper') {
            await deleteDiaperRecord(activeFamilyId || uid, id);
          } else if (logType === 'medication') {
            await deleteMedicationLog(activeFamilyId || uid, id);
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
        await toggleReminderActive(activeFamilyId || uid, reminder);
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
        await saveReminder(activeFamilyId || uid, newRem);
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
        await completeReminder(activeFamilyId || uid, reminder);
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
        await deleteReminder(activeFamilyId || uid, id);
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
      await savePediatricianNotes(activeFamilyId || uid, newNotes);
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
      await requestFCMToken(uid, activeFamilyId || uid);
    } else {
      throw new Error('Usuário não autenticado.');
    }
  };

  // Render correct sub-screen component
  const renderScreen = () => {
    if (authLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-screen bg-[#FFF8F0]">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-md mb-6 animate-pulse bg-white flex items-center justify-center">
              <img src="/favicon.svg" alt="Baby Grow Logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="w-10 h-10 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#FF7A00] font-bold text-sm mt-4">Carregando o Baby Grow...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    if (!baby || currentScreen === 'baby-profile') {
      return (
        <BabyProfileScreen
          initialBaby={baby}
          userRole={userRole}
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
            growthRecords={growthRecords}
            reminders={reminders}
            sleepRecords={sleepRecords}
            diaperRecords={diaperRecords}
            medicationLogs={medicationLogs}
            userRole={userRole}
            onNavigate={(screen) => {
              setPreviousTab(currentScreen === 'today' ? 'today' : currentScreen);
              setCurrentScreen(screen as ScreenName);
            }}
            onAddWaterLog={handleAddWater}
            onDeleteLog={handleDeleteLog}
            onCompleteReminder={handleCompleteReminder}
            onEditFeeding={(feeding) => {
              setEditingFeeding(feeding);
              setPreviousTab(currentScreen);
              setCurrentScreen('feed-breast');
            }}
          />
        );
      case 'feedings':
        return (
          <AlimentacaoScreen
            feedings={feedings}
            fruits={fruits}
            meals={meals}
            userRole={userRole}
            onNavigate={(screen) => {
              setPreviousTab('feedings');
              setCurrentScreen(screen as ScreenName);
            }}
            onAddWaterLog={handleAddWater}
            onDeleteLog={handleDeleteLog}
          />
        );
      case 'sleep':
        return (
          <SleepScreen
            baby={baby!}
            sleepRecords={sleepRecords}
            userRole={userRole}
            onSaveRecord={handleSaveSleepRecord}
            onDeleteRecord={handleDeleteSleepRecord}
          />
        );
      case 'diapers':
        return (
          <DiaperScreen
            diaperRecords={diaperRecords}
            userRole={userRole}
            onSaveRecord={handleSaveDiaperRecord}
            onDeleteRecord={handleDeleteDiaperRecord}
          />
        );
      case 'medications':
        return (
          <MedicationScreen
            medications={medications}
            medicationLogs={medicationLogs}
            reminders={reminders}
            userRole={userRole}
            onSaveMedication={handleSaveMedication}
            onDeleteMedication={handleDeleteMedication}
            onSaveMedicationLog={handleSaveMedicationLog}
            onDeleteMedicationLog={handleDeleteMedicationLog}
          />
        );
      case 'more':
        return (
          <MoreScreen
            onNavigate={(screen) => {
              setPreviousTab('more');
              setCurrentScreen(screen as ScreenName);
            }}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            feedings={feedings}
            fruits={fruits}
            meals={meals}
            sleepRecords={sleepRecords}
            diaperRecords={diaperRecords}
            medicationLogs={medicationLogs}
            userRole={userRole}
            onDeleteLog={handleDeleteLog}
            onEditFeeding={(feeding) => {
              setEditingFeeding(feeding);
              setPreviousTab(currentScreen);
              setCurrentScreen('feed-breast');
            }}
          />
        );
      case 'growth':
        return (
          <GrowthScreen
            baby={baby!}
            growthRecords={growthRecords}
            userRole={userRole}
            onSaveRecord={handleSaveGrowthRecord}
            onDeleteRecord={handleDeleteGrowthRecord}
          />
        );
      case 'vaccines':
        return (
          <VaccinesScreen
            baby={baby!}
            vaccineRecords={vaccineRecords}
            customVaccines={customVaccines}
            reminders={reminders}
            userRole={userRole}
            onSaveRecord={handleSaveVaccineRecord}
            onDeleteRecord={handleDeleteVaccineRecord}
            onSaveCustomVaccine={handleSaveCustomVaccine}
            onDeleteCustomVaccine={handleDeleteCustomVaccine}
            onSaveReminder={handleAddReminder}
          />
        );
      case 'reminders':
        return (
          <RemindersScreen
            reminders={reminders}
            userRole={userRole}
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
            userRole={userRole}
            onSaveNotes={handleSavePediatricianNotes}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            userEmail={user}
            userProfile={userProfile}
            userRole={userRole}
            onEditBaby={() => {
              setPreviousTab('settings');
              setCurrentScreen('baby-profile');
            }}
            onLogout={handleLogout}
            onActivatePush={handleActivatePushNotifications}
            onNavigate={(screen) => {
              setPreviousTab('settings');
              setCurrentScreen(screen as any);
            }}
            onMigrateData={async () => {
              if (uid && activeFamilyId) {
                await migrateUserDataToFamily(uid, activeFamilyId);
                setUserProfile(prev => prev ? { ...prev, migrationToFamilyCompleted: true } : null);
              }
            }}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'family-sharing':
        return (
          <FamilyScreen
            userId={uid || ''}
            userEmail={user || ''}
            familyId={activeFamilyId}
            familyName={baby?.name ? `Família de ${baby.name}` : undefined}
            userRole={userRole}
            members={familyMembers}
            invites={familyInvites}
            onBack={() => setCurrentScreen('settings')}
            onRefreshSession={async () => {
              console.log("Session refreshed");
            }}
          />
        );
      case 'privacy-policy':
        return <PrivacyPolicyScreen />;
      case 'terms-of-use':
        return <TermsOfUseScreen />;
      case 'data-saved':
        return <DataSavedScreen />;
      case 'important-info':
        return <ImportantInfoScreen onBack={() => setCurrentScreen('settings')} />;
      case 'feed-breast':
        return (
          <FeedBreastScreen
            initialFeeding={editingFeeding}
            onSave={handleSaveFeeding}
            onCancel={() => {
              setEditingFeeding(null);
              setCurrentScreen('today');
            }}
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
        return 'Baby Grow';
      case 'feedings':
        return 'Alimentação';
      case 'sleep':
        return 'Registro de Sono';
      case 'diapers':
        return 'Registro de Fraldas';
      case 'medications':
        return 'Medicamentos';
      case 'more':
        return 'Recursos';
      case 'history':
        return 'Histórico';
      case 'growth':
        return 'Crescimento';
      case 'vaccines':
        return 'Vacinas';
      case 'reminders':
        return 'Lembretes';
      case 'pediatrician':
        return 'Relatório do Pediatra';
      case 'settings':
        return 'Configurações';
      case 'family-sharing':
        return 'Família e Compartilhamento';
      case 'feed-breast':
        return 'Registrar Mamada';
      case 'feed-fruit':
        return 'Registrar Fruta';
      case 'feed-meal':
        return 'Registrar Refeição';
      case 'baby-profile':
        return baby ? 'Editar Bebê' : 'Cadastrar Bebê';
      case 'privacy-policy':
        return 'Política de Privacidade';
      case 'terms-of-use':
        return 'Termos de Uso';
      case 'data-saved':
        return 'Quais dados são salvos';
      case 'important-info':
        return 'Informações Importantes';
      default:
        return 'Baby Grow';
    }
  };

  const showNav = user && baby && ['today', 'feedings', 'sleep', 'diapers', 'more', 'growth', 'vaccines', 'reminders', 'pediatrician', 'settings', 'medications', 'history'].includes(currentScreen);
  const showBack = user && baby && ['feed-breast', 'feed-fruit', 'feed-meal', 'baby-profile', 'growth', 'vaccines', 'reminders', 'pediatrician', 'settings', 'medications', 'history', 'privacy-policy', 'terms-of-use', 'data-saved', 'important-info', 'family-sharing'].includes(currentScreen);

  const handleBack = showBack ? () => {
    if (currentScreen === 'baby-profile') {
      setCurrentScreen(previousTab);
    } else if (['growth', 'vaccines', 'reminders', 'pediatrician', 'settings', 'medications', 'history'].includes(currentScreen)) {
      setCurrentScreen('more');
    } else if (['privacy-policy', 'terms-of-use', 'data-saved', 'important-info'].includes(currentScreen)) {
      setCurrentScreen('settings');
    } else if (currentScreen === 'family-sharing') {
      setCurrentScreen('settings');
    } else {
      setCurrentScreen('today');
    }
  } : undefined;

  const getActiveTab = (screen: ScreenName): TabName => {
    if (['today', 'feedings', 'sleep', 'diapers', 'more'].includes(screen)) {
      return screen as TabName;
    }
    return 'more';
  };

  return (
    <AppShell>
      {user && (
        <TopBar
          title={getHeaderTitle()}
          babyName={baby?.name}
          babyPhoto={baby?.photoBase64}
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
          activeTab={getActiveTab(currentScreen)}
          onTabChange={(tab) => setCurrentScreen(tab as ScreenName)}
        />
      )}
    </AppShell>
  );
}

export default App;

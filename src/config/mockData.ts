import type { Reminder, Baby } from '../types';

export interface FeedLog {
  id: string;
  babyId: string;
  type: 'breast' | 'formula' | 'mixed' | 'fruit' | 'meal' | 'water';
  timestamp: number;
  notes?: string;
  details: {
    breastLeftMinutes?: number;
    breastRightMinutes?: number;
    breastFormulaMl?: number;
    waterMl?: number;
    fruitName?: string;
    fruitQuantity?: string;
    mealName?: string;
    mealFoods?: string[];
    acceptance?: 'poor' | 'medium' | 'good' | 'excellent';
  };
}

export const MOCK_BABY: Baby = {
  name: 'Maya',
  birthDate: '2025-11-12',
  gender: 'girl',
  targetWeight: 9.2
};

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    babyId: 'baby-1',
    title: 'Mamada da manhã',
    type: 'feeding',
    mode: 'fixed',
    fixedTime: '08:00',
    repeatDaily: true,
    active: true,
    notes: 'Dar peito ou fórmula',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nextTriggerAt: Date.now() + 3600000 // 1 hora a partir de agora
  },
  {
    id: 'rem-2',
    babyId: 'baby-1',
    title: 'Hora da Frutinha',
    type: 'fruit',
    mode: 'fixed',
    fixedTime: '10:00',
    repeatDaily: true,
    active: true,
    notes: 'Banana raspada',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nextTriggerAt: Date.now() + 3600000 * 3 // 3 horas a partir de agora
  },
  {
    id: 'rem-3',
    babyId: 'baby-1',
    title: 'Almoço papinha',
    type: 'meal',
    mode: 'fixed',
    fixedTime: '12:00',
    repeatDaily: true,
    active: true,
    notes: 'Purê de abóbora',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nextTriggerAt: Date.now() + 3600000 * 5 // 5 horas a partir de agora
  },
  {
    id: 'rem-4',
    babyId: 'baby-1',
    title: 'Mamada da tarde',
    type: 'feeding',
    mode: 'timer',
    intervalMinutes: 180, // 3 horas
    repeatDaily: false,
    active: false,
    notes: 'Avisar 3 horas após a anterior',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nextTriggerAt: 0
  }
];

export const MOCK_LOGS: FeedLog[] = [
  {
    id: 'log-1',
    babyId: 'baby-1',
    type: 'breast',
    timestamp: Date.now() - 3600000 * 25, // ~25 hours ago
    notes: 'Mamou super bem em ambos os seios.',
    details: {
      breastLeftMinutes: 15,
      breastRightMinutes: 12
    }
  },
  {
    id: 'log-2',
    babyId: 'baby-1',
    type: 'fruit',
    timestamp: Date.now() - 3600000 * 22, // ~22 hours ago
    notes: 'Raspou o pratinho, adorou!',
    details: {
      fruitName: 'Banana Amassada com Aveia',
      fruitQuantity: '1 banana inteira',
      acceptance: 'excellent'
    }
  },
  {
    id: 'log-3',
    babyId: 'baby-1',
    type: 'meal',
    timestamp: Date.now() - 3600000 * 20, // ~20 hours ago
    notes: 'Estranhou um pouco o brócolis, mas comeu a abóbora.',
    details: {
      mealName: 'Almoço',
      mealFoods: ['Purê de abóbora', 'Brócolis cozido', 'Frango desfiado'],
      acceptance: 'good'
    }
  },
  {
    id: 'log-4',
    babyId: 'baby-1',
    type: 'water',
    timestamp: Date.now() - 3600000 * 18, // ~18 hours ago
    details: {
      waterMl: 60
    }
  },
  {
    id: 'log-5',
    babyId: 'baby-1',
    type: 'breast',
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
    notes: 'Estava sonolenta, mamou rápido e dormiu.',
    details: {
      breastLeftMinutes: 8,
      breastRightMinutes: 5,
      breastFormulaMl: 30
    }
  },
  {
    id: 'log-6',
    babyId: 'baby-1',
    type: 'fruit',
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
    notes: 'Careta para o azedinho da manga, comeu metade.',
    details: {
      fruitName: 'Manga Palmer em cubos',
      fruitQuantity: 'Metade',
      acceptance: 'medium'
    }
  }
];

// LocalStorage helpers to simulate database operations offline
export const getStoredBaby = (): Baby | null => {
  const data = localStorage.getItem('rt_baby');
  return data ? JSON.parse(data) : MOCK_BABY;
};

export const saveStoredBaby = (baby: Baby) => {
  localStorage.setItem('rt_baby', JSON.stringify(baby));
};

export const getStoredLogs = (): FeedLog[] => {
  const data = localStorage.getItem('rt_logs');
  return data ? JSON.parse(data) : MOCK_LOGS;
};

export const saveStoredLogs = (logs: FeedLog[]) => {
  localStorage.setItem('rt_logs', JSON.stringify(logs));
};

export const getStoredReminders = (): Reminder[] => {
  const data = localStorage.getItem('rt_reminders');
  return data ? JSON.parse(data) : MOCK_REMINDERS;
};

export const saveStoredReminders = (reminders: Reminder[]) => {
  localStorage.setItem('rt_reminders', JSON.stringify(reminders));
};

export const resetStoredData = () => {
  localStorage.setItem('rt_baby', JSON.stringify(MOCK_BABY));
  localStorage.setItem('rt_logs', JSON.stringify(MOCK_LOGS));
  localStorage.setItem('rt_reminders', JSON.stringify(MOCK_REMINDERS));
};

import type { Reminder, Baby, GrowthRecord, VaccineRecord, CustomVaccine, SleepRecord, DiaperRecord, Medication, MedicationLog } from '../types';

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

export const getStoredPediatricianNotes = (): string => {
  return localStorage.getItem('rt_ped_notes') || '';
};

export const saveStoredPediatricianNotes = (notes: string) => {
  localStorage.setItem('rt_ped_notes', notes);
};

export const MOCK_GROWTH_RECORDS: GrowthRecord[] = [
  {
    id: 'gro-1',
    babyId: 'baby-1',
    date: '2025-11-12',
    ageInDays: 0,
    weightKg: 3.2,
    lengthCm: 49.0,
    headCircumferenceCm: 34.0,
    notes: 'Nascimento da Maya. Saudável e ativa.',
    createdAt: Date.now() - 3600000 * 24 * 180,
    updatedAt: Date.now() - 3600000 * 24 * 180
  },
  {
    id: 'gro-2',
    babyId: 'baby-1',
    date: '2026-01-12',
    ageInDays: 61,
    weightKg: 5.1,
    lengthCm: 57.0,
    headCircumferenceCm: 38.0,
    notes: 'Consulta de 2 meses. Vacinas em dia.',
    createdAt: Date.now() - 3600000 * 24 * 120,
    updatedAt: Date.now() - 3600000 * 24 * 120
  },
  {
    id: 'gro-3',
    babyId: 'baby-1',
    date: '2026-03-12',
    ageInDays: 120,
    weightKg: 6.4,
    lengthCm: 62.0,
    headCircumferenceCm: 40.0,
    notes: 'Consulta de 4 meses. Maya está descobrindo as mãos.',
    createdAt: Date.now() - 3600000 * 24 * 60,
    updatedAt: Date.now() - 3600000 * 24 * 60
  },
  {
    id: 'gro-4',
    babyId: 'baby-1',
    date: '2026-05-12',
    ageInDays: 181,
    weightKg: 7.3,
    lengthCm: 65.5,
    headCircumferenceCm: 41.7,
    notes: 'Consulta de 6 meses. Liberação para introdução alimentar!',
    createdAt: Date.now() - 3600000 * 24 * 20,
    updatedAt: Date.now() - 3600000 * 24 * 20
  }
];

export const getStoredGrowthRecords = (): GrowthRecord[] => {
  const data = localStorage.getItem('rt_growth_records');
  return data ? JSON.parse(data) : MOCK_GROWTH_RECORDS;
};

export const saveStoredGrowthRecords = (records: GrowthRecord[]) => {
  localStorage.setItem('rt_growth_records', JSON.stringify(records));
};

export const MOCK_VACCINE_RECORDS: VaccineRecord[] = [
  {
    id: 'vac-rec-1',
    babyId: 'baby-1',
    vaccineId: 'bcg_0m',
    vaccineName: 'BCG',
    dose: 'Dose Única',
    recommendedAgeMonths: 0,
    recommendedDate: '2025-11-12',
    applied: true,
    appliedDate: '2025-11-12',
    location: 'Unidade Básica de Saúde',
    batchNumber: 'BCG2025A',
    clinic: 'Posto de Saúde',
    reaction: 'Nenhuma',
    notes: 'Cicatriz vacinal normal.',
    source: 'SUS',
    createdAt: Date.now() - 3600000 * 24 * 180,
    updatedAt: Date.now() - 3600000 * 24 * 180
  },
  {
    id: 'vac-rec-2',
    babyId: 'baby-1',
    vaccineId: 'hepb_0m',
    vaccineName: 'Hepatite B',
    dose: 'Dose de Nascimento',
    recommendedAgeMonths: 0,
    recommendedDate: '2025-11-12',
    applied: true,
    appliedDate: '2025-11-12',
    location: 'Maternidade',
    batchNumber: 'HEP2025X',
    clinic: 'Maternidade',
    reaction: 'Nenhuma',
    notes: 'Aplicada nas primeiras horas.',
    source: 'SUS',
    createdAt: Date.now() - 3600000 * 24 * 180,
    updatedAt: Date.now() - 3600000 * 24 * 180
  }
];

export const getStoredVaccineRecords = (): VaccineRecord[] => {
  const data = localStorage.getItem('rt_vaccine_records');
  return data ? JSON.parse(data) : MOCK_VACCINE_RECORDS;
};

export const saveStoredVaccineRecords = (records: VaccineRecord[]) => {
  localStorage.setItem('rt_vaccine_records', JSON.stringify(records));
};

export const getStoredCustomVaccines = (): CustomVaccine[] => {
  const data = localStorage.getItem('rt_custom_vaccines');
  return data ? JSON.parse(data) : [];
};

export const saveStoredCustomVaccines = (customVaccines: CustomVaccine[]) => {
  localStorage.setItem('rt_custom_vaccines', JSON.stringify(customVaccines));
};

export const getStoredSleepRecords = (): SleepRecord[] => {
  const data = localStorage.getItem('rt_sleep_records');
  return data ? JSON.parse(data) : MOCK_SLEEP_RECORDS;
};

export const saveStoredSleepRecords = (records: SleepRecord[]) => {
  localStorage.setItem('rt_sleep_records', JSON.stringify(records));
};

export const getStoredDiaperRecords = (): DiaperRecord[] => {
  const data = localStorage.getItem('rt_diaper_records');
  return data ? JSON.parse(data) : MOCK_DIAPER_RECORDS;
};

export const saveStoredDiaperRecords = (records: DiaperRecord[]) => {
  localStorage.setItem('rt_diaper_records', JSON.stringify(records));
};

export const getStoredMedications = (): Medication[] => {
  const data = localStorage.getItem('rt_medications');
  return data ? JSON.parse(data) : MOCK_MEDICATIONS;
};

export const saveStoredMedications = (medications: Medication[]) => {
  localStorage.setItem('rt_medications', JSON.stringify(medications));
};

export const getStoredMedicationLogs = (): MedicationLog[] => {
  const data = localStorage.getItem('rt_medication_logs');
  return data ? JSON.parse(data) : MOCK_MEDICATION_LOGS;
};

export const saveStoredMedicationLogs = (logs: MedicationLog[]) => {
  localStorage.setItem('rt_medication_logs', JSON.stringify(logs));
};

export const MOCK_SLEEP_RECORDS: SleepRecord[] = [
  {
    id: 'slp-1',
    babyId: 'baby-1',
    sleepType: 'soneca',
    startDateTime: `${new Date().toISOString().split('T')[0]}T10:00`,
    endDateTime: `${new Date().toISOString().split('T')[0]}T11:15`,
    durationMinutes: 75,
    location: 'berço',
    notes: 'Dormiu tranquilo com ruído branco.',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'slp-2',
    babyId: 'baby-1',
    sleepType: 'sono noturno',
    startDateTime: `${new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0]}T20:30`,
    endDateTime: `${new Date().toISOString().split('T')[0]}T06:45`,
    durationMinutes: 615,
    location: 'berço',
    notes: 'Acordou uma vez para mamar.',
    createdAt: Date.now() - 24 * 3600 * 1000,
    updatedAt: Date.now() - 24 * 3600 * 1000
  }
];

export const MOCK_DIAPER_RECORDS: DiaperRecord[] = [
  {
    id: 'dia-1',
    babyId: 'baby-1',
    diaperType: 'xixi',
    datetime: `${new Date().toISOString().split('T')[0]}T08:30`,
    notes: 'Fralda bem cheia.',
    createdAt: Date.now() - 3600000 * 6,
    updatedAt: Date.now() - 3600000 * 6
  },
  {
    id: 'dia-2',
    babyId: 'baby-1',
    diaperType: 'xixi e cocô',
    datetime: `${new Date().toISOString().split('T')[0]}T12:00`,
    stoolColor: 'Amarelo ouro',
    stoolConsistency: 'pastosa',
    notes: 'Sem assaduras.',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3
  }
];

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    babyId: 'baby-1',
    name: 'Vitamina D (Ad-til)',
    dose: '2',
    unit: 'gotas',
    frequencyType: 'dose única',
    startDate: `${new Date().toISOString().split('T')[0]}`,
    prescribedBy: 'Dra. Ana (Pediatra)',
    notes: 'Dar pela manhã.',
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'med-2',
    babyId: 'baby-1',
    name: 'Paracetamol Bebê',
    dose: '5',
    unit: 'gotas',
    frequencyType: 'a cada X horas',
    intervalHours: 6,
    startDate: `${new Date().toISOString().split('T')[0]}`,
    prescribedBy: 'Pediatra de plantão',
    notes: 'Apenas em caso de febre acima de 37.8ºC.',
    active: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const MOCK_MEDICATION_LOGS: MedicationLog[] = [
  {
    id: 'med-log-1',
    babyId: 'baby-1',
    medicationId: 'med-1',
    medicationName: 'Vitamina D (Ad-til)',
    datetime: `${new Date().toISOString().split('T')[0]}T09:00`,
    doseGiven: '2 gotas',
    status: 'administrado',
    notes: 'Tomou direto na colherinha.',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  }
];

export const resetStoredData = () => {
  localStorage.setItem('rt_baby', JSON.stringify(MOCK_BABY));
  localStorage.setItem('rt_logs', JSON.stringify(MOCK_LOGS));
  localStorage.setItem('rt_reminders', JSON.stringify(MOCK_REMINDERS));
  localStorage.setItem('rt_growth_records', JSON.stringify(MOCK_GROWTH_RECORDS));
  localStorage.setItem('rt_vaccine_records', JSON.stringify(MOCK_VACCINE_RECORDS));
  localStorage.setItem('rt_custom_vaccines', JSON.stringify([]));
  localStorage.setItem('rt_sleep_records', JSON.stringify(MOCK_SLEEP_RECORDS));
  localStorage.setItem('rt_diaper_records', JSON.stringify(MOCK_DIAPER_RECORDS));
  localStorage.setItem('rt_medications', JSON.stringify(MOCK_MEDICATIONS));
  localStorage.setItem('rt_medication_logs', JSON.stringify(MOCK_MEDICATION_LOGS));
  localStorage.setItem('rt_ped_notes', 'O bebê tem aceitado bem as frutinhas pela manhã. Demonstrar atenção especial com reações a frutas cítricas.');
};

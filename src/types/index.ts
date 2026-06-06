export interface Baby {
  id?: string;
  name: string;
  birthDate: string;
  gender: 'boy' | 'girl';
  targetWeight?: number;
  photoBase64?: string;
}

export type FeedingType = 'breast' | 'formula' | 'mixed' | 'water';

export interface FeedingLog {
  id?: string;
  babyId: string;
  type: FeedingType;
  datetime: string; // Formato YYYY-MM-DDTHH:MM local
  amountMl?: number; // Opcional para breast, preenchido se formula/mixed/water
  durationMinutes?: number; // Opcional
  notes?: string;
  createdAt: number;
  updatedAt: number;
  breastSide?: 'left' | 'right' | 'both' | null;
  leftBreastDurationSeconds?: number;
  rightBreastDurationSeconds?: number;
  totalBreastDurationSeconds?: number;
  startedAt?: number;
  endedAt?: number;
}

export type QuantityScale = 'nada' | 'muito pouco' | 'pouco' | 'bem' | 'muito';

export type ReactionType = 'aceitou' | 'recusou' | 'fez careta' | 'gases' | 'regurgitou' | 'irritação/manchas' | 'outro';

export interface FruitLog {
  id?: string;
  babyId: string;
  fruitName: string;
  fruitType?: string; // Variedade/tipo da fruta (ex: Laranja Lima, Maçã Gala)
  datetime: string; // Formato YYYY-MM-DDTHH:MM local
  quantity: QuantityScale;
  reaction: ReactionType;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type MealCategory = 'legume' | 'verdura' | 'cereal/tubérculo' | 'proteína' | 'refeição completa' | 'outro';

export type MealTexture = 'amassado' | 'purê' | 'pedaços macios' | 'outro';

export interface MealLog {
  id?: string;
  babyId: string;
  category: MealCategory;
  foodName: string;
  datetime: string; // Formato YYYY-MM-DDTHH:MM local
  quantity: QuantityScale;
  texture: MealTexture;
  reaction: ReactionType;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ReminderType = 'feeding' | 'fruit' | 'meal' | 'vacina' | 'sono' | 'medicamento' | 'other';
export type ReminderMode = 'fixed' | 'timer';

export interface Reminder {
  id?: string;
  babyId: string;
  type: ReminderType;
  title: string;
  mode: ReminderMode;
  fixedTime?: string;         // Formato "HH:MM" (obrigatório se mode === 'fixed')
  intervalMinutes?: number;  // Intervalo em minutos (obrigatório se mode === 'timer')
  repeatDaily: boolean;      // Repetir diariamente (apenas para modo fixed)
  active: boolean;           // Lembrete ativado ou desativado
  notes?: string;
  createdAt: number;
  updatedAt: number;
  lastCompletedAt?: number | null; // Timestamp da última conclusão
  nextTriggerAt: number;     // Timestamp do próximo disparo para ordenação e disparo
  nextDueAt?: number;        // Timestamp do próximo vencimento (alias/sincronizado com nextTriggerAt)
  completedToday?: boolean;  // Indica se foi concluído no dia de hoje
  lastNotifiedAt?: number | null; // Timestamp do último push disparado
  notificationStatus?: 'sent' | 'failed' | 'skipped' | null; // Estado do último disparo de push
  medicationId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  babyId?: string;
  activeFamilyId?: string;
  migrationToFamilyCompleted?: boolean;
}

export interface Family {
  id?: string;
  name: string;
  ownerUserId: string;
  createdAt: number;
  updatedAt: number;
}

export interface FamilyMember {
  userId: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'cuidador' | 'leitura';
  status: 'active';
  createdAt: number;
  updatedAt: number;
}

export interface FamilyInvite {
  id?: string;
  email: string;
  role: 'cuidador' | 'leitura';
  status: 'pending' | 'accepted' | 'revoked';
  invitedByUserId: string;
  invitedByEmail: string;
  invitedAt: number;
  acceptedAt?: number;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
  inviteCode: string;
  restrictedToEmail: boolean;
}

export interface GrowthRecord {
  id?: string;
  babyId: string;
  date: string; // Formato YYYY-MM-DD
  ageInDays: number;
  weightKg: number;
  lengthCm: number;
  headCircumferenceCm?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Vaccine {
  id: string;
  name: string;
  recommendedAgeMonths: number;
  dose: string;
  diseasesPrevented: string;
  type: 'sus' | 'particular' | 'both';
  notes: string;
  source: string;
  active: boolean;
}

export interface VaccineRecord {
  id?: string;
  babyId: string;
  vaccineId: string; // ID da vacina ou "custom"
  vaccineName: string;
  dose: string;
  recommendedAgeMonths: number;
  recommendedDate: string; // YYYY-MM-DD
  applied: boolean;
  appliedDate: string; // YYYY-MM-DD
  location?: string;
  batchNumber?: string;
  clinic?: string;
  reaction?: string;
  notes?: string;
  source: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomVaccine {
  id?: string;
  babyId: string;
  vaccineName: string;
  dose: string;
  recommendedAgeMonths: number;
  recommendedDate: string; // YYYY-MM-DD
  type: 'sus' | 'particular' | 'custom';
  diseasesPrevented?: string;
  notes?: string;
  repeatDose: boolean;
  intervalValue?: number;
  intervalUnit?: 'days' | 'months';
  dosesCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SleepRecord {
  id?: string;
  babyId: string;
  sleepType: 'soneca' | 'sono noturno';
  startDateTime: string; // YYYY-MM-DDTHH:MM local
  endDateTime?: string; // YYYY-MM-DDTHH:MM local
  durationMinutes?: number;
  location: 'berço' | 'colo' | 'carrinho' | 'cama compartilhada' | 'outro';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DiaperRecord {
  id?: string;
  babyId: string;
  diaperType: 'xixi' | 'cocô' | 'xixi e cocô' | 'seca';
  datetime: string; // YYYY-MM-DDTHH:MM local
  stoolColor?: string;
  stoolConsistency?: 'líquida' | 'pastosa' | 'normal' | 'dura' | 'outro';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Medication {
  id?: string;
  babyId: string;
  name: string;
  dose: string;
  unit: 'ml' | 'gotas' | 'comprimido' | 'sachê' | 'outro';
  frequencyType: 'dose única' | 'a cada X horas' | 'X vezes ao dia' | 'horários fixos';
  intervalHours?: number;
  timesPerDay?: number;
  fixedTimes?: string[]; // Array of "HH:MM"
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  prescribedBy?: string;
  notes?: string;
  active: boolean;
  enableReminder?: boolean;
  reminderTime?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MedicationLog {
  id?: string;
  babyId: string;
  medicationId: string;
  medicationName: string;
  datetime: string; // YYYY-MM-DDTHH:MM local
  doseGiven: string;
  status: 'administrado' | 'pulado' | 'atrasado';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}



export interface Baby {
  id?: string;
  name: string;
  birthDate: string;
  gender: 'boy' | 'girl' | 'other';
  targetWeight?: number;
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
}

export type QuantityScale = 'nada' | 'muito pouco' | 'pouco' | 'bem' | 'muito';

export type ReactionType = 'aceitou' | 'recusou' | 'fez careta' | 'gases' | 'regurgitou' | 'irritação/manchas' | 'outro';

export interface FruitLog {
  id?: string;
  babyId: string;
  fruitName: string;
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

export type ReminderType = 'feeding' | 'fruit' | 'meal' | 'other';
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
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  babyId?: string;
}

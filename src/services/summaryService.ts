import type { FeedingLog, FruitLog, MealLog } from '../types';

export interface TodaySummary {
  totalBreastfeedings: number; // Quantidade de mamadas (leite materno, fórmula ou misto)
  totalFormulaMl: number; // Volume total de fórmula ou misto em ml
  fruitsOffered: string[]; // Nomes das frutas oferecidas hoje
  mealsCount: number; // Quantidade de refeições principais hoje
  lastBreastfeeding: FeedingLog | null; // Última mamada
  lastFruit: FruitLog | null; // Última fruta
  lastMeal: MealLog | null; // Última refeição
}

/**
 * Filtra registros para o dia corrente local.
 * Formato da data no banco: YYYY-MM-DDTHH:MM.
 */
export const isToday = (datetimeStr: string): boolean => {
  if (!datetimeStr) return false;
  const logDate = datetimeStr.split('T')[0]; // Pega YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return logDate === todayStr;
};

/**
 * Calcula o resumo estatístico do dia de hoje com base nas listas de registros fornecidas.
 */
export const getTodaySummary = (
  feedings: FeedingLog[],
  fruits: FruitLog[],
  meals: MealLog[]
): TodaySummary => {
  // 1. Filtrar apenas registros de hoje
  const todayFeedings = feedings.filter((f) => isToday(f.datetime));
  const todayFruits = fruits.filter((fr) => isToday(fr.datetime));
  const todayMeals = meals.filter((m) => isToday(m.datetime));

  // 2. Estatísticas de Mamadas e Fórmula
  const breastfeedingsToday = todayFeedings.filter(
    (f) => f.type === 'breast' || f.type === 'formula' || f.type === 'mixed'
  );
  
  const totalFormulaMl = todayFeedings
    .filter((f) => (f.type === 'formula' || f.type === 'mixed') && f.amountMl)
    .reduce((sum, f) => sum + (f.amountMl || 0), 0);

  // 3. Frutas oferecidas
  const fruitsOffered = todayFruits.map((fr) => fr.fruitName);

  // 4. Últimas atividades (os arrays já vêm ordenados decrescentes por data, então pegamos o primeiro item)
  const lastBreastfeeding = feedings.find(
    (f) => f.type === 'breast' || f.type === 'formula' || f.type === 'mixed'
  ) || null;
  
  const lastFruit = fruits.length > 0 ? fruits[0] : null;
  const lastMeal = meals.length > 0 ? meals[0] : null;

  return {
    totalBreastfeedings: breastfeedingsToday.length,
    totalFormulaMl,
    fruitsOffered,
    mealsCount: todayMeals.length,
    lastBreastfeeding,
    lastFruit,
    lastMeal
  };
};

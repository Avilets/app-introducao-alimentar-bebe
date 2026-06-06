export interface PercentileDataPoint {
  month: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

// WHO Child Growth Standards (0 to 24 months) - Weight (kg)
export const BOYS_WEIGHT: PercentileDataPoint[] = [
  { month: 0, p3: 2.4, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
  { month: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
  { month: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1 },
  { month: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
  { month: 4, p3: 5.6, p15: 6.3, p50: 7.0, p85: 7.8, p97: 8.7 },
  { month: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3 },
  { month: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
  { month: 7, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.2, p97: 10.3 },
  { month: 8, p3: 6.9, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.7 },
  { month: 9, p3: 7.1, p15: 8.0, p50: 8.9, p85: 9.9, p97: 11.0 },
  { month: 10, p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.4 },
  { month: 11, p3: 7.6, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.7 },
  { month: 12, p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
  { month: 15, p3: 8.3, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8 },
  { month: 18, p3: 8.8, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.7 },
  { month: 21, p3: 9.2, p15: 10.2, p50: 11.5, p85: 12.9, p97: 14.5 },
  { month: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 }
];

export const GIRLS_WEIGHT: PercentileDataPoint[] = [
  { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { month: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
  { month: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6 },
  { month: 3, p3: 4.5, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.5 },
  { month: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.3, p97: 8.2 },
  { month: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
  { month: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.3, p97: 9.3 },
  { month: 7, p3: 6.0, p15: 6.8, p50: 7.7, p85: 8.8, p97: 9.8 },
  { month: 8, p3: 6.3, p15: 7.0, p50: 8.0, p85: 9.1, p97: 10.2 },
  { month: 9, p3: 6.5, p15: 7.3, p50: 8.2, p85: 9.4, p97: 10.5 },
  { month: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.7, p97: 10.9 },
  { month: 11, p3: 6.9, p15: 7.7, p50: 8.7, p85: 10.0, p97: 11.2 },
  { month: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.2, p97: 11.5 },
  { month: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 11.0, p97: 12.4 },
  { month: 18, p3: 8.1, p15: 9.0, p50: 10.2, p85: 11.7, p97: 13.2 },
  { month: 21, p3: 8.6, p15: 9.6, p50: 10.9, p85: 12.4, p97: 14.0 },
  { month: 24, p3: 9.0, p15: 10.1, p50: 11.5, p85: 13.1, p97: 14.8 }
];

// WHO Child Growth Standards (0 to 24 months) - Length (cm)
export const BOYS_LENGTH: PercentileDataPoint[] = [
  { month: 0, p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
  { month: 1, p3: 50.8, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.6 },
  { month: 2, p3: 54.4, p15: 56.4, p50: 58.4, p85: 60.4, p97: 62.4 },
  { month: 3, p3: 57.3, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
  { month: 4, p3: 59.7, p15: 61.8, p50: 63.9, p85: 66.0, p97: 68.0 },
  { month: 5, p3: 61.7, p15: 63.8, p50: 65.9, p85: 68.0, p97: 70.1 },
  { month: 6, p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
  { month: 7, p3: 64.8, p15: 67.0, p50: 69.2, p85: 71.3, p97: 73.5 },
  { month: 8, p3: 66.2, p15: 68.4, p50: 70.6, p85: 72.8, p97: 75.0 },
  { month: 9, p3: 67.5, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.5 },
  { month: 10, p3: 68.7, p15: 71.0, p50: 73.3, p85: 75.6, p97: 77.9 },
  { month: 11, p3: 69.9, p15: 72.2, p50: 74.5, p85: 76.9, p97: 79.2 },
  { month: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
  { month: 15, p3: 74.1, p15: 76.5, p50: 79.1, p85: 81.6, p97: 84.1 },
  { month: 18, p3: 76.9, p15: 79.4, p50: 82.3, p85: 85.0, p97: 87.7 },
  { month: 21, p3: 79.4, p15: 82.1, p50: 85.1, p85: 88.0, p97: 90.9 },
  { month: 24, p3: 81.7, p15: 84.6, p50: 87.8, p85: 90.9, p97: 93.9 }
];

export const GIRLS_LENGTH: PercentileDataPoint[] = [
  { month: 0, p3: 45.4, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.9 },
  { month: 1, p3: 49.8, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.6 },
  { month: 2, p3: 53.0, p15: 55.0, p50: 57.1, p85: 59.1, p97: 61.1 },
  { month: 3, p3: 55.6, p15: 57.7, p50: 59.8, p85: 61.9, p97: 64.0 },
  { month: 4, p3: 57.8, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.4 },
  { month: 5, p3: 59.6, p15: 61.8, p50: 64.0, p85: 66.2, p97: 68.5 },
  { month: 6, p3: 61.2, p15: 63.5, p50: 65.7, p85: 68.0, p97: 70.3 },
  { month: 7, p3: 62.7, p15: 65.0, p50: 67.3, p85: 69.6, p97: 71.9 },
  { month: 8, p3: 64.0, p15: 66.4, p50: 68.7, p85: 71.1, p97: 73.5 },
  { month: 9, p3: 65.3, p15: 67.7, p50: 70.1, p85: 72.6, p97: 75.0 },
  { month: 10, p3: 66.5, p15: 69.0, p50: 71.5, p85: 74.0, p97: 76.4 },
  { month: 11, p3: 67.7, p15: 70.3, p50: 72.8, p85: 75.3, p97: 77.8 },
  { month: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 79.2 },
  { month: 15, p3: 72.0, p15: 74.6, p50: 77.5, p85: 80.2, p97: 83.0 },
  { month: 18, p3: 74.9, p15: 77.6, p50: 80.7, p85: 83.6, p97: 86.5 },
  { month: 21, p3: 77.5, p15: 80.4, p50: 83.7, p85: 86.7, p97: 89.7 },
  { month: 24, p3: 80.0, p15: 83.0, p50: 86.4, p85: 89.6, p97: 92.7 }
];

// WHO Child Growth Standards (0 to 24 months) - Head Circumference (cm)
export const BOYS_HEAD: PercentileDataPoint[] = [
  { month: 0, p3: 31.9, p15: 33.2, p50: 34.5, p85: 35.8, p97: 37.0 },
  { month: 1, p3: 34.9, p15: 36.1, p50: 37.3, p85: 38.5, p97: 39.7 },
  { month: 2, p3: 36.8, p15: 37.9, p50: 39.1, p85: 40.3, p97: 41.5 },
  { month: 3, p3: 38.1, p15: 39.3, p50: 40.5, p85: 41.7, p97: 42.9 },
  { month: 4, p3: 39.2, p15: 40.3, p50: 41.6, p85: 42.8, p97: 44.0 },
  { month: 5, p3: 40.1, p15: 41.2, p50: 42.4, p85: 43.6, p97: 44.8 },
  { month: 6, p3: 40.8, p15: 41.9, p50: 43.1, p85: 44.3, p97: 45.5 },
  { month: 7, p3: 41.4, p15: 42.5, p50: 43.8, p85: 45.0, p97: 46.2 },
  { month: 8, p3: 41.9, p15: 43.1, p50: 44.3, p85: 45.5, p97: 46.8 },
  { month: 9, p3: 42.4, p15: 43.5, p50: 44.8, p85: 46.0, p97: 47.2 },
  { month: 10, p3: 42.8, p15: 44.0, p50: 45.2, p85: 46.4, p97: 47.7 },
  { month: 11, p3: 43.2, p15: 44.3, p50: 45.6, p85: 46.8, p97: 48.0 },
  { month: 12, p3: 43.5, p15: 44.7, p50: 45.9, p85: 47.1, p97: 48.4 },
  { month: 15, p3: 44.3, p15: 45.5, p50: 46.8, p85: 48.0, p97: 49.3 },
  { month: 18, p3: 45.0, p15: 46.2, p50: 47.4, p85: 48.7, p97: 50.0 },
  { month: 21, p3: 45.5, p15: 46.7, p50: 48.0, p85: 49.3, p97: 50.6 },
  { month: 24, p3: 46.0, p15: 47.2, p50: 48.5, p85: 49.8, p97: 51.1 }
];

export const GIRLS_HEAD: PercentileDataPoint[] = [
  { month: 0, p3: 31.5, p15: 32.7, p50: 33.9, p85: 35.1, p97: 36.2 },
  { month: 1, p3: 34.0, p15: 35.2, p50: 36.5, p85: 37.7, p97: 38.9 },
  { month: 2, p3: 35.7, p15: 36.9, p50: 38.0, p85: 39.2, p97: 40.4 },
  { month: 3, p3: 36.9, p15: 38.1, p50: 39.3, p85: 40.5, p97: 41.7 },
  { month: 4, p3: 37.9, p15: 39.1, p50: 40.2, p85: 41.4, p97: 42.6 },
  { month: 5, p3: 38.7, p15: 39.9, p50: 41.1, p85: 42.3, p97: 43.5 },
  { month: 6, p3: 39.4, p15: 40.5, p50: 41.7, p85: 42.9, p97: 44.1 },
  { month: 7, p3: 40.0, p15: 41.1, p50: 42.3, p85: 43.5, p97: 44.7 },
  { month: 8, p3: 40.5, p15: 41.7, p50: 42.8, p85: 44.0, p97: 45.2 },
  { month: 9, p3: 41.0, p15: 42.1, p50: 43.3, p85: 44.5, p97: 45.7 },
  { month: 10, p3: 41.4, p15: 42.5, p50: 43.7, p85: 44.9, p97: 46.1 },
  { month: 11, p3: 41.8, p15: 42.9, p50: 44.1, p85: 45.3, p97: 46.5 },
  { month: 12, p3: 42.1, p15: 43.2, p50: 44.4, p85: 45.6, p97: 46.9 },
  { month: 15, p3: 42.9, p15: 44.0, p50: 45.2, p85: 46.5, p97: 47.7 },
  { month: 18, p3: 43.5, p15: 44.7, p50: 45.9, p85: 47.2, p97: 48.4 },
  { month: 21, p3: 44.1, p15: 45.2, p50: 46.5, p85: 47.7, p97: 49.0 },
  { month: 24, p3: 44.6, p15: 45.8, p50: 47.0, p85: 48.2, p97: 49.5 }
];

export type MeasurementType = 'weight' | 'length' | 'head';

/**
 * Retorna a lista de percentis de referência com base no sexo e tipo de medida.
 */
export const getReferenceData = (gender: 'boy' | 'girl' | 'other', type: MeasurementType): PercentileDataPoint[] => {
  const isBoy = gender === 'boy' || gender === 'other'; // default to boy if other
  if (type === 'weight') return isBoy ? BOYS_WEIGHT : GIRLS_WEIGHT;
  if (type === 'length') return isBoy ? BOYS_LENGTH : GIRLS_LENGTH;
  return isBoy ? BOYS_HEAD : GIRLS_HEAD;
};

/**
 * Interpola linearmente os limites de percentil para uma idade em dias.
 */
export const interpolatePercentilesForAge = (
  gender: 'boy' | 'girl' | 'other',
  type: MeasurementType,
  ageInDays: number
): { p3: number; p15: number; p50: number; p85: number; p97: number } => {
  const data = getReferenceData(gender, type);
  const ageInMonths = ageInDays / 30.4375;

  // Se a idade for menor que zero, retorna os valores do nascimento
  if (ageInMonths <= 0) {
    return { p3: data[0].p3, p15: data[0].p15, p50: data[0].p50, p85: data[0].p85, p97: data[0].p97 };
  }

  // Se a idade exceder 24 meses, retorna os limites de 24 meses
  if (ageInMonths >= 24) {
    const last = data[data.length - 1];
    return { p3: last.p3, p15: last.p15, p50: last.p50, p85: last.p85, p97: last.p97 };
  }

  // Localiza os dois meses de limite para interpolação
  let lower = data[0];
  let upper = data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].month <= ageInMonths && data[i + 1].month >= ageInMonths) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }

  const factor = (ageInMonths - lower.month) / (upper.month - lower.month);

  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * factor;

  return {
    p3: lerp(lower.p3, upper.p3),
    p15: lerp(lower.p15, upper.p15),
    p50: lerp(lower.p50, upper.p50),
    p85: lerp(lower.p85, upper.p85),
    p97: lerp(lower.p97, upper.p97)
  };
};

export interface PercentileResult {
  percentile: number; // Valor estimado entre 1 e 99
  percentileText: string; // Ex: "P54" ou "Abaixo de P3"
  interpretation: string; // Ex: "Próximo à mediana (faixa normal)"
}

/**
 * Calcula o percentil aproximado e interpretação para uma determinada medida e idade do bebê.
 */
export const calculatePercentile = (
  gender: 'boy' | 'girl' | 'other',
  type: MeasurementType,
  ageInDays: number,
  value: number
): PercentileResult => {
  const limits = interpolatePercentilesForAge(gender, type, ageInDays);
  
  let percentile = 50;
  let percentileText = 'P50';
  let interpretation = 'Próximo à mediana para a idade e sexo';

  if (value < limits.p3) {
    // Abaixo do percentil 3
    const ratio = value / limits.p3;
    percentile = Math.max(1, Math.round(3 * ratio));
    percentileText = 'Abaixo de P3';
    interpretation = 'Abaixo da curva de referência típica';
  } else if (value < limits.p15) {
    // Entre P3 e P15
    const ratio = (value - limits.p3) / (limits.p15 - limits.p3);
    percentile = Math.round(3 + 12 * ratio);
    percentileText = `P${percentile}`;
    interpretation = 'Faixa de alerta inferior (baixo peso/altura)';
  } else if (value < limits.p50) {
    // Entre P15 e P50
    const ratio = (value - limits.p15) / (limits.p50 - limits.p15);
    percentile = Math.round(15 + 35 * ratio);
    percentileText = `P${percentile}`;
    interpretation = 'Dentro do padrão de crescimento saudável';
  } else if (value < limits.p85) {
    // Entre P50 e P85
    const ratio = (value - limits.p50) / (limits.p85 - limits.p50);
    percentile = Math.round(50 + 35 * ratio);
    percentileText = `P${percentile}`;
    interpretation = 'Dentro do padrão de crescimento saudável';
  } else if (value < limits.p97) {
    // Entre P85 e P97
    const ratio = (value - limits.p85) / (limits.p97 - limits.p85);
    percentile = Math.round(85 + 12 * ratio);
    percentileText = `P${percentile}`;
    interpretation = 'Faixa de alerta superior (alto peso/altura)';
  } else {
    // Acima de P97
    const diff = value - limits.p97;
    const ratio = diff / (limits.p97 - limits.p85);
    percentile = Math.min(99, Math.round(97 + 2 * ratio));
    percentileText = 'Acima de P97';
    interpretation = 'Acima da curva de referência típica';
  }

  return { percentile, percentileText, interpretation };
};

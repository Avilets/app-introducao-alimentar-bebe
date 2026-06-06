import type { Vaccine } from '../types';

export const VACCINE_SCHEDULE: Vaccine[] = [
  // Ao nascer (0 meses)
  {
    id: 'bcg_0m',
    name: 'BCG',
    recommendedAgeMonths: 0,
    dose: 'Dose Única',
    diseasesPrevented: 'Formas graves de tuberculose (miliar e meníngea)',
    type: 'sus',
    notes: 'Aplicar o mais precocemente possível, preferencialmente na maternidade.',
    source: 'SUS',
    active: true
  },
  {
    id: 'hepb_0m',
    name: 'Hepatite B',
    recommendedAgeMonths: 0,
    dose: 'Dose de Nascimento',
    diseasesPrevented: 'Hepatite B',
    type: 'sus',
    notes: 'Deve ser administrada nas primeiras 12 a 24 horas de vida.',
    source: 'SUS',
    active: true
  },
  // 2 meses
  {
    id: 'penta_2m',
    name: 'Pentavalente',
    recommendedAgeMonths: 2,
    dose: '1ª Dose',
    diseasesPrevented: 'Difteria, Tétano, Coqueluche, Hepatite B e Meningite por Haemophilus influenzae B',
    type: 'sus',
    notes: 'Intervalo de 60 dias entre as doses.',
    source: 'SUS',
    active: true
  },
  {
    id: 'vip_2m',
    name: 'VIP (Poliomielite Inativada)',
    recommendedAgeMonths: 2,
    dose: '1ª Dose',
    diseasesPrevented: 'Paralisia Infantil (Poliomielite)',
    type: 'sus',
    notes: 'Vacina injetável.',
    source: 'SUS',
    active: true
  },
  {
    id: 'rotavirus_2m',
    name: 'Rotavírus',
    recommendedAgeMonths: 2,
    dose: '1ª Dose',
    diseasesPrevented: 'Diarreia por rotavírus',
    type: 'sus',
    notes: 'Vacina oral. Limite de idade máximo para a 1ª dose: 3 meses e 15 dias.',
    source: 'SUS',
    active: true
  },
  {
    id: 'pneumo10_2m',
    name: 'Pneumocócica 10-Valente',
    recommendedAgeMonths: 2,
    dose: '1ª Dose',
    diseasesPrevented: 'Pneumonia, otite, meningite e outras infecções por pneumococos',
    type: 'both',
    notes: 'Pode ser substituída pela Pneumocócica 13 ou 15 na rede privada.',
    source: 'SUS / SBP',
    active: true
  },
  // 3 meses
  {
    id: 'meningoc_3m',
    name: 'Meningocócica C',
    recommendedAgeMonths: 3,
    dose: '1ª Dose',
    diseasesPrevented: 'Meningite meningocócica do sorogrupo C',
    type: 'both',
    notes: 'Pode ser substituída pela Meningocócica ACWY na rede privada.',
    source: 'SUS / SBP',
    active: true
  },
  {
    id: 'meningob_3m',
    name: 'Meningocócica B',
    recommendedAgeMonths: 3,
    dose: '1ª Dose',
    diseasesPrevented: 'Meningite meningocócica do sorogrupo B',
    type: 'particular',
    notes: 'Recomendada pela SBP/SBIm. Disponível apenas na rede privada.',
    source: 'SBP/SBIm',
    active: true
  },
  // 4 meses
  {
    id: 'penta_4m',
    name: 'Pentavalente',
    recommendedAgeMonths: 4,
    dose: '2ª Dose',
    diseasesPrevented: 'Difteria, Tétano, Coqueluche, Hepatite B e Meningite/infecções por Hib',
    type: 'sus',
    notes: 'Segunda dose.',
    source: 'SUS',
    active: true
  },
  {
    id: 'vip_4m',
    name: 'VIP (Poliomielite Inativada)',
    recommendedAgeMonths: 4,
    dose: '2ª Dose',
    diseasesPrevented: 'Poliomielite',
    type: 'sus',
    notes: 'Segunda dose.',
    source: 'SUS',
    active: true
  },
  {
    id: 'rotavirus_4m',
    name: 'Rotavírus',
    recommendedAgeMonths: 4,
    dose: '2ª Dose',
    diseasesPrevented: 'Diarreia por rotavírus',
    type: 'sus',
    notes: 'Vacina oral. Limite de idade máximo para a 2ª dose: 7 meses e 29 dias.',
    source: 'SUS',
    active: true
  },
  {
    id: 'pneumo10_4m',
    name: 'Pneumocócica 10-Valente',
    recommendedAgeMonths: 4,
    dose: '2ª Dose',
    diseasesPrevented: 'Infecções por pneumococos',
    type: 'both',
    notes: 'Segunda dose.',
    source: 'SUS / SBP',
    active: true
  },
  // 5 meses
  {
    id: 'meningoc_5m',
    name: 'Meningocócica C',
    recommendedAgeMonths: 5,
    dose: '2ª Dose',
    diseasesPrevented: 'Meningite meningocócica C',
    type: 'both',
    notes: 'Segunda dose.',
    source: 'SUS / SBP',
    active: true
  },
  {
    id: 'meningob_5m',
    name: 'Meningocócica B',
    recommendedAgeMonths: 5,
    dose: '2ª Dose',
    diseasesPrevented: 'Meningite meningocócica B',
    type: 'particular',
    notes: 'Segunda dose da rede privada.',
    source: 'SBP/SBIm',
    active: true
  },
  // 6 meses
  {
    id: 'penta_6m',
    name: 'Pentavalente',
    recommendedAgeMonths: 6,
    dose: '3ª Dose',
    diseasesPrevented: 'Difteria, Tétano, Coqueluche, Hepatite B e Meningite/infecções por Hib',
    type: 'sus',
    notes: 'Terceira dose.',
    source: 'SUS',
    active: true
  },
  {
    id: 'vip_6m',
    name: 'VIP (Poliomielite Inativada)',
    recommendedAgeMonths: 6,
    dose: '3ª Dose',
    diseasesPrevented: 'Poliomielite',
    type: 'sus',
    notes: 'Terceira dose injetável (VIP substitui VOP em todo o esquema básico).',
    source: 'SUS',
    active: true
  },
  {
    id: 'covid_6m',
    name: 'Covid-19',
    recommendedAgeMonths: 6,
    dose: '1ª Dose',
    diseasesPrevented: 'Formas graves e complicações de Covid-19',
    type: 'sus',
    notes: 'Inclusa no calendário nacional para crianças de 6 meses a menores de 5 anos.',
    source: 'SUS',
    active: true
  },
  {
    id: 'influenza_6m',
    name: 'Influenza (Gripe)',
    recommendedAgeMonths: 6,
    dose: 'Dose Anual',
    diseasesPrevented: 'Gripe e suas complicações',
    type: 'both',
    notes: 'Indicada anualmente durante as campanhas de vacinação (duas doses com intervalo de 30 dias na primeira vez).',
    source: 'SUS / SBP',
    active: true
  },
  // 9 meses
  {
    id: 'febre_amarela_9m',
    name: 'Febre Amarela',
    recommendedAgeMonths: 9,
    dose: '1ª Dose',
    diseasesPrevented: 'Febre Amarela',
    type: 'sus',
    notes: 'Recomendada para todo o Brasil. Reforço aos 4 anos.',
    source: 'SUS',
    active: true
  },
  // 12 meses
  {
    id: 'triplice_viral_12m',
    name: 'Tríplice Viral',
    recommendedAgeMonths: 12,
    dose: '1ª Dose',
    diseasesPrevented: 'Sarampo, Caxumba e Rubéola',
    type: 'sus',
    notes: 'Primeira dose da vacina tríplice viral.',
    source: 'SUS',
    active: true
  },
  {
    id: 'pneumo10_12m',
    name: 'Pneumocócica 10-Valente',
    recommendedAgeMonths: 12,
    dose: 'Reforço',
    diseasesPrevented: 'Infecções por pneumococos',
    type: 'both',
    notes: 'Dose de reforço recomendada.',
    source: 'SUS / SBP',
    active: true
  },
  {
    id: 'meningoc_12m',
    name: 'Meningocócica C',
    recommendedAgeMonths: 12,
    dose: 'Reforço',
    diseasesPrevented: 'Meningite meningocócica C',
    type: 'both',
    notes: 'Dose de reforço (ou Meningo ACWY na rede privada).',
    source: 'SUS / SBP',
    active: true
  },
  // 15 meses
  {
    id: 'dtp_15m',
    name: 'DTP',
    recommendedAgeMonths: 15,
    dose: '1º Reforço',
    diseasesPrevented: 'Difteria, Tétano e Coqueluche',
    type: 'sus',
    notes: 'Reforço com a tríplice bacteriana.',
    source: 'SUS',
    active: true
  },
  {
    id: 'vip_15m',
    name: 'VIP (Poliomielite Inativada)',
    recommendedAgeMonths: 15,
    dose: '1º Reforço',
    diseasesPrevented: 'Poliomielite',
    type: 'sus',
    notes: 'Dose de reforço com vacina injetável VIP.',
    source: 'SUS',
    active: true
  },
  {
    id: 'hepatite_a_15m',
    name: 'Hepatite A',
    recommendedAgeMonths: 15,
    dose: 'Dose Única',
    diseasesPrevented: 'Hepatite A',
    type: 'both',
    notes: 'No SUS é dose única aos 15 meses. A SBP recomenda segunda dose aos 18-24 meses na rede particular.',
    source: 'SUS / SBP',
    active: true
  },
  {
    id: 'varicela_15m',
    name: 'Varicela (Catapora)',
    recommendedAgeMonths: 15,
    dose: '1ª Dose',
    diseasesPrevented: 'Varicela',
    type: 'sus',
    notes: 'No SUS é aplicada como vacina tetra viral ou varicela isolada.',
    source: 'SUS',
    active: true
  },
  // 4 anos
  {
    id: 'dtp_4y',
    name: 'DTP',
    recommendedAgeMonths: 48,
    dose: '2º Reforço',
    diseasesPrevented: 'Difteria, Tétano e Coqueluche',
    type: 'sus',
    notes: 'Segundo reforço da vacina tríplice bacteriana.',
    source: 'SUS',
    active: true
  },
  {
    id: 'vip_4y',
    name: 'VIP (Poliomielite Inativada)',
    recommendedAgeMonths: 48,
    dose: '2º Reforço',
    diseasesPrevented: 'Poliomielite',
    type: 'sus',
    notes: 'Segundo reforço com VIP injetável.',
    source: 'SUS',
    active: true
  },
  {
    id: 'febre_amarela_4y',
    name: 'Febre Amarela',
    recommendedAgeMonths: 48,
    dose: 'Reforço',
    diseasesPrevented: 'Febre Amarela',
    type: 'sus',
    notes: 'Reforço para crianças vacinadas aos 9 meses.',
    source: 'SUS',
    active: true
  },
  {
    id: 'varicela_4y',
    name: 'Varicela (Catapora)',
    recommendedAgeMonths: 48,
    dose: '2ª Dose',
    diseasesPrevented: 'Varicela',
    type: 'sus',
    notes: 'Segunda dose da vacina de varicela.',
    source: 'SUS',
    active: true
  }
];

export interface FruitInfo {
  name: string;
  benefits: string;
  texture: string;
  safety: string;
}

export const FRUITS_DATABASE: FruitInfo[] = [
  {
    name: 'Banana',
    benefits: 'Rica em potássio e energia, é de fácil digestão e naturalmente doce. Ótima para iniciar a introdução alimentar.',
    texture: 'Amassada com o garfo ou oferecida em pedaços grandes cortados no sentido do comprimento (método BLW).',
    safety: 'Certifique-se de que a banana está bem madura e macia para evitar riscos de engasgo.'
  },
  {
    name: 'Maçã',
    benefits: 'Contém fibras solúveis que ajudam o intestino do bebê e vitamina C. Excelente para fortalecer a imunidade.',
    texture: 'Cozida ou assada e amassada (como purê), ou ralada crua na parte fina do ralador.',
    safety: 'Nunca ofereça maçã crua em pedaços ou rodelas, pois é muito dura e apresenta alto risco de engasgo. Sempre coza ou rale.'
  },
  {
    name: 'Pera',
    benefits: 'Super suculenta, rica em água e fibras. Excelente para hidratar e ajudar a soltar o intestino preso do bebê.',
    texture: 'Cozida e amassada no início. Se estiver extremamente madura e macia, pode ser raspada com a colher crua.',
    safety: 'Pera dura deve ser sempre cozida. Retire sementes e a parte central fibrosa antes de oferecer.'
  },
  {
    name: 'Mamão',
    benefits: 'Rico em vitaminas A e C. É o maior aliado natural para regular o intestino do bebê e combater a constipação.',
    texture: 'Amassado com o garfo ou cortado em fatias largas e sem casca para o bebê segurar.',
    safety: 'Remova completamente todas as sementes pretas, pois elas podem causar desconforto ou engasgo.'
  },
  {
    name: 'Abacate',
    benefits: 'Fonte de gorduras boas e saudáveis (monoinsaturadas) essenciais para o desenvolvimento cerebral e energia do bebê.',
    texture: 'Amassado com o garfo (pode adicionar gotas de limão ou laranja) ou em fatias macias sem casca.',
    safety: 'Por ser muito macio, é extremamente seguro. Apenas garanta que o bebê não pegue pedaços da casca dura.'
  },
  {
    name: 'Manga',
    benefits: 'Fonte de vitamina A, fibras e muito saborosa. Atrai muito os bebês pelo sabor doce e cor vibrante.',
    texture: 'Oferecida direto no caroço (bem lavado e descascado para o bebê roer) ou em tiras largas na vertical.',
    safety: 'A manga é muito escorregadia. Retire os fiapos mais grossos que possam incomodar a garganta do bebê.'
  },
  {
    name: 'Melancia',
    benefits: 'Composta por mais de 90% de água, é perfeita para dias quentes para manter o bebê hidratado e refrescado.',
    texture: 'Cortada em triângulos grandes com a casca para o bebê segurar e chupar, ou amassada retirando o caldo.',
    safety: 'Retire absolutamente todas as sementes antes de oferecer ao bebê.'
  },
  {
    name: 'Melão',
    benefits: 'Rico em água, vitaminas e minerais. Tem sabor suave que é muito bem aceito no início da introdução alimentar.',
    texture: 'Cortado em formato de bastão (tamanho de um dedo) bem maduro e macio para o bebê segurar.',
    safety: 'Ofereça apenas melão bem maduro. Se estiver duro, raspe com uma colher ou amasse.'
  },
  {
    name: 'Laranja',
    benefits: 'Altíssima concentração de vitamina C, que ajuda na absorção de ferro das principais refeições (como feijão).',
    texture: 'Oferecida em gomos cortados ao meio (sem pele/película e sem sementes) para o bebê chupar, ou em formato de "espremer".',
    safety: 'Retire as sementes e a película branca/transparente que envolve o gomo, pois o bebê não consegue mastigá-la e pode engasgar.'
  },
  {
    name: 'Ameixa',
    benefits: 'Rica em fibras e sorbitol. Juntamente com o mamão, é um dos melhores laxantes naturais para bebês.',
    texture: 'Cozida e amassada sem pele, ou raspada se estiver muito madura.',
    safety: 'Retire sempre o caroço central e retire a pele, que pode grudar no céu da boca do bebê.'
  },
  {
    name: 'Pêssego',
    benefits: 'Rico em antioxidantes, potássio e vitaminas A e C. Tem textura aveludada e sabor muito agradável.',
    texture: 'Cozido e amassado, ou bem maduro cortado em fatias verticais sem a casca peluda.',
    safety: 'Retire a casca para evitar que grude na garganta do bebê, e descarte o caroço grande.'
  },
  {
    name: 'Kiwi',
    benefits: 'Excelente fonte de vitamina C (mais que a laranja) e magnésio. Ajuda muito na digestão e no intestino.',
    texture: 'Cortado ao meio e raspado com colher, ou cortado em rodelas grossas maduras cortadas ao meio.',
    safety: 'Escolha kiwis bem maduros para que a parte central branca esteja macia. Fruta ácida pode causar assadura leve ao redor da boca, o que é normal.'
  }
];

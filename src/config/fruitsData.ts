export interface FruitInfo {
  name: string;
  benefits: string;
  texture: string;
  safety: string;
}

export const FRUITS_DATABASE: FruitInfo[] = [
  {
    name: 'Banana',
    benefits: 'Pode contribuir com potássio e energia. É frequentemente descrita como de fácil digestão e sabor naturalmente doce, sendo muito oferecida no início da introdução alimentar de forma educativa.',
    texture: 'Amassada com o garfo ou oferecida em pedaços grandes cortados no sentido do comprimento (método BLW).',
    safety: 'Certifique-se de que a banana está bem madura e macia para evitar riscos de engasgo.'
  },
  {
    name: 'Maçã',
    benefits: 'Pode contribuir com fibras solúveis e vitamina C, auxiliando na complementação nutricional diária do bebê.',
    texture: 'Cozida ou assada e amassada (como purê), ou ralada crua na parte fina do ralador.',
    safety: 'Nunca ofereça maçã crua em pedaços ou rodelas, pois é muito dura e apresenta alto risco de engasgo. Sempre coza ou rale.'
  },
  {
    name: 'Pera',
    benefits: 'Pode contribuir para a hidratação e para o trânsito intestinal por ser rica em água e fibras alimentares.',
    texture: 'Cozida e amassada no início. Se estiver extremamente madura e macia, pode ser raspada com a colher crua.',
    safety: 'Pera dura deve ser sempre cozida. Retire sementes e a parte central fibrosa antes de oferecer.'
  },
  {
    name: 'Mamão',
    benefits: 'Pode contribuir para o trânsito intestinal saudável, auxiliando na regulação da evacuação do bebê de forma suave.',
    texture: 'Amassado com o garfo ou cortado em fatias largas e sem casca para o bebê segurar.',
    safety: 'Remova completamente todas as sementes pretas, pois elas podem causar desconforto ou engasgo.'
  },
  {
    name: 'Abacate',
    benefits: 'Pode contribuir como fonte de gorduras monoinsaturadas para a nutrição e desenvolvimento diário do bebê.',
    texture: 'Amassado com o garfo (pode adicionar gotas de limão ou laranja) ou em fatias macias sem casca.',
    safety: 'Por ser muito macio, é extremamente seguro. Apenas garanta que o bebê não pegue pedaços da casca dura.'
  },
  {
    name: 'Manga',
    benefits: 'Pode contribuir com vitamina A e fibras, sendo frequentemente bem aceita pelo sabor doce e textura agradável.',
    texture: 'Oferecida direto no caroço (bem lavado e descascado para o bebê roer) ou em tiras largas na vertical.',
    safety: 'A manga é muito escorregadia. Retire os fiapos mais grossos que possam incomodar a garganta do bebê.'
  },
  {
    name: 'Melancia',
    benefits: 'Pode contribuir na hidratação em dias quentes por conter alta proporção de água em sua composição.',
    texture: 'Cortada em triângulos grandes com a casca para o bebê segurar e chupar, ou amassada retirando o caldo.',
    safety: 'Retire absolutamente todas as sementes antes de oferecer ao bebê.'
  },
  {
    name: 'Melão',
    benefits: 'Pode contribuir com a hidratação e minerais, oferecendo um sabor suave e de fácil aceitação inicial.',
    texture: 'Cortado em formato de bastão (tamanho de um dedo) bem maduro e macio para o bebê segurar.',
    safety: 'Ofereça apenas melão bem maduro. Se estiver duro, raspe com uma colher ou amasse.'
  },
  {
    name: 'Laranja',
    benefits: 'Pode contribuir para a absorção de ferro das refeições principais devido à presença de vitamina C.',
    texture: 'Oferecida em gomos cortados ao meio (sem pele/película e sem sementes) para o bebê chupar, ou em formato de "espremer".',
    safety: 'Retire as sementes e a película branca/transparente que envolve o gomo, pois o bebê não consegue mastigá-la e pode engasgar.'
  },
  {
    name: 'Ameixa',
    benefits: 'Pode auxiliar no trânsito intestinal e digestão do bebê por conter fibras alimentares e sorbitol.',
    texture: 'Cozida e amassada sem pele, ou raspada se estiver muito madura.',
    safety: 'Retire sempre o caroço central e retire a pele, que pode grudar no céu da boca do bebê.'
  },
  {
    name: 'Pêssego',
    benefits: 'Pode contribuir com vitaminas A e C, oferecendo uma textura suave para as gengivas do bebê.',
    texture: 'Cozido e amassado, ou bem maduro cortado em fatias verticais sem a casca peluda.',
    safety: 'Retire a casca para evitar que grude na garganta do bebê, e descarte o caroço grande.'
  },
  {
    name: 'Kiwi',
    benefits: 'Pode contribuir como fonte de vitamina C e minerais, ajudando na complementação nutricional e hidratação.',
    texture: 'Cortado ao meio e raspado com colher, ou cortado em rodelas grossas maduras cortadas ao meio.',
    safety: 'Escolha kiwis bem maduros para que a parte central branca esteja macia. Fruta ácida pode causar assadura leve ao redor da boca, o que é normal.'
  }
];

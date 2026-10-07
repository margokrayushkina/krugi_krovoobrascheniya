export interface OrganInfo {
  id: string;
  name: string;
  description: string;
  role: string;
  category: 'heart' | 'organ' | 'circle';
}

export const organData: Record<string, OrganInfo> = {
  rightAtrium: {
    id: 'rightAtrium',
    name: 'Правое предсердие',
    description: 'Принимает венозную кровь из верхней и нижней полых вен. Это верхняя правая камера сердца.',
    role: 'Собирает кровь, бедную кислородом, со всего тела и передаёт её правому желудочку.',
    category: 'heart'
  },
  rightVentricle: {
    id: 'rightVentricle',
    name: 'Правый желудочек',
    description: 'Перекачивает венозную кровь в лёгочную артерию к лёгким. Расположен ниже правого предсердия.',
    role: 'Начало малого круга кровообращения — отправляет кровь в лёгкие за кислородом.',
    category: 'heart'
  },
  leftAtrium: {
    id: 'leftAtrium',
    name: 'Левое предсердие',
    description: 'Принимает артериальную кровь из лёгких по лёгочным венам. Это верхняя левая камера сердца.',
    role: 'Конец малого круга — получает обогащённую кислородом кровь и передаёт её левому желудочку.',
    category: 'heart'
  },
  leftVentricle: {
    id: 'leftVentricle',
    name: 'Левый желудочек',
    description: 'Самая мощная камера сердца! Стенки левого желудочка самые толстые, потому что ему нужно протолкнуть кровь через всю аорту.',
    role: 'Начало большого круга кровообращения — выбрасывает кровь, богатую кислородом, ко всем органам тела.',
    category: 'heart'
  },
  lungs: {
    id: 'lungs',
    name: 'Лёгкие',
    description: 'Парный орган дыхания. В лёгких происходит газообмен: кровь отдаёт углекислый газ и получает кислород.',
    role: 'Здесь венозная кровь превращается в артериальную — насыщается кислородом.',
    category: 'organ'
  },
  liver: {
    id: 'liver',
    name: 'Печень',
    description: 'Самая крупная железа организма. Очищает кровь от токсинов и вредных веществ.',
    role: 'Фильтрует кровь, обезвреживает яды, участвует в обмене веществ.',
    category: 'organ'
  },
  kidneys: {
    id: 'kidneys',
    name: 'Почки',
    description: 'Парный орган, расположенный в поясничной области. Фильтруют кровь, удаляя лишнюю воду и отходы.',
    role: 'Образуют мочу, выводят из организма продукты обмена веществ и лишнюю жидкость.',
    category: 'organ'
  },
  intestines: {
    id: 'intestines',
    name: 'Кишечник',
    description: 'Длинная трубка, в которой переваривается пища. Из переваренной пищи организм получает питательные вещества.',
    role: 'Получает питательные вещества из пищи и передаёт их в кровь.',
    category: 'organ'
  },
  brain: {
    id: 'brain',
    name: 'Мозг',
    description: 'Главный орган нервной системы. Управляет всем телом, думает, запоминает, чувствует.',
    role: 'Получает кислород и питательные вещества для своей работы. Очень чувствителен к нехватке кислорода.',
    category: 'organ'
  },
  muscles: {
    id: 'muscles',
    name: 'Мышцы',
    description: 'Обеспечивают движение тела. Мышцам нужно много кислорода и энергии для сокращения.',
    role: 'Получают кислород и питательные вещества для сокращения и движения.',
    category: 'organ'
  },
  smallCircle: {
    id: 'smallCircle',
    name: 'Малый круг кровообращения',
    description: 'Правый желудочек → лёгочная артерия → лёгкие → лёгочные вены → левое предсердие.',
    role: 'Здесь кровь обогащается кислородом в лёгких и избавляется от углекислого газа.',
    category: 'circle'
  },
  largeCircle: {
    id: 'largeCircle',
    name: 'Большой круг кровообращения',
    description: 'Левый желудочек → аорта → все органы тела → полые вены → правое предсердие.',
    role: 'Здесь кровь отдаёт кислород и питательные вещества тканям и забирает углекислый газ.',
    category: 'circle'
  }
};

export interface QuizQuestion {
  id: number;
  title: string;
  description: string;
  correctOrder: string[];
  organIds: string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    title: 'Малый круг кровообращения',
    description: 'Нажми на камеры сердца и органы в правильном порядке пути крови через малый круг:',
    correctOrder: ['rightVentricle', 'lungs', 'leftAtrium'],
    organIds: ['rightVentricle', 'lungs', 'leftAtrium', 'rightAtrium', 'leftVentricle', 'brain']
  },
  {
    id: 2,
    title: 'Большой круг кровообращения',
    description: 'Нажми на камеры сердца и органы в правильном порядке пути крови через большой круг:',
    correctOrder: ['leftVentricle', 'brain', 'rightAtrium'],
    organIds: ['leftVentricle', 'brain', 'rightAtrium', 'leftAtrium', 'rightVentricle', 'lungs']
  },
  {
    id: 3,
    title: 'Полный путь крови',
    description: 'Расстав камеры сердца в порядке, в котором кровь проходит через них:',
    correctOrder: ['rightAtrium', 'rightVentricle', 'leftAtrium', 'leftVentricle'],
    organIds: ['rightAtrium', 'rightVentricle', 'leftAtrium', 'leftVentricle']
  }
];

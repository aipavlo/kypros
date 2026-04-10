export const easyStartLessonIds = [
  "gr_lesson_001",
  "cy_lesson_001",
  "gr_lesson_006",
  "cy_lesson_008",
  "gr_lesson_022",
  "gr_lesson_011",
  "cy_lesson_002",
  "gr_lesson_012",
  "gr_lesson_015",
  "cy_lesson_005",
  "gr_lesson_017",
  "gr_lesson_018",
  "cy_lesson_015",
  "gr_lesson_019",
  "gr_lesson_021",
  "cy_lesson_023"
] as const;

export const easyStartNotes = [
  {
    id: "note_welcome",
    step: 2,
    eyebrow: "Заметка",
    title: "Язык и страна идут вместе",
    text: "На старте полезно не делить всё слишком строго на “язык” и “историю”. Даже короткие факты о Кипре делают уроки живее и помогают быстрее почувствовать контекст.",
    tone: "history"
  },
  {
    id: "note_small_steps",
    step: 5,
    eyebrow: "Подсказка",
    title: "Маленькие шаги работают лучше",
    text: "Для раннего прогресса важнее пройти один следующий урок, чем долго выбирать идеальный маршрут. Поэтому здесь всё уже выстроено за тебя.",
    tone: "language"
  },
  {
    id: "note_history",
    step: 9,
    eyebrow: "История",
    title: "История не должна пугать",
    text: "В этом режиме исторические справки короткие и дружелюбные. Их задача не перегрузить, а дать чувство, что ты уже постепенно понимаешь Кипр глубже.",
    tone: "history"
  },
  {
    id: "note_keep_going",
    step: 13,
    eyebrow: "Дальше",
    title: "Ты уже не просто учишь слова",
    text: "К этому месту язык начинает связываться с повседневной жизнью, а культурные и исторические заметки перестают быть чужими. Это хороший момент просто продолжать без лишнего анализа.",
    tone: "mixed"
  }
] as const;

export const trailDefinitions = [
  {
    id: "trail_souvlaki_starter",
    title: "Souvlaki Starter Pack",
    subtitle: "Не философствовать, а выжить и заговорить",
    tone: "language",
    icon: "chat",
    art: "market",
    result: "После прохождения ты сможешь представиться, рассказать о семье, назвать адрес, купить еду, сделать заказ и спросить дорогу на базовом греческом.",
    strategyNote: "Это лучший стартовый trail, если хочется быстро почувствовать полезность языка и получить ранние маленькие победы.",
    focus: ["самопрезентация", "семья", "дом", "покупки", "город"],
    lessonIds: [
      "gr_lesson_001",
      "gr_lesson_006",
      "gr_lesson_011",
      "gr_lesson_012",
      "gr_lesson_015",
      "gr_lesson_016",
      "gr_lesson_017",
      "gr_lesson_019"
    ]
  },
  {
    id: "trail_zeus_vs_paperwork",
    title: "Zeus vs Paperwork",
    subtitle: "Когда тебе нужен не гром, а справка",
    tone: "mixed",
    icon: "document",
    art: "archive",
    result: "После прохождения ты будешь понимать базовые формы, сервисные фразы, лексику гражданства и общий государственный контекст, который нужен для походов в сервисы и подготовки к экзамену.",
    strategyNote: "Маршрут собран так, чтобы paperwork ощущался не хаосом, а понятной системой из повторяющихся сервисных сценариев.",
    focus: ["документы", "запись в сервисы", "гражданство", "институты"],
    lessonIds: [
      "gr_lesson_021",
      "gr_lesson_029",
      "gr_lesson_009",
      "gr_lesson_033",
      "cy_lesson_001",
      "cy_lesson_004",
      "cy_lesson_009",
      "cy_lesson_023"
    ]
  },
  {
    id: "trail_aphrodite_history_buff",
    title: "Aphrodite's History Buffet",
    subtitle: "От древности до современного Кипра без сухой боли",
    tone: "history",
    icon: "laurel",
    art: "mosaic",
    result: "После прохождения ты соберёшь связную картину истории Кипра: древний фон, колониальный период, независимость, 1974 год и европейское измерение.",
    strategyNote: "Trail идёт по крупным историческим опорам, потому что так память работает лучше, чем при разрозненном заучивании дат.",
    focus: ["история", "независимость", "1974", "ЕС и евро"],
    lessonIds: [
      "cy_lesson_015",
      "cy_lesson_016",
      "cy_lesson_017",
      "cy_lesson_003",
      "cy_lesson_018",
      "cy_lesson_013",
      "cy_lesson_006",
      "cy_lesson_023"
    ]
  },
  {
    id: "trail_olive_republic",
    title: "Olive Republic Sprint",
    subtitle: "Государство, символы и общество без занудства",
    tone: "history",
    icon: "civic",
    art: "olive",
    result: "После прохождения ты будешь уверенно ориентироваться в том, как устроена Республика Кипр: название, столица, языки, парламент, ветви власти, символы и культурный фон.",
    strategyNote: "Этот маршрут уменьшает информационную асимметрию: после него уже ясно, как государство устроено и какие темы стоит повторять отдельно.",
    focus: ["государство", "языки", "парламент", "культура"],
    lessonIds: [
      "cy_lesson_001",
      "cy_lesson_008",
      "cy_lesson_011",
      "cy_lesson_004",
      "cy_lesson_009",
      "cy_lesson_012",
      "cy_lesson_020",
      "cy_lesson_021"
    ]
  },
  {
    id: "trail_moussaka_to_b1",
    title: "Moussaka to B1",
    subtitle: "Сначала мирно поесть, потом уже выражать мнение",
    tone: "language",
    icon: "arrow",
    art: "script",
    result: "После прохождения ты перейдёшь от A1-базы к более связному греческому: встречи, работа, здоровье, общественные сообщения, культурные темы и короткое мнение на уровне B1.",
    strategyNote: "Trail держит ощущение роста: каждый следующий модуль выглядит как логическое усиление прошлого, а не как случайный скачок сложности.",
    focus: ["A2 -> B1", "работа", "здоровье", "культура", "общественные тексты"],
    lessonIds: [
      "gr_lesson_026",
      "gr_lesson_027",
      "gr_lesson_028",
      "gr_lesson_025",
      "gr_lesson_030",
      "gr_lesson_031",
      "gr_lesson_032"
    ]
  },
  {
    id: "trail_athena_small_talk",
    title: "Athena Small Talk Forge",
    subtitle: "Куём базу без трагедии в трёх актах",
    tone: "language",
    icon: "spark",
    art: "speech",
    result: "После прохождения ты уверенно пройдёшь старт A1: представишься, скажешь откуда ты, объяснишь кто ты, чем владеешь, и опишешь свой обычный день простыми фразами.",
    strategyNote: "Это мягкий разговорный вход: первые уроки собраны так, чтобы быстро снять страх пустого рта и дать ощущение живой речи.",
    focus: ["знакомство", "страна и язык", "είμαι", "έχω", "распорядок"],
    lessonIds: [
      "gr_lesson_001",
      "gr_lesson_006",
      "gr_lesson_022",
      "gr_lesson_023",
      "gr_lesson_013",
      "gr_lesson_014"
    ]
  },
  {
    id: "trail_taverna_ninja",
    title: "Taverna Ninja Protocol",
    subtitle: "Есть, просить, ехать и не паниковать",
    tone: "language",
    icon: "compass",
    art: "taverna",
    result: "После прохождения ты сможешь покупать продукты, заказывать в кафе, ориентироваться в городе, пользоваться транспортом и спокойно спрашивать дорогу.",
    strategyNote: "Маршрут собран вокруг частых everyday wins: полезность ощущается сразу, поэтому продолжать становится проще, чем бросить.",
    focus: ["еда", "заказ", "цены", "город", "транспорт"],
    lessonIds: [
      "gr_lesson_015",
      "gr_lesson_016",
      "gr_lesson_017",
      "gr_lesson_018",
      "gr_lesson_019",
      "gr_lesson_035"
    ]
  },
  {
    id: "trail_copper_island_crash",
    title: "Copper Island Crash Course",
    subtitle: "Кипр без тумана в голове",
    tone: "history",
    icon: "map",
    art: "island_map",
    result: "После прохождения у тебя сложится ясная база по идентичности Кипра: государство, языки, символы, география, округа и региональные различия.",
    strategyNote: "Trail намеренно собирает устойчивый каркас по стране, чтобы дальше исторические и экзаменационные факты ложились на уже понятную карту.",
    focus: ["идентичность", "языки", "символы", "география", "округа"],
    lessonIds: [
      "cy_lesson_001",
      "cy_lesson_008",
      "cy_lesson_011",
      "cy_lesson_002",
      "cy_lesson_010",
      "cy_lesson_019"
    ]
  },
  {
    id: "trail_ministry_maze_any_percent",
    title: "Ministry Maze Any%",
    subtitle: "Максимум пользы, минимум блужданий по формам",
    tone: "mixed",
    icon: "document",
    art: "stamp",
    result: "После прохождения ты лучше ориентируешься в сервисной жизни: анкеты, запись в сервисы, подтверждение встреч, государственные институты и формат экзаменационной проверки.",
    strategyNote: "Этот trail снижает цену ошибки: сначала даёт базовый service-language, а уже потом добавляет институциональные и экзаменационные блоки.",
    focus: ["анкеты", "КЕП", "запись", "институты", "экзамен"],
    lessonIds: [
      "gr_lesson_021",
      "gr_lesson_002",
      "gr_lesson_029",
      "gr_lesson_037",
      "cy_lesson_004",
      "cy_lesson_009",
      "cy_lesson_007",
      "cy_lesson_014"
    ]
  },
  {
    id: "trail_halloumi_heritage",
    title: "Halloumi and Heritage Loop",
    subtitle: "Культура, люди и история без музейной пыли",
    tone: "mixed",
    icon: "laurel",
    art: "amphora",
    result: "После прохождения ты будешь лучше понимать культурные привычки Кипра, общественные даты, наследие, религиозный фон и то, как история влияет на современную идентичность.",
    strategyNote: "Здесь культура подаётся как связующее звено между историей и повседневностью, поэтому материал легче удерживается и реже ощущается сухим.",
    focus: ["культура", "общество", "наследие", "религия", "идентичность"],
    lessonIds: [
      "gr_lesson_031",
      "cy_lesson_005",
      "cy_lesson_020",
      "cy_lesson_021",
      "cy_lesson_022",
      "cy_lesson_026",
      "cy_lesson_028"
    ]
  },
  {
    id: "trail_marble_to_minibus",
    title: "Marble to Minibus",
    subtitle: "От античности к автобусной остановке",
    tone: "mixed",
    icon: "map",
    art: "road",
    result: "После прохождения ты увидишь связку между историей и повседневностью: от древнего и византийского слоя Кипра до современных поездок, города и общественной реальности.",
    strategyNote: "Trail специально смешивает историю и бытовые уроки, чтобы знания не распадались на два отдельных мира: учебный и жизненный.",
    focus: ["история", "город", "поездки", "современность", "связная картина"],
    lessonIds: [
      "cy_lesson_025",
      "cy_lesson_026",
      "cy_lesson_017",
      "cy_lesson_018",
      "gr_lesson_018",
      "gr_lesson_019",
      "gr_lesson_035"
    ]
  },
  {
    id: "trail_home_setup_no_drama",
    title: "Home Setup, No Drama",
    subtitle: "Адрес, квартира и бытовые вопросы без лишней паники",
    tone: "mixed",
    icon: "map",
    art: "road",
    result: "После прохождения ты сможешь спокойно назвать адрес, заполнить базовые поля о проживании, объяснить бытовую проблему, подтвердить контакт и поддержать короткий разговор о районе и соседях.",
    strategyNote: "Маршрут собран как practical settling-in layer: сначала адрес и формы, потом квартира и бытовые трения, а в конце короткий everyday small talk, чтобы переезд не ощущался набором несвязанных задач.",
    focus: ["адрес", "проживание", "квартира", "контакт", "район"],
    lessonIds: [
      "gr_lesson_012",
      "gr_lesson_021",
      "gr_lesson_025",
      "gr_lesson_037",
      "gr_lesson_073"
    ]
  },
  {
    id: "trail_no_english_pls",
    title: "No English, Please",
    subtitle: "Вежливо, спокойно и всё ещё по-гречески",
    tone: "language",
    icon: "chat",
    art: "speech",
    result: "После прохождения ты будешь лучше держать живой разговор на греческом: просить говорить медленнее, не теряться в быстрых репликах и строить короткую speaking-практику.",
    strategyNote: "Маршрут делает speaking менее страшным: цена входа маленькая, а быстрый полезный эффект виден уже после нескольких уроков.",
    focus: ["English-switch", "listening", "speaking routine", "живой диалог"],
    lessonIds: [
      "gr_lesson_001",
      "gr_lesson_017",
      "gr_lesson_040",
      "gr_lesson_041",
      "gr_lesson_042"
    ]
  },
  {
    id: "trail_doctor_pharmacy_follow_up",
    title: "Doctor, Pharmacy, Follow-Up",
    subtitle: "Самочувствие, запись и уточнения без выпадения в английский",
    tone: "language",
    icon: "compass",
    art: "speech",
    result: "После прохождения ты сможешь описать самочувствие, договориться о времени, понять короткий сервисный звонок и вежливо уточнить детали у врача, в аптеке или на регистрации.",
    strategyNote: "Это low-pressure medical-and-service trail: он не требует идеального языка, а собирает самые частые фразы вокруг самочувствия, записи, follow-up вопросов и коротких бытовых реплик на слух.",
    focus: ["врач", "аптека", "запись", "уточнения", "слух"],
    lessonIds: [
      "gr_lesson_026",
      "gr_lesson_027",
      "gr_lesson_037",
      "gr_lesson_041",
      "gr_lesson_054"
    ]
  },
  {
    id: "trail_kep_survival_mode",
    title: "KEP Survival Mode",
    subtitle: "Когда бумажка тоже персонаж сюжета",
    tone: "mixed",
    icon: "document",
    art: "archive",
    result: "После прохождения ты будешь лучше ориентироваться в forms-and-services сценариях: анкеты, запись, подтверждение, курсы греческого и институциональный контекст.",
    strategyNote: "Trail собирает частые service-scenarios в один пакет, чтобы пользователю не приходилось вручную искать нужные уроки перед реальным походом в сервис.",
    focus: ["КЕП", "заявления", "курсы", "институты", "appointments"],
    lessonIds: [
      "gr_lesson_021",
      "gr_lesson_029",
      "gr_lesson_037",
      "gr_lesson_043",
      "cy_lesson_004",
      "cy_lesson_009",
      "cy_lesson_030"
    ]
  },
  {
    id: "trail_kep_to_resolution",
    title: "KEP to Resolution",
    subtitle: "Не просто подать бумагу, а довести вопрос до ясности",
    tone: "mixed",
    icon: "document",
    art: "stamp",
    result: "После прохождения ты сможешь пройти путь от формы и записи до уточнения требований, справок и сроков в KEP и других сервисах, не теряясь в следующем шаге.",
    strategyNote: "Этот маршрут продолжает service layer дальше стартового survival-mode: он нужен тем, кому мало просто записаться, а важно понять, что принести, что спросить и как дочитать инструкцию до конца.",
    focus: ["KEP", "справки", "требования", "сроки", "инструкции"],
    lessonIds: [
      "gr_lesson_021",
      "gr_lesson_029",
      "gr_lesson_037",
      "gr_lesson_071",
      "gr_lesson_072"
    ]
  },
  {
    id: "trail_fact_not_panic",
    title: "Fact, Not Panic",
    subtitle: "Запоминать Кипр по темам, а не по нервам",
    tone: "history",
    icon: "civic",
    art: "timeline",
    result: "После прохождения ты будешь повторять Cyprus Reality более системно: через тематические блоки, понимание устойчивых фактов и отдельную проверку изменяемых данных перед экзаменом.",
    strategyNote: "Это стратегический trail для повторения: он превращает нервное заучивание в более выгодную стратегию тематического обзора и перепроверки фактов.",
    focus: ["тематическое повторение", "изменяемые факты", "экзаменационная стратегия"],
    lessonIds: [
      "cy_lesson_001",
      "cy_lesson_003",
      "cy_lesson_023",
      "cy_lesson_029",
      "cy_lesson_030",
      "cy_lesson_024"
    ]
  }
] as const;

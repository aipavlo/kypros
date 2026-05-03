import scenarioPacksJson from "@content/07-everyday-greek/scenario-packs.json";
import { appRoutes } from "@/src/lib/routes";
import type { ScenarioPackItem } from "@/src/content/types";
import { transliterateGreekToLatin } from "@/src/content/transliteration";

type ScenarioPackTone = "language" | "mixed";
type ScenarioPackCategory = "first_week" | "daily_runs" | "services";

type ScenarioPackPresentation = {
  category: ScenarioPackCategory;
  categoryLabel: string;
  tone: ScenarioPackTone;
  icon: string;
  art: string;
  estimatedMinutes: number;
  subtitle: string;
  promise: string;
  focus: string[];
  checks: string[];
};

export type ScenarioPack = {
  id: string;
  title: string;
  subtitle: string;
  promise: string;
  description: string;
  category: ScenarioPackCategory;
  categoryLabel: string;
  tone: ScenarioPackTone;
  icon: string;
  art: string;
  estimatedMinutes: number;
  linkedLessonId: string;
  linkedTrailId?: string;
  focus: string[];
  phrases: Array<{
    greek: string;
    translation: string;
    transliteration?: string;
  }>;
  selfCheck: {
    prompt: string;
    checks: string[];
  };
  productionPrompt: string;
};

const scenarioPackPresentationById: Record<string, ScenarioPackPresentation> = {
  scenario_001_greet_introduce: {
    category: "first_week",
    categoryLabel: "Первая неделя",
    tone: "language",
    icon: "chat",
    art: "speech",
    estimatedMinutes: 5,
    subtitle: "Начать короткий разговор спокойно и без английского с первой фразы",
    promise: "Поздороваться, представиться и не потерять нить в первой минуте разговора.",
    focus: ["приветствие", "вежливость", "короткое представление"],
    checks: [
      "Поздоровайся одной вежливой фразой.",
      "Назови своё имя одной короткой репликой.",
      "Добавь страну или город и остановись без лишнего текста."
    ]
  },
  scenario_002_speak_slowly: {
    category: "first_week",
    categoryLabel: "Первая неделя",
    tone: "language",
    icon: "spark",
    art: "speech",
    estimatedMinutes: 5,
    subtitle: "Сказать, что тебе нужен более мягкий темп и ещё одна попытка понять",
    promise: "Попросить говорить медленнее и выиграть себе время без мгновенного ухода в английский.",
    focus: ["уточнение", "темп речи", "повтор"],
    checks: [
      "Скажи, что говоришь немного по-гречески.",
      "Попроси говорить медленнее.",
      "Добавь одну фразу про то, что понял не всё."
    ]
  },
  scenario_003_family_small_talk: {
    category: "first_week",
    categoryLabel: "Первая неделя",
    tone: "language",
    icon: "chat",
    art: "sunrise",
    estimatedMinutes: 5,
    subtitle: "Коротко ответить про семью и домашний контекст без длинного рассказа",
    promise: "Поддержать тёплый бытовой small talk о семье несколькими короткими фразами.",
    focus: ["семья", "дом", "короткий ответ"],
    checks: [
      "Скажи одну фразу о семье.",
      "Добавь, где живёте.",
      "Удержи ответ в пределах 2-3 коротких реплик."
    ]
  },
  scenario_004_where_is_it: {
    category: "daily_runs",
    categoryLabel: "Ежедневные дела",
    tone: "language",
    icon: "map",
    art: "steps",
    estimatedMinutes: 6,
    subtitle: "Найти улицу, вход, офис или остановку и не зависнуть на первом же вопросе",
    promise: "Спросить дорогу, уточнить расстояние и попросить показать на карте.",
    focus: ["дорога", "карта", "место"],
    checks: [
      "Спроси, где находится нужное место.",
      "Уточни, близко ли это.",
      "Попроси показать на карте."
    ]
  },
  scenario_005_transport_and_taxi: {
    category: "daily_runs",
    categoryLabel: "Ежедневные дела",
    tone: "language",
    icon: "arrow",
    art: "road",
    estimatedMinutes: 6,
    subtitle: "Понять, куда ехать, и быстро попросить автобус или такси",
    promise: "Закрыть базовый transport-сценарий без длинного объяснения маршрута.",
    focus: ["автобус", "такси", "центр"],
    checks: [
      "Спроси про автобус в центр.",
      "Уточни, где остановка.",
      "Собери короткую просьбу про такси."
    ]
  },
  scenario_006_coffee_order: {
    category: "daily_runs",
    categoryLabel: "Ежедневные дела",
    tone: "language",
    icon: "spark",
    art: "market",
    estimatedMinutes: 6,
    subtitle: "Заказать кофе и закрыть короткий диалог без паники",
    promise: "Сделать короткий заказ в кафе и не потеряться после первого уточнения.",
    focus: ["кофе", "заказ", "вежливость"],
    checks: [
      "Скажи, что хочешь кофе.",
      "Добавь вежливую формулу.",
      "Удержи заказ в 1-2 коротких фразах."
    ]
  },
  scenario_007_groceries_market: {
    category: "daily_runs",
    categoryLabel: "Ежедневные дела",
    tone: "language",
    icon: "compass",
    art: "market",
    estimatedMinutes: 6,
    subtitle: "Купить продукты и назвать нужное без длинного shopping-диалога",
    promise: "Быстро собрать grocery-scenario для магазина и рынка.",
    focus: ["продукты", "магазин", "покупка"],
    checks: [
      "Назови один нужный продукт.",
      "Собери короткую просьбу о покупке.",
      "Добавь вежливую завершающую фразу."
    ]
  },
  scenario_008_price_and_quantity: {
    category: "daily_runs",
    categoryLabel: "Ежедневные дела",
    tone: "language",
    icon: "compass",
    art: "stamp",
    estimatedMinutes: 5,
    subtitle: "Спросить цену и количество без длинной торговли",
    promise: "Уточнить стоимость и объём так, чтобы спокойно завершить покупку.",
    focus: ["цена", "количество", "касса"],
    checks: [
      "Спроси, сколько это стоит.",
      "Уточни количество.",
      "Проверь, можешь ли завершить покупку одной фразой."
    ]
  },
  scenario_009_appointment_service: {
    category: "services",
    categoryLabel: "Сервисы",
    tone: "mixed",
    icon: "document",
    art: "archive",
    estimatedMinutes: 7,
    subtitle: "Записаться, подтвердить время и не потерять смысл на ресепшене",
    promise: "Пройти короткий service-scenario вокруг записи и подтверждения времени.",
    focus: ["запись", "время", "сервис"],
    checks: [
      "Скажи, что хочешь записаться.",
      "Подтверди день и время.",
      "Пойми, можешь ли повторить это вслух спокойно."
    ]
  },
  scenario_010_pharmacy_health: {
    category: "services",
    categoryLabel: "Сервисы",
    tone: "mixed",
    icon: "spark",
    art: "waves",
    estimatedMinutes: 7,
    subtitle: "Сказать о самочувствии, попросить лекарство и задать один follow-up вопрос",
    promise: "Собрать low-pressure medical scenario без длинного рассказа о симптомах.",
    focus: ["аптека", "самочувствие", "follow-up"],
    checks: [
      "Скажи, что тебе плохо.",
      "Попроси лекарство или помощь.",
      "Добавь короткий follow-up вопрос."
    ]
  },
  scenario_011_reschedule_plan: {
    category: "services",
    categoryLabel: "Сервисы",
    tone: "mixed",
    icon: "document",
    art: "road",
    estimatedMinutes: 6,
    subtitle: "Перенести встречу или договорённость без лишней неловкости",
    promise: "Быстро объяснить, что встречу нужно перенести, и предложить другой слот.",
    focus: ["перенос", "время", "план"],
    checks: [
      "Скажи, что нужна другая дата или время.",
      "Предложи альтернативу.",
      "Удержи просьбу краткой и вежливой."
    ]
  },
  scenario_012_ask_repeat_clarify: {
    category: "services",
    categoryLabel: "Сервисы",
    tone: "language",
    icon: "chat",
    art: "speech",
    estimatedMinutes: 5,
    subtitle: "Попросить повторить, уточнить и не потерять разговор",
    promise: "Держать clarification-loop коротко и спокойно даже в быстром разговоре.",
    focus: ["повтор", "уточнение", "понимание"],
    checks: [
      "Попроси повторить.",
      "Уточни, что не расслышал.",
      "Собери это в один короткий clarification-loop."
    ]
  }
};

const sourceScenarioPacks = scenarioPacksJson as ScenarioPackItem[];

export const scenarioPacks: ScenarioPack[] = sourceScenarioPacks.map((pack) => {
  const presentation = scenarioPackPresentationById[pack.id];

  return {
    id: pack.id,
    title: pack.title,
    subtitle: presentation?.subtitle ?? pack.intent,
    promise: presentation?.promise ?? pack.intent,
    description: `${pack.scenario} ${pack.intent}`.trim(),
    category: presentation?.category ?? "daily_runs",
    categoryLabel: presentation?.categoryLabel ?? "Ежедневные дела",
    tone: presentation?.tone ?? "language",
    icon: presentation?.icon ?? "chat",
    art: presentation?.art ?? "speech",
    estimatedMinutes: presentation?.estimatedMinutes ?? 6,
    linkedLessonId: pack.links.lessonIds[0] ?? "",
    linkedTrailId: pack.links.trailIds[0],
    focus: presentation?.focus ?? [pack.intent],
    phrases: pack.phrasePack.map((phrase) => {
      const transliteration = phrase.transliteration ?? transliterateGreekToLatin(phrase.greek) ?? undefined;

      return {
        greek: phrase.greek,
        translation: phrase.translation,
        ...(transliteration ? { transliteration } : {})
      };
    }),
    selfCheck: {
      prompt: pack.selfCheck,
      checks: presentation?.checks ?? [
        "Прочитай и проговори 2-3 фразы вслух.",
        "Попробуй воспроизвести сценарий без подсказки.",
        "Оцени, где нужен опорный урок."
      ]
    },
    productionPrompt: pack.productionPrompt
  };
});

export const scenarioPackById = new Map(scenarioPacks.map((pack) => [pack.id, pack] as const));

export function getScenarioPackById(packId?: string | null) {
  if (!packId) {
    return scenarioPacks[0];
  }

  return scenarioPackById.get(packId) ?? scenarioPacks[0];
}

export function getScenarioPackLink(packId: string) {
  return appRoutes.phrasebook({ pack: packId });
}

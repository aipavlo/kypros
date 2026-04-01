import greekModules from "@content/02-greek-b1/modules.json";
import greekLessons from "@content/02-greek-b1/lessons.json";
import cyprusModules from "@content/03-cyprus-reality/modules.json";
import cyprusLessons from "@content/03-cyprus-reality/lessons.json";
import cyprusFactsJson from "@content/03-cyprus-reality/facts.json";
import {
  CYPRUS_LESSON_COUNT,
  GREEK_LESSON_COUNT,
  HUMOR_ITEM_COUNT,
  LESSON_TOTAL_COUNT
} from "@/src/content/contentCounts";
import type {
  FactItem,
  LessonItem,
  ModuleItem,
  TrackSummary
} from "@/src/content/types";

function sortByOrder<T extends { order?: number }>(items: T[]) {
  return items.sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999));
}

export const modules = sortByOrder([
  ...(greekModules as ModuleItem[]),
  ...(cyprusModules as ModuleItem[])
]);

export const lessons = sortByOrder([
  ...(greekLessons as LessonItem[]),
  ...(cyprusLessons as LessonItem[])
]);

export const cyprusFacts = cyprusFactsJson as FactItem[];

const trackMeta: Record<string, Omit<TrackSummary, "lessonCount" | "moduleCount">> = {
  greek_b1: {
    id: "greek_b1",
    title: "Программа по греческому языку",
    description:
      "Основная программа A1 -> A2 -> B1 -> B2 для жизни на Кипре, общения и общественно-бытовых сценариев; C1 добавлен как дополнительный продвинутый блок после основной линии."
  },
  cyprus_reality: {
    id: "cyprus_reality",
    title: "Cyprus Reality",
    description:
      "Самостоятельная программа по истории, институтам, датам, культуре и общественно-политическому контексту Кипра без хаотичного заучивания фактов."
  },
  exam_prep: {
    id: "exam_prep",
    title: "Подготовка к экзамену",
    description:
      "Слой проверки и обратной связи с короткими квизами, пробными режимами и возвратом к слабым темам."
  },
  speaking_practice: {
    id: "speaking_practice",
    title: "Разговорная практика",
    description:
      "Подборка разговорных маршрутов по речи и восприятию на слух: держать разговор на греческом и не уходить в английский."
  },
  citizenship_strategy: {
    id: "citizenship_strategy",
    title: "Стратегия подготовки",
    description:
      "Подборка маршрутов по сервисам, формам, институтам и тематическому повторению Cyprus Reality перед экзаменом."
  },
  greek_humor: {
    id: "greek_humor",
    title: "Греческий юмор",
    description:
      "Лёгкий культурный раздел с мемами, шутками и анекдотами, который помогает возвращаться в язык без перегруза."
  }
};

const trackLessonCountOverrides: Record<string, number> = {
  greek_b1: GREEK_LESSON_COUNT,
  cyprus_reality: CYPRUS_LESSON_COUNT,
  speaking_practice: 12,
  citizenship_strategy: 14,
  greek_humor: HUMOR_ITEM_COUNT
};

const trackModuleCountOverrides: Record<string, number> = {
  speaking_practice: 2,
  citizenship_strategy: 2,
  greek_humor: 3
};

const modulesByTrack = new Map<string, ModuleItem[]>();
const lessonsByTrack = new Map<string, LessonItem[]>();
const lessonsByModule = new Map<string, LessonItem[]>();
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson] as const));
const moduleById = new Map(modules.map((module) => [module.id, module] as const));

for (const module of modules) {
  const current = modulesByTrack.get(module.trackId) ?? [];
  current.push(module);
  modulesByTrack.set(module.trackId, current);
}

for (const lesson of lessons) {
  const trackLessons = lessonsByTrack.get(lesson.trackId) ?? [];
  trackLessons.push(lesson);
  lessonsByTrack.set(lesson.trackId, trackLessons);

  const moduleLessons = lessonsByModule.get(lesson.moduleId) ?? [];
  moduleLessons.push(lesson);
  lessonsByModule.set(lesson.moduleId, moduleLessons);
}

for (const [trackId, trackModules] of modulesByTrack) {
  modulesByTrack.set(trackId, sortByOrder(trackModules));
}

for (const [trackId, trackLessons] of lessonsByTrack) {
  lessonsByTrack.set(trackId, sortByOrder(trackLessons));
}

for (const [moduleId, moduleLessons] of lessonsByModule) {
  lessonsByModule.set(moduleId, sortByOrder(moduleLessons));
}

export const tracks: TrackSummary[] = Object.values(trackMeta).map((track) => ({
  ...track,
  lessonCount:
    trackLessonCountOverrides[track.id] ??
    lessonsByTrack.get(track.id)?.length ??
    0,
  moduleCount:
    trackModuleCountOverrides[track.id] ??
    modulesByTrack.get(track.id)?.length ??
    0
}));

export function getModulesByTrack(trackId: string) {
  return modulesByTrack.get(trackId) ?? [];
}

export function getLessonsByTrack(trackId: string) {
  return lessonsByTrack.get(trackId) ?? [];
}

export function getLessonsByModule(moduleId: string) {
  return lessonsByModule.get(moduleId) ?? [];
}

export function getLessonsByTrackAndDifficulty(trackId: string, difficulty: string) {
  return getLessonsByTrack(trackId).filter((lesson) => lesson.difficulty === difficulty);
}

export function getModulesByTrackAndDifficulty(trackId: string, difficulty: string) {
  const lessonModuleIds = new Set(
    getLessonsByTrackAndDifficulty(trackId, difficulty).map((lesson) => lesson.moduleId)
  );

  return getModulesByTrack(trackId).filter((module) => lessonModuleIds.has(module.id));
}

export function getTrackStartLessons(trackId: string, limit = 3) {
  return getLessonsByTrack(trackId).slice(0, limit);
}

export function getRecentLessons(trackId: string, limit = 6) {
  return getLessonsByTrack(trackId)
    .slice()
    .sort((left, right) => (right.order ?? -1) - (left.order ?? -1))
    .slice(0, limit);
}

export function getLessonById(lessonId: string) {
  return lessonById.get(lessonId);
}

export function getModuleById(moduleId: string) {
  return moduleById.get(moduleId);
}

export function getMutableCyprusFacts() {
  return cyprusFacts.filter(
    (fact) => fact.trackId === "cyprus_reality" && fact.sourceStatus === "draft"
  );
}

export function getNextLesson(lessonId: string) {
  const currentLesson = getLessonById(lessonId);

  if (!currentLesson) {
    return undefined;
  }

  const orderedLessons = getLessonsByTrack(currentLesson.trackId);
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex === -1 || currentIndex === orderedLessons.length - 1) {
    return undefined;
  }

  return orderedLessons[currentIndex + 1];
}

export { LESSON_TOTAL_COUNT };

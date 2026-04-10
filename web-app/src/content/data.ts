import greekModules from "@content/02-greek-b1/modules.json";
import greekLessons from "@content/02-greek-b1/lessons.json";
import greekFlashcards from "@content/02-greek-b1/flashcards.json";
import cyprusModules from "@content/03-cyprus-reality/modules.json";
import cyprusLessons from "@content/03-cyprus-reality/lessons.json";
import cyprusFlashcards from "@content/03-cyprus-reality/flashcards.json";
import cyprusFactsJson from "@content/03-cyprus-reality/facts.json";
import examQuizzes from "@content/04-exam-prep/quizzes.json";
import quizModesJson from "@content/04-exam-prep/quiz-modes.json";
import humorItemsJson from "@content/06-greek-humor/items.json";
import {
  getSentenceReviewClusterById,
  getSentenceReviewClustersByLessonId,
  getSentenceReviewClustersByModuleId,
  getSentenceReviewClustersByTrack,
  sentenceReviewClusters
} from "@/src/content/sentenceReviewData";
import type {
  FactItem,
  FlashcardItem,
  HumorItem,
  LessonItem,
  ModuleItem,
  QuizModeItem,
  QuizQuestionItem,
  TrackSummary
} from "@/src/content/types";

export const modules = [...(greekModules as ModuleItem[]), ...(cyprusModules as ModuleItem[])];

export const lessons = [...(greekLessons as LessonItem[]), ...(cyprusLessons as LessonItem[])];

export const quizzes = examQuizzes as QuizQuestionItem[];
export const quizModes = quizModesJson as QuizModeItem[];
export const cyprusFacts = cyprusFactsJson as FactItem[];
export const flashcards = [
  ...(greekFlashcards as FlashcardItem[]),
  ...(cyprusFlashcards as FlashcardItem[])
];
export const humorItems = humorItemsJson as HumorItem[];
export const sentenceReviewItems = sentenceReviewClusters;

const trackMeta: Record<string, Omit<TrackSummary, "lessonCount" | "moduleCount">> = {
  greek_b1: {
    id: "greek_b1",
    title: "Программа по греческому языку",
    description: "Основная программа A1 -> A2 -> B1 -> B2 для жизни на Кипре, общения и общественно-бытовых сценариев; C1 добавлен как дополнительный продвинутый блок после основной линии."
  },
  cyprus_reality: {
    id: "cyprus_reality",
    title: "Cyprus Reality",
    description: "Самостоятельная программа по истории, институтам, датам, культуре и общественно-политическому контексту Кипра без хаотичного заучивания фактов."
  },
  exam_prep: {
    id: "exam_prep",
    title: "Подготовка к экзамену",
    description: "Слой проверки и обратной связи с короткими квизами, пробными режимами и возвратом к слабым темам."
  },
  speaking_practice: {
    id: "speaking_practice",
    title: "Разговорная практика",
    description: "Подборка разговорных маршрутов по речи и восприятию на слух: держать разговор на греческом и не уходить в английский."
  },
  citizenship_strategy: {
    id: "citizenship_strategy",
    title: "Стратегия подготовки",
    description: "Подборка маршрутов по сервисам, формам, институтам и тематическому повторению Cyprus Reality перед экзаменом."
  },
  greek_humor: {
    id: "greek_humor",
    title: "Греческий юмор",
    description: "Лёгкий культурный раздел с мемами, шутками и анекдотами, который помогает возвращаться в язык без перегруза."
  }
};

const trackLessonCountOverrides: Record<string, number> = {
  speaking_practice: 12,
  citizenship_strategy: 14,
  greek_humor: humorItems.length
};

const trackModuleCountOverrides: Record<string, number> = {
  speaking_practice: 2,
  citizenship_strategy: 2,
  greek_humor: 3
};

export const tracks: TrackSummary[] = Object.values(trackMeta).map((track) => ({
  ...track,
  lessonCount:
    trackLessonCountOverrides[track.id] ??
    lessons.filter((lesson) => lesson.trackId === track.id).length,
  moduleCount:
    trackModuleCountOverrides[track.id] ??
    modules.filter((module) => module.trackId === track.id).length
}));

export function getModulesByTrack(trackId: string) {
  return modules
    .filter((module) => module.trackId === trackId)
    .sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999));
}

export function getLessonsByTrack(trackId: string) {
  return lessons
    .filter((lesson) => lesson.trackId === trackId)
    .sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999));
}

export function getLessonsByModule(moduleId: string) {
  return lessons
    .filter((lesson) => lesson.moduleId === moduleId)
    .sort((left, right) => (left.order ?? 9999) - (right.order ?? 9999));
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
  return lessons.find((lesson) => lesson.id === lessonId);
}

export function getModuleById(moduleId: string) {
  return modules.find((module) => module.id === moduleId);
}

export function getQuizHighlights(limit = 4) {
  return quizzes.slice(0, limit);
}

export function getQuizModeById(modeId: string) {
  return quizModes.find((mode) => mode.id === modeId);
}

function questionHasTag(question: QuizQuestionItem, tag: string) {
  return question.tags.includes(tag);
}

function flashcardHasTag(card: FlashcardItem, tag: string) {
  return card.tags.includes(tag);
}

function normalizeDifficultyList(value?: string[] | string) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function getQuizQuestionsByMode(modeId: string) {
  const mode = getQuizModeById(modeId);

  if (!mode) {
    return quizzes;
  }

  const { questionStrategy } = mode;

  if (questionStrategy.mix) {
    const selectedQuestions: QuizQuestionItem[] = [];
    const usedIds = new Set<string>();

    for (const chunk of questionStrategy.mix) {
      const matchingQuestions = quizzes.filter((question) => {
        const matchesTrack = questionHasTag(question, chunk.trackTag);
        const matchesDifficulty = chunk.difficulty ? question.difficulty === chunk.difficulty : true;

        return matchesTrack && matchesDifficulty && !usedIds.has(question.id);
      });

      for (const question of matchingQuestions.slice(0, chunk.count)) {
        usedIds.add(question.id);
        selectedQuestions.push(question);
      }
    }

    return selectedQuestions;
  }

  const difficultyList = normalizeDifficultyList(questionStrategy.difficulty);

  return quizzes.filter((question) => {
    const matchesTrack = questionStrategy.trackTag
      ? questionHasTag(question, questionStrategy.trackTag)
      : true;
    const matchesDifficulty =
      difficultyList.length > 0 ? difficultyList.includes(question.difficulty) : true;

    return matchesTrack && matchesDifficulty;
  });
}

export function getFlashcardsByTrack(trackId: string) {
  return flashcards.filter((card) => card.trackId === trackId);
}

export function getFlashcardsByLesson(lessonId: string) {
  return flashcards.filter((card) => flashcardHasTag(card, `lesson:${lessonId}`));
}

export function getFlashcardsByModule(moduleId: string, difficulty?: string) {
  return flashcards.filter((card) => {
    const matchesModule = flashcardHasTag(card, `module:${moduleId}`);
    const matchesDifficulty = difficulty ? card.difficulty === difficulty : true;

    return matchesModule && matchesDifficulty;
  });
}

export {
  getSentenceReviewClusterById,
  getSentenceReviewClustersByLessonId,
  getSentenceReviewClustersByModuleId,
  getSentenceReviewClustersByTrack
};

export function getQuizQuestionsByLesson(lessonId: string, difficulty?: string) {
  return quizzes.filter((question) => {
    const matchesLesson = questionHasTag(question, `lesson:${lessonId}`);
    const matchesDifficulty = difficulty ? question.difficulty === difficulty : true;

    return matchesLesson && matchesDifficulty;
  });
}

export function getQuizQuestionsByModule(moduleId: string, difficulty?: string) {
  return quizzes.filter((question) => {
    const matchesModule = questionHasTag(question, `module:${moduleId}`);
    const isMiniQuiz = questionHasTag(question, "quiz:mini");
    const matchesDifficulty = difficulty ? question.difficulty === difficulty : true;

    return matchesModule && isMiniQuiz && matchesDifficulty;
  });
}

export function getMutableCyprusFacts() {
  return cyprusFacts.filter((fact) => fact.trackId === "cyprus_reality" && fact.sourceStatus === "draft");
}

export function getRecommendedQuizModeForLesson(lessonId: string) {
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return undefined;
  }

  if (lesson.trackId === "cyprus_reality") {
    return getQuizModeById("mode_cyprus_reality");
  }

  const modeByDifficulty: Record<string, string> = {
    a1: "mode_greek_a1",
    a2: "mode_greek_a2",
    b1: "mode_greek_b1",
    b2: "mode_greek_b2",
    c1: "mode_greek_c1"
  };

  return getQuizModeById(modeByDifficulty[lesson.difficulty] ?? "mode_mixed_summary");
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

export function getHumorItems() {
  return humorItems;
}

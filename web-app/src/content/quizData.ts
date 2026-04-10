import examQuizzes from "@content/04-exam-prep/quizzes.json";
import quizModesJson from "@content/04-exam-prep/quiz-modes.json";
import { QUIZ_TOTAL_COUNT } from "@/src/content/contentCounts";
import { getLessonById } from "@/src/content/catalogData";
import type { QuizModeItem, QuizQuestionItem } from "@/src/content/types";

export const quizzes = examQuizzes as QuizQuestionItem[];
export const quizModes = quizModesJson as QuizModeItem[];

const quizModeById = new Map(quizModes.map((mode) => [mode.id, mode] as const));
const quizQuestionsByLesson = new Map<string, QuizQuestionItem[]>();
const quizQuestionsByModule = new Map<string, QuizQuestionItem[]>();

function questionHasTag(question: QuizQuestionItem, tag: string) {
  return question.tags.includes(tag);
}

function questionHasAnyTag(question: QuizQuestionItem, tags: string[]) {
  return tags.some((tag) => questionHasTag(question, tag));
}

function normalizeDifficultyList(value?: string[] | string) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

for (const question of quizzes) {
  for (const tag of question.tags) {
    if (tag.startsWith("lesson:")) {
      const lessonId = tag.replace("lesson:", "");
      const lessonQuestions = quizQuestionsByLesson.get(lessonId) ?? [];
      lessonQuestions.push(question);
      quizQuestionsByLesson.set(lessonId, lessonQuestions);
    }

    if (tag.startsWith("module:")) {
      const moduleId = tag.replace("module:", "");
      const moduleQuestions = quizQuestionsByModule.get(moduleId) ?? [];
      moduleQuestions.push(question);
      quizQuestionsByModule.set(moduleId, moduleQuestions);
    }
  }
}

export function getQuizHighlights(limit = 4) {
  return quizzes.slice(0, limit);
}

export function getQuizModeById(modeId: string) {
  return quizModeById.get(modeId);
}

export function getQuizQuestionsByMode(modeId: string) {
  const mode = getQuizModeById(modeId);

  if (!mode) {
    return quizzes;
  }

  const { questionStrategy } = mode;
  const includeTags = questionStrategy.includeTags ?? [];
  const excludeTags = questionStrategy.excludeTags ?? [];
  const limit = questionStrategy.limit;
  const matchesTagFilters = (question: QuizQuestionItem) =>
    (includeTags.length === 0 || questionHasAnyTag(question, includeTags)) &&
    (excludeTags.length === 0 || !questionHasAnyTag(question, excludeTags));
  let selectedQuestions: QuizQuestionItem[];

  if (questionStrategy.mix) {
    selectedQuestions = [];
    const usedIds = new Set<string>();

    for (const chunk of questionStrategy.mix) {
      const matchingQuestions = quizzes.filter((question) => {
        const matchesTrack = questionHasTag(question, chunk.trackTag);
        const matchesDifficulty = chunk.difficulty ? question.difficulty === chunk.difficulty : true;
        return matchesTrack && matchesDifficulty && matchesTagFilters(question) && !usedIds.has(question.id);
      });

      for (const question of matchingQuestions.slice(0, chunk.count)) {
        usedIds.add(question.id);
        selectedQuestions.push(question);
      }
    }
  } else {
    const difficultyList = normalizeDifficultyList(questionStrategy.difficulty);

    selectedQuestions = quizzes.filter((question) => {
      const matchesTrack = questionStrategy.trackTag
        ? questionHasTag(question, questionStrategy.trackTag)
        : true;
      const matchesDifficulty =
        difficultyList.length > 0 ? difficultyList.includes(question.difficulty) : true;
      return matchesTrack && matchesDifficulty && matchesTagFilters(question);
    });
  }

  return typeof limit === "number" ? selectedQuestions.slice(0, limit) : selectedQuestions;
}

export function getQuizQuestionsByLesson(lessonId: string, difficulty?: string) {
  return (quizQuestionsByLesson.get(lessonId) ?? []).filter((question) => {
    const matchesLesson = questionHasTag(question, `lesson:${lessonId}`);
    const matchesDifficulty = difficulty ? question.difficulty === difficulty : true;

    return matchesLesson && matchesDifficulty;
  });
}

export function getQuizQuestionsByModule(moduleId: string, difficulty?: string) {
  return (quizQuestionsByModule.get(moduleId) ?? []).filter((question) => {
    const matchesModule = questionHasTag(question, `module:${moduleId}`);
    const isMiniQuiz = questionHasTag(question, "quiz:mini");
    const matchesDifficulty = difficulty ? question.difficulty === difficulty : true;

    return matchesModule && isMiniQuiz && matchesDifficulty;
  });
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

export { QUIZ_TOTAL_COUNT };

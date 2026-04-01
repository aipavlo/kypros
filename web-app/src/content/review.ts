import { getModuleById } from "@/src/content/catalogData";
import { getQuizModeById } from "@/src/content/quizData";
import { getModuleStage } from "@/src/content/presentation";

export type QuizModeProgress = {
  attempts: number;
  bestPercent: number;
  lastPercent: number;
  wrongQuestionIds: string[];
  weakModules: string[];
  weakSkills: string[];
};

export type StoredQuizProgress = Record<string, QuizModeProgress>;

export type ReviewModeSummary = {
  modeId: string;
  title: string;
  attempts: number;
  lastPercent: number;
  bestPercent: number;
  wrongQuestionIds: string[];
  weakModules: string[];
  weakSkills: string[];
};

export type ReviewPlanItem = {
  modeId: string;
  modeTitle: string;
  modeLink: string;
  retryLink: string;
  wrongQuestionCount: number;
  moduleId: string | null;
  moduleTitle: string | null;
  lessonLink: string | null;
  flashcardsLink: string | null;
  weakSkills: string[];
};

function getModuleLessonLink(moduleId: string) {
  const module = getModuleById(moduleId);

  if (!module) {
    return "/lessons";
  }

  if (module.trackId === "greek_b1") {
    return `/lessons?stage=${getModuleStage(moduleId)}&module=${moduleId}&source=quiz`;
  }

  return `/lessons?module=${moduleId}&source=quiz`;
}

function getModuleFlashcardsLink(moduleId: string) {
  const module = getModuleById(moduleId);

  if (!module) {
    return "/flashcards";
  }

  return `/flashcards?track=${module.trackId}&module=${moduleId}`;
}

export function getReviewSummaries(quizProgress: StoredQuizProgress): ReviewModeSummary[] {
  return Object.entries(quizProgress)
    .flatMap(([modeId, progress]) => {
      const mode = getQuizModeById(modeId);

      if (!mode || (progress.wrongQuestionIds.length === 0 && progress.weakModules.length === 0)) {
        return [];
      }

      return [
        {
          modeId,
          title: mode.title,
          attempts: progress.attempts,
          lastPercent: progress.lastPercent,
          bestPercent: progress.bestPercent,
          wrongQuestionIds: progress.wrongQuestionIds,
          weakModules: progress.weakModules,
          weakSkills: progress.weakSkills
        }
      ];
    })
    .sort((left, right) => {
      const leftWeight = left.wrongQuestionIds.length + left.weakModules.length * 2;
      const rightWeight = right.wrongQuestionIds.length + right.weakModules.length * 2;

      if (rightWeight !== leftWeight) {
        return rightWeight - leftWeight;
      }

      return left.lastPercent - right.lastPercent;
    });
}

export function getReviewPlan(quizProgress: StoredQuizProgress, limit = 3): ReviewPlanItem[] {
  return getReviewSummaries(quizProgress).slice(0, limit).map((summary) => {
    const moduleId = summary.weakModules[0] ?? null;
    const moduleTitle = moduleId ? (getModuleById(moduleId)?.title ?? moduleId) : null;

    return {
      modeId: summary.modeId,
      modeTitle: summary.title,
      modeLink: `/quiz?mode=${summary.modeId}`,
      retryLink: `/quiz?mode=${summary.modeId}&retry=mistakes`,
      wrongQuestionCount: summary.wrongQuestionIds.length,
      moduleId,
      moduleTitle,
      lessonLink: moduleId ? getModuleLessonLink(moduleId) : null,
      flashcardsLink: moduleId ? getModuleFlashcardsLink(moduleId) : null,
      weakSkills: summary.weakSkills
    };
  });
}

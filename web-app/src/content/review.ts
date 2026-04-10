import { getModuleById } from "@/src/content/catalogData";
import { getLessonById } from "@/src/content/catalogData";
import { getQuizModeById, quizzes } from "@/src/content/quizData";
import { getModuleStage } from "@/src/content/presentation";
import type { QuizQuestionItem } from "@/src/content/types";

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

export type ReviewWeakFocus = {
  trackId: string | null;
  moduleId: string | null;
  moduleTitle: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  skill: string | null;
  label: string;
  questionCount: number;
};

export type ReviewPlanItem = {
  modeId: string;
  modeTitle: string;
  modeLink: string;
  retryLink: string;
  correctionLink: string;
  selfCheckLink: string;
  retryModeId: string;
  retryModeTitle: string;
  selfCheckModeId: string;
  selfCheckModeTitle: string;
  wrongQuestionCount: number;
  moduleId: string | null;
  moduleTitle: string | null;
  lessonLink: string | null;
  flashcardsLink: string | null;
  weakSkills: string[];
  weakFocus: ReviewWeakFocus;
  variantPrompt: string;
  packTitle: string;
  packSummary: string;
  quickReturnTitle: string;
  quickReturnDescription: string;
  fullLessonTitle: string;
  fullLessonDescription: string;
};

const reviewQuestionById = new Map(quizzes.map((question) => [question.id, question] as const));

const REVIEW_MODE_IDS = {
  greek: {
    retry: "mode_greek_retry_core",
    selfCheck: "mode_greek_self_check_core"
  },
  cyprus: {
    retry: "mode_cyprus_retry_core",
    selfCheck: "mode_cyprus_self_check_core"
  },
  mixed: {
    retry: "mode_mixed_retry_core",
    selfCheck: "mode_mixed_self_check_core"
  }
} as const;

function getQuestionTagValue(tags: string[], prefix: string) {
  return tags.find((tag) => tag.startsWith(prefix))?.replace(prefix, "");
}

function getTopTagValue(questions: Array<{ tags: string[] }>, prefix: string) {
  const counts = new Map<string, number>();

  for (const question of questions) {
    const value = getQuestionTagValue(question.tags, prefix);

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function getReviewTrackFamily(summary: ReviewModeSummary) {
  const families = new Set(
    summary.weakModules
      .map((moduleId) => getModuleById(moduleId)?.trackId)
      .filter((trackId): trackId is string => Boolean(trackId))
      .map((trackId) => (trackId === "cyprus_reality" ? "cyprus" : trackId === "greek_b1" ? "greek" : "mixed"))
  );

  if (families.size > 1) {
    return "mixed" as const;
  }

  if (families.has("cyprus")) {
    return "cyprus" as const;
  }

  if (families.has("greek")) {
    return "greek" as const;
  }

  if (summary.modeId.startsWith("mode_cyprus")) {
    return "cyprus" as const;
  }

  if (summary.modeId.startsWith("mode_greek")) {
    return "greek" as const;
  }

  return "mixed" as const;
}

function buildReviewWeakFocus(summary: ReviewModeSummary): ReviewWeakFocus {
  const wrongQuestions = summary.wrongQuestionIds
    .map((questionId) => reviewQuestionById.get(questionId))
    .filter((question): question is NonNullable<typeof question> => Boolean(question));

  const moduleId = summary.weakModules[0] ?? getTopTagValue(wrongQuestions, "module:");
  const lessonId = getTopTagValue(wrongQuestions, "lesson:");
  const skill = summary.weakSkills[0] ?? getTopTagValue(wrongQuestions, "skill:");
  const module = moduleId ? getModuleById(moduleId) : undefined;
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const label = lesson?.title ?? module?.title ?? skill ?? summary.title;

  return {
    trackId: module?.trackId ?? lesson?.trackId ?? null,
    moduleId,
    moduleTitle: module?.title ?? null,
    lessonId,
    lessonTitle: lesson?.title ?? null,
    skill,
    label,
    questionCount: summary.wrongQuestionIds.length
  };
}

function getReviewModeLinks(summary: ReviewModeSummary) {
  const family = getReviewTrackFamily(summary);
  return REVIEW_MODE_IDS[family];
}

function getVariantPrompt(summary: ReviewModeSummary, focus: ReviewWeakFocus) {
  const familyLabel =
    focus.trackId === "cyprus_reality"
      ? "Cyprus Reality"
      : focus.trackId === "greek_b1"
        ? "Greek"
        : "mixed";

  const promptParts = [
    `Сначала сделай короткий corrective pass по ${familyLabel}.`,
    focus.label ? `Фокус: ${focus.label}.` : null,
    focus.skill ? `Слабой зоной отмечен навык ${focus.skill}.` : null,
    summary.wrongQuestionIds.length > 0
      ? `После этого проверь себя на ${summary.wrongQuestionIds.length} вопрос(ах) в более сжатом self-check формате.`
      : "Потом проверь себя в более сжатом self-check формате."
  ];

  return promptParts.filter((part): part is string => Boolean(part)).join(" ");
}

function buildRemediationPackCopy(summary: ReviewModeSummary, focus: ReviewWeakFocus) {
  const focusLabel = focus.label || summary.title;
  const wrongQuestionCount = summary.wrongQuestionIds.length;

  return {
    packTitle: `Remediation pack: ${focusLabel}`,
    packSummary:
      wrongQuestionCount > 0
        ? `Сначала короткий quick return по ${wrongQuestionCount} слабым вопросам, потом при необходимости полный возврат в тему ${focusLabel}.`
        : `Сначала короткий quick return, потом при необходимости полный возврат в тему ${focusLabel}.`,
    quickReturnTitle: "Quick return",
    quickReturnDescription:
      wrongQuestionCount > 0
        ? `${Math.min(wrongQuestionCount, 3)} вопроса собраны в короткий corrective pass без полного урока, карточек и каталога режимов.`
        : "Короткий corrective pass помогает быстро вернуться в тему без полного урока и длинного маршрута.",
    fullLessonTitle: "Full lesson revisit",
    fullLessonDescription:
      focus.moduleTitle != null
        ? `Если быстрый возврат не хватает, открой полный учебный путь по теме ${focus.moduleTitle}: урок, карточки и ближайшая self-check.`
        : `Если быстрый возврат не хватает, открой полный учебный путь по слабой теме: урок, карточки и ближайшая self-check.`
  };
}

export type RetrySelfCheckItem = {
  questionId: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  weakModuleTitle: string | null;
  weakSkills: string[];
};

type QuizQuestionLike = QuizQuestionItem;

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
    const weakFocus = buildReviewWeakFocus(summary);
    const modeLinks = getReviewModeLinks(summary);
    const retryMode = getQuizModeById(modeLinks.retry);
    const selfCheckMode = getQuizModeById(modeLinks.selfCheck);
    const remediationPackCopy = buildRemediationPackCopy(summary, weakFocus);

    return {
      modeId: summary.modeId,
      modeTitle: summary.title,
      modeLink: `/quiz?mode=${summary.modeId}`,
      retryLink: `/quiz?mode=${summary.modeId}&retry=mistakes`,
      correctionLink: `/quiz?mode=${modeLinks.retry}&source=review&focus=correction`,
      selfCheckLink: `/quiz?mode=${modeLinks.selfCheck}&source=review&focus=self-check`,
      retryModeId: retryMode?.id ?? summary.modeId,
      retryModeTitle: retryMode?.title ?? summary.title,
      selfCheckModeId: selfCheckMode?.id ?? summary.modeId,
      selfCheckModeTitle: selfCheckMode?.title ?? summary.title,
      wrongQuestionCount: summary.wrongQuestionIds.length,
      moduleId,
      moduleTitle,
      lessonLink: moduleId ? getModuleLessonLink(moduleId) : null,
      flashcardsLink: moduleId ? getModuleFlashcardsLink(moduleId) : null,
      weakSkills: summary.weakSkills,
      weakFocus,
      variantPrompt: getVariantPrompt(summary, weakFocus),
      ...remediationPackCopy
    };
  });
}

export function getCompactRetryQuestionIds(
  wrongQuestionIds: string[],
  activeQuestions: QuizQuestionLike[],
  limit = 3
) {
  const availableQuestionIds = new Set(activeQuestions.map((question) => question.id));

  return [...new Set(wrongQuestionIds)]
    .filter((questionId) => availableQuestionIds.has(questionId))
    .slice(0, limit);
}

export function getRetrySelfCheckItems(
  wrongQuestionIds: string[],
  activeQuestions: QuizQuestionLike[],
  limit = 3
): RetrySelfCheckItem[] {
  const compactIds = getCompactRetryQuestionIds(wrongQuestionIds, activeQuestions, limit);

  return compactIds
    .map((questionId) => activeQuestions.find((question) => question.id === questionId))
    .filter((question): question is QuizQuestionLike => Boolean(question))
    .map((question) => {
      const weakModuleId = question.tags.find((tag) => tag.startsWith("module:"))?.replace("module:", "") ?? null;
      const weakSkills = question.tags
        .filter((tag) => tag.startsWith("skill:"))
        .map((tag) => tag.replace("skill:", ""));

      return {
        questionId: question.id,
        question: question.question,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        weakModuleTitle: weakModuleId ? (getModuleById(weakModuleId)?.title ?? weakModuleId) : null,
        weakSkills
      };
    });
}

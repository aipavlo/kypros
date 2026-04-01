import { browserStorageAdapter, type BrowserStorageAdapter } from "@/src/adapters/browserStorage";
import {
  getLessonById,
  getLessonsByModule,
  getModuleById,
  lessons,
  modules
} from "@/src/content/catalogData";
import { getQuizModeById, quizzes } from "@/src/content/quizData";
import { getModuleStage } from "@/src/content/presentation";
import { getModuleProgressKey } from "@/src/content/progress";
import type {
  AccessState,
  LastOpenedContext,
  LearningProgressSnapshot,
  StoredQuizProgress
} from "@/src/platform/appStateTypes";

const COMPLETED_LESSONS_STORAGE_KEY = "ccp_completed_lessons";
const REVIEWED_MODULES_STORAGE_KEY = "ccp_reviewed_modules";
const PASSED_MODULE_QUIZZES_STORAGE_KEY = "ccp_passed_module_quizzes";
const QUIZ_PROGRESS_STORAGE_KEY = "ccp_quiz_progress";
const ACCESS_STATE_STORAGE_KEY = "ccp_access_state";
const LAST_OPENED_CONTEXT_STORAGE_KEY = "ccp_last_opened_context";

const VALID_LESSON_IDS = new Set(lessons.map((lesson) => lesson.id));
const VALID_MODULE_IDS = new Set(modules.map((module) => module.id));
const VALID_MODULE_PROGRESS_IDS = new Set(
  modules.flatMap((module) => {
    if (module.trackId !== "greek_b1") {
      return [module.id];
    }

    const stages = [...new Set(getLessonsByModule(module.id).map((lesson) => lesson.difficulty))];
    return stages.map((stageId) => getModuleProgressKey(module.id, module.trackId, stageId));
  })
);
const VALID_QUESTION_IDS = new Set(quizzes.map((question) => question.id));

export type LocalAppStateAdapter = {
  readLearningProgressSnapshot(): LearningProgressSnapshot;
  toggleCompletedLesson(snapshot: LearningProgressSnapshot, lessonId: string): LearningProgressSnapshot;
  markModuleReviewed(snapshot: LearningProgressSnapshot, moduleProgressId: string): LearningProgressSnapshot;
  markModuleQuizPassed(snapshot: LearningProgressSnapshot, moduleProgressId: string): LearningProgressSnapshot;
  saveQuizProgress(snapshot: LearningProgressSnapshot, quizProgress: StoredQuizProgress): LearningProgressSnapshot;
  readAccessState(): AccessState;
  saveAccessState(accessState: AccessState): AccessState;
  readLastOpenedContext(): LastOpenedContext;
  saveLastOpenedContext(context: LastOpenedContext): LastOpenedContext;
};

export type { AccessState, LastOpenedContext, LearningProgressSnapshot };

function sanitizeCompletedLessonIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(value.filter((item): item is string => typeof item === "string" && VALID_LESSON_IDS.has(item)))
  ];
}

function sanitizeModuleProgressIds(value: unknown, completedLessonIds: string[]): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sanitizedItems = value.flatMap((item) => {
    if (typeof item !== "string") {
      return [];
    }

    if (VALID_MODULE_PROGRESS_IDS.has(item)) {
      return [item];
    }

    if (!VALID_MODULE_IDS.has(item)) {
      return [];
    }

    const module = getModuleById(item);

    if (!module) {
      return [];
    }

    if (module.trackId !== "greek_b1") {
      return [item];
    }

    const moduleLessons = getLessonsByModule(item);
    const moduleStages = [...new Set(moduleLessons.map((lesson) => lesson.difficulty))];
    const completedStageKeys = moduleStages.flatMap((stageId) => {
      const stageLessons = moduleLessons.filter((lesson) => lesson.difficulty === stageId);
      const stageCompleted =
        stageLessons.length > 0 && stageLessons.every((lesson) => completedLessonIds.includes(lesson.id));

      return stageCompleted ? [getModuleProgressKey(item, module.trackId, stageId)] : [];
    });

    if (completedStageKeys.length > 0) {
      return completedStageKeys;
    }

    return [getModuleProgressKey(item, module.trackId, getModuleStage(item))];
  });

  return [...new Set(sanitizedItems)];
}

function sanitizeQuizProgress(value: unknown): StoredQuizProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const sanitizedEntries = Object.entries(value).flatMap(([modeId, rawProgress]) => {
    if (!getQuizModeById(modeId)) {
      return [];
    }

    if (!rawProgress || typeof rawProgress !== "object" || Array.isArray(rawProgress)) {
      return [];
    }

    const candidate = rawProgress as {
      attempts?: unknown;
      bestPercent?: unknown;
      lastPercent?: unknown;
      wrongQuestionIds?: unknown;
      weakModules?: unknown;
      weakSkills?: unknown;
    };

    const attempts =
      typeof candidate.attempts === "number" && Number.isFinite(candidate.attempts)
        ? Math.max(0, Math.min(Math.trunc(candidate.attempts), 10000))
        : 0;
    const bestPercent =
      typeof candidate.bestPercent === "number" && Number.isFinite(candidate.bestPercent)
        ? Math.max(0, Math.min(Math.trunc(candidate.bestPercent), 100))
        : 0;
    const lastPercent =
      typeof candidate.lastPercent === "number" && Number.isFinite(candidate.lastPercent)
        ? Math.max(0, Math.min(Math.trunc(candidate.lastPercent), 100))
        : 0;
    const wrongQuestionIds = Array.isArray(candidate.wrongQuestionIds)
      ? [
          ...new Set(
            candidate.wrongQuestionIds.filter(
              (item): item is string => typeof item === "string" && VALID_QUESTION_IDS.has(item)
            )
          )
        ]
      : [];
    const weakModules = Array.isArray(candidate.weakModules)
      ? candidate.weakModules.filter((item): item is string => typeof item === "string").slice(0, 5)
      : [];
    const weakSkills = Array.isArray(candidate.weakSkills)
      ? candidate.weakSkills.filter((item): item is string => typeof item === "string").slice(0, 5)
      : [];

    return [
      [
        modeId,
        {
          attempts,
          bestPercent,
          lastPercent,
          wrongQuestionIds,
          weakModules,
          weakSkills
        }
      ] as const
    ];
  });

  return Object.fromEntries(sanitizedEntries);
}

function sanitizeAccessState(value: unknown): AccessState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      entitlements: [],
      accessSource: "local"
    };
  }

  const candidate = value as {
    entitlements?: unknown;
    accessSource?: unknown;
  };

  const entitlements = Array.isArray(candidate.entitlements)
    ? [...new Set(candidate.entitlements.filter((item): item is string => typeof item === "string"))]
    : [];
  const accessSource = candidate.accessSource === "server" ? "server" : "local";

  return {
    entitlements,
    accessSource
  };
}

function sanitizeLastOpenedContext(value: unknown): LastOpenedContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const candidate = value as {
    trackId?: unknown;
    moduleId?: unknown;
    lessonId?: unknown;
    origin?: unknown;
  };

  return {
    trackId: typeof candidate.trackId === "string" ? candidate.trackId : undefined,
    moduleId: typeof candidate.moduleId === "string" ? candidate.moduleId : undefined,
    lessonId:
      typeof candidate.lessonId === "string" && VALID_LESSON_IDS.has(candidate.lessonId)
        ? candidate.lessonId
        : undefined,
    origin: typeof candidate.origin === "string" ? candidate.origin : undefined
  };
}

function addMissingId(currentIds: string[], nextId: string) {
  return currentIds.includes(nextId) ? currentIds : [...currentIds, nextId];
}

function writeLearningProgressSnapshot(
  storage: BrowserStorageAdapter,
  snapshot: LearningProgressSnapshot
) {
  storage.writeJson(COMPLETED_LESSONS_STORAGE_KEY, snapshot.completedLessonIds);
  storage.writeJson(REVIEWED_MODULES_STORAGE_KEY, snapshot.reviewedModuleIds);
  storage.writeJson(PASSED_MODULE_QUIZZES_STORAGE_KEY, snapshot.passedModuleQuizIds);
  storage.writeJson(QUIZ_PROGRESS_STORAGE_KEY, snapshot.quizProgress);
}

function readLearningProgressSnapshot(storage: BrowserStorageAdapter): LearningProgressSnapshot {
  const completedLessonIds = storage.readJson(COMPLETED_LESSONS_STORAGE_KEY, {
    fallbackValue: [],
    sanitize: sanitizeCompletedLessonIds
  });
  const reviewedModuleIds = storage.readJson(REVIEWED_MODULES_STORAGE_KEY, {
    fallbackValue: [],
    sanitize: (value) => sanitizeModuleProgressIds(value, completedLessonIds)
  });
  const passedModuleQuizIds = storage.readJson(PASSED_MODULE_QUIZZES_STORAGE_KEY, {
    fallbackValue: [],
    sanitize: (value) => sanitizeModuleProgressIds(value, completedLessonIds)
  });
  const quizProgress = storage.readJson(QUIZ_PROGRESS_STORAGE_KEY, {
    fallbackValue: {},
    sanitize: sanitizeQuizProgress
  });

  return {
    completedLessonIds,
    reviewedModuleIds,
    passedModuleQuizIds,
    quizProgress
  };
}

export function createLocalAppStateAdapter(
  storage: BrowserStorageAdapter = browserStorageAdapter
): LocalAppStateAdapter {
  return {
    readLearningProgressSnapshot() {
      return readLearningProgressSnapshot(storage);
    },

    toggleCompletedLesson(snapshot, lessonId) {
      if (!VALID_LESSON_IDS.has(lessonId) || !getLessonById(lessonId)) {
        return snapshot;
      }

      const completedLessonIds = snapshot.completedLessonIds.includes(lessonId)
        ? snapshot.completedLessonIds.filter((id) => id !== lessonId)
        : [...snapshot.completedLessonIds, lessonId];
      const nextSnapshot = {
        ...snapshot,
        completedLessonIds,
        reviewedModuleIds: sanitizeModuleProgressIds(snapshot.reviewedModuleIds, completedLessonIds),
        passedModuleQuizIds: sanitizeModuleProgressIds(snapshot.passedModuleQuizIds, completedLessonIds)
      };

      writeLearningProgressSnapshot(storage, nextSnapshot);
      return nextSnapshot;
    },

    markModuleReviewed(snapshot, moduleProgressId) {
      if (!VALID_MODULE_PROGRESS_IDS.has(moduleProgressId)) {
        return snapshot;
      }

      const nextSnapshot = {
        ...snapshot,
        reviewedModuleIds: addMissingId(snapshot.reviewedModuleIds, moduleProgressId)
      };

      writeLearningProgressSnapshot(storage, nextSnapshot);
      return nextSnapshot;
    },

    markModuleQuizPassed(snapshot, moduleProgressId) {
      if (!VALID_MODULE_PROGRESS_IDS.has(moduleProgressId)) {
        return snapshot;
      }

      const nextSnapshot = {
        ...snapshot,
        passedModuleQuizIds: addMissingId(snapshot.passedModuleQuizIds, moduleProgressId)
      };

      writeLearningProgressSnapshot(storage, nextSnapshot);
      return nextSnapshot;
    },

    saveQuizProgress(snapshot, quizProgress) {
      const nextSnapshot = {
        ...snapshot,
        quizProgress: sanitizeQuizProgress(quizProgress)
      };

      writeLearningProgressSnapshot(storage, nextSnapshot);
      return nextSnapshot;
    },

    readAccessState() {
      return storage.readJson(ACCESS_STATE_STORAGE_KEY, {
        fallbackValue: {
          entitlements: [],
          accessSource: "local"
        },
        sanitize: sanitizeAccessState
      });
    },

    saveAccessState(accessState) {
      const sanitizedAccessState = sanitizeAccessState(accessState);
      storage.writeJson(ACCESS_STATE_STORAGE_KEY, sanitizedAccessState);
      return sanitizedAccessState;
    },

    readLastOpenedContext() {
      return storage.readJson(LAST_OPENED_CONTEXT_STORAGE_KEY, {
        fallbackValue: {},
        sanitize: sanitizeLastOpenedContext
      });
    },

    saveLastOpenedContext(context) {
      const sanitizedContext = sanitizeLastOpenedContext(context);
      storage.writeJson(LAST_OPENED_CONTEXT_STORAGE_KEY, sanitizedContext);
      return sanitizedContext;
    }
  };
}

export const localAppStateAdapter = createLocalAppStateAdapter();

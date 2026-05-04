import {
  getLessonsByModule,
  getModuleById,
  getModulesByTrack,
  getModulesByTrackAndDifficulty
} from "@/src/content/catalogData";
import { appRoutes } from "@/src/lib/routes";
import { getModuleStage } from "@/src/content/presentation";
import type { LessonItem } from "@/src/content/types";

export type ModuleCycleStatus = {
  moduleLessons: LessonItem[];
  completedLessonCount: number;
  lessonsDone: boolean;
  reviewDone: boolean;
  quizDone: boolean;
  completed: boolean;
  progressPercent: number;
};

export type LearningLoopAction = {
  kind: "lesson" | "flashcards" | "quiz" | "next_module" | "done";
  title: string;
  description: string;
  to: string;
};

export function getModuleProgressKey(moduleId: string, trackId: string, stageId?: string) {
  if (trackId === "greek_b1") {
    return `${moduleId}::${stageId ?? getModuleStage(moduleId)}`;
  }

  return moduleId;
}

export function hasModuleProgress(
  progressIds: string[],
  moduleId: string,
  trackId: string,
  stageId?: string
) {
  return progressIds.includes(getModuleProgressKey(moduleId, trackId, stageId));
}

function getModuleLessonsLink(trackId: string, moduleId: string, stageId?: string) {
  if (trackId === "greek_b1") {
    return appRoutes.lessons({ stage: stageId ?? "a1", module: moduleId, source: "loop" });
  }

  return appRoutes.lessons({ module: moduleId, source: "loop" });
}

function getModuleQuizLink(trackId: string, moduleId: string, stageId?: string) {
  if (trackId === "cyprus_reality") {
    return appRoutes.quiz({ mode: "mode_cyprus_reality", module: moduleId });
  }

  return appRoutes.quiz({ mode: `mode_greek_${stageId ?? "a1"}`, module: moduleId });
}

function getModulesForLoop(trackId: string, stageId?: string) {
  if (trackId === "greek_b1" && stageId) {
    return getModulesByTrackAndDifficulty(trackId, stageId);
  }

  return getModulesByTrack(trackId);
}

export function getCompletedCount(items: Array<{ id: string }>, completedIds: string[]) {
  return items.filter((item) => completedIds.includes(item.id)).length;
}

export function getModuleLessonsForStage(moduleId: string, trackId: string, stageId?: string) {
  return getLessonsByModule(moduleId).filter((lesson) =>
    trackId === "greek_b1" && stageId ? lesson.difficulty === stageId : true
  );
}

export function getModuleCycleStatus(
  moduleId: string,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
): ModuleCycleStatus {
  const moduleLessons = getModuleLessonsForStage(moduleId, trackId, stageId);
  const completedLessonCount = moduleLessons.filter((lesson) => completedIds.includes(lesson.id)).length;
  const lessonsDone = moduleLessons.length > 0 && completedLessonCount === moduleLessons.length;
  const reviewDone = hasModuleProgress(reviewedModuleIds, moduleId, trackId, stageId);
  const quizDone = hasModuleProgress(passedModuleQuizIds, moduleId, trackId, stageId);
  const totalSteps = moduleLessons.length + 2;
  const completedSteps = completedLessonCount + (reviewDone ? 1 : 0) + (quizDone ? 1 : 0);

  return {
    moduleLessons,
    completedLessonCount,
    lessonsDone,
    reviewDone,
    quizDone,
    completed: lessonsDone && reviewDone && quizDone,
    progressPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  };
}

export function getModuleNextLearningAction(
  moduleId: string,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
): LearningLoopAction {
  const module = getModuleById(moduleId);
  const moduleCycleStatus = getModuleCycleStatus(
    moduleId,
    completedIds,
    reviewedModuleIds,
    passedModuleQuizIds,
    trackId,
    stageId
  );
  const nextLesson = moduleCycleStatus.moduleLessons.find((lesson) => !completedIds.includes(lesson.id));

  if (nextLesson) {
    return {
      kind: "lesson",
      title: `Открыть урок: ${nextLesson.order}. ${nextLesson.title}`,
      description: "Следующий шаг в цикле: пройти ближайший урок этого модуля.",
      to: appRoutes.lesson(nextLesson.id, { source: "loop" })
    };
  }

  if (!moduleCycleStatus.reviewDone) {
    return {
      kind: "flashcards",
      title: "Перейти к карточкам модуля",
      description: "Уроки завершены. Теперь закрепи модуль карточками.",
      to: appRoutes.flashcards({ track: trackId, module: moduleId })
    };
  }

  if (!moduleCycleStatus.quizDone) {
    return {
      kind: "quiz",
      title: "Перейти к мини-проверке модуля",
      description: "Карточки уже повторены. Осталось закрыть короткую проверку.",
      to: getModuleQuizLink(trackId, moduleId, stageId)
    };
  }

  const modulesForTrack = getModulesForLoop(trackId, stageId);
  const currentModuleIndex = modulesForTrack.findIndex((item) => item.id === moduleId);
  const nextModule = modulesForTrack.slice(currentModuleIndex + 1).find((item) => {
    const status = getModuleCycleStatus(
      item.id,
      completedIds,
      reviewedModuleIds,
      passedModuleQuizIds,
      trackId,
      stageId
    );

    return !status.completed;
  });

  if (nextModule) {
    const nextModuleLessons = getModuleLessonsForStage(nextModule.id, trackId, stageId);
    const nextModuleLesson = nextModuleLessons.find((lesson) => !completedIds.includes(lesson.id));
    const nextModuleTitle = nextModule.title;

    return {
      kind: "next_module",
      title: `Открыть следующий модуль: ${nextModuleTitle}`,
      description: nextModuleLesson
        ? `Следующий шаг: ${nextModuleLesson.order}. ${nextModuleLesson.title}.`
        : "Текущий модуль закрыт. Можно переходить к следующему модулю.",
      to: nextModuleLesson
        ? appRoutes.lesson(nextModuleLesson.id, { source: "loop" })
        : getModuleLessonsLink(trackId, nextModule.id, stageId)
    };
  }

  return {
    kind: "done",
    title: module ? `${module.title}: цикл завершён` : "Цикл завершён",
    description: "Уроки, карточки и мини-проверка завершены. Можно перейти к обзору прогресса.",
    to: appRoutes.dashboard()
  };
}

export function isModuleCompleted(
  moduleId: string,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
) {
  return getModuleCycleStatus(
    moduleId,
    completedIds,
    reviewedModuleIds,
    passedModuleQuizIds,
    trackId,
    stageId
  ).completed;
}

export function getUnlockedModuleIds(
  modulesForTrack: Array<{ id: string }>,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
) {
  return modulesForTrack.reduce<string[]>((unlocked, module, index) => {
    if (index === 0) {
      unlocked.push(module.id);
      return unlocked;
    }

    const previousModule = modulesForTrack[index - 1];
    if (
      isModuleCompleted(
        previousModule.id,
        completedIds,
        reviewedModuleIds,
        passedModuleQuizIds,
        trackId,
        stageId
      )
    ) {
      unlocked.push(module.id);
    }

    return unlocked;
  }, []);
}

export function getFirstUnlockedModuleId(
  modulesForTrack: Array<{ id: string }>,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
) {
  return (
    getUnlockedModuleIds(
      modulesForTrack,
      completedIds,
      reviewedModuleIds,
      passedModuleQuizIds,
      trackId,
      stageId
    )[0] ?? modulesForTrack[0]?.id
  );
}

export function getNextIncompleteLesson(
  lessonsList: Array<{ id: string }>,
  completedIds: string[]
) {
  return lessonsList.find((lesson) => !completedIds.includes(lesson.id)) ?? lessonsList[0];
}

export function getModuleRemainingParts(moduleCycleStatus: ModuleCycleStatus) {
  const remaining: string[] = [];

  if (!moduleCycleStatus.lessonsDone) {
    remaining.push(
      `уроки ${moduleCycleStatus.completedLessonCount}/${moduleCycleStatus.moduleLessons.length}`
    );
  }

  if (!moduleCycleStatus.reviewDone) {
    remaining.push("карточки");
  }

  if (!moduleCycleStatus.quizDone) {
    remaining.push("мини-проверку");
  }

  return remaining;
}

export function getModuleRemainingCopy(moduleCycleStatus: ModuleCycleStatus) {
  if (moduleCycleStatus.completed) {
    return "Полный цикл завершён";
  }

  return `Осталось: ${getModuleRemainingParts(moduleCycleStatus).join(" · ")}`;
}

export function getTrackCycleSummary(
  modulesForTrack: Array<{ id: string }>,
  completedIds: string[],
  reviewedModuleIds: string[],
  passedModuleQuizIds: string[],
  trackId: string,
  stageId?: string
) {
  const statuses = modulesForTrack.map((module) =>
    getModuleCycleStatus(
      module.id,
      completedIds,
      reviewedModuleIds,
      passedModuleQuizIds,
      trackId,
      trackId === "greek_b1" ? stageId ?? getModuleStage(module.id) : undefined
    )
  );

  const completedModules = statuses.filter((status) => status.completed).length;
  const startedModules = statuses.filter(
    (status) =>
      status.completedLessonCount > 0 || status.reviewDone || status.quizDone
  ).length;

  return {
    completedModules,
    startedModules,
    totalModules: modulesForTrack.length
  };
}

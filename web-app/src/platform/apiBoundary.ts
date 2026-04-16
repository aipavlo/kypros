import type {
  LastOpenedContext,
  LearningProgressSnapshot
} from "@/src/platform/appStateTypes";

export const appApiRoutes = {
  progress: "/api/app/progress",
  lastOpenedContext: "/api/app/context/last-opened"
} as const;

export type ProgressApiResponse = {
  progress: LearningProgressSnapshot;
};

export type UpdateProgressApiRequest =
  | {
      action: "toggle_lesson_completed";
      lessonId: string;
    }
  | {
      action: "mark_module_reviewed";
      moduleProgressId: string;
    }
  | {
      action: "mark_module_quiz_passed";
      moduleProgressId: string;
    }
  | {
      action: "save_quiz_progress";
      quizProgress: LearningProgressSnapshot["quizProgress"];
    };

export type LastOpenedContextApiResponse = {
  context: LastOpenedContext;
};

export type UpdateLastOpenedContextApiRequest = {
  context: LastOpenedContext;
};

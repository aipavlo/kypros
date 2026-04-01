import type {
  AccessState,
  LastOpenedContext,
  LearningProgressSnapshot
} from "@/src/platform/appStateTypes";
import type { AppSessionState } from "@/src/platform/appClient";

export const appApiRoutes = {
  signIn: "/api/auth/login",
  signOut: "/api/auth/logout",
  session: "/api/app/session",
  access: "/api/app/access",
  progress: "/api/app/progress",
  lastOpenedContext: "/api/app/context/last-opened"
} as const;

export type SessionApiResponse = {
  session: AppSessionState;
};

export type SignInApiRequest = {
  email: string;
};

export type SignInApiResponse = {
  session: AppSessionState;
};

export type SignOutApiResponse = {
  session: AppSessionState;
};

export type AccessApiResponse = {
  access: AccessState;
};

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

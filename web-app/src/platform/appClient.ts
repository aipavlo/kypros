import type {
  AccessState,
  LastOpenedContext,
  LearningProgressSnapshot
} from "@/src/platform/appStateTypes";

export type AppMode = "no-db" | "db";

export type AppSessionState = {
  mode: "anonymous" | "authenticated";
  userId: string | null;
  isPersistent: boolean;
};

export type AppClient = {
  mode: AppMode;
  getSession(): Promise<AppSessionState>;
  signIn(input: { email: string }): Promise<AppSessionState>;
  signOut(): Promise<AppSessionState>;
  getAccessState(): Promise<AccessState>;
  hasEntitlement(featureKey: string): Promise<boolean>;
  getLearningProgress(): Promise<LearningProgressSnapshot>;
  toggleLessonCompleted(lessonId: string): Promise<LearningProgressSnapshot>;
  markModuleReviewed(moduleProgressId: string): Promise<LearningProgressSnapshot>;
  markModuleQuizPassed(moduleProgressId: string): Promise<LearningProgressSnapshot>;
  saveQuizProgress(
    quizProgress: LearningProgressSnapshot["quizProgress"]
  ): Promise<LearningProgressSnapshot>;
  getLastOpenedContext(): Promise<LastOpenedContext>;
  saveLastOpenedContext(context: LastOpenedContext): Promise<LastOpenedContext>;
};

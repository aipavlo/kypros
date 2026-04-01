export type QuizModeProgress = {
  attempts: number;
  bestPercent: number;
  lastPercent: number;
  wrongQuestionIds: string[];
  weakModules: string[];
  weakSkills: string[];
};

export type StoredQuizProgress = Record<string, QuizModeProgress>;

export type AccessState = {
  entitlements: string[];
  accessSource: "local" | "server";
};

export type LastOpenedContext = {
  trackId?: string;
  moduleId?: string;
  lessonId?: string;
  origin?: string;
};

export type LearningProgressSnapshot = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  quizProgress: StoredQuizProgress;
};

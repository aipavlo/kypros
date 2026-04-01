import { useEffect, useState } from "react";
import type { LearningProgressSnapshot } from "@/src/platform/appStateTypes";
import type { StoredQuizProgress } from "@/src/content/review";
import { getActiveAppClient } from "@/src/platform/getActiveAppClient";

type LearningProgressState = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  quizProgress: StoredQuizProgress;
  setQuizProgress: React.Dispatch<React.SetStateAction<StoredQuizProgress>>;
  toggleCompletedLesson: (lessonId: string) => void;
  markModuleReviewed: (moduleProgressId: string) => void;
  markModuleQuizPassed: (moduleProgressId: string) => void;
};

const EMPTY_LEARNING_PROGRESS_SNAPSHOT: LearningProgressSnapshot = {
  completedLessonIds: [],
  reviewedModuleIds: [],
  passedModuleQuizIds: [],
  quizProgress: {}
};

export function useLearningProgressState(): LearningProgressState {
  const [learningProgressSnapshot, setLearningProgressSnapshot] = useState<LearningProgressSnapshot>(
    EMPTY_LEARNING_PROGRESS_SNAPSHOT
  );
  const appClient = getActiveAppClient();

  useEffect(() => {
    let isMounted = true;

    appClient.getLearningProgress().then((snapshot) => {
      if (isMounted) {
        setLearningProgressSnapshot(snapshot);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [appClient]);

  function setQuizProgress(update: React.SetStateAction<StoredQuizProgress>) {
    void Promise.resolve().then(async () => {
      const currentSnapshot = learningProgressSnapshot;
      const nextQuizProgress =
        typeof update === "function" ? update(currentSnapshot.quizProgress) : update;

      const nextSnapshot = await appClient.saveQuizProgress(nextQuizProgress);
      setLearningProgressSnapshot(nextSnapshot);
    });
  }

  function toggleCompletedLesson(lessonId: string) {
    void appClient.toggleLessonCompleted(lessonId).then((nextSnapshot) => {
      setLearningProgressSnapshot(nextSnapshot);
    });
  }

  function markModuleReviewed(moduleProgressId: string) {
    void appClient.markModuleReviewed(moduleProgressId).then((nextSnapshot) => {
      setLearningProgressSnapshot(nextSnapshot);
    });
  }

  function markModuleQuizPassed(moduleProgressId: string) {
    void appClient.markModuleQuizPassed(moduleProgressId).then((nextSnapshot) => {
      setLearningProgressSnapshot(nextSnapshot);
    });
  }

  return {
    completedLessonIds: learningProgressSnapshot.completedLessonIds,
    reviewedModuleIds: learningProgressSnapshot.reviewedModuleIds,
    passedModuleQuizIds: learningProgressSnapshot.passedModuleQuizIds,
    quizProgress: learningProgressSnapshot.quizProgress,
    setQuizProgress,
    toggleCompletedLesson,
    markModuleReviewed,
    markModuleQuizPassed
  };
}

import { localAppStateAdapter } from "@/src/adapters/localAppStateAdapter";
import type { AppClient } from "@/src/platform/appClient";

const LOCAL_SESSION = {
  mode: "anonymous" as const,
  userId: null,
  isPersistent: false
};

export const localAppClient: AppClient = {
  mode: "no-db",

  async getSession() {
    return LOCAL_SESSION;
  },

  async signIn() {
    return LOCAL_SESSION;
  },

  async signOut() {
    return LOCAL_SESSION;
  },

  async getAccessState() {
    return localAppStateAdapter.readAccessState();
  },

  async hasEntitlement(featureKey) {
    const accessState = localAppStateAdapter.readAccessState();
    return accessState.entitlements.includes(featureKey);
  },

  async getLearningProgress() {
    return localAppStateAdapter.readLearningProgressSnapshot();
  },

  async toggleLessonCompleted(lessonId) {
    const currentSnapshot = localAppStateAdapter.readLearningProgressSnapshot();
    return localAppStateAdapter.toggleCompletedLesson(currentSnapshot, lessonId);
  },

  async markModuleReviewed(moduleProgressId) {
    const currentSnapshot = localAppStateAdapter.readLearningProgressSnapshot();
    return localAppStateAdapter.markModuleReviewed(currentSnapshot, moduleProgressId);
  },

  async markModuleQuizPassed(moduleProgressId) {
    const currentSnapshot = localAppStateAdapter.readLearningProgressSnapshot();
    return localAppStateAdapter.markModuleQuizPassed(currentSnapshot, moduleProgressId);
  },

  async saveQuizProgress(quizProgress) {
    const currentSnapshot = localAppStateAdapter.readLearningProgressSnapshot();
    return localAppStateAdapter.saveQuizProgress(currentSnapshot, quizProgress);
  },

  async getLastOpenedContext() {
    return localAppStateAdapter.readLastOpenedContext();
  },

  async saveLastOpenedContext(context) {
    return localAppStateAdapter.saveLastOpenedContext(context);
  }
};

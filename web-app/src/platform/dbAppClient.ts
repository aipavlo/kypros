import type { AppClient } from "@/src/platform/appClient";
import {
  appApiRoutes,
  type AccessApiResponse,
  type LastOpenedContextApiResponse,
  type ProgressApiResponse,
  type SignInApiRequest,
  type SignInApiResponse,
  type SignOutApiResponse,
  type SessionApiResponse,
  type UpdateLastOpenedContextApiRequest,
  type UpdateProgressApiRequest
} from "@/src/platform/apiBoundary";

async function fetchJson<ResponseValue>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ResponseValue> {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`DB app client request failed: ${response.status}`);
  }

  return response.json() as Promise<ResponseValue>;
}

export const dbAppClient: AppClient = {
  mode: "db",

  async getSession() {
    const response = await fetchJson<SessionApiResponse>(appApiRoutes.session);
    return response.session;
  },

  async signIn(input) {
    const response = await fetchJson<SignInApiResponse>(appApiRoutes.signIn, {
      method: "POST",
      body: JSON.stringify(input satisfies SignInApiRequest)
    });

    return response.session;
  },

  async signOut() {
    const response = await fetchJson<SignOutApiResponse>(appApiRoutes.signOut, {
      method: "POST"
    });

    return response.session;
  },

  async getAccessState() {
    const response = await fetchJson<AccessApiResponse>(appApiRoutes.access);
    return response.access;
  },

  async hasEntitlement(featureKey) {
    const access = await this.getAccessState();
    return access.entitlements.includes(featureKey);
  },

  async getLearningProgress() {
    const response = await fetchJson<ProgressApiResponse>(appApiRoutes.progress);
    return response.progress;
  },

  async toggleLessonCompleted(lessonId) {
    const response = await fetchJson<ProgressApiResponse>(appApiRoutes.progress, {
      method: "PUT",
      body: JSON.stringify({
        action: "toggle_lesson_completed",
        lessonId
      } satisfies UpdateProgressApiRequest)
    });

    return response.progress;
  },

  async markModuleReviewed(moduleProgressId) {
    const response = await fetchJson<ProgressApiResponse>(appApiRoutes.progress, {
      method: "PUT",
      body: JSON.stringify({
        action: "mark_module_reviewed",
        moduleProgressId
      } satisfies UpdateProgressApiRequest)
    });

    return response.progress;
  },

  async markModuleQuizPassed(moduleProgressId) {
    const response = await fetchJson<ProgressApiResponse>(appApiRoutes.progress, {
      method: "PUT",
      body: JSON.stringify({
        action: "mark_module_quiz_passed",
        moduleProgressId
      } satisfies UpdateProgressApiRequest)
    });

    return response.progress;
  },

  async saveQuizProgress(quizProgress) {
    const response = await fetchJson<ProgressApiResponse>(appApiRoutes.progress, {
      method: "PUT",
      body: JSON.stringify({
        action: "save_quiz_progress",
        quizProgress
      } satisfies UpdateProgressApiRequest)
    });

    return response.progress;
  },

  async getLastOpenedContext() {
    const response = await fetchJson<LastOpenedContextApiResponse>(appApiRoutes.lastOpenedContext);
    return response.context;
  },

  async saveLastOpenedContext(context) {
    const response = await fetchJson<LastOpenedContextApiResponse>(appApiRoutes.lastOpenedContext, {
      method: "PUT",
      body: JSON.stringify({
        context
      } satisfies UpdateLastOpenedContextApiRequest)
    });

    return response.context;
  }
};

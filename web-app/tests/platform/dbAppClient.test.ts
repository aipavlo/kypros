import test from "node:test";
import assert from "node:assert/strict";
import { dbAppClient } from "../../src/platform/dbAppClient.js";

type FetchCall = {
  input: RequestInfo | URL;
  init?: RequestInit;
};

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function withMockedFetch(
  implementation: (calls: FetchCall[]) => typeof globalThis.fetch,
  callback: (calls: FetchCall[]) => Promise<void>
) {
  const originalFetch = globalThis.fetch;
  const calls: FetchCall[] = [];

  globalThis.fetch = implementation(calls);

  return callback(calls).finally(() => {
    globalThis.fetch = originalFetch;
  });
}

test("dbAppClient.getSession requests session endpoint with credentials", async () => {
  await withMockedFetch(
    (calls) =>
      async (input, init) => {
        calls.push({ input, init });
        return createJsonResponse({
          session: {
            mode: "authenticated",
            userId: "user-1",
            isPersistent: true
          }
        });
      },
    async (calls) => {
      const session = await dbAppClient.getSession();

      assert.deepEqual(session, {
        mode: "authenticated",
        userId: "user-1",
        isPersistent: true
      });
      assert.equal(String(calls[0]?.input), "/api/app/session");
      assert.equal(calls[0]?.init?.credentials, "include");
      assert.deepEqual(calls[0]?.init?.headers, {
        "Content-Type": "application/json"
      });
    }
  );
});

test("dbAppClient.signIn posts login payload", async () => {
  await withMockedFetch(
    (calls) =>
      async (input, init) => {
        calls.push({ input, init });
        return createJsonResponse({
          session: {
            mode: "authenticated",
            userId: "pending-db-user",
            isPersistent: true
          }
        });
      },
    async (calls) => {
      await dbAppClient.signIn({
        email: "test@example.com"
      });

      assert.equal(String(calls[0]?.input), "/api/auth/login");
      assert.equal(calls[0]?.init?.method, "POST");
      assert.equal(calls[0]?.init?.body, JSON.stringify({ email: "test@example.com" }));
    }
  );
});

test("dbAppClient.saveQuizProgress stores quiz progress through progress boundary", async () => {
  await withMockedFetch(
    (calls) =>
      async (input, init) => {
        calls.push({ input, init });
        return createJsonResponse({
          progress: {
            completedLessonIds: [],
            reviewedModuleIds: [],
            passedModuleQuizIds: [],
            quizProgress: {
              mode_cyprus_reality: {
                attempts: 2,
                bestPercent: 80,
                lastPercent: 70,
                wrongQuestionIds: ["q_1"],
                weakModules: ["cy_module_001"],
                weakSkills: ["history"]
              }
            }
          }
        });
      },
    async (calls) => {
      const progress = await dbAppClient.saveQuizProgress({
        mode_cyprus_reality: {
          attempts: 2,
          bestPercent: 80,
          lastPercent: 70,
          wrongQuestionIds: ["q_1"],
          weakModules: ["cy_module_001"],
          weakSkills: ["history"]
        }
      });

      assert.equal(String(calls[0]?.input), "/api/app/progress");
      assert.equal(calls[0]?.init?.method, "PUT");
      assert.match(String(calls[0]?.init?.body), /"action":"save_quiz_progress"/);
      assert.equal(progress.quizProgress.mode_cyprus_reality?.bestPercent, 80);
    }
  );
});

test("dbAppClient throws useful error on failed request", async () => {
  await withMockedFetch(
    () => async () => createJsonResponse({ error: "nope" }, 501),
    async () => {
      await assert.rejects(() => dbAppClient.getAccessState(), /DB app client request failed: 501/);
    }
  );
});

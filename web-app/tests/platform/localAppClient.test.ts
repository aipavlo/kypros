import test from "node:test";
import assert from "node:assert/strict";
import { localAppClient } from "../../src/platform/localAppClient.js";
import { localAppStateAdapter } from "../../src/adapters/localAppStateAdapter.js";
import type { LearningProgressSnapshot } from "../../src/platform/appStateTypes.js";

function withPatchedAdapter<T>(
  patches: Partial<typeof localAppStateAdapter>,
  callback: () => Promise<T> | T
) {
  const originals = new Map<keyof typeof localAppStateAdapter, unknown>();

  for (const [key, value] of Object.entries(patches) as Array<
    [keyof typeof localAppStateAdapter, unknown]
  >) {
    originals.set(key, localAppStateAdapter[key]);
    Object.assign(localAppStateAdapter, {
      [key]: value
    });
  }

  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of originals.entries()) {
      Object.assign(localAppStateAdapter, {
        [key]: value
      });
    }
  });
}

test("localAppClient keeps no-db session flow anonymous", async () => {
  assert.deepEqual(await localAppClient.getSession(), {
    mode: "anonymous",
    userId: null,
    isPersistent: false
  });
  assert.deepEqual(await localAppClient.signIn({ email: "user@example.com" }), {
    mode: "anonymous",
    userId: null,
    isPersistent: false
  });
  assert.deepEqual(await localAppClient.signOut(), {
    mode: "anonymous",
    userId: null,
    isPersistent: false
  });
});

test("localAppClient delegates lesson toggle through localAppStateAdapter", async () => {
  const currentSnapshot: LearningProgressSnapshot = {
    completedLessonIds: [],
    reviewedModuleIds: [],
    passedModuleQuizIds: [],
    quizProgress: {}
  };
  const nextSnapshot = {
    ...currentSnapshot,
    completedLessonIds: ["gr_lesson_022"]
  };
  const calls: Array<{ type: string; lessonId?: string; snapshot?: typeof currentSnapshot }> = [];

  await withPatchedAdapter(
    {
      readLearningProgressSnapshot() {
        calls.push({
          type: "read"
        });
        return currentSnapshot;
      },
      toggleCompletedLesson(snapshot, lessonId) {
        calls.push({
          type: "toggle",
          lessonId,
          snapshot
        });
        return nextSnapshot;
      }
    },
    async () => {
      const result = await localAppClient.toggleLessonCompleted("gr_lesson_022");

      assert.deepEqual(result, nextSnapshot);
    }
  );

  assert.deepEqual(calls, [
    {
      type: "read"
    },
    {
      type: "toggle",
      lessonId: "gr_lesson_022",
      snapshot: currentSnapshot
    }
  ]);
});

test("localAppClient reads entitlements and last opened context through the adapter", async () => {
  await withPatchedAdapter(
    {
      readAccessState() {
        return {
          entitlements: ["premium"],
          accessSource: "local"
        };
      },
      saveLastOpenedContext(context) {
        return {
          ...context,
          origin: context.origin ?? "manual"
        };
      }
    },
    async () => {
      assert.equal(await localAppClient.hasEntitlement("premium"), true);
      assert.equal(await localAppClient.hasEntitlement("cyprus"), false);
      assert.deepEqual(
        await localAppClient.saveLastOpenedContext({
          trackId: "greek_b1"
        }),
        {
          trackId: "greek_b1",
          origin: "manual"
        }
      );
    }
  );
});

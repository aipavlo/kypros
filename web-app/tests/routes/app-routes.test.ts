import test from "node:test";
import assert from "node:assert/strict";
import { GET as getAccess } from "../../app/api/app/access/route.js";
import { GET as getProgress, PUT as putProgress } from "../../app/api/app/progress/route.js";
import {
  GET as getLastOpenedContext,
  PUT as putLastOpenedContext
} from "../../app/api/app/context/last-opened/route.js";

test("access route keeps 501 contract shape stable", async () => {
  const response = await getAccess();

  assert.equal(response.status, 501);
  assert.deepEqual(await response.json(), {
    access: {
      entitlements: [],
      accessSource: "server"
    }
  });
});

test("progress routes return empty 501-safe snapshot", async () => {
  const getResponse = await getProgress();
  const putResponse = await putProgress(
    new Request("http://localhost/api/app/progress", {
      method: "PUT",
      body: JSON.stringify({
        action: "toggle_lesson_completed",
        lessonId: "lesson_1"
      })
    })
  );

  assert.equal(getResponse.status, 501);
  assert.equal(putResponse.status, 501);
  assert.deepEqual(await getResponse.json(), {
    progress: {
      completedLessonIds: [],
      reviewedModuleIds: [],
      passedModuleQuizIds: [],
      quizProgress: {}
    }
  });
  assert.deepEqual(await putResponse.json(), {
    progress: {
      completedLessonIds: [],
      reviewedModuleIds: [],
      passedModuleQuizIds: [],
      quizProgress: {}
    }
  });
});

test("last-opened routes return empty 501-safe context", async () => {
  const getResponse = await getLastOpenedContext();
  const putResponse = await putLastOpenedContext(
    new Request("http://localhost/api/app/context/last-opened", {
      method: "PUT",
      body: JSON.stringify({
        context: {
          trackId: "greek_b1"
        }
      })
    })
  );

  assert.equal(getResponse.status, 501);
  assert.equal(putResponse.status, 501);
  assert.deepEqual(await getResponse.json(), {
    context: {}
  });
  assert.deepEqual(await putResponse.json(), {
    context: {}
  });
});

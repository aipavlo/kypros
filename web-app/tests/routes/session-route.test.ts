import test from "node:test";
import assert from "node:assert/strict";
import { createSessionGetHandler } from "../../app/api/app/session/route.js";

test("session route returns anonymous contract shape", async () => {
  const getSession = createSessionGetHandler(async () => ({
    mode: "anonymous",
    userId: null,
    isPersistent: false
  }));
  const response = await getSession();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    session: {
      mode: "anonymous",
      userId: null,
      isPersistent: false
    }
  });
});

test("session route returns authenticated contract shape", async () => {
  const getSession = createSessionGetHandler(async () => ({
    mode: "authenticated",
    userId: "user-42",
    isPersistent: true
  }));
  const response = await getSession();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    session: {
      mode: "authenticated",
      userId: "user-42",
      isPersistent: true
    }
  });
});

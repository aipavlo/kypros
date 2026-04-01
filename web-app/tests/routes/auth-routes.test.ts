import test from "node:test";
import assert from "node:assert/strict";
import { POST as login } from "../../app/api/auth/login/route.js";
import { POST as logout } from "../../app/api/auth/logout/route.js";

test("login route rejects request without email", async () => {
  const response = await login(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({})
    })
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Email is required."
  });
});

test("login route returns authenticated session and session cookie", async () => {
  const response = await login(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com"
      })
    })
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    session: {
      mode: "authenticated",
      userId: "pending-db-user",
      isPersistent: true
    }
  });
  assert.match(response.headers.get("set-cookie") ?? "", /kypros_session=dev-/);
});

test("logout route clears cookie and returns anonymous session", async () => {
  const response = await logout();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    session: {
      mode: "anonymous",
      userId: null,
      isPersistent: false
    }
  });
  assert.match(response.headers.get("set-cookie") ?? "", /kypros_session=;/);
});

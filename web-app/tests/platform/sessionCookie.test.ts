import test from "node:test";
import assert from "node:assert/strict";
import {
  APP_SESSION_COOKIE_NAME,
  appSessionCookieOptions,
  createSessionCookieValue,
  parseSessionCookieValue
} from "../../src/platform/sessionCookie.js";

test("session cookie config uses stable public contract", () => {
  assert.equal(APP_SESSION_COOKIE_NAME, "kypros_session");
  assert.equal(appSessionCookieOptions.httpOnly, true);
  assert.equal(appSessionCookieOptions.sameSite, "lax");
  assert.equal(appSessionCookieOptions.path, "/");
});

test("createSessionCookieValue stores raw session token", () => {
  const sessionToken = "dev-1234567890abcdef";

  assert.equal(createSessionCookieValue({ sessionToken }), sessionToken);
});

test("parseSessionCookieValue rejects missing and short cookie values", () => {
  assert.equal(parseSessionCookieValue(undefined), null);
  assert.equal(parseSessionCookieValue(""), null);
  assert.equal(parseSessionCookieValue("too-short"), null);
});

test("parseSessionCookieValue trims and returns valid token payload", () => {
  assert.deepEqual(parseSessionCookieValue("   dev-1234567890abcdef   "), {
    sessionToken: "dev-1234567890abcdef"
  });
});

export const APP_SESSION_COOKIE_NAME = "kypros_session";

export const appSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export type SessionCookiePayload = {
  sessionToken: string;
};

export function createSessionCookieValue(payload: SessionCookiePayload) {
  return payload.sessionToken;
}

export function parseSessionCookieValue(rawValue: string | undefined): SessionCookiePayload | null {
  if (!rawValue || typeof rawValue !== "string") {
    return null;
  }

  const sessionToken = rawValue.trim();

  if (sessionToken.length < 16) {
    return null;
  }

  return {
    sessionToken
  };
}

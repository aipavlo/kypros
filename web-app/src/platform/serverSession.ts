import { cookies } from "next/headers";
import { APP_SESSION_COOKIE_NAME, parseSessionCookieValue } from "@/src/platform/sessionCookie";
import type { AppSessionState } from "@/src/platform/appClient";

export async function resolveServerSession(): Promise<AppSessionState> {
  const cookieStore = await cookies();
  const rawCookieValue = cookieStore.get(APP_SESSION_COOKIE_NAME)?.value;
  const sessionCookiePayload = parseSessionCookieValue(rawCookieValue);

  if (!sessionCookiePayload) {
    return {
      mode: "anonymous",
      userId: null,
      isPersistent: false
    };
  }

  return {
    mode: "authenticated",
    userId: "pending-db-user",
    isPersistent: true
  };
}

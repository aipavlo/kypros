import { NextResponse } from "next/server";
import type { SignOutApiResponse } from "@/src/platform/apiBoundary";
import { APP_SESSION_COOKIE_NAME, appSessionCookieOptions } from "@/src/platform/sessionCookie";

export async function POST() {
  const response = NextResponse.json<SignOutApiResponse>({
    session: {
      mode: "anonymous",
      userId: null,
      isPersistent: false
    }
  });

  response.cookies.set(APP_SESSION_COOKIE_NAME, "", {
    ...appSessionCookieOptions,
    maxAge: 0
  });

  return response;
}

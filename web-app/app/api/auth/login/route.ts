import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { SignInApiRequest, SignInApiResponse } from "@/src/platform/apiBoundary";
import {
  APP_SESSION_COOKIE_NAME,
  appSessionCookieOptions,
  createSessionCookieValue
} from "@/src/platform/sessionCookie";

export async function POST(request: Request) {
  const requestBody = (await request.json().catch(() => null)) as SignInApiRequest | null;

  if (!requestBody?.email || typeof requestBody.email !== "string") {
    return NextResponse.json(
      {
        error: "Email is required."
      },
      {
        status: 400
      }
    );
  }

  const response = NextResponse.json<SignInApiResponse>({
    session: {
      mode: "authenticated",
      userId: "pending-db-user",
      isPersistent: true
    }
  });

  response.cookies.set(
    APP_SESSION_COOKIE_NAME,
    createSessionCookieValue({
      sessionToken: `dev-${randomUUID()}`
    }),
    appSessionCookieOptions
  );

  return response;
}

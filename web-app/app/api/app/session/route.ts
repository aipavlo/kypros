import { NextResponse } from "next/server";
import type { SessionApiResponse } from "@/src/platform/apiBoundary";
import type { AppSessionState } from "@/src/platform/appClient";
import { resolveServerSession } from "@/src/platform/serverSession";

type SessionResolver = () => Promise<AppSessionState>;

export function createSessionGetHandler(resolveSession: SessionResolver = resolveServerSession) {
  return async function GET() {
    const session = await resolveSession();

    return NextResponse.json<SessionApiResponse>({
      session
    });
  };
}

export const GET = createSessionGetHandler();

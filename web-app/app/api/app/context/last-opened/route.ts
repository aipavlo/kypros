import { NextResponse } from "next/server";
import type {
  LastOpenedContextApiResponse,
  UpdateLastOpenedContextApiRequest
} from "@/src/platform/apiBoundary";

const EMPTY_CONTEXT: LastOpenedContextApiResponse = {
  context: {}
};

export async function GET() {
  return NextResponse.json<LastOpenedContextApiResponse>(EMPTY_CONTEXT, {
    status: 501
  });
}

export async function PUT(request: Request) {
  await request.json().catch(() => null as UpdateLastOpenedContextApiRequest | null);

  return NextResponse.json<LastOpenedContextApiResponse>(EMPTY_CONTEXT, {
    status: 501
  });
}

import { NextResponse } from "next/server";
import type { AccessApiResponse } from "@/src/platform/apiBoundary";

export async function GET() {
  return NextResponse.json<AccessApiResponse>(
    {
      access: {
        entitlements: [],
        accessSource: "server"
      }
    },
    {
      status: 501
    }
  );
}

import { NextResponse } from "next/server";
import type {
  ProgressApiResponse,
  UpdateProgressApiRequest
} from "@/src/platform/apiBoundary";

const EMPTY_PROGRESS: ProgressApiResponse = {
  progress: {
    completedLessonIds: [],
    reviewedModuleIds: [],
    passedModuleQuizIds: [],
    quizProgress: {}
  }
};

export async function GET() {
  return NextResponse.json<ProgressApiResponse>(EMPTY_PROGRESS, {
    status: 501
  });
}

export async function PUT(request: Request) {
  await request.json().catch(() => null as UpdateProgressApiRequest | null);

  return NextResponse.json<ProgressApiResponse>(EMPTY_PROGRESS, {
    status: 501
  });
}

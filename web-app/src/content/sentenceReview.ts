import sentenceReviewJson from "@content/02-greek-b1/sentence-review.json";
import type { SentenceReviewPackItem } from "@/src/content/types";

export const sentenceReviewPacks = sentenceReviewJson as SentenceReviewPackItem[];

const sentenceReviewPackByLesson = new Map(
  sentenceReviewPacks.map((pack) => [pack.lessonId, pack] as const)
);

const sentenceReviewPacksByModule = new Map<string, SentenceReviewPackItem[]>();

for (const pack of sentenceReviewPacks) {
  const current = sentenceReviewPacksByModule.get(pack.moduleId) ?? [];
  current.push(pack);
  sentenceReviewPacksByModule.set(pack.moduleId, current);
}

export function getSentenceReviewPackByLesson(lessonId?: string | null) {
  if (!lessonId) {
    return undefined;
  }

  return sentenceReviewPackByLesson.get(lessonId);
}

export function getSentenceReviewPacksByModule(moduleId?: string | null) {
  if (!moduleId) {
    return [];
  }

  return sentenceReviewPacksByModule.get(moduleId) ?? [];
}

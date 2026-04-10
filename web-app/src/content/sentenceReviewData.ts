import sentenceReviewJson from "@content/02-greek-b1/sentence-review.json";
import { transliterateGreekToLatin } from "@/src/content/transliteration";
import type { SentenceReviewExerciseItem, SentenceReviewPackItem } from "@/src/content/types";

export type SentenceReviewCluster = SentenceReviewPackItem & {
  primaryLessonId: string;
  primaryModuleId: string;
  sentenceCount: number;
  sentences: Array<SentenceReviewExerciseItem & { greek: string; transliteration?: string }>;
};

const sourceSentenceReviewItems = sentenceReviewJson as SentenceReviewPackItem[];

export const sentenceReviewClusters: SentenceReviewCluster[] = sourceSentenceReviewItems.map(
  (item) => ({
    ...item,
    primaryLessonId: item.lessonId,
    primaryModuleId: item.moduleId,
    sentenceCount: item.exercises.length,
    sentences: item.exercises.map((exercise) => {
      const transliteration =
        transliterateGreekToLatin(exercise.answer) ?? undefined;

      return {
        ...exercise,
        greek: exercise.answer,
        ...(transliteration ? { transliteration } : {})
      };
    })
  })
);

export const sentenceReviewClusterById = new Map(
  sentenceReviewClusters.map((cluster) => [cluster.id, cluster] as const)
);

const sentenceReviewClustersByLessonId = new Map<string, SentenceReviewCluster[]>();
const sentenceReviewClustersByModuleId = new Map<string, SentenceReviewCluster[]>();

for (const cluster of sentenceReviewClusters) {
  const lessonClusters = sentenceReviewClustersByLessonId.get(cluster.lessonId) ?? [];
  lessonClusters.push(cluster);
  sentenceReviewClustersByLessonId.set(cluster.lessonId, lessonClusters);

  const moduleClusters = sentenceReviewClustersByModuleId.get(cluster.moduleId) ?? [];
  moduleClusters.push(cluster);
  sentenceReviewClustersByModuleId.set(cluster.moduleId, moduleClusters);
}

export function getSentenceReviewClusterById(clusterId: string) {
  return sentenceReviewClusterById.get(clusterId);
}

export function getSentenceReviewClustersByTrack(trackId: string) {
  return sentenceReviewClusters.filter((cluster) => cluster.trackId === trackId);
}

export function getSentenceReviewClustersByLessonId(lessonId: string) {
  return sentenceReviewClustersByLessonId.get(lessonId) ?? [];
}

export function getSentenceReviewClustersByModuleId(moduleId: string) {
  return sentenceReviewClustersByModuleId.get(moduleId) ?? [];
}

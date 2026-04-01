import greekFlashcards from "@content/02-greek-b1/flashcards.json";
import cyprusFlashcards from "@content/03-cyprus-reality/flashcards.json";
import { FLASHCARD_TOTAL_COUNT } from "@/src/content/contentCounts";
import type { FlashcardItem } from "@/src/content/types";

export const flashcards = [
  ...(greekFlashcards as FlashcardItem[]),
  ...(cyprusFlashcards as FlashcardItem[])
];

function flashcardHasTag(card: FlashcardItem, tag: string) {
  return card.tags.includes(tag);
}

const flashcardsByTrack = new Map<string, FlashcardItem[]>();
const flashcardsByLesson = new Map<string, FlashcardItem[]>();
const flashcardsByModule = new Map<string, FlashcardItem[]>();

for (const card of flashcards) {
  const trackCards = flashcardsByTrack.get(card.trackId) ?? [];
  trackCards.push(card);
  flashcardsByTrack.set(card.trackId, trackCards);

  for (const tag of card.tags) {
    if (tag.startsWith("lesson:")) {
      const lessonId = tag.replace("lesson:", "");
      const lessonCards = flashcardsByLesson.get(lessonId) ?? [];
      lessonCards.push(card);
      flashcardsByLesson.set(lessonId, lessonCards);
    }

    if (tag.startsWith("module:")) {
      const moduleId = tag.replace("module:", "");
      const moduleCards = flashcardsByModule.get(moduleId) ?? [];
      moduleCards.push(card);
      flashcardsByModule.set(moduleId, moduleCards);
    }
  }
}

export function getFlashcardsByTrack(trackId: string) {
  return flashcardsByTrack.get(trackId) ?? [];
}

export function getFlashcardsByLesson(lessonId: string) {
  return flashcardsByLesson.get(lessonId) ?? [];
}

export function getFlashcardsByModule(moduleId: string, difficulty?: string) {
  return (flashcardsByModule.get(moduleId) ?? []).filter((card) => {
    const matchesModule = flashcardHasTag(card, `module:${moduleId}`);
    const matchesDifficulty = difficulty ? card.difficulty === difficulty : true;

    return matchesModule && matchesDifficulty;
  });
}

export { FLASHCARD_TOTAL_COUNT };

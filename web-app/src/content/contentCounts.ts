import greekLessonsJson from "@content/02-greek-b1/lessons.json";
import greekFlashcardsJson from "@content/02-greek-b1/flashcards.json";
import cyprusLessonsJson from "@content/03-cyprus-reality/lessons.json";
import cyprusFlashcardsJson from "@content/03-cyprus-reality/flashcards.json";
import examQuizzesJson from "@content/04-exam-prep/quizzes.json";
import humorItemsJson from "@content/06-greek-humor/items.json";
import { trailDefinitions } from "@/src/content/trails";

export const GREEK_LESSON_COUNT = greekLessonsJson.length;
export const CYPRUS_LESSON_COUNT = cyprusLessonsJson.length;
export const LESSON_TOTAL_COUNT = GREEK_LESSON_COUNT + CYPRUS_LESSON_COUNT;
export const FLASHCARD_TOTAL_COUNT = greekFlashcardsJson.length + cyprusFlashcardsJson.length;
export const QUIZ_TOTAL_COUNT = examQuizzesJson.length;
export const HUMOR_ITEM_COUNT = humorItemsJson.length;
export const TRAIL_TOTAL_COUNT = trailDefinitions.length;

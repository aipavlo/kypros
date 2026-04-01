import { lessons } from "@/src/content/catalogData";

export const STATIC_ROUTE_PATHS = [
  "/",
  "/welcome",
  "/dashboard",
  "/easy-start",
  "/lessons",
  "/cyprus",
  "/tracks",
  "/trails",
  "/flashcards",
  "/quiz",
  "/content",
  "/humor",
  "/achievements"
] as const;

export function getAllRouteSlugs(): string[][] {
  const staticRouteSlugs = STATIC_ROUTE_PATHS.map((route) =>
    route === "/" ? [] : route.slice(1).split("/")
  );
  const lessonRouteSlugs = lessons.map((lesson) => ["lessons", lesson.id]);

  return [...staticRouteSlugs, ...lessonRouteSlugs];
}

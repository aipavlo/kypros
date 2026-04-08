import { lessons } from "@/src/content/catalogData";
import { ALL_STATIC_ROUTE_PATHS } from "@/src/seo/siteMetadata";

export const STATIC_ROUTE_PATHS = ALL_STATIC_ROUTE_PATHS;

export function getAllRouteSlugs(): string[][] {
  const staticRouteSlugs = STATIC_ROUTE_PATHS.map((route) =>
    route === "/" ? [] : route.slice(1).split("/")
  );
  const lessonRouteSlugs = lessons.map((lesson) => ["lessons", lesson.id]);

  return [...staticRouteSlugs, ...lessonRouteSlugs];
}

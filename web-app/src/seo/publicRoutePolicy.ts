import { getLessonById } from "@/src/content/catalogData";
import { getRouteSeoEntry } from "@/src/seo/siteMetadata";

export function getRoutePathFromSlug(slug: string[]) {
  if (slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

export function isIndexableRoutePath(routePath: string) {
  if (routePath.startsWith("/lessons/")) {
    return Boolean(getLessonById(routePath.replace("/lessons/", "")));
  }

  return getRouteSeoEntry(routePath).indexable;
}

export function isIndexableRouteSlug(slug: string[]) {
  return isIndexableRoutePath(getRoutePathFromSlug(slug));
}

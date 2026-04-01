import type { MetadataRoute } from "next";
import { lessons } from "@/src/content/catalogData";
import { SITE_URL } from "@/src/seo/siteMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
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
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/cyprus" || route === "/lessons" ? 0.9 : 0.7
  })) satisfies MetadataRoute.Sitemap;

  const lessonEntries = lessons.map((lesson) => ({
    url: `${SITE_URL}/lessons/${lesson.id}`,
    changeFrequency: "monthly",
    priority: lesson.trackId === "cyprus_reality" ? 0.8 : 0.7
  })) satisfies MetadataRoute.Sitemap;

  return [...staticEntries, ...lessonEntries];
}

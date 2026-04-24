import type { MetadataRoute } from "next";
import { lessons } from "@/src/content/catalogData";
import indexableStaticRoutes from "./indexableStaticRoutes.json";
import { getAbsoluteUrl } from "@/src/seo/siteMetadata";

type IndexableStaticRouteEntry = {
  pathname: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

const indexableStaticRouteEntries = indexableStaticRoutes as IndexableStaticRouteEntry[];

export const INDEXABLE_STATIC_ROUTE_PATHS = indexableStaticRouteEntries.map((entry) => entry.pathname);
export const INDEXABLE_STATIC_ROUTE_ENTRIES = indexableStaticRouteEntries;

export function getSitemapMetadata(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = INDEXABLE_STATIC_ROUTE_ENTRIES.map((entry) => ({
    url: getAbsoluteUrl(entry.pathname),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));

  const lessonEntries: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: getAbsoluteUrl(`/lessons/${lesson.id}`),
    changeFrequency: "monthly" as const,
    priority: lesson.trackId === "cyprus_reality" ? 0.8 : 0.7
  }));

  return [...staticEntries, ...lessonEntries];
}

export function buildSitemapXml() {
  const entries = getSitemapMetadata()
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${(entry.priority ?? 0.7).toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${getAbsoluteUrl("/sitemap.xml")}
`;
}

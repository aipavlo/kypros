import type { MetadataRoute } from "next";
import { lessons } from "@/src/content/catalogData";
import { STATIC_ROUTE_PATHS } from "@/src/seo/routes";
import { getAbsoluteUrl } from "@/src/seo/siteMetadata";

export function getRobotsMetadata(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: getAbsoluteUrl("/sitemap.xml")
  };
}

export function getSitemapMetadata(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTE_PATHS.map((route) => ({
    url: getAbsoluteUrl(route),
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "/" ? 1 : route === "/cyprus" || route === "/lessons" ? 0.9 : 0.7
  }));

  const lessonEntries: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: getAbsoluteUrl(`/lessons/${lesson.id}`),
    changeFrequency: "monthly" as const,
    priority: lesson.trackId === "cyprus_reality" ? 0.8 : 0.7
  }));

  return [...staticEntries, ...lessonEntries];
}

export function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");
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

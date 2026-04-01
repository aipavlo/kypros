import type { MetadataRoute } from "next";
import { getSitemapMetadata } from "@/src/seo/siteFiles";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapMetadata() satisfies MetadataRoute.Sitemap;
}

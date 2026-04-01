import type { MetadataRoute } from "next";
import { getRobotsMetadata } from "@/src/seo/siteFiles";

export default function robots(): MetadataRoute.Robots {
  return getRobotsMetadata();
}

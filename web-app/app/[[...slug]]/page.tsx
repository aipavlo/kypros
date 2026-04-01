import type { Metadata } from "next";
import { AppEntry } from "@/src/AppEntry";
import { getRouteMetadataFromSlug } from "@/src/seo/siteMetadata";

type CatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  return getRouteMetadataFromSlug(slug);
}

export default function CatchAllPage() {
  return <AppEntry />;
}

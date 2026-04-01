import type { Metadata } from "next";
import { AppEntry } from "@/src/AppEntry";
import { getAllRouteSlugs } from "@/src/seo/routes";
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

export function generateStaticParams() {
  return getAllRouteSlugs().map((slug) => ({ slug }));
}

export default function CatchAllPage() {
  return <AppEntry />;
}

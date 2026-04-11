import type { Metadata } from "next";
import { AppEntry } from "@/src/AppEntry";
import { PublicRouteSnapshot } from "@/src/seo/PublicRouteSnapshot";
import { getPageStructuredData } from "@/src/seo/pageSchema";
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

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug = [] } = await params;
  const structuredData = getPageStructuredData(slug);

  return (
    <>
      <PublicRouteSnapshot slug={slug} />
      {structuredData.map((entry, index) => (
        <script
          key={`${slug.join("/") || "root"}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      <AppEntry />
    </>
  );
}

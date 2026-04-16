import test from "node:test";
import assert from "node:assert/strict";
import { lessons } from "../../src/content/catalogData.js";
import { getSitemapMetadata } from "../../src/seo/siteFiles.js";
import { getPageStructuredData } from "../../src/seo/pageSchema.js";
import { getAbsoluteUrl, getRouteMetadataFromSlug } from "../../src/seo/siteMetadata.js";

function getResolvedTitle(metadata: { title?: unknown }) {
  if (typeof metadata.title === "string") {
    return metadata.title;
  }

  if (metadata.title && typeof metadata.title === "object" && "absolute" in metadata.title) {
    const absoluteTitle = (metadata.title as { absolute?: unknown }).absolute;
    return typeof absoluteTitle === "string" ? absoluteTitle : "";
  }

  return "";
}

test("utility routes are marked noindex while key SEO entrypoints stay indexable", () => {
  const dashboardMetadata = getRouteMetadataFromSlug(["dashboard"]);
  const lessonsMetadata = getRouteMetadataFromSlug(["lessons"]);
  const welcomeMetadata = getRouteMetadataFromSlug(["welcome"]);
  const dashboardRobots =
    typeof dashboardMetadata.robots === "string" ? null : dashboardMetadata.robots;
  const lessonsRobots = typeof lessonsMetadata.robots === "string" ? null : lessonsMetadata.robots;

  assert.equal(dashboardRobots?.index, false);
  assert.equal(lessonsRobots?.index, true);
  assert.equal(welcomeMetadata.alternates?.canonical, getAbsoluteUrl("/"));
});

test("sitemap keeps only indexable static routes", () => {
  const sitemap = getSitemapMetadata().map((entry) => entry.url);

  assert.ok(sitemap.includes(getAbsoluteUrl("/lessons")));
  assert.ok(sitemap.includes(getAbsoluteUrl("/cyprus")));
  assert.ok(sitemap.includes(getAbsoluteUrl("/trails")));
  assert.ok(!sitemap.includes(getAbsoluteUrl("/dashboard")));
  assert.ok(!sitemap.includes(getAbsoluteUrl("/quiz")));
  assert.ok(!sitemap.includes(getAbsoluteUrl("/content")));
});

test("sitemap URLs stay inside the /kypros/ URL prefix", () => {
  const sitemapUrls = getSitemapMetadata().map((entry) => entry.url);

  assert.ok(sitemapUrls.length > 0);

  for (const url of sitemapUrls) {
    assert.match(url, /^https:\/\/aipavlo\.github\.io\/kypros(\/|$)/);
  }
});

test("structured data covers courses, collections and lesson pages", () => {
  const homeSchema = getPageStructuredData([]);
  const easyStartSchema = getPageStructuredData(["easy-start"]);
  const lessonsSchema = getPageStructuredData(["lessons"]);
  const phrasebookSchema = getPageStructuredData(["phrasebook"]);
  const cyprusSchema = getPageStructuredData(["cyprus"]);
  const trailsSchema = getPageStructuredData(["trails"]);
  const humorSchema = getPageStructuredData(["humor"]);
  const lessonSchema = getPageStructuredData(["lessons", "gr_lesson_020"]);
  const utilitySchema = getPageStructuredData(["dashboard"]);

  assert.deepEqual(homeSchema.map((entry) => entry["@type"]), ["WebPage"]);
  assert.deepEqual(easyStartSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "WebPage"]);
  assert.deepEqual(lessonsSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "Course"]);
  assert.deepEqual(phrasebookSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "CollectionPage"]);
  assert.deepEqual(cyprusSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "WebPage"]);
  assert.deepEqual(trailsSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "CollectionPage"]);
  assert.deepEqual(humorSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "CollectionPage"]);
  assert.deepEqual(lessonSchema.map((entry) => entry["@type"]), ["BreadcrumbList", "LearningResource"]);
  assert.deepEqual(utilitySchema, []);
  assert.equal(
    [...phrasebookSchema, ...trailsSchema, ...humorSchema].some((entry) => "mainEntity" in entry),
    false
  );
});

test("public metadata includes social preview images", () => {
  const landingMetadata = getRouteMetadataFromSlug([]);
  const lessonMetadata = getRouteMetadataFromSlug(["lessons", "gr_lesson_001"]);
  const landingTwitter = landingMetadata.twitter as { card?: string } | undefined;

  assert.equal(landingTwitter?.card, "summary_large_image");
  assert.ok(Array.isArray(landingMetadata.openGraph?.images));
  assert.ok((landingMetadata.openGraph?.images?.length ?? 0) > 0);
  assert.ok(Array.isArray(lessonMetadata.openGraph?.images));
  assert.ok((lessonMetadata.openGraph?.images?.length ?? 0) > 0);
});

test("route and lesson metadata stay within snippet-friendly budgets", () => {
  const staticRouteSlugs = [[], ["easy-start"], ["lessons"], ["cyprus"], ["trails"], ["humor"]];

  for (const slug of staticRouteSlugs) {
    const metadata = getRouteMetadataFromSlug(slug);
    const title = getResolvedTitle(metadata);
    assert.ok(title.length <= 70, `route title too long for /${slug.join("/") || ""}: ${title.length}`);
    assert.ok((metadata.description?.length ?? 0) <= 160, `route description too long for /${slug.join("/") || ""}`);
  }

  for (const lesson of lessons) {
    const metadata = getRouteMetadataFromSlug(["lessons", lesson.id]);
    const title = getResolvedTitle(metadata);
    assert.ok(title.length <= 70, `lesson title too long for ${lesson.id}: ${title.length}`);
    assert.ok((metadata.description?.length ?? 0) <= 160, `lesson description too long for ${lesson.id}`);
  }
});

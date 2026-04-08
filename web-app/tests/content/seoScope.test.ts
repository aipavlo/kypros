import test from "node:test";
import assert from "node:assert/strict";
import { getSitemapMetadata } from "../../src/seo/siteFiles.js";
import { getPageStructuredData } from "../../src/seo/pageSchema.js";
import { SITE_URL, getAbsoluteUrl, getRouteMetadataFromSlug } from "../../src/seo/siteMetadata.js";

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

  assert.ok(sitemap.includes(`${SITE_URL}/lessons`));
  assert.ok(sitemap.includes(`${SITE_URL}/cyprus`));
  assert.ok(sitemap.includes(`${SITE_URL}/trails`));
  assert.ok(!sitemap.includes(`${SITE_URL}/dashboard`));
  assert.ok(!sitemap.includes(`${SITE_URL}/quiz`));
  assert.ok(!sitemap.includes(`${SITE_URL}/content`));
});

test("structured data covers courses, collections and lesson pages", () => {
  const lessonsSchema = getPageStructuredData(["lessons"]);
  const trailsSchema = getPageStructuredData(["trails"]);
  const lessonSchema = getPageStructuredData(["lessons", "gr_lesson_020"]);

  assert.ok(lessonsSchema.some((entry) => entry["@type"] === "Course"));
  assert.ok(trailsSchema.some((entry) => entry["@type"] === "CollectionPage"));
  assert.ok(lessonSchema.some((entry) => entry["@type"] === "LearningResource"));
  assert.ok(lessonSchema.some((entry) => entry["@type"] === "BreadcrumbList"));
});

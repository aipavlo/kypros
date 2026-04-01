import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_TITLE,
  SITE_URL,
  getRouteMetadataFromSlug
} from "../../src/seo/siteMetadata.js";

test("route metadata keeps canonical and Open Graph URLs aligned for static pages", () => {
  const metadata = getRouteMetadataFromSlug(["quiz"]);

  assert.equal(metadata.title, "Мини-проверки по греческому языку и Cyprus Reality");
  assert.equal(metadata.alternates?.canonical, `${SITE_URL}/quiz`);
  assert.equal(metadata.openGraph?.url, `${SITE_URL}/quiz`);
});

test("lesson metadata uses a lesson-specific canonical instead of the site root", () => {
  const metadata = getRouteMetadataFromSlug(["lessons", "gr_lesson_020"]);

  assert.equal(metadata.alternates?.canonical, `${SITE_URL}/lessons/gr_lesson_020`);
  assert.equal(metadata.openGraph?.url, `${SITE_URL}/lessons/gr_lesson_020`);
  assert.match(String(metadata.title), /Объявления и простые вывески/);
});

test("default title no longer duplicates the site name before the layout template", () => {
  assert.equal(DEFAULT_TITLE, "Греческий язык и Cyprus Reality для подготовки к экзамену");
});

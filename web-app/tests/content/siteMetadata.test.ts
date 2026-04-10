import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_TITLE,
  getAbsoluteUrl,
  getRouteMetadataFromSlug
} from "../../src/seo/siteMetadata.js";

test("route metadata keeps canonical and Open Graph URLs aligned for static pages", () => {
  const metadata = getRouteMetadataFromSlug(["quiz"]);

  assert.deepEqual(metadata.title, {
    absolute: "Мини-проверки по греческому и Cyprus Reality | Kypros Path"
  });
  assert.equal(metadata.alternates?.canonical, getAbsoluteUrl("/quiz"));
  assert.equal(metadata.openGraph?.url, getAbsoluteUrl("/quiz"));
});

test("lesson metadata uses a lesson-specific canonical instead of the site root", () => {
  const metadata = getRouteMetadataFromSlug(["lessons", "gr_lesson_020"]);

  assert.equal(metadata.alternates?.canonical, getAbsoluteUrl("/lessons/gr_lesson_020"));
  assert.equal(metadata.openGraph?.url, getAbsoluteUrl("/lessons/gr_lesson_020"));
  assert.match(JSON.stringify(metadata.title), /Объявления и простые вывески/);
});

test("default title no longer duplicates the site name before the layout template", () => {
  assert.equal(DEFAULT_TITLE, "Греческий и Cyprus Reality для жизни на Кипре");
});

test("utility titles that already include the brand do not duplicate Kypros Path in final metadata", () => {
  const metadata = getRouteMetadataFromSlug(["welcome"]);

  assert.deepEqual(metadata.title, {
    absolute: "О сервисе Kypros Path"
  });
});

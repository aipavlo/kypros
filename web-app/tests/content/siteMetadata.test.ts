import test from "node:test";
import assert from "node:assert/strict";
import { absoluteUrl } from "../../src/lib/url.js";
import {
  DEFAULT_TITLE,
  getRouteMetadataFromSlug
} from "../../src/seo/siteMetadata.js";

test("route metadata keeps canonical and Open Graph URLs aligned for static pages", () => {
  const metadata = getRouteMetadataFromSlug(["quiz"]);

  assert.deepEqual(metadata.title, {
    absolute: "Мини-проверки по греческому и Cyprus Reality | Kypros Path"
  });
  assert.equal(metadata.alternates?.canonical, absoluteUrl("/quiz"));
  assert.equal(metadata.openGraph?.url, absoluteUrl("/quiz"));
});

test("lesson metadata uses a lesson-specific canonical instead of the site root", () => {
  const metadata = getRouteMetadataFromSlug(["lessons", "gr_lesson_020"]);

  assert.equal(metadata.alternates?.canonical, absoluteUrl("/lessons/gr_lesson_020"));
  assert.equal(metadata.openGraph?.url, absoluteUrl("/lessons/gr_lesson_020"));
  assert.match(JSON.stringify(metadata.title), /Объявления и простые вывески/);
});

test("absoluteUrl keeps trailing slash for route pages but not for file paths", () => {
  assert.equal(absoluteUrl("/"), "https://aipavlo.github.io/kypros/");
  assert.equal(absoluteUrl("/lessons"), "https://aipavlo.github.io/kypros/lessons/");
  assert.equal(absoluteUrl("/lessons/gr_lesson_020"), "https://aipavlo.github.io/kypros/lessons/gr_lesson_020/");
  assert.equal(absoluteUrl("/sitemap.xml"), "https://aipavlo.github.io/kypros/sitemap.xml");
  assert.equal(absoluteUrl("/social-preview.svg"), "https://aipavlo.github.io/kypros/social-preview.svg");
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

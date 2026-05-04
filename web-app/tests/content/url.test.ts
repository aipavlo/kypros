import test from "node:test";
import assert from "node:assert/strict";
import { absoluteUrl, assetUrl, withBasePath } from "../../src/lib/url.js";

test("withBasePath prefixes internal route paths for the project site", () => {
  assert.equal(withBasePath("/"), "/kypros/");
  assert.equal(withBasePath("/lessons"), "/kypros/lessons");
  assert.equal(withBasePath("/lessons/gr_lesson_020?mode=review"), "/kypros/lessons/gr_lesson_020?mode=review");
});

test("withBasePath leaves non-root-relative values unchanged", () => {
  assert.equal(withBasePath("https://example.com"), "https://example.com");
  assert.equal(withBasePath("mailto:test@example.com"), "mailto:test@example.com");
});

test("assetUrl reuses withBasePath for static assets", () => {
  assert.equal(assetUrl("/icon.svg"), "/kypros/icon.svg");
  assert.equal(assetUrl("site.webmanifest"), "/kypros/site.webmanifest");
});

test("absoluteUrl keeps route and file URL contracts stable", () => {
  assert.equal(absoluteUrl("/"), "https://aipavlo.github.io/kypros/");
  assert.equal(absoluteUrl("/cyprus"), "https://aipavlo.github.io/kypros/cyprus/");
  assert.equal(absoluteUrl("/robots.txt"), "https://aipavlo.github.io/kypros/robots.txt");
});

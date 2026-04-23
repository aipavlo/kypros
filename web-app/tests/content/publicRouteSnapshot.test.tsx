import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicRouteSnapshot } from "../../src/seo/PublicRouteSnapshot.js";
import { getInternalHref } from "../../src/seo/siteMetadata.js";

test("PublicRouteSnapshot renders crawlable HTML for public entry routes and lesson pages", () => {
  const homeMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={[]} />);
  const lessonsMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons"]} />);
  const sitemapMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["sitemap"]} />);
  const lessonMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons", "gr_lesson_022"]} />);

  assert.match(homeMarkup, /data-seo-route="\/"/);
  assert.match(homeMarkup, /Греческий и Cyprus Reality для жизни на Кипре/);
  assert.match(homeMarkup, new RegExp(`href="${getInternalHref("/easy-start")}"`));

  assert.match(lessonsMarkup, /data-seo-route="\/lessons"/);
  assert.match(lessonsMarkup, /Уроки Greek Core для жизни на Кипре/);
  assert.match(lessonsMarkup, new RegExp(`href="${getInternalHref("/phrasebook")}"`));

  assert.match(sitemapMarkup, /data-seo-route="\/sitemap"/);
  assert.match(sitemapMarkup, /Карта сайта Kypros Path/);
  assert.match(sitemapMarkup, new RegExp(`href="${getInternalHref("/cyprus")}"`));

  assert.match(lessonMarkup, /data-seo-route="\/lessons\/gr_lesson_022"/);
  assert.match(lessonMarkup, /Продолжить путь/);
  assert.match(lessonMarkup, /Вернуться к списку уроков/);
  assert.doesNotMatch(homeMarkup, /href="\/(?!kypros\/|")/);
  assert.doesNotMatch(lessonsMarkup, /href="\/(?!kypros\/|")/);
  assert.doesNotMatch(sitemapMarkup, /href="\/(?!kypros\/|")/);
  assert.doesNotMatch(lessonMarkup, /href="\/(?!kypros\/|")/);
});

test("PublicRouteSnapshot stays empty for noindex utility routes", () => {
  const markup = renderToStaticMarkup(<PublicRouteSnapshot slug={["dashboard"]} />);

  assert.equal(markup, "");
});

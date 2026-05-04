import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { withBasePath } from "../../src/lib/url.js";
import { PublicRouteSnapshot } from "../../src/seo/PublicRouteSnapshot.js";

test("PublicRouteSnapshot renders crawlable HTML for public entry routes and lesson pages", () => {
  const homeMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={[]} />);
  const lessonsMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons"]} />);
  const sitemapMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["sitemap"]} />);
  const lessonMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons", "gr_lesson_022"]} />);

  assert.match(homeMarkup, /data-seo-route="\/"/);
  assert.match(homeMarkup, /Греческий и Cyprus Reality для жизни на Кипре/);
  assert.match(homeMarkup, new RegExp(`href="${withBasePath("/easy-start")}"`));

  assert.match(lessonsMarkup, /data-seo-route="\/lessons"/);
  assert.match(lessonsMarkup, /Уроки греческого для жизни на Кипре/);
  assert.match(lessonsMarkup, new RegExp(`href="${withBasePath("/phrasebook")}"`));

  assert.match(sitemapMarkup, /data-seo-route="\/sitemap"/);
  assert.match(sitemapMarkup, /Карта сайта: ключевые страницы и уроки/);
  assert.match(sitemapMarkup, new RegExp(`href="${withBasePath("/cyprus")}"`));

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

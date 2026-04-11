import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicRouteSnapshot } from "../../src/seo/PublicRouteSnapshot.js";

test("PublicRouteSnapshot renders crawlable HTML for public entry routes and lesson pages", () => {
  const homeMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={[]} />);
  const lessonsMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons"]} />);
  const lessonMarkup = renderToStaticMarkup(<PublicRouteSnapshot slug={["lessons", "gr_lesson_022"]} />);

  assert.match(homeMarkup, /data-seo-route="\/"/);
  assert.match(homeMarkup, /Греческий и Cyprus Reality для жизни на Кипре/);
  assert.match(homeMarkup, /href="\/easy-start"/);

  assert.match(lessonsMarkup, /data-seo-route="\/lessons"/);
  assert.match(lessonsMarkup, /Уроки Greek Core для жизни на Кипре/);
  assert.match(lessonsMarkup, /href="\/phrasebook"/);

  assert.match(lessonMarkup, /data-seo-route="\/lessons\/gr_lesson_022"/);
  assert.match(lessonMarkup, /Продолжить путь/);
  assert.match(lessonMarkup, /Вернуться к списку уроков/);
});

test("PublicRouteSnapshot stays empty for noindex utility routes", () => {
  const markup = renderToStaticMarkup(<PublicRouteSnapshot slug={["dashboard"]} />);

  assert.equal(markup, "");
});

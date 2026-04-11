import test from "node:test";
import assert from "node:assert/strict";
import { EasyStartPage } from "../../src/screens/EasyStartPage.js";
import { TracksPage } from "../../src/screens/TracksPage.js";
import { TrailsPage } from "../../src/screens/TrailsPage.js";
import { renderRoute, countClass } from "../support/renderRoute.js";

test("EasyStartPage keeps one obvious next-step route while leaving the wider catalog secondary", () => {
  const markup = renderRoute({
    path: "/easy-start",
    url: "/easy-start",
    element: <EasyStartPage completedLessonIds={[]} />
  });

  assert.match(markup, /Лёгкий старт/);
  assert.match(markup, /Открой один короткий шаг и не выбирай маршрут вручную/);
  assert.match(markup, /Открыть следующий урок/);
  assert.match(markup, /Нужен не короткий старт, а вся программа Greek Core/);
  assert.match(markup, /Сейчас: шаг 1/);
  assert.match(markup, /Открыть этот шаг/);
  assert.equal(countClass(markup, "primary-link-button"), 1);
});

test("TracksPage keeps route roles explicit between lessons, cyprus and quiz surfaces", () => {
  const markup = renderRoute({
    path: "/tracks",
    url: "/tracks",
    element: <TracksPage />
  });

  assert.match(markup, /Учебные программы и подборки/);
  assert.match(markup, /Что открывать и зачем/);
  assert.match(markup, /Проходить языковую программу/);
  assert.match(markup, /Изучать Cyprus Reality отдельно/);
  assert.match(markup, /Проверить знания/);
  assert.match(markup, /Рабочая страница для Greek Core/);
  assert.match(markup, /Отдельная учебная линия по Кипру/);
  assert.match(markup, /Отдельный слой самопроверки, а не вход в программы/);
});

test("TrailsPage keeps one selected trail actionable and preserves trail-context lesson links", () => {
  const markup = renderRoute({
    path: "/trails",
    url: "/trails?trail=trail_souvlaki_starter",
    element: <TrailsPage completedLessonIds={[]} />
  });

  assert.match(markup, /Готовые маршруты обучения/);
  assert.match(markup, /С чего начать по самой частой задаче/);
  assert.match(markup, /Souvlaki Starter Pack/);
  assert.match(markup, /Продолжить маршрут:/);
  assert.match(markup, /Открыть языковую программу/);
  assert.match(markup, /Открыть Cyprus Reality/);
  assert.match(markup, /Если нужен похожий маршрут, а не новый большой каталог/);
  assert.match(markup, /Показать полный каталог маршрутов/);
  assert.match(markup, /source=trail/);
  assert.equal(countClass(markup, "primary-link-button"), 2);
});

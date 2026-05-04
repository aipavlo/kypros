import test from "node:test";
import assert from "node:assert/strict";
import { PhrasebookPage } from "../../src/screens/PhrasebookPage.js";
import { renderRoute, countClass } from "../support/renderRoute.js";

test("phrasebook route keeps compact practical scenarios readable and tied back into the product", () => {
  const markup = renderRoute({
    path: "/phrasebook",
    url: "/phrasebook?pack=scenario_006_coffee_order",
    element: <PhrasebookPage />
  });

  assert.match(markup, /Бытовые фразы на греческом для жизни на Кипре/);
  assert.match(markup, /Открытый mini-route/);
  assert.match(markup, /Заказать кофе/);
  assert.match(markup, /Mini-route script/);
  assert.match(markup, /Self-check/);
  assert.match(markup, /Production prompt/);
  assert.match(markup, /Как проходить practical scenario за 5-7 минут/);
  assert.match(markup, /Выбери бытовую задачу и открой один компактный маршрут/);
  assert.match(markup, /Если нужен похожий intent, а не новый большой раздел/);
  assert.match(markup, /Открыть следующий mini-route/);
  assert.match(markup, /Пройти этот mini-route/);
  assert.match(markup, /Открыть опорный урок/);
  assert.match(markup, /scenario_006_coffee_order/);
  assert.match(markup, /lessons\/gr_lesson_015\?source=phrasebook&amp;pack=scenario_006_coffee_order/);
  assert.ok(countClass(markup, "trail-catalog-card") >= 5);
});

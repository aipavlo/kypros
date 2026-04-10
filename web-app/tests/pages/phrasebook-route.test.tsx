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

  assert.match(markup, /Практические фразы и бытовые сценарии без режима справочника/);
  assert.match(markup, /Открытый сценарий/);
  assert.match(markup, /Заказать кофе/);
  assert.match(markup, /Phrase pack/);
  assert.match(markup, /Self-check/);
  assert.match(markup, /Production prompt/);
  assert.match(markup, /Открыть опорный урок/);
  assert.match(markup, /Открыть связанный маршрут/);
  assert.match(markup, /scenario_006_coffee_order/);
  assert.match(markup, /lessons\/gr_lesson_015\?source=phrasebook&amp;pack=scenario_006_coffee_order/);
  assert.ok(countClass(markup, "trail-catalog-card") >= 6);
});

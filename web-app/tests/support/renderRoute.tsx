import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";

type RouteRenderOptions = {
  path: string;
  url: string;
  element: ReactElement;
};

function normalizeMarkup(markup: string) {
  return markup.replace(/\s+/g, " ").trim();
}

export function renderRoute(options: RouteRenderOptions) {
  return normalizeMarkup(
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[options.url]}>
        <Routes>
          <Route path={options.path} element={options.element} />
        </Routes>
      </MemoryRouter>
    )
  );
}

export function countClass(markup: string, className: string) {
  return (markup.match(new RegExp(`class=\"[^\"]*\\b${className}\\b`, "g")) ?? []).length;
}

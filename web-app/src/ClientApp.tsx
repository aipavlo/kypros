"use client";

import { BrowserRouter, HashRouter } from "react-router-dom";
import { App } from "@/src/App";

export function ClientApp() {
  if (process.env.NEXT_PUBLIC_DEPLOY_TARGET === "github-pages") {
    return (
      <HashRouter>
        <App />
      </HashRouter>
    );
  }

  return (
    <BrowserRouter basename={process.env.NEXT_PUBLIC_BASE_PATH || undefined}>
      <App />
    </BrowserRouter>
  );
}

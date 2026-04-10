"use client";

import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/src/App";

function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || undefined;
}

function getLegacyHashPath(hash: string) {
  if (!hash.startsWith("#/")) {
    return null;
  }

  return hash.slice(1);
}

function getBrowserUrlFromLegacyHash(basePath: string | undefined, hash: string) {
  const legacyPath = getLegacyHashPath(hash);

  if (!legacyPath) {
    return null;
  }

  const normalizedBasePath = basePath ? basePath.replace(/\/+$/, "") : "";

  return `${normalizedBasePath}${legacyPath}`;
}

export function ClientApp() {
  const basePath = getBasePath();
  const [legacyHashHandled, setLegacyHashHandled] = useState(() => !Boolean(getLegacyHashPath(window.location.hash)));

  useEffect(() => {
    document.documentElement.dataset.appHydrated = "true";
    const nextUrl = getBrowserUrlFromLegacyHash(basePath, window.location.hash);

    if (nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }

    setLegacyHashHandled(true);

    return () => {
      delete document.documentElement.dataset.appHydrated;
    };
  }, [basePath]);

  if (!legacyHashHandled) {
    return null;
  }

  return (
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  );
}

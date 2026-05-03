"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AppEntry = dynamic(() => import("@/src/AppEntry").then((module) => module.AppEntry), {
  ssr: false
});

type DeferredAppEntryProps = {
  deferUntilIdle?: boolean;
};

type IdleWindow = Window & {
  cancelIdleCallback?: (id: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

export function DeferredAppEntry({ deferUntilIdle = false }: DeferredAppEntryProps) {
  const [shouldRenderApp, setShouldRenderApp] = useState(() => !deferUntilIdle);

  useEffect(() => {
    if (!deferUntilIdle) {
      return;
    }

    const idleWindow = window as IdleWindow;
    const supportsIdleCallback =
      typeof idleWindow.requestIdleCallback === "function" &&
      typeof idleWindow.cancelIdleCallback === "function";
    let idleHandle: number | null = null;

    const mountApp = () => {
      setShouldRenderApp(true);
    };

    const handleFirstIntent = () => {
      mountApp();
    };

    if (supportsIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(mountApp, { timeout: 1500 });
    } else {
      idleHandle = window.setTimeout(mountApp, 700);
    }

    window.addEventListener("pointerdown", handleFirstIntent, { once: true, passive: true });
    window.addEventListener("keydown", handleFirstIntent, { once: true });
    window.addEventListener("focusin", handleFirstIntent, { once: true });
    window.addEventListener("touchstart", handleFirstIntent, { once: true, passive: true });

    return () => {
      if (idleHandle !== null) {
        if (supportsIdleCallback) {
          idleWindow.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }

      window.removeEventListener("pointerdown", handleFirstIntent);
      window.removeEventListener("keydown", handleFirstIntent);
      window.removeEventListener("focusin", handleFirstIntent);
      window.removeEventListener("touchstart", handleFirstIntent);
    };
  }, [deferUntilIdle]);

  if (!shouldRenderApp) {
    return null;
  }

  return <AppEntry />;
}

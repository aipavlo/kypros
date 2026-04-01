"use client";

import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("@/src/ClientApp").then((module) => module.ClientApp), {
  ssr: false
});

export function AppEntry() {
  return <ClientApp />;
}

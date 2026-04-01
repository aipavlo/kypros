import { dbAppClient } from "@/src/platform/dbAppClient";
import { localAppClient } from "@/src/platform/localAppClient";
import type { AppClient, AppMode } from "@/src/platform/appClient";

function getConfiguredAppMode(): AppMode {
  return process.env.NEXT_PUBLIC_APP_MODE === "db" ? "db" : "no-db";
}

export function getActiveAppClient(): AppClient {
  return getConfiguredAppMode() === "db" ? dbAppClient : localAppClient;
}

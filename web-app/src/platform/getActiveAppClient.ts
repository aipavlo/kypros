import { localAppClient } from "@/src/platform/localAppClient";
import type { AppClient } from "@/src/platform/appClient";

export function getActiveAppClient(): AppClient {
  return localAppClient;
}

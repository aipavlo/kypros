import humorItemsJson from "@content/06-greek-humor/items.json";
import { HUMOR_ITEM_COUNT } from "@/src/content/contentCounts";
import type { HumorItem } from "@/src/content/types";

export const humorItems = humorItemsJson as HumorItem[];

export function getHumorItems() {
  return humorItems;
}

export { HUMOR_ITEM_COUNT };

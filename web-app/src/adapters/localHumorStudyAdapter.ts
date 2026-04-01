import { browserStorageAdapter, type BrowserStorageAdapter } from "@/src/adapters/browserStorage";
import { getHumorItems } from "@/src/content/humorData";

const HUMOR_STUDY_STORAGE_KEY = "ccp_humor_study_state";
const VALID_HUMOR_ITEM_IDS = new Set(getHumorItems().map((item) => item.id));

export type HumorStudyState = {
  savedItemIds: string[];
  viewedItemIds: string[];
};

export type LocalHumorStudyAdapter = {
  readState(): HumorStudyState;
  toggleSaved(state: HumorStudyState, itemId: string): HumorStudyState;
  markViewed(state: HumorStudyState, itemId: string): HumorStudyState;
};

function sanitizeHumorStudyIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((candidate): candidate is string => typeof candidate === "string"))].filter(
    (itemId) => VALID_HUMOR_ITEM_IDS.has(itemId)
  );
}

function sanitizeHumorStudyState(value: unknown): HumorStudyState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      savedItemIds: [],
      viewedItemIds: []
    };
  }

  const candidate = value as {
    savedItemIds?: unknown;
    viewedItemIds?: unknown;
  };

  return {
    savedItemIds: sanitizeHumorStudyIds(candidate.savedItemIds),
    viewedItemIds: sanitizeHumorStudyIds(candidate.viewedItemIds)
  };
}

function writeState(storage: BrowserStorageAdapter, state: HumorStudyState) {
  storage.writeJson(HUMOR_STUDY_STORAGE_KEY, state);
}

function toggleItemId(ids: string[], itemId: string) {
  return ids.includes(itemId) ? ids.filter((candidate) => candidate !== itemId) : [...ids, itemId];
}

export function createLocalHumorStudyAdapter(
  storage: BrowserStorageAdapter = browserStorageAdapter
): LocalHumorStudyAdapter {
  return {
    readState() {
      return storage.readJson(HUMOR_STUDY_STORAGE_KEY, {
        fallbackValue: {
          savedItemIds: [],
          viewedItemIds: []
        },
        sanitize: sanitizeHumorStudyState
      });
    },

    toggleSaved(state, itemId) {
      if (!VALID_HUMOR_ITEM_IDS.has(itemId)) {
        return state;
      }

      const nextState = {
        ...state,
        savedItemIds: toggleItemId(state.savedItemIds, itemId)
      };

      writeState(storage, nextState);
      return nextState;
    },

    markViewed(state, itemId) {
      if (!VALID_HUMOR_ITEM_IDS.has(itemId) || state.viewedItemIds.includes(itemId)) {
        return state;
      }

      const nextState = {
        ...state,
        viewedItemIds: [...state.viewedItemIds, itemId]
      };

      writeState(storage, nextState);
      return nextState;
    }
  };
}

export const localHumorStudyAdapter = createLocalHumorStudyAdapter();

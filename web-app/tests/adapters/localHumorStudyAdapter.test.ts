import test from "node:test";
import assert from "node:assert/strict";
import {
  createLocalHumorStudyAdapter,
  type HumorStudyState
} from "../../src/adapters/localHumorStudyAdapter.js";
import type { BrowserStorageAdapter, BrowserStorageReader } from "../../src/adapters/browserStorage.js";

const HUMOR_STUDY_STORAGE_KEY = "ccp_humor_study_state";
const VALID_HUMOR_ITEM_ID = "humor_176";

function createMemoryStorage(seed: Record<string, unknown> = {}) {
  const store = structuredClone(seed);

  const storage: BrowserStorageAdapter = {
    readJson<T>(storageKey: string, reader: BrowserStorageReader<T>) {
      if (!(storageKey in store)) {
        return reader.fallbackValue;
      }

      return reader.sanitize(store[storageKey]);
    },

    writeJson<T>(storageKey: string, value: T) {
      store[storageKey] = structuredClone(value);
    }
  };

  return {
    storage,
    snapshot() {
      return structuredClone(store);
    }
  };
}

test("localHumorStudyAdapter sanitizes saved and viewed ids against real humor content", () => {
  const memory = createMemoryStorage({
    [HUMOR_STUDY_STORAGE_KEY]: {
      savedItemIds: [VALID_HUMOR_ITEM_ID, VALID_HUMOR_ITEM_ID, "missing-id", 42],
      viewedItemIds: ["missing-id", VALID_HUMOR_ITEM_ID]
    }
  });
  const adapter = createLocalHumorStudyAdapter(memory.storage);

  assert.deepEqual(adapter.readState(), {
    savedItemIds: [VALID_HUMOR_ITEM_ID],
    viewedItemIds: [VALID_HUMOR_ITEM_ID]
  });
});

test("localHumorStudyAdapter toggles saved items and marks viewed items once", () => {
  const memory = createMemoryStorage();
  const adapter = createLocalHumorStudyAdapter(memory.storage);
  const emptyState: HumorStudyState = {
    savedItemIds: [],
    viewedItemIds: []
  };

  const savedState = adapter.toggleSaved(emptyState, VALID_HUMOR_ITEM_ID);
  const unsavedState = adapter.toggleSaved(savedState, VALID_HUMOR_ITEM_ID);
  const viewedState = adapter.markViewed(savedState, VALID_HUMOR_ITEM_ID);
  const repeatedViewedState = adapter.markViewed(viewedState, VALID_HUMOR_ITEM_ID);

  assert.deepEqual(savedState.savedItemIds, [VALID_HUMOR_ITEM_ID]);
  assert.deepEqual(unsavedState.savedItemIds, []);
  assert.deepEqual(viewedState.viewedItemIds, [VALID_HUMOR_ITEM_ID]);
  assert.deepEqual(repeatedViewedState.viewedItemIds, [VALID_HUMOR_ITEM_ID]);
  assert.deepEqual(memory.snapshot()[HUMOR_STUDY_STORAGE_KEY], {
    savedItemIds: [VALID_HUMOR_ITEM_ID],
    viewedItemIds: [VALID_HUMOR_ITEM_ID]
  });
});

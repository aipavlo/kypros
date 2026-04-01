import test from "node:test";
import assert from "node:assert/strict";
import { browserStorageAdapter } from "../../src/adapters/browserStorage.js";

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function withMockedWindow(storage: MockStorage | undefined, callback: () => void) {
  const originalWindow = globalThis.window;

  if (storage) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: storage
      }
    });
  } else {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined
    });
  }

  try {
    callback();
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });
  }
}

test("browserStorageAdapter returns fallback when window is unavailable", () => {
  withMockedWindow(undefined, () => {
    const result = browserStorageAdapter.readJson("missing", {
      fallbackValue: ["fallback"],
      sanitize: (value) => value as string[]
    });

    assert.deepEqual(result, ["fallback"]);
  });
});

test("browserStorageAdapter sanitizes parsed localStorage value", () => {
  withMockedWindow(
    {
      getItem() {
        return JSON.stringify(["safe", "value"]);
      },
      setItem() {}
    },
    () => {
      const result = browserStorageAdapter.readJson("progress", {
        fallbackValue: [],
        sanitize: (value) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [])
      });

      assert.deepEqual(result, ["safe", "value"]);
    }
  );
});

test("browserStorageAdapter writes serialized JSON into localStorage", () => {
  let writtenValue = "";

  withMockedWindow(
    {
      getItem() {
        return null;
      },
      setItem(_key, value) {
        writtenValue = value;
      }
    },
    () => {
      browserStorageAdapter.writeJson("access", {
        entitlements: ["premium"]
      });
    }
  );

  assert.equal(writtenValue, JSON.stringify({ entitlements: ["premium"] }));
});

export type BrowserStorageReader<T> = {
  fallbackValue: T;
  sanitize: (value: unknown) => T;
};

export type BrowserStorageAdapter = {
  readJson<T>(storageKey: string, reader: BrowserStorageReader<T>): T;
  writeJson<T>(storageKey: string, value: T): void;
};

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export const browserStorageAdapter: BrowserStorageAdapter = {
  readJson<T>(storageKey: string, reader: BrowserStorageReader<T>) {
    const storage = getLocalStorage();

    if (!storage) {
      return reader.fallbackValue;
    }

    const rawValue = storage.getItem(storageKey);

    if (!rawValue) {
      return reader.fallbackValue;
    }

    try {
      return reader.sanitize(JSON.parse(rawValue));
    } catch {
      return reader.fallbackValue;
    }
  },

  writeJson<T>(storageKey: string, value: T) {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.setItem(storageKey, JSON.stringify(value));
  }
};

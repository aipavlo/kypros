import { browserStorageAdapter, type BrowserStorageAdapter } from "@/src/adapters/browserStorage";
import { getHumorItems } from "@/src/content/humorData";

const HUMOR_STATS_STORAGE_KEY = "ccp_humor_stats";
const VALID_HUMOR_ITEM_IDS = new Set(getHumorItems().map((item) => item.id));
const MAX_HUMOR_VIEWS = 100000;
const MAX_HUMOR_VOTES = 10000;

export type HumorStats = Record<string, { views: number; votes: number }>;

export type LocalHumorStatsAdapter = {
  readStats(): HumorStats;
  trackItemOpen(stats: HumorStats, itemId: string): HumorStats;
  voteItem(stats: HumorStats, itemId: string, delta: 1 | -1): HumorStats;
};

function sanitizeHumorStats(value: unknown): HumorStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const sanitizedEntries = Object.entries(value).flatMap(([itemId, rawStats]) => {
    if (!VALID_HUMOR_ITEM_IDS.has(itemId)) {
      return [];
    }

    if (!rawStats || typeof rawStats !== "object" || Array.isArray(rawStats)) {
      return [];
    }

    const candidate = rawStats as { views?: unknown; votes?: unknown };
    const views =
      typeof candidate.views === "number" && Number.isFinite(candidate.views)
        ? Math.max(0, Math.min(Math.trunc(candidate.views), MAX_HUMOR_VIEWS))
        : 0;
    const votes =
      typeof candidate.votes === "number" && Number.isFinite(candidate.votes)
        ? Math.max(-MAX_HUMOR_VOTES, Math.min(Math.trunc(candidate.votes), MAX_HUMOR_VOTES))
        : 0;

    return [[itemId, { views, votes }] as const];
  });

  return Object.fromEntries(sanitizedEntries);
}

function writeStats(storage: BrowserStorageAdapter, stats: HumorStats) {
  storage.writeJson(HUMOR_STATS_STORAGE_KEY, stats);
}

export function createLocalHumorStatsAdapter(
  storage: BrowserStorageAdapter = browserStorageAdapter
): LocalHumorStatsAdapter {
  return {
    readStats() {
      return storage.readJson(HUMOR_STATS_STORAGE_KEY, {
        fallbackValue: {},
        sanitize: sanitizeHumorStats
      });
    },

    trackItemOpen(stats, itemId) {
      if (!VALID_HUMOR_ITEM_IDS.has(itemId)) {
        return stats;
      }

      const previous = stats[itemId] ?? { views: 0, votes: 0 };
      const nextStats = {
        ...stats,
        [itemId]: {
          ...previous,
          views: Math.min(previous.views + 1, MAX_HUMOR_VIEWS)
        }
      };

      writeStats(storage, nextStats);
      return nextStats;
    },

    voteItem(stats, itemId, delta) {
      if (!VALID_HUMOR_ITEM_IDS.has(itemId)) {
        return stats;
      }

      const previous = stats[itemId] ?? { views: 0, votes: 0 };
      const nextStats = {
        ...stats,
        [itemId]: {
          ...previous,
          votes: Math.max(-MAX_HUMOR_VOTES, Math.min(previous.votes + delta, MAX_HUMOR_VOTES))
        }
      };

      writeStats(storage, nextStats);
      return nextStats;
    }
  };
}

export const localHumorStatsAdapter = createLocalHumorStatsAdapter();

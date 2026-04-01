import test from "node:test";
import assert from "node:assert/strict";
import {
  createLocalAppStateAdapter,
  type LearningProgressSnapshot
} from "../../src/adapters/localAppStateAdapter.js";
import { getModulesByTrack, getModulesByTrackAndDifficulty, getLessonsByModule } from "../../src/content/data.js";
import { getModuleProgressKey } from "../../src/content/progress.js";
import type { BrowserStorageAdapter, BrowserStorageReader } from "../../src/adapters/browserStorage.js";

const COMPLETED_LESSONS_STORAGE_KEY = "ccp_completed_lessons";
const REVIEWED_MODULES_STORAGE_KEY = "ccp_reviewed_modules";
const PASSED_MODULE_QUIZZES_STORAGE_KEY = "ccp_passed_module_quizzes";
const QUIZ_PROGRESS_STORAGE_KEY = "ccp_quiz_progress";

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

const greekModule = getModulesByTrackAndDifficulty("greek_b1", "a1")[0];
const greekLessonIds = getLessonsByModule(greekModule.id)
  .filter((lesson) => lesson.difficulty === "a1")
  .map((lesson) => lesson.id);
const greekProgressKey = getModuleProgressKey(greekModule.id, "greek_b1", "a1");
const cyprusModule = getModulesByTrack("cyprus_reality")[0];

test("localAppStateAdapter sanitizes legacy progress ids and quiz payload against real content", () => {
  const memory = createMemoryStorage({
    [COMPLETED_LESSONS_STORAGE_KEY]: [...greekLessonIds, "missing-lesson", 42],
    [REVIEWED_MODULES_STORAGE_KEY]: [greekModule.id, "invalid-module"],
    [PASSED_MODULE_QUIZZES_STORAGE_KEY]: [cyprusModule.id, "invalid-module"],
    [QUIZ_PROGRESS_STORAGE_KEY]: {
      mode_greek_a1: {
        attempts: 3.8,
        bestPercent: 150,
        lastPercent: -12,
        wrongQuestionIds: ["quiz_cy_001", "invalid-question"],
        weakModules: [greekModule.id, "m2", "m3", "m4", "m5", "m6"],
        weakSkills: ["grammar", "reading", 10, "listening", "writing", "extra"]
      },
      invalid_mode: {
        attempts: 10,
        bestPercent: 10,
        lastPercent: 10,
        wrongQuestionIds: ["quiz_cy_001"],
        weakModules: [],
        weakSkills: []
      }
    }
  });
  const adapter = createLocalAppStateAdapter(memory.storage);
  const snapshot = adapter.readLearningProgressSnapshot();

  assert.deepEqual(snapshot.completedLessonIds, greekLessonIds);
  assert.deepEqual(snapshot.reviewedModuleIds, [greekProgressKey]);
  assert.deepEqual(snapshot.passedModuleQuizIds, [cyprusModule.id]);
  assert.deepEqual(snapshot.quizProgress, {
    mode_greek_a1: {
      attempts: 3,
      bestPercent: 100,
      lastPercent: 0,
      wrongQuestionIds: ["quiz_cy_001"],
      weakModules: [greekModule.id, "m2", "m3", "m4", "m5"],
      weakSkills: ["grammar", "reading", "listening", "writing", "extra"]
    }
  });
});

test("localAppStateAdapter toggles completed lessons and persists the snapshot", () => {
  const memory = createMemoryStorage();
  const adapter = createLocalAppStateAdapter(memory.storage);
  const emptySnapshot: LearningProgressSnapshot = {
    completedLessonIds: [],
    reviewedModuleIds: [],
    passedModuleQuizIds: [],
    quizProgress: {}
  };

  const completedSnapshot = adapter.toggleCompletedLesson(emptySnapshot, greekLessonIds[0]);
  const revertedSnapshot = adapter.toggleCompletedLesson(completedSnapshot, greekLessonIds[0]);

  assert.deepEqual(completedSnapshot.completedLessonIds, [greekLessonIds[0]]);
  assert.deepEqual(revertedSnapshot.completedLessonIds, []);
  assert.deepEqual(memory.snapshot()[COMPLETED_LESSONS_STORAGE_KEY], []);
});

test("localAppStateAdapter sanitizes access state and last opened context before saving", () => {
  const memory = createMemoryStorage();
  const adapter = createLocalAppStateAdapter(memory.storage);

  const accessState = adapter.saveAccessState({
    entitlements: ["premium", "premium", "cyprus"],
    accessSource: "invalid" as "local"
  });
  const context = adapter.saveLastOpenedContext({
    trackId: "greek_b1",
    moduleId: greekModule.id,
    lessonId: "missing-lesson",
    origin: "lesson_flow"
  });

  assert.deepEqual(accessState, {
    entitlements: ["premium", "cyprus"],
    accessSource: "local"
  });
  assert.deepEqual(context, {
    trackId: "greek_b1",
    moduleId: greekModule.id,
    lessonId: undefined,
    origin: "lesson_flow"
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { getModulesByTrackAndDifficulty, getModulesByTrack } from "../../src/content/data.js";
import { getQuizQuestionsByMode } from "../../src/content/quizData.js";
import {
  getCompactRetryQuestionIds,
  getReviewPlan,
  getReviewSummaries,
  getRetrySelfCheckItems
} from "../../src/content/review.js";

const greekModule = getModulesByTrackAndDifficulty("greek_b1", "a1")[0];
const cyprusModule = getModulesByTrack("cyprus_reality")[0];

test("getReviewSummaries filters empty entries and sorts by retry weight", () => {
  const summaries = getReviewSummaries({
    mode_greek_a1: {
      attempts: 2,
      bestPercent: 80,
      lastPercent: 62,
      wrongQuestionIds: ["quiz_cy_001"],
      weakModules: [greekModule.id],
      weakSkills: ["grammar"]
    },
    mode_cyprus_reality: {
      attempts: 1,
      bestPercent: 50,
      lastPercent: 41,
      wrongQuestionIds: ["quiz_cy_002", "quiz_cy_003"],
      weakModules: [],
      weakSkills: ["history"]
    },
    mode_greek_b1: {
      attempts: 3,
      bestPercent: 90,
      lastPercent: 90,
      wrongQuestionIds: [],
      weakModules: [],
      weakSkills: []
    },
    unknown_mode: {
      attempts: 4,
      bestPercent: 10,
      lastPercent: 10,
      wrongQuestionIds: ["quiz_cy_001"],
      weakModules: [greekModule.id],
      weakSkills: []
    }
  });

  assert.deepEqual(
    summaries.map((summary) => summary.modeId),
    ["mode_greek_a1", "mode_cyprus_reality"]
  );
  assert.equal(summaries[0].title, "Греческий A1");
  assert.equal(summaries[0].weakModules[0], greekModule.id);
});

test("getReviewPlan builds direct retry links for greek and cyprus modules", () => {
  const plan = getReviewPlan(
    {
      mode_greek_a1: {
        attempts: 2,
        bestPercent: 80,
        lastPercent: 62,
        wrongQuestionIds: ["quiz_cy_001"],
        weakModules: [greekModule.id],
        weakSkills: ["grammar"]
      },
      mode_cyprus_reality: {
        attempts: 1,
        bestPercent: 50,
        lastPercent: 41,
        wrongQuestionIds: ["quiz_cy_002"],
        weakModules: [cyprusModule.id],
        weakSkills: ["history"]
      }
    },
    2
  );

  assert.deepEqual(
    plan.map((item) => item.modeId),
    ["mode_cyprus_reality", "mode_greek_a1"]
  );
  assert.equal(plan[0].lessonLink, `/lessons?module=${cyprusModule.id}&source=quiz`);
  assert.equal(
    plan[0].flashcardsLink,
    `/flashcards?track=cyprus_reality&module=${cyprusModule.id}`
  );
  assert.equal(plan[1].lessonLink, `/lessons?stage=a1&module=${greekModule.id}&source=quiz`);
  assert.equal(plan[1].flashcardsLink, `/flashcards?track=greek_b1&module=${greekModule.id}`);
  assert.equal(plan[1].retryLink, "/quiz?mode=mode_greek_a1&retry=mistakes");
  assert.match(plan[1].packTitle, /Correction loop:/);
  assert.match(plan[1].selfCheckDescription, /remediation-entry/);
  assert.match(plan[1].quickReturnDescription, /self-check/);
  assert.match(plan[1].fullLessonDescription, /полный учебный путь/);
});

test("compact retry keeps only a short focused subset of wrong questions", () => {
  const greekQuestions = getQuizQuestionsByMode("mode_greek_a1");
  const compactIds = getCompactRetryQuestionIds(
    ["quiz_gr_012", "quiz_gr_013", "quiz_gr_014", "quiz_gr_015"],
    greekQuestions
  );

  assert.deepEqual(compactIds, ["quiz_gr_012", "quiz_gr_013", "quiz_gr_014"]);
});

test("retry self-check builds correction cards from saved weak questions", () => {
  const greekQuestions = getQuizQuestionsByMode("mode_greek_a1");
  const selfCheckItems = getRetrySelfCheckItems(
    ["quiz_gr_012", "quiz_gr_014"],
    greekQuestions
  );

  assert.equal(selfCheckItems.length, 2);
  assert.match(selfCheckItems[0].question, /Как переводится форма|Что означает/);
  assert.ok(selfCheckItems[0].correctAnswer.length > 0);
  assert.ok(selfCheckItems[0].explanation.length > 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import learningPathsJson from "@content/05-seed-data/learning-paths.json";
import sentenceReviewJson from "@content/02-greek-b1/sentence-review.json";
import scenarioPacksJson from "@content/07-everyday-greek/scenario-packs.json";
import { lessons } from "../../src/content/catalogData.js";
import { quizzes } from "../../src/content/quizData.js";
import { easyStartLessonIds, trailDefinitions } from "../../src/content/trails.js";

const lessonIds = new Set(lessons.map((lesson) => lesson.id));
const quizIds = new Set(quizzes.map((quiz) => quiz.id));
const scenarioPacks = scenarioPacksJson as Array<{
  id: string;
  phrasePack: Array<{ greek: string; translation: string; transliteration?: string }>;
  productionPrompt: string;
  selfCheck: string;
  links: {
    lessonIds: string[];
    trailIds: string[];
  };
}>;
const sentenceReviewPacks = sentenceReviewJson as Array<{
  id: string;
  trackId: string;
  moduleId: string;
  lessonId: string;
  difficulty: string;
  exercises: Array<{
    id: string;
    type: "cloze" | "rebuild";
    prompt: string;
    translation: string;
    answer: string;
    options?: string[];
    parts?: string[];
  }>;
}>;
const compactPhrasebookTrailIds: string[] = [
  "trail_souvlaki_starter",
  "trail_home_setup_no_drama",
  "trail_taverna_ninja",
  "trail_no_english_pls",
  "trail_doctor_pharmacy_follow_up",
  "trail_kep_survival_mode",
  "trail_kep_to_resolution"
] as const;

test("easy-start path points only to real lessons and keeps both product tracks represented", () => {
  const easyStartTrackIds = new Set<string>();

  for (const lessonId of easyStartLessonIds) {
    const lesson = lessons.find((item) => item.id === lessonId);

    assert.ok(lesson, `Expected easy-start lesson to exist: ${lessonId}`);
    easyStartTrackIds.add(lesson.trackId);
  }

  assert.deepEqual([...easyStartTrackIds].sort(), ["cyprus_reality", "greek_b1"]);
});

test("trail definitions reference real lessons without duplicate steps inside a trail", () => {
  const trailIds = new Set<string>();

  for (const trail of trailDefinitions) {
    assert.equal(trailIds.has(trail.id), false, `Duplicate trail id: ${trail.id}`);
    trailIds.add(trail.id);
    assert.ok(trail.lessonIds.length > 0, `Trail should not be empty: ${trail.id}`);
    assert.equal(
      new Set(trail.lessonIds).size,
      trail.lessonIds.length,
      `Trail should not repeat lesson ids: ${trail.id}`
    );

    for (const lessonId of trail.lessonIds) {
      assert.ok(lessonIds.has(lessonId), `Trail ${trail.id} references missing lesson ${lessonId}`);
    }
  }
});

test("scenario packs stay compact, practical and tied to real lessons or trails", () => {
  const trailIds = new Set<string>(trailDefinitions.map((trail) => trail.id));
  const scenarioIds = new Set<string>();

  assert.ok(scenarioPacks.length >= 10 && scenarioPacks.length <= 15);

  for (const pack of scenarioPacks) {
    assert.equal(scenarioIds.has(pack.id), false, `Duplicate scenario pack id: ${pack.id}`);
    scenarioIds.add(pack.id);
    assert.ok(pack.phrasePack.length >= 3 && pack.phrasePack.length <= 5, `Scenario pack should stay compact: ${pack.id}`);
    assert.match(pack.selfCheck, /\?/);
    assert.ok(pack.productionPrompt.length > 24, `Scenario pack needs a real production prompt: ${pack.id}`);
    assert.ok(
      pack.links.lessonIds.length > 0 || pack.links.trailIds.length > 0,
      `Scenario pack should link back into the product: ${pack.id}`
    );

    for (const phrase of pack.phrasePack) {
      assert.ok(phrase.greek.length > 0, `Scenario phrase needs Greek text: ${pack.id}`);
      assert.ok(phrase.translation.length > 0, `Scenario phrase needs translation: ${pack.id}`);
    }

    for (const lessonId of pack.links.lessonIds) {
      assert.ok(lessonIds.has(lessonId), `Scenario pack ${pack.id} references missing lesson ${lessonId}`);
    }

    for (const trailId of pack.links.trailIds) {
      assert.ok(trailIds.has(trailId), `Scenario pack ${pack.id} references missing trail ${trailId}`);
    }
  }
});

test("sentence review packs stay scoped to real greek lessons and mix cloze with rebuild practice", () => {
  const sentenceReviewIds = new Set<string>();

  assert.ok(sentenceReviewPacks.length >= 6, "Sentence review layer should cover multiple key Greek lessons");

  for (const pack of sentenceReviewPacks) {
    assert.equal(sentenceReviewIds.has(pack.id), false, `Duplicate sentence review pack id: ${pack.id}`);
    sentenceReviewIds.add(pack.id);
    assert.equal(pack.trackId, "greek_b1");
    assert.ok(lessonIds.has(pack.lessonId), `Sentence review pack references missing lesson ${pack.lessonId}`);
    assert.ok(pack.exercises.length >= 3 && pack.exercises.length <= 4, `Sentence review pack should stay compact: ${pack.id}`);

    const exerciseTypes = new Set(pack.exercises.map((exercise) => exercise.type));
    assert.ok(exerciseTypes.has("cloze"), `Sentence review pack needs a cloze item: ${pack.id}`);
    assert.ok(exerciseTypes.has("rebuild"), `Sentence review pack needs a rebuild item: ${pack.id}`);

    for (const exercise of pack.exercises) {
      assert.ok(exercise.prompt.length > 8, `Sentence review prompt should be readable: ${exercise.id}`);
      assert.ok(exercise.translation.length > 8, `Sentence review translation should be readable: ${exercise.id}`);
      assert.ok(exercise.answer.length > 2, `Sentence review answer should be non-trivial: ${exercise.id}`);

      if (exercise.type === "cloze") {
        assert.match(exercise.prompt, /____/);
        assert.ok((exercise.options?.length ?? 0) >= 3, `Cloze item should offer options: ${exercise.id}`);
      }

      if (exercise.type === "rebuild") {
        assert.ok((exercise.parts?.length ?? 0) >= 2, `Rebuild item should include parts: ${exercise.id}`);
      }
    }
  }
});

test("phrasebook-style scenario trails stay compact and practical", () => {
  const trailById = new Map<string, (typeof trailDefinitions)[number]>(
    trailDefinitions.map((trail) => [trail.id, trail] as const)
  );

  for (const trailId of compactPhrasebookTrailIds) {
    const trail = trailById.get(trailId);

    assert.ok(trail, `Expected phrasebook trail to exist: ${trailId}`);
    assert.ok(trail.lessonIds.length > 0, `Phrasebook trail should not be empty: ${trailId}`);
    assert.ok(trail.lessonIds.length <= 8, `Phrasebook trail should stay compact: ${trailId}`);
    assert.notEqual(trail.tone, "history", `Phrasebook trail should stay practical: ${trailId}`);
    assert.match(trail.result, /^После прохождения ты /);
    assert.ok(trail.focus.length > 0, `Phrasebook trail should have focus tags: ${trailId}`);
  }
});

test("editorial learning paths use only real lesson and quiz ids with normalized quiz prefixes", () => {
  for (const learningPath of learningPathsJson) {
    assert.ok(learningPath.steps.length > 0, `Learning path should not be empty: ${learningPath.id}`);

    for (const stepId of learningPath.steps) {
      assert.equal(
        stepId.startsWith("квиз_"),
        false,
        `Learning path ${learningPath.id} uses legacy quiz prefix: ${stepId}`
      );

      if (stepId.startsWith("gr_lesson_") || stepId.startsWith("cy_lesson_")) {
        assert.ok(lessonIds.has(stepId), `Learning path ${learningPath.id} references missing lesson ${stepId}`);
        continue;
      }

      if (stepId.startsWith("quiz_")) {
        assert.ok(quizIds.has(stepId), `Learning path ${learningPath.id} references missing quiz ${stepId}`);
        continue;
      }

      assert.fail(`Learning path ${learningPath.id} uses unsupported step id ${stepId}`);
    }
  }
});

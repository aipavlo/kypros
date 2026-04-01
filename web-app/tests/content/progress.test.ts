import test from "node:test";
import assert from "node:assert/strict";
import {
  getLessonsByModule,
  getModulesByTrack,
  getModulesByTrackAndDifficulty
} from "../../src/content/data.js";
import {
  getModuleCycleStatus,
  getModuleNextLearningAction,
  getModuleProgressKey,
  getUnlockedModuleIds
} from "../../src/content/progress.js";

const greekStageId = "a1";
const greekModules = getModulesByTrackAndDifficulty("greek_b1", greekStageId);
const firstGreekModule = greekModules[0];
const secondGreekModule = greekModules[1];
const firstGreekLessons = getLessonsByModule(firstGreekModule.id).filter(
  (lesson) => lesson.difficulty === greekStageId
);
const firstGreekLessonIds = firstGreekLessons.map((lesson) => lesson.id);
const firstGreekProgressKey = getModuleProgressKey(firstGreekModule.id, "greek_b1", greekStageId);
const cyprusModules = getModulesByTrack("cyprus_reality");

test("getModuleProgressKey keeps greek progress stage-aware and cyprus progress stable", () => {
  assert.equal(firstGreekProgressKey, `${firstGreekModule.id}::${greekStageId}`);
  assert.equal(
    getModuleProgressKey(cyprusModules[0].id, "cyprus_reality"),
    cyprusModules[0].id
  );
});

test("getModuleCycleStatus reaches 100 percent for completed greek module stage", () => {
  const status = getModuleCycleStatus(
    firstGreekModule.id,
    firstGreekLessonIds,
    [firstGreekProgressKey],
    [firstGreekProgressKey],
    "greek_b1",
    greekStageId
  );

  assert.equal(status.completedLessonCount, firstGreekLessonIds.length);
  assert.equal(status.lessonsDone, true);
  assert.equal(status.reviewDone, true);
  assert.equal(status.quizDone, true);
  assert.equal(status.completed, true);
  assert.equal(status.progressPercent, 100);
});

test("getModuleNextLearningAction follows lesson to flashcards to quiz to next-module order", () => {
  const lessonAction = getModuleNextLearningAction(
    firstGreekModule.id,
    [],
    [],
    [],
    "greek_b1",
    greekStageId
  );
  const flashcardsAction = getModuleNextLearningAction(
    firstGreekModule.id,
    firstGreekLessonIds,
    [],
    [],
    "greek_b1",
    greekStageId
  );
  const quizAction = getModuleNextLearningAction(
    firstGreekModule.id,
    firstGreekLessonIds,
    [firstGreekProgressKey],
    [],
    "greek_b1",
    greekStageId
  );
  const nextModuleAction = getModuleNextLearningAction(
    firstGreekModule.id,
    firstGreekLessonIds,
    [firstGreekProgressKey],
    [firstGreekProgressKey],
    "greek_b1",
    greekStageId
  );
  const secondModuleLesson = getLessonsByModule(secondGreekModule.id).find(
    (lesson) => lesson.difficulty === greekStageId
  );

  assert.equal(lessonAction.kind, "lesson");
  assert.match(lessonAction.to, new RegExp(`/lessons/${firstGreekLessonIds[0]}\\?source=loop$`));

  assert.equal(flashcardsAction.kind, "flashcards");
  assert.equal(flashcardsAction.to, `/flashcards?track=greek_b1&module=${firstGreekModule.id}`);

  assert.equal(quizAction.kind, "quiz");
  assert.equal(quizAction.to, `/quiz?mode=mode_greek_${greekStageId}&module=${firstGreekModule.id}`);

  assert.equal(nextModuleAction.kind, "next_module");
  assert.match(
    nextModuleAction.to,
    new RegExp(`/lessons/${secondModuleLesson?.id}\\?source=loop$`)
  );
});

test("getUnlockedModuleIds opens only the first module until previous module is fully completed", () => {
  const lockedAfterFirst = getUnlockedModuleIds(
    greekModules.slice(0, 2),
    [],
    [],
    [],
    "greek_b1",
    greekStageId
  );
  const unlockedAfterCompletion = getUnlockedModuleIds(
    greekModules.slice(0, 2),
    firstGreekLessonIds,
    [firstGreekProgressKey],
    [firstGreekProgressKey],
    "greek_b1",
    greekStageId
  );

  assert.deepEqual(lockedAfterFirst, [firstGreekModule.id]);
  assert.deepEqual(unlockedAfterCompletion, [firstGreekModule.id, secondGreekModule.id]);
});

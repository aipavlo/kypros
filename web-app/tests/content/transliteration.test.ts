import test from "node:test";
import assert from "node:assert/strict";
import { getFlashcardPronunciation, transliterateGreekToLatin } from "../../src/content/transliteration.js";

test("transliterateGreekToLatin returns english-friendly reading for greek words and phrases", () => {
  assert.equal(transliterateGreekToLatin("Παρακαλώ"), "Parakalo");
  assert.equal(transliterateGreekToLatin("Μένω στη Λάρνακα"), "Meno sti Larnaka");
  assert.equal(transliterateGreekToLatin("Κυπριακή Δημοκρατία"), "Kypriaki Dimokratia");
});

test("getFlashcardPronunciation prefers explicit transliteration and skips non-greek fronts", () => {
  assert.equal(
    getFlashcardPronunciation({
      id: "custom",
      trackId: "greek_b1",
      front: "διαβατήριο",
      back: "паспорт",
      transliteration: "diavatirio",
      tags: [],
      difficulty: "a1"
    }),
    "diavatirio"
  );

  assert.equal(
    getFlashcardPronunciation({
      id: "english",
      trackId: "cyprus_reality",
      front: "1959 agreements",
      back: "соглашения",
      tags: [],
      difficulty: "b1"
    }),
    null
  );
});

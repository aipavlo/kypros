import test from "node:test";
import assert from "node:assert/strict";
import {
  getFlashcardPronunciation,
  transliterateGreekToLatin,
  transliterateGreekToLatinWithStress
} from "../../src/content/transliteration.js";

test("transliterateGreekToLatin returns english-friendly reading for greek words and phrases", () => {
  assert.equal(transliterateGreekToLatin("Παρακαλώ"), "Parakalo");
  assert.equal(transliterateGreekToLatin("Μένω στη Λάρνακα"), "Meno sti Larnaka");
  assert.equal(transliterateGreekToLatin("Κυπριακή Δημοκρατία"), "Kipriaki Dimokratia");
  assert.equal(transliterateGreekToLatin("ευχαριστώ"), "efharisto");
  assert.equal(transliterateGreekToLatin("μπαμπάς"), "babas");
  assert.equal(transliterateGreekToLatin("γεια"), "yia");
  assert.equal(transliterateGreekToLatin("διεύθυνση"), "diefthinsi");
});

test("transliterateGreekToLatinWithStress adds an english-friendly stress marker after the stressed sound", () => {
  assert.equal(transliterateGreekToLatinWithStress("Παρακαλώ"), "Parakalo'");
  assert.equal(transliterateGreekToLatinWithStress("Μένω στη Λάρνακα"), "Me'no sti La'rnaka");
  assert.equal(transliterateGreekToLatinWithStress("αίτηση"), "i'tisi");
  assert.equal(transliterateGreekToLatinWithStress("ευχαριστώ"), "efharisto'");
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

  assert.equal(
    getFlashcardPronunciation(
      {
        id: "accented",
        trackId: "greek_b1",
        front: "Παρακαλώ",
        back: "пожалуйста",
        tags: [],
        difficulty: "a1"
      },
      { includeStress: true }
    ),
    "Parakalo'"
  );
});

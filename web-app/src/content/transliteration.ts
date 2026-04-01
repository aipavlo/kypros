import type { FlashcardItem } from "@/src/content/types";

const GREEK_LETTER_PATTERN = /[\u0370-\u03ff\u1f00-\u1fff]/i;
const GREEK_COMBINING_STRESS_PATTERN = /[\u0301\u0342]/u;
const VOICELESS_CONSONANTS = new Set(["κ", "π", "τ", "ξ", "σ", "ς", "φ", "θ", "χ", "ψ"]);
const GREEK_VOWELS = new Set(["α", "ε", "η", "ι", "ο", "υ", "ω"]);

const LETTER_MAP: Record<string, string> = {
  α: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "i",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "i",
  φ: "f",
  χ: "h",
  ψ: "ps",
  ω: "o"
};

function getNormalizedGreekLetters(value: string) {
  const letters: Array<{ value: string; stressed: boolean }> = [];

  for (const character of value.normalize("NFD")) {
    if (/\p{L}/u.test(character)) {
      letters.push({
        value: character === "ς" ? "σ" : character.toLowerCase(),
        stressed: false
      });
      continue;
    }

    if (GREEK_COMBINING_STRESS_PATTERN.test(character) && letters.length > 0) {
      letters[letters.length - 1].stressed = true;
    }
  }

  return letters;
}

function startsWithFrontVowelSound(
  letters: Array<{ value: string; stressed: boolean }>,
  index: number
) {
  const pair = `${letters[index]?.value ?? ""}${letters[index + 1]?.value ?? ""}`;

  if (pair === "αι" || pair === "ει" || pair === "οι" || pair === "υι") {
    return true;
  }

  const nextValue = letters[index]?.value;
  return nextValue === "ε" || nextValue === "η" || nextValue === "ι" || nextValue === "υ";
}

function appendChunk(
  currentValue: string,
  chunk: string,
  includeStress: boolean,
  stressed: boolean
) {
  if (includeStress && stressed) {
    return currentValue + chunk + "'";
  }

  return currentValue + chunk;
}

function soundsLikeSoftStop(
  letters: Array<{ value: string; stressed: boolean }>,
  index: number
) {
  return index === 0 || GREEK_VOWELS.has(letters[index - 1]?.value ?? "");
}

function transliterateGreekWord(word: string, includeStress = false) {
  const normalizedLetters = getNormalizedGreekLetters(word);
  let index = 0;
  let transliteratedWord = "";

  while (index < normalizedLetters.length) {
    const currentLetter = normalizedLetters[index];
    const nextLetter = normalizedLetters[index + 1];
    const digraph = `${currentLetter?.value ?? ""}${nextLetter?.value ?? ""}`;
    const digraphStressed = Boolean(currentLetter?.stressed || nextLetter?.stressed);

    if (digraph === "αι" || digraph === "ει" || digraph === "οι" || digraph === "υι") {
      transliteratedWord = appendChunk(transliteratedWord, "i", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (digraph === "ου") {
      transliteratedWord = appendChunk(transliteratedWord, "ou", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (digraph === "αυ" || digraph === "ευ" || digraph === "ηυ") {
      const nextSoundLetter = normalizedLetters[index + 2]?.value ?? "";
      const voicedChunk = digraph === "αυ" ? "av" : digraph === "ευ" ? "ev" : "iv";
      const voicelessChunk = digraph === "αυ" ? "af" : digraph === "ευ" ? "ef" : "if";
      transliteratedWord = appendChunk(
        transliteratedWord,
        VOICELESS_CONSONANTS.has(nextSoundLetter) ? voicelessChunk : voicedChunk,
        includeStress,
        digraphStressed
      );
      index += 2;
      continue;
    }

    if (digraph === "γγ") {
      transliteratedWord = appendChunk(transliteratedWord, "ng", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (digraph === "γχ") {
      transliteratedWord = appendChunk(transliteratedWord, "nh", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (digraph === "γκ") {
      transliteratedWord = appendChunk(
        transliteratedWord,
        soundsLikeSoftStop(normalizedLetters, index) ? "g" : "ng",
        includeStress,
        digraphStressed
      );
      index += 2;
      continue;
    }

    if (digraph === "μπ") {
      transliteratedWord = appendChunk(
        transliteratedWord,
        soundsLikeSoftStop(normalizedLetters, index) ? "b" : "mb",
        includeStress,
        digraphStressed
      );
      index += 2;
      continue;
    }

    if (digraph === "ντ") {
      transliteratedWord = appendChunk(
        transliteratedWord,
        soundsLikeSoftStop(normalizedLetters, index) ? "d" : "nd",
        includeStress,
        digraphStressed
      );
      index += 2;
      continue;
    }

    if (digraph === "τσ") {
      transliteratedWord = appendChunk(transliteratedWord, "ts", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (digraph === "τζ") {
      transliteratedWord = appendChunk(transliteratedWord, "tz", includeStress, digraphStressed);
      index += 2;
      continue;
    }

    if (currentLetter?.value === "γ" && startsWithFrontVowelSound(normalizedLetters, index + 1)) {
      transliteratedWord = appendChunk(transliteratedWord, "y", includeStress, Boolean(currentLetter.stressed));
      index += 1;
      continue;
    }

    transliteratedWord = appendChunk(
      transliteratedWord,
      LETTER_MAP[currentLetter?.value ?? ""] ?? currentLetter?.value ?? "",
      includeStress,
      Boolean(currentLetter?.stressed)
    );
    index += 1;
  }

  if (/^\p{Lu}/u.test(word)) {
    return transliteratedWord.charAt(0).toUpperCase() + transliteratedWord.slice(1);
  }

  return transliteratedWord;
}

export function transliterateGreekToLatin(value: string) {
  if (!GREEK_LETTER_PATTERN.test(value)) {
    return null;
  }

  return value.replace(/\p{L}+/gu, (word) =>
    GREEK_LETTER_PATTERN.test(word) ? transliterateGreekWord(word) : word
  );
}

export function transliterateGreekToLatinWithStress(value: string) {
  if (!GREEK_LETTER_PATTERN.test(value)) {
    return null;
  }

  return value.replace(/\p{L}+/gu, (word) =>
    GREEK_LETTER_PATTERN.test(word) ? transliterateGreekWord(word, true) : word
  );
}

export function getFlashcardPronunciation(card: FlashcardItem, options?: { includeStress?: boolean }) {
  if (card.transliteration) {
    return card.transliteration;
  }

  return options?.includeStress ? transliterateGreekToLatinWithStress(card.front) : transliterateGreekToLatin(card.front);
}

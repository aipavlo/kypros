import type { FlashcardItem } from "@/src/content/types";

const GREEK_LETTER_PATTERN = /[\u0370-\u03ff\u1f00-\u1fff]/i;

const DIGRAPH_MAP: Array<[string, string]> = [
  ["αι", "ai"],
  ["ει", "ei"],
  ["οι", "oi"],
  ["ου", "ou"],
  ["αυ", "av"],
  ["ευ", "ev"],
  ["ηυ", "iv"],
  ["γγ", "ng"],
  ["γκ", "gk"],
  ["γχ", "nch"],
  ["μπ", "mp"],
  ["ντ", "nt"],
  ["τσ", "ts"],
  ["τζ", "tz"]
];

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
  υ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o"
};

function normalizeGreek(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ");
}

function transliterateGreekWord(word: string) {
  const normalizedWord = normalizeGreek(word).toLowerCase();
  let index = 0;
  let transliteratedWord = "";

  while (index < normalizedWord.length) {
    const digraph = normalizedWord.slice(index, index + 2);
    const mappedDigraph = DIGRAPH_MAP.find(([pattern]) => pattern === digraph)?.[1];

    if (mappedDigraph) {
      transliteratedWord += mappedDigraph;
      index += 2;
      continue;
    }

    const currentLetter = normalizedWord[index];
    transliteratedWord += LETTER_MAP[currentLetter] ?? currentLetter;
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

export function getFlashcardPronunciation(card: FlashcardItem) {
  if (card.transliteration) {
    return card.transliteration;
  }

  return transliterateGreekToLatin(card.front);
}

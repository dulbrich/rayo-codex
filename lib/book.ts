import {
  type Address, CHAPTERS_PER_VOLUME, MAX_LETTERS, MAX_SYLLABLES, PHRASES_PER_VERSE,
  SYLLABLES_PER_CHAPTER, SYLLABLES_PER_PHRASE, SYLLABLES_PER_VERSE, VERSES_PER_CHAPTER,
  isAddressArchived, padded, startSyllable, syllablesAt,
} from "./codex";

export const OPENING: Address = { volume: 1, chapter: 1, verse: 1, phrase: 1 };
export const VERSES_PER_PAGE = 5;
export const PAGES_PER_CHAPTER = VERSES_PER_CHAPTER / VERSES_PER_PAGE;
export const INDEXED_CHAPTERS = MAX_SYLLABLES / SYLLABLES_PER_CHAPTER;
export const PAGE_COUNT = INDEXED_CHAPTERS * PAGES_PER_CHAPTER;

export function pageOf(address: Address) {
  return Math.floor((startSyllable(address) - 1) / (SYLLABLES_PER_VERSE * VERSES_PER_PAGE));
}

export function addressAtLetter(letter: number): Address {
  if (!Number.isSafeInteger(letter) || letter < 1 || letter > MAX_LETTERS) {
    throw new RangeError("Letter outside the indexed archive.");
  }
  const syllable = Math.floor((letter - 1) / 3);
  const chapter = Math.floor(syllable / SYLLABLES_PER_CHAPTER);
  return {
    volume: 1 + Math.floor(chapter / CHAPTERS_PER_VOLUME),
    chapter: 1 + chapter % CHAPTERS_PER_VOLUME,
    verse: 1 + Math.floor(syllable / SYLLABLES_PER_VERSE) % VERSES_PER_CHAPTER,
    phrase: 1 + Math.floor(syllable / SYLLABLES_PER_PHRASE) % PHRASES_PER_VERSE,
  };
}

export function openingOfPage(index: number): Address {
  return addressAtLetter(1 + index * VERSES_PER_PAGE * SYLLABLES_PER_VERSE * 3);
}

export function passageHref(address: Address, includePhrase = false) {
  const params = new URLSearchParams({
    v: String(address.volume), c: String(address.chapter), vr: String(address.verse),
  });
  if (includePhrase) params.set("p", String(address.phrase));
  return "/?" + params.toString();
}

export function parsePassage(params: URLSearchParams): Address | null {
  const address = {
    volume: Number(params.get("v") ?? 1), chapter: Number(params.get("c") ?? 1),
    verse: Number(params.get("vr") ?? 1), phrase: Number(params.get("p") ?? 1),
  };
  return isAddressArchived(address) ? address : null;
}

export function phrasesOfVerse(digits: string, address: Address): string[][] {
  const first = startSyllable({ ...address, phrase: 1 });
  const verse = syllablesAt(digits, first, SYLLABLES_PER_VERSE);
  return Array.from({ length: PHRASES_PER_VERSE }, (_, i) => {
    const offset = i * SYLLABLES_PER_PHRASE;
    return verse.slice(offset, offset + SYLLABLES_PER_PHRASE);
  });
}

export function twoDigits(value: number) {
  return padded(value, 2);
}

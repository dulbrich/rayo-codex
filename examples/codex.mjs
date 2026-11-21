import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function index(value, limit, name) {
  if (!Number.isSafeInteger(value) || value < 1 || value > limit)
    throw new RangeError(name + " outside the available range");
  return value - 1;
}

export class CodexReader {
  #digits;
  constructor(digits) {
    this.#digits = digits.trim();
    if (!this.#digits || /[^0-9]/.test(this.#digits) || this.#digits.length % 2)
      throw new Error("Expected decimal digits of pi in complete pairs, without 3.");
  }

  syllable(position) {
    const i = 2 * index(position, this.#digits.length / 2, "Syllable");
    const a = Number(this.#digits[i]), b = Number(this.#digits[i + 1]);
    return "lmnrsvzfkt"[a] + "aeiou"[Math.floor(b / 2)] + "nlkstfmpdr"[(a + b) % 10];
  }

  passage(start, count) {
    const offset = index(start, this.#digits.length / 2, "Start");
    index(count, this.#digits.length / 2 - offset, "Count");
    return Array.from({ length: count }, (_, i) => this.syllable(start + i)).join("-");
  }

  phrase(volume, chapter, verse, phrase) {
    const v = index(volume, Math.ceil(this.#digits.length / 8000000), "Volume");
    const c = index(chapter, 1000, "Chapter");
    const line = index(verse, 100, "Verse"), p = index(phrase, 10, "Phrase");
    return this.passage(1 + ((v * 1000 + c) * 100 + line) * 40 + p * 4, 4);
  }

  verse(volume, chapter, verse) {
    return Array.from({ length: 10 }, (_, i) => this.phrase(volume, chapter, verse, i + 1)).join(" ");
  }

  chapter(volume, chapter) {
    return Array.from({ length: 100 }, (_, i) =>
      (i + 1) + ". " + this.verse(volume, chapter, i + 1)).join("\n");
  }
}

export function passage(digits, start, count) {
  return new CodexReader(digits).passage(start, count);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [volume = "1", chapter = "1", ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error("Usage: node codex.mjs [volume] [chapter]");
  const reader = new CodexReader(readFileSync("pi.txt", "utf8"));
  console.log(reader.chapter(Number(volume), Number(chapter)));
}

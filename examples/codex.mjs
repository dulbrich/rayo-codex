import { readFileSync } from "node:fs";

// start is a one-based syllable position; count is the number to read.
export function passage(digits, start, count) {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(count) ||
      start < 1 || count < 1 || count > Math.floor(digits.length / 2) - start + 1) {
    throw new RangeError("Passage outside the digit file");
  }
  const syllables = [];
  for (let i = start - 1; i < start - 1 + count; i++) {
    const pair = digits.slice(2 * i, 2 * i + 2);
    if (!/^[0-9]{2}$/.test(pair)) throw new Error("Expected decimal digits");
    const a = Number(pair[0]), b = Number(pair[1]);
    syllables.push("lmnrsvzfkt"[a] + "aeiou"[Math.floor(b / 2)] + "nlkstfmpdr"[(a + b) % 10]);
  }
  return syllables.join("-");
}

const digits = readFileSync("pi.txt", "utf8").trim();
console.log(passage(digits, 1, 4));

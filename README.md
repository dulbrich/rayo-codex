# Rayo Codex

A pocket-sized book reader for the mathematical word David and his son Harvey invented together.

## The idea

David and Harvey wanted to invent the longest word they could imagine and still be able to pronounce it one piece at a time. They chose Rayo's number as its length in letters and gave it the fictional definition **"something specific to happen."** Each consecutive pair of decimal digits of pi after the decimal point selects one of 100 unique, pronounceable three-letter syllables.

- Onsets: `LMNRSVZFKT`
- Vowels: `AEIOU`
- Codas: `NLKSTFMPDR` (index by the sum of the two digits modulo 10)
- A phrase is 4 syllables, a verse is 10 phrases, a chapter is 100 verses, and a volume is 1,000 chapters.
- Navigation is 1-based. The practical interactive archive covers the first 100,000 syllables (300,000 letters), not the entire mathematical word.
- The example **Volume 1 / Chapter 3 / Verse 17 / Phrase 4** decodes to **SAF · REM · KIS · ROR**.

## Reading

Open a chapter from Contents and turn through five verses per page. The arrow keys, page buttons, and horizontal swipes also cross chapter boundaries. The reader remembers the last passage on this device. Shared links with `v`, `c`, `vr`, and `p` open directly to the indexed phrase.

Tap a verse for a syllable breakdown, whole-verse or individual phrase playback, and sharing. Jump to a chapter and verse or look up an inclusive letter range with **Jump to…** (Ctrl/Cmd+K). **About** explains the origin, the digit-pair rule, and the size of the readable archive.

## Local development

```sh
npm install
npm run dev
```

Visit http://localhost:3000.

## Vercel

Import the GitHub repository as a Next.js project with default build settings. No environment variables or paid API are required.

## Tech

Next.js App Router, TypeScript, React, and CSS. The static reader and the `/api/pi` endpoint use the same 200,000 decimal digits of pi computed by BigInt binary splitting with guard digits. Once the reader loads, turning pages and looking up letters need no additional data request. The browser voice approximates the pronunciation.

## Note

This is a fictional artistic/mathematical project. Rayo's number is a finite number, not the largest finite number. The code does not try to calculate or store Rayo's number of characters.

## License

For now, all rights reserved by the repository owner.

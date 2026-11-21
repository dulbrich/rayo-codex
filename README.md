# Rayo Codex

A retro CRT mathematical language explorer, inspired by the feeling of an early-1980s computer terminal.

## The idea

The mathematically defined word has Rayo's-number length and the fictional definition **"something specific to happen."** Each consecutive pair of decimal digits of pi after the decimal point selects one of 100 unique, pronounceable three-letter syllables.

- Onsets: `LMNRSVZFKT`
- Vowels: `AEIOU`
- Codas: `NR`
- A phrase is 4 syllables, a verse is 10 phrases, a chapter is 100 verses, and a volume is 1,000 chapters.
- Navigation is 1-based. The practical interactive archive covers the first 100,000 syllables (300,000 letters), not the entire mathematical word.
- The example **Volume 1 / Chapter 3 / Verse 17 / Phrase 4** decodes to **SAR · RER · KIR · RON**.

## Local development

```sh
npm install
npm run dev
```

Visit http://localhost:3000.

## Vercel

Import the GitHub repository as a Next.js project with default build settings. No environment variables or paid API are required.

## Tech

Next.js App Router, TypeScript, React, CSS. The `/api/pi` endpoint computes and serves 200,000 exact decimal digits of pi using BigInt binary splitting with guard digits. Browser speech synthesis is an approximation, not an authoritative pronunciation engine.

## Note

This is a fictional artistic/mathematical project. Rayo's number is a finite number, not the largest finite number. The code does not try to calculate or store Rayo's number of characters.

## License

For now, all rights reserved by the repository owner.

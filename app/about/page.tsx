import { readFile } from "node:fs/promises";
import path from "node:path";
import hljs from "highlight.js/lib/common";
import CodeLibrary from "@/components/CodeLibrary";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import ChapterTrace from "@/components/ChapterTrace";
import SiteHeader from "@/components/SiteHeader";
import { INDEXED_CHAPTERS, OPENING, passageHref } from "@/lib/book";
import {
  CHAPTERS_PER_VOLUME, MAX_LETTERS, MAX_SYLLABLES, CODAS, ONSETS, PHRASES_PER_VERSE,
  SYLLABLES_PER_PHRASE, VERSES_PER_CHAPTER, syllableForPair,
} from "@/lib/codex";
import { piDecimalDigits } from "@/lib/pi";

export const metadata: Metadata = { title: "About the word" };

const examples = [
  { language: "JavaScript", file: "codex.mjs", grammar: "javascript", command: "node codex.mjs 1 3" },
  { language: "Python", file: "codex.py", grammar: "python", command: "python3 codex.py 1 3" },
  { language: "Rust", file: "codex.rs", grammar: "rust", command: "rustc codex.rs -o codex && ./codex 1 3" },
  { language: "C++", file: "codex.cpp", grammar: "cpp", command: "c++ -std=c++17 codex.cpp -o codex && ./codex 1 3" },
];

export default async function About() {
  const samples = await Promise.all(examples.map(async example => {
    const code = await readFile(path.join(process.cwd(), "examples", example.file), "utf8");
    const highlighted = hljs.highlight(code, { language: example.grammar }).value;
    return { ...example, code, highlighted };
  }));
  const seed = piDecimalDigits(40).slice(0, 8);
  const pairs = seed.match(/../g) ?? [];
  return <>
    <SiteHeader section="about" />
    <main className="about-wrap">
      <Link className="back-link" href="/"><ArrowLeft /> Back to reader</Link>
      <header className="about-cover">
        <div><p className="kicker"><i aria-hidden="true" /> Rayo Codex</p><h1>About the word</h1></div>
        <ChapterTrace seed={seed} />
      </header>
      <a className="text-button" href="#code-library">Explore the code library <ArrowDown /></a>
      <section className="about-origin">
        <h2>A word by David and Harvey</h2>
        <p>David and his son Harvey set out to invent the longest word they could imagine. They wanted to be able to say it out loud, even if they could only ever speak a small part of it.</p>
        <p>They chose Rayo’s number as its length in letters. The word means <em>“something specific to happen.”</em> The digits of π determine how it sounds.</p>
        <p className="shorthand-note"><img src="/icon.svg" width="48" height="48" alt="" /><span>Harvey invented a shorthand for the whole word. Draw a lowercase u with a horizontal line through its middle.</span></p>
      </section>
      <section className="about-section">
        <h2>How π becomes a word</h2>
        <p>Start just after the decimal point in π and read two digits at a time. Each pair from 00 to 99 picks one three-letter syllable. Here is the opening phrase.</p>
        <figure className="pair-example">
          <figcaption><span>Digits of π</span><span>Syllable</span></figcaption>
          {pairs.map((pair, i) => <div key={i}><strong>{pair}</strong><ArrowDown aria-hidden="true" />
            <span lang="art">{syllableForPair(Number(pair)).toLowerCase()}</span></div>)}
        </figure>
        <p>The first digit picks an opening consonant from <span className="inline-code">{ONSETS.split("").join(" ")}</span>, counting from zero. The second digit picks the vowel. The pairs 0–1, 2–3, 4–5, 6–7 and 8–9 give A, E, I, O and U in that order. To find the ending, add the two digits and use the last digit of the sum to count from zero in <span className="inline-code">{CODAS.split("").join(" ")}</span>. For 14, the sum is 5, so the syllable ends in F and sounds like “mif.”</p>
        <p>This consonant–vowel–consonant pattern gives every piece a sound. The same digits always give the same syllables.</p>
        <Link className="text-button" href={passageHref(OPENING, true)}>Try the opening phrase <ArrowRight /></Link>
      </section>
      <section className="about-section">
        <h2>Reading a piece of it</h2>
        <p>The syllables form one continuous word. Hyphens, spaces and verse numbers help you read it and find your way back.</p>
        <dl className="hierarchy">
          <div><dt>Phrase</dt><dd>{SYLLABLES_PER_PHRASE} syllables</dd></div>
          <div><dt>Verse</dt><dd>{PHRASES_PER_VERSE} phrases</dd></div>
          <div><dt>Chapter</dt><dd>{VERSES_PER_CHAPTER} verses</dd></div>
          <div><dt>Volume</dt><dd>{CHAPTERS_PER_VOLUME.toLocaleString("en-US")} chapters</dd></div>
        </dl>
        <p>Rayo’s number is finite. The reader opens a much smaller part of the word, the first {INDEXED_CHAPTERS} chapters of Volume 01. That gives you {MAX_SYLLABLES.toLocaleString("en-US")} syllables, or {MAX_LETTERS.toLocaleString("en-US")} letters, to explore.</p>
        <p>Turn pages with the arrows or a swipe. Tap a verse to hear its phrases. Each chapter’s wireframe takes its shape from the four π pairs printed beneath it.</p>
        <a className="source-link" href="https://github.com/dulbrich/rayo-codex/blob/main/lib/codex.ts">View the syllable rules on GitHub <ArrowUpRight /></a>
      </section>
      <CodeLibrary samples={samples} revision={process.env.VERCEL_GIT_COMMIT_SHA || "main"} />
    </main>
  </>;
}

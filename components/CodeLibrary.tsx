"use client";

import { useRef, useState } from "react";

type Sample = { language: string; file: string; command: string; code: string; highlighted: string };

export default function CodeLibrary({ samples, revision }: { samples: Sample[]; revision: string }) {
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const source = useRef<HTMLElement>(null);
  const sample = samples[index];

  async function copy() {
    const element = source.current;
    try {
      await navigator.clipboard.writeText(sample.code);
      if (source.current === element) setNotice("Code copied.");
    } catch {
      if (!element || source.current !== element) return;
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      setNotice("Use your device’s Copy command to copy the selected code.");
    }
  }

  return <section className="about-section code-library" id="code-library">
    <h2>Code library for <s>u</s></h2>
    <p>Print a chapter or use the reader methods in your own program. Download the digits of π and save the selected code beside them as <code>{sample.file}</code>.</p>
    <a className="text-button" href="/api/pi" download="pi.txt">Download pi.txt</a>
    <p>Each example command prints Volume 1, Chapter 3 as 100 numbered verses. Change the last two numbers to choose a volume and chapter. The supplied digits cover chapters 1–25 of Volume 1. For later chapters, supply more consecutive digits of π starting immediately after the decimal point.</p>
    <div className="library-tools">
      <label>Language <select value={index} onChange={e => { setIndex(Number(e.target.value)); setNotice(""); }}>
        {samples.map((entry, i) => <option key={entry.file} value={i}>{entry.language}</option>)}
      </select></label>
      <button className="secondary-button" onClick={copy}>Copy code</button>
      <a className="text-button" href={"https://github.com/dulbrich/rayo-codex/blob/" + revision + "/examples/" + sample.file}>View on GitHub</a>
    </div>
    <p role="status">{notice}</p>
    <pre tabIndex={0} aria-label={sample.language + " source code"}><code key={sample.file} ref={source} dangerouslySetInnerHTML={{ __html: sample.highlighted }} /></pre>
    <p>Run from the folder containing both files</p>
    <pre tabIndex={0}><code>{sample.command}</code></pre>
    <h3>Build your own reader</h3>
    <p>Create a <code>CodexReader</code> from the digit string and reuse it across calls. Every position starts at 1.</p>
    <dl className="reader-methods">
      <div><dt><code>syllable(position)</code></dt><dd>Read one syllable.</dd></div>
      <div><dt><code>passage(start, count)</code></dt><dd>Read consecutive syllables, including across chapter boundaries.</dd></div>
      <div><dt><code>phrase(volume, chapter, verse, phrase)</code></dt><dd>Read four syllables.</dd></div>
      <div><dt><code>verse(volume, chapter, verse)</code></dt><dd>Read ten phrases separated by spaces.</dd></div>
      <div><dt><code>chapter(volume, chapter)</code></dt><dd>Read all 100 numbered verses on separate lines.</dd></div>
    </dl>
  </section>;
}

"use client";

import { useRef, useState } from "react";

type Sample = { language: string; file: string; command: string; code: string };

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
    <p>Calculate a passage on your computer. Download the digits of π and save the selected code beside them as <code>{sample.file}</code>.</p>
    <a className="text-button" href="/api/pi" download="pi.txt">Download pi.txt</a>
    <div className="library-tools">
      <label>Language <select value={index} onChange={e => { setIndex(Number(e.target.value)); setNotice(""); }}>
        {samples.map((entry, i) => <option key={entry.file} value={i}>{entry.language}</option>)}
      </select></label>
      <button className="secondary-button" onClick={copy}>Copy code</button>
      <a className="text-button" href={"https://github.com/dulbrich/rayo-codex/blob/" + revision + "/examples/" + sample.file}>View on GitHub</a>
    </div>
    <p role="status">{notice}</p>
    <pre tabIndex={0} aria-label={sample.language + " source code"}><code key={sample.file} ref={source}>{sample.code}</code></pre>
    <p>Run from the folder containing both files</p>
    <pre tabIndex={0}><code>{sample.command}</code></pre>
    <p>The example starts at syllable 1 and reads 4, giving <code>mif-mim-tel-zil</code>. Change those two numbers in the call to <code>passage</code> to explore the first 100,000 syllables. For example, start at 41 to read from verse 2.</p>
  </section>;
}

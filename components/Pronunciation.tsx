import { useEffect, useRef, useState } from "react";
import { Copy, Link2, Play, Square, Volume2 } from "lucide-react";
import { type Address, formatVerse } from "@/lib/codex";
import { passageHref, twoDigits } from "@/lib/book";
import ReaderDialog from "./ReaderDialog";

type Props = { address: Address; phrases: string[][]; initialPhrase: number | null; onClose: () => void };

export default function Pronunciation({ address, phrases, initialPhrase, onClose }: Props) {
  const [selected, setSelected] = useState(initialPhrase);
  const [playing, setPlaying] = useState<number | "verse" | null>(null);
  const [sounding, setSounding] = useState<number | null>(null);
  const [rate, setRate] = useState(.8);
  const [feedback, setFeedback] = useState("");
  const [manualCopy, setManualCopy] = useState("");
  const utterances = useRef<SpeechSynthesisUtterance[]>([]);
  const audioSupported = typeof window !== "undefined" && !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
  const initialRow = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    initialRow.current?.scrollIntoView({ block: "nearest" });
    return () => {
      if (utterances.current.length) {
        utterances.current = [];
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  function stop() {
    if (utterances.current.length) {
      utterances.current = [];
      window.speechSynthesis?.cancel();
    }
    setPlaying(null);
    setSounding(null);
  }

  function play(part: number | "verse") {
    stop();
    setFeedback("");
    setManualCopy("");
    setSelected(part === "verse" ? null : part);
    if (playing === part || !audioSupported) return;

    const first = part === "verse" ? 0 : part - 1;
    const groups = part === "verse" ? phrases : [phrases[first]];
    const queue = groups.map(group => new SpeechSynthesisUtterance(group.join(" ").toLowerCase()));
    utterances.current = queue;
    setPlaying(part);
    queue.forEach((utterance, i) => {
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.onstart = () => { if (utterances.current === queue) setSounding(first + i + 1); };
      utterance.onend = () => {
        if (utterances.current === queue && i === queue.length - 1) {
          utterances.current = [];
          setPlaying(null);
          setSounding(null);
        }
      };
      utterance.onerror = () => {
        if (utterances.current !== queue) return;
        stop();
        setFeedback("This voice could not play the audio. You can still read each syllable below.");
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  async function copy(kind: "text" | "link") {
    const url = new URL(passageHref({ ...address, phrase: selected ?? 1 }, selected !== null), window.location.origin);
    url.searchParams.set("listen", "1");
    const passage = selected === null ? formatVerse(phrases.flat()) : phrases[selected - 1].join("");
    const value = kind === "link" ? url.toString() : passage;
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(kind === "link" ? "Passage link copied." : "Passage text copied.");
      setManualCopy("");
    } catch {
      setManualCopy(value);
      setFeedback("Select the text below to copy it.");
    }
  }

  return <ReaderDialog title={"Verse " + twoDigits(address.verse)} context={"Pronunciation / Chapter " + twoDigits(address.chapter)} onClose={onClose}>
    <div className="dialog-body pronunciation-body">
      <div className="play-controls">
        <button className="primary-button" disabled={!audioSupported} onClick={() => play("verse")}>
          {playing === "verse" ? <Square /> : <Play />}{playing === "verse" ? "Stop verse" : "Play verse"}</button>
        <label className="speed">Speed <select value={rate} onChange={e => { stop(); setRate(Number(e.target.value)); }}>
          {[.6, .8, 1, 1.2].map(value => <option key={value} value={value}>{value}×</option>)}
        </select></label>
      </div>
      <p className="form-help">{audioSupported ? "Listen to the verse or choose a four-syllable phrase. Audio uses your browser’s voice." : "Audio is unavailable in this browser. Each row shows the four syllables of a phrase."}</p>
      <ol className="phrase-list" aria-label="Pronunciation by phrase">
        {phrases.map((group, i) => {
          const number = i + 1;
          return <li key={number}><button type="button" ref={initialPhrase === number ? initialRow : undefined}
            className={selected === number || sounding === number ? "is-selected" : ""}
            aria-label={(!audioSupported ? "Select" : playing === number ? "Stop" : "Play") + " phrase " + number + ", " + group.join(" ")}
            onClick={() => play(number)}>
            <span className="phrase-number">{twoDigits(number)}</span>
            <span className="phrase-syllables" lang="art">{group.map((syllable, j) =>
              <span key={j}>{syllable.toLowerCase()}</span>)}</span>
            {playing === number ? <Square /> : <Volume2 />}
          </button></li>;
        })}
      </ol>
      <div className="copy-actions">
        <button className="secondary-button" onClick={() => copy("link")}><Link2 /> Copy {selected === null ? "verse" : "phrase"} link</button>
        <button className="secondary-button" onClick={() => copy("text")}><Copy /> Copy text</button>
      </div>
      <p className="copy-feedback" role="status">{feedback}</p>
      {manualCopy && <textarea className="copy-fallback" aria-label="Text to copy" readOnly value={manualCopy} onFocus={e => e.target.select()} />}
    </div>
  </ReaderDialog>;
}

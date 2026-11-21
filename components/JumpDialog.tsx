import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import {
  type Address, MAX_LETTERS, MAX_LETTER_REQUEST, VERSES_PER_CHAPTER,
  isAddressArchived, lettersAt, startSyllable,
} from "@/lib/codex";
import { INDEXED_CHAPTERS, addressAtLetter } from "@/lib/book";
import ReaderDialog from "./ReaderDialog";

type Props = { address: Address; digits: string; onClose: () => void; onGo: (address: Address) => void };

export default function JumpDialog({ address, digits, onClose, onGo }: Props) {
  const firstLetter = (startSyllable(address) - 1) * 3 + 1;
  const [mode, setMode] = useState<"passage" | "letters">("passage");
  const [chapter, setChapter] = useState(String(address.chapter));
  const [verse, setVerse] = useState(String(address.verse));
  const [start, setStart] = useState(String(firstLetter));
  const [end, setEnd] = useState(String(Math.min(firstLetter + 11, MAX_LETTERS)));
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (mode === "passage") {
      const next = { volume: 1, chapter: Number(chapter), verse: Number(verse), phrase: 1 };
      if (isAddressArchived(next)) onGo(next);
      else setError("Choose a chapter and verse inside the indexed archive.");
      return;
    }
    try {
      setResult(lettersAt(digits, Number(start), Number(end)));
    } catch {
      setResult("");
      setError("Enter an inclusive range of up to " + MAX_LETTER_REQUEST + " letters, with the end at or after the start.");
    }
  }

  return <ReaderDialog title="Jump to a passage" context="Volume 01" onClose={onClose}>
    <div className="dialog-body">
      <div className="switcher" role="group" aria-label="Lookup method">
        {(["passage", "letters"] as const).map(value => <button key={value} type="button"
          aria-pressed={mode === value} onClick={() => { setMode(value); setError(""); }}>
          {value === "passage" ? "Chapter & verse" : "Letter range"}</button>)}
      </div>
      <form className="jump-form" onSubmit={submit}>
        {mode === "passage" ? <>
          <label>Chapter <span>1–{INDEXED_CHAPTERS}</span><input type="number" inputMode="numeric" min="1"
            max={INDEXED_CHAPTERS} required value={chapter} onChange={e => setChapter(e.target.value)} /></label>
          <label>Verse <span>1–{VERSES_PER_CHAPTER}</span><input type="number" inputMode="numeric" min="1"
            max={VERSES_PER_CHAPTER} required value={verse} onChange={e => setVerse(e.target.value)} /></label>
        </> : <>
          <label>First letter<input type="number" inputMode="numeric" min="1" max={MAX_LETTERS} required
            value={start} onChange={e => { setStart(e.target.value); setResult(""); }} /></label>
          <label>Last letter<input type="number" inputMode="numeric" min="1" max={MAX_LETTERS} required
            value={end} onChange={e => { setEnd(e.target.value); setResult(""); }} /></label>
          <p className="form-help">Letters 1–{MAX_LETTERS.toLocaleString("en-US")}. Read up to {MAX_LETTER_REQUEST} at once.</p>
        </>}
        <button className="primary-button" type="submit">{mode === "passage" ? "Open passage" : "Read letters"}<ArrowRight /></button>
      </form>
      {error && <p className="feedback error" role="alert">{error}</p>}
      {mode === "letters" && result && <div className="letter-result" aria-live="polite">
        <p className="kicker">Letters {Number(start).toLocaleString("en-US")}–{Number(end).toLocaleString("en-US")}</p>
        <p className="raw-letters">{result}</p>
        <button className="text-button" onClick={() => onGo(addressAtLetter(Number(start)))}>Open starting verse <ArrowRight /></button>
      </div>}
    </div>
  </ReaderDialog>;
}

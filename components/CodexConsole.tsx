"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Address, INITIAL_ADDRESS, MAX_SYLLABLES, MAX_LETTERS, MAX_LETTER_REQUEST,
  SYLLABLES_PER_PHRASE, SYLLABLES_PER_VERSE, PHRASES_PER_VERSE,
  isAddressArchived, isValidAddress, startSyllable,
  syllablesAt, lettersAt, formatPhrase, formatVerse, padded,
} from "@/lib/codex";

type Mode = "phrase" | "verse" | "letters";
type Draft = { volume: string; chapter: string; verse: string; phrase: string };
const fields: (keyof Address)[] = ["volume", "chapter", "verse", "phrase"];

function toDraft(a: Address): Draft {
  return { volume: String(a.volume), chapter: String(a.chapter), verse: String(a.verse), phrase: String(a.phrase) };
}
function parseDraft(d: Draft): Address | null {
  if (Object.values(d).some(v => !/^\d+$/.test(v))) return null;
  const a = { volume: Number(d.volume), chapter: Number(d.chapter), verse: Number(d.verse), phrase: Number(d.phrase) };
  return isValidAddress(a) ? a : null;
}
function loadAddress(): Address | null {
  const q = new URLSearchParams(window.location.search);
  if (!["v", "c", "vr", "p"].some(k => q.has(k))) return null;
  const a = {
    volume: Number(q.get("v") ?? "1"), chapter: Number(q.get("c") ?? "1"),
    verse: Number(q.get("vr") ?? "1"), phrase: Number(q.get("p") ?? "1"),
  };
  return isAddressArchived(a) ? a : null;
}
function addressUrl(a: Address): string {
  const url = new URL(window.location.href);
  url.searchParams.set("v", String(a.volume));
  url.searchParams.set("c", String(a.chapter));
  url.searchParams.set("vr", String(a.verse));
  url.searchParams.set("p", String(a.phrase));
  return url.toString();
}
function Waves({ active }: { active: boolean }) {
  return <div className={"waves" + (active ? " playing" : "")} aria-hidden="true">
    {Array.from({ length: 37 }, (_, i) =>
      <i key={i} className={i > 15 && i < 22 ? "amber" : ""} style={{
        height: (12 + Math.round((Math.abs(Math.sin(i * 1.53))*.72 + Math.abs(Math.sin(i*.31))*.28)*78)) + "%",
        animationDelay: (i%7*.09) + "s"
      }} />
    )}
  </div>;
}
export default function CodexConsole() {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState<Address>(INITIAL_ADDRESS);
  const [draft, setDraft] = useState<Draft>(() => toDraft(INITIAL_ADDRESS));
  const [mode, setMode] = useState<Mode>("phrase");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(.8);
  const [letterStart, setLetterStart] = useState("25957");
  const [letterEnd, setLetterEnd] = useState("25968");
  const [letterResult, setLetterResult] = useState("");

  useEffect(() => {
    const initial = loadAddress();
    if (initial) {
      setAddress(initial);
      setDraft(toDraft(initial));
      const first = (startSyllable(initial)-1)*3+1;
      setLetterStart(String(first));
      setLetterEnd(String(first+11));
    }
    setHydrated(true);
    const ctrl = new AbortController();
    fetch("/api/pi", { signal: ctrl.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Archive not responding ("+response.status+")");
        return (await response.text()).trim();
      })
      .then(text => {
        if (!/^\d+$/.test(text) || text.length !== MAX_SYLLABLES*2 || !text.startsWith("141592653589793238462643383279"))
          throw new Error("Archive failed integrity validation");
        setDigits(text);
      })
      .catch((e: unknown) => { if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "Data unavailable"); });
    return () => { ctrl.abort(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    if (hydrated) window.history.replaceState(null, "", addressUrl(address));
  }, [address, hydrated]);

  const first = startSyllable(address);
  const verseFirst = first - (address.phrase-1)*SYLLABLES_PER_PHRASE;
  const phrase = useMemo(() => digits ? syllablesAt(digits, first, SYLLABLES_PER_PHRASE) : [], [digits,first]);
  const verse = useMemo(() => digits ? syllablesAt(digits, verseFirst, SYLLABLES_PER_VERSE) : [], [digits,verseFirst]);
  const groups = useMemo(() => Array.from({length:PHRASES_PER_VERSE}, (_, i) => verse.slice(i*4,i*4+4)), [verse]);
  const rangeStart=(first-1)*3+1;
  const rangeEnd=rangeStart+11;

  function go(next: Address) {
    if (!isAddressArchived(next)) {
      setNotice("Outside available archive: Volume 1, Chapters 1–25 are currently indexed.");
      return;
    }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setAddress(next);
    setDraft(toDraft(next));
    setMode("phrase");
    setNotice("");
    const start=(startSyllable(next)-1)*3+1;
    setLetterStart(String(start));
    setLetterEnd(String(start+11));
    setLetterResult("");
  }
  function decode() {
    const next=parseDraft(draft);
    if (!next) {
      setNotice("Invalid coordinates. Enter positive whole numbers within the Codex hierarchy.");
      return;
    }
    go(next);
  }
  function speech() {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    if (!digits) return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setNotice("This browser does not support synthesized speech."); return;
    }
    const utterance = new SpeechSynthesisUtterance((mode === "verse" ? formatVerse(verse) : phrase.join(" ")).replaceAll("/", ". ").replaceAll("-", " "));
    utterance.rate=rate; utterance.pitch=.86;
    utterance.onend=()=>setSpeaking(false);
    utterance.onerror=()=>setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setNotice("Speech is approximate; pronunciation depends on the browser voice.");
  }
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setNotice(label+" copied."); }
    catch { setNotice("Clipboard unavailable; select and copy text manually."); }
  }
  function exploreLetters() {
    try {
      setLetterResult(lettersAt(digits,Number(letterStart),Number(letterEnd)));
      setNotice("");
    } catch (e) {
      setLetterResult("");
      setNotice(e instanceof Error ? e.message : "Invalid range");
    }
  }
  return <main className="shell">
    <div className="crt">
      <div className="scanlines" aria-hidden="true" />
      <div className="screen">
        <header className="masthead">
          <div className="brand"><div className="cube" aria-hidden="true">◇</div><div>
            <h1>RAYO CODEX SYSTEM</h1>
            <p>THE MATHEMATICAL LANGUAGE ARCHIVE</p>
          </div></div>
          <div className="systeminfo"><span>ARC-80 SERIES 4000<br />LANGUAGE ENGINE v1.0</span><strong className={"status " + (error ? "fault" : "")}><i />{error ? "SYSTEM ERROR" : digits ? "SYSTEM ONLINE" : "LOADING ARCHIVE"}</strong></div>
        </header>

        <div className="columns">
          <aside className="panel navigator">
            <h2 className="panel-title">▶ ARCHIVE NAVIGATOR</h2>
            <div className="panel-content">
              <p className="eyebrow">SELECT COORDINATE TO DECODE</p>
              <hr />
              <form onSubmit={e=>{e.preventDefault();decode();}} className="coordinate-form">
                {fields.map(field=><label key={field} className={"coordinate " + (field==="phrase" ? "selected" : "")}>
                  <span>{field.toUpperCase()}</span>
                  <input type="number" inputMode="numeric" min={1}
                    max={field==="volume"?undefined:field==="chapter"?1000:field==="verse"?100:10}
                    value={draft[field]} onChange={e=>setDraft(d=>({...d,[field]:e.target.value}))} />
                  <b aria-hidden="true">▼</b>
                </label>)}
                <button className="decode" type="submit">▶ &nbsp; DECODE PASSAGE</button>
              </form>
              <hr className="spaced" />
              <div className="signal">ARCHIVE SIGNAL <span>[LIVE]</span></div>
              <div className="bars" aria-hidden="true">{Array.from({length:27},(_,i)=><i key={i} style={{height:(15+Math.abs(Math.sin(i*1.7)*Math.cos(i*.23))*85)+"%"}} />)}</div>
              <p className="diagnostic">INDEXED AT SYLLABLE <b>{padded(first,8)}</b></p>
              <div className="archive-info">
                <small>ADDRESS FORMAT</small><strong>VOL / CH / VR / PH</strong>
                <small>ARCHIVE CAPACITY</small><strong>{MAX_SYLLABLES.toLocaleString()} SYLLABLES</strong>
                <small>ARCHIVE COVERAGE</small><strong>25 CHAPTERS · VOLUME 01</strong>
              </div>
            </div>
          </aside>

          <section className="center" aria-label="Decoded passage">
            <div className="section-caption"><span />THE WORD BEYOND SCALE<span /></div>
            <div className="orbit">
              <div className="floor" aria-hidden="true" />
              <div className="ring outer" aria-hidden="true" /><div className="ring inner" aria-hidden="true" />
              <div className="cross horizontal" aria-hidden="true" /><div className="cross vertical" aria-hidden="true" />
              <svg className="terrain" viewBox="0 0 600 130" aria-hidden="true"><path d="M0 130 Q300 0 600 130 M0 130 H600 M300 0 V130 M300 0 L70 130 M300 0 L180 130 M300 0 L420 130 M300 0 L530 130 M65 100 H535 M150 75 H450 M230 45 H370" /></svg>
              <div className="orbit-content">
                <div className="chips"><span>VOL {address.volume}</span><span>CH {address.chapter}</span><span>VR {address.verse}</span><span>PH {address.phrase}</span></div>
                <div className="reading">
                  <p className="gold address-line">VOLUME {address.volume} · CHAPTER {address.chapter} · VERSE {address.verse} · PHRASE {address.phrase}</p>
                  {mode==="phrase" && <><h2 className="magic" aria-live="polite">{phrase.length ? phrase.join(" · ") : "··· ··· ··· ···"}</h2><p className="motto">ONE WORD. BEYOND SCALE.</p></>}
                  {mode==="verse" && <div className="verse-view"><h2>COMPLETE VERSE {padded(address.verse,2)}</h2><div className="verse-list">{groups.map((g,i)=><button className={i+1===address.phrase?"current":""} key={i} onClick={()=>go({...address,phrase:i+1})}><small>{padded(i+1,2)}</small>{formatPhrase(g)}</button>)}</div></div>}
                  {mode==="letters" && <div className="letter-view"><h2>LETTER-RANGE TERMINAL</h2><div className="letter-fields"><label>START<input type="number" value={letterStart} min="1" max={MAX_LETTERS} onChange={e=>setLetterStart(e.target.value)} /></label><label>END<input type="number" value={letterEnd} min="1" max={MAX_LETTERS} onChange={e=>setLetterEnd(e.target.value)} /></label><button onClick={exploreLetters} disabled={!digits}>READ</button></div><p className="letter-output" aria-live="polite">{letterResult||"ENTER AN INCLUSIVE RANGE TO DECODE"}</p><small>MAX {MAX_LETTER_REQUEST} LETTERS / REQUEST</small></div>}
                </div>
                <div className="readout"><span>{mode==="verse"?"40 / 40 SYLLABLES":mode==="letters"?"LETTER INDEX MODE":"4 / 4 SYLLABLES"}</span><span className="gold-bordered">{error?"SIGNAL LOST":digits?"SIGNAL VERIFIED":"DECODING..."}</span></div>
              </div>
            </div>
            <div className="modes" role="group" aria-label="Display mode">
              {(["phrase","verse","letters"] as const).map((m,i)=><button key={m} aria-pressed={mode===m} className={mode===m?"active":""} onClick={()=>{setMode(m);setNotice("");}}>{padded(i+1,2)} {m.toUpperCase()}</button>)}
            </div>
          </section>

          <aside className="panel phonetic">
            <h2 className="panel-title">▶ PHONETIC TERMINAL</h2>
            <div className="panel-content">
              <p className="eyebrow">THE VOICE OF THE CODEX</p><hr />
              <p className="fieldname">SELECTED PASSAGE</p>
              <div className="syllable-tiles">{phrase.length?phrase.map((s,i)=><span key={i}>{s}</span>):<span>LOADING</span>}</div>
              <div className="stat"><span>LETTER RANGE</span><strong>{rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}</strong></div>
              <div className="stat"><span>SYLLABLES</span><strong>04</strong></div>
              <hr className="spaced" />
              <div className="stat"><span>PRONUNCIATION WAVEFORM</span><strong>{speaking?"LIVE":"READY"}</strong></div>
              <Waves active={speaking} />
              <button className="speak" onClick={speech} disabled={!digits||!!error}><span>{speaking?"■":"▶"}</span>{speaking?"STOP PLAYBACK":mode==="verse"?"SPEAK THIS VERSE":"SPEAK THIS PHRASE"}</button>
              <label className="rate">RATE <input type="range" min="0.55" max="1.2" step="0.05" value={rate} onChange={e=>setRate(Number(e.target.value))} />{rate.toFixed(2)}×</label>
              <div className="tools"><button disabled={!digits} onClick={()=>copy(mode==="verse"?formatVerse(verse):phrase.join(""),"Passage")}>COPY TEXT</button><button onClick={()=>copy(addressUrl(address),"Share link")}>SHARE LINK</button></div>
              <hr className="spaced" />
              <p className="fieldname">DECODING PROTOCOL</p>
              <div className="protocol"><div><b>π</b><span>→ 2 DIGITS</span></div><div><b>00–99</b><span>→ 100 SYLLABLES</span></div><div><b>1 SYLLABLE</b><span>→ 3 LETTERS</span></div><div><b>1 PHRASE</b><span>→ 4 SYLLABLES</span></div></div>
            </div>
          </aside>
        </div>
        <footer className="timeline-panel">
          <div className="timeline-name"><strong>VERSE TIMELINE</strong><span>CHAPTER {address.chapter} · VERSE {address.verse}</span></div>
          <div className="timeline" aria-label="Navigate phrases">
            {Array.from({length:PHRASES_PER_VERSE},(_,i)=><button key={i} aria-label={"Phrase "+(i+1)} aria-current={address.phrase===i+1?"step":undefined} className={address.phrase===i+1?"active":""} onClick={()=>go({...address,phrase:i+1})}><i /><span>{padded(i+1,2)}{address.phrase===i+1?" · ACTIVE":""}</span></button>)}
          </div>
          <div className="mode-tag"><span>MODE {mode==="phrase"?"01":mode==="verse"?"02":"03"}</span><strong>▶ EXPLORE</strong></div>
        </footer>
        <div className="footnote"><span>100,000 SYLLABLES · 300,000 LETTERS · DETERMINISTIC π ARCHIVE</span><span>DEFINITION: “SOMETHING SPECIFIC TO HAPPEN”</span></div>
        {(notice||error)&&<div className={"notice"+(error?" err":"")} role="status">&gt; {error||notice}</div>}
      </div>
    </div>
  </main>;
}

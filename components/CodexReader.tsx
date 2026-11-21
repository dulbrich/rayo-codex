"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { ArrowLeft, ArrowRight, AudioLines, ChevronDown, List, Volume2 } from "lucide-react";
import {
  type Address, SYLLABLES_PER_CHAPTER, VERSES_PER_CHAPTER, isAddressArchived, startSyllable,
} from "@/lib/codex";
import {
  OPENING, PAGE_COUNT, PAGES_PER_CHAPTER, VERSES_PER_PAGE,
  openingOfPage, pageOf, parsePassage, passageHref, phrasesOfVerse, twoDigits,
} from "@/lib/book";
import ChapterIndex from "./ChapterIndex";
import ChapterTrace from "./ChapterTrace";
import JumpDialog from "./JumpDialog";
import Pronunciation from "./Pronunciation";
import ReaderDialog from "./ReaderDialog";
import SiteHeader from "./SiteHeader";

type Panel = "contents" | "jump" | "pronunciation" | null;
const BOOKMARK = "rayo-codex.reading-place.v1";

function remember(address: Address) {
  try { localStorage.setItem(BOOKMARK, passageHref(address).split("?")[1]); } catch { /* Storage is optional. */ }
}

export default function CodexReader({ digits }: { digits: string }) {
  const [address, setAddress] = useState<Address>(OPENING);
  const [panel, setPanel] = useState<Panel>(null);
  const [initialPhrase, setInitialPhrase] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [shortcut, setShortcut] = useState("Ctrl");
  const scroll = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; time: number; verseButton: HTMLButtonElement | null } | null>(null);
  const page = pageOf(address);
  const first = openingOfPage(page);
  const lastVerse = first.verse + VERSES_PER_PAGE - 1;
  const chapterOffset = (startSyllable({ ...first, verse: 1 }) - 1) * 2;

  const reveal = useCallback((next: Address) => {
    requestAnimationFrame(() => {
      const container = scroll.current;
      if (!container) return;
      if ((next.verse - 1) % VERSES_PER_PAGE === 0) container.scrollTop = 0;
      else document.getElementById("verse-" + next.verse)?.scrollIntoView({ block: "nearest" });
    });
  }, []);

  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const hasAddress = ["v", "c", "vr", "p"].some(key => params.has(key));
      let next: Address | null = null;
      if (hasAddress) next = parsePassage(params);
      else {
        try {
          const saved = localStorage.getItem(BOOKMARK);
          if (saved) next = parsePassage(new URLSearchParams(saved));
        } catch { /* Start at the opening page if storage is unavailable. */ }
      }
      setNotice(hasAddress && !next ? "This address is outside the indexed archive. Showing the opening page." : "");
      const pronunciation = !!next && hasAddress && (params.has("p") || params.get("listen") === "1");
      const position = next ?? OPENING;
      setAddress(position);
      setInitialPhrase(pronunciation && params.has("p") ? position.phrase : null);
      setPanel(pronunciation ? "pronunciation" : null);
      if (!hasAddress || !next) window.history.replaceState(window.history.state, "", passageHref(position));
      remember(position);
      reveal(position);
    }
    restore();
    if (/Mac|iPhone|iPad/i.test(navigator.platform)) setShortcut("⌘");
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [reveal]);

  const go = useCallback((next: Address) => {
    if (!isAddressArchived(next)) return;
    const href = passageHref(next);
    if (window.location.pathname + window.location.search !== href) window.history.pushState(null, "", href);
    setPanel(null);
    setInitialPhrase(null);
    setNotice("");
    setAddress(next);
    remember(next);
    reveal(next);
  }, [reveal]);

  const turn = useCallback((direction: -1 | 1) => {
    const target = page + direction;
    if (target < 0 || target >= PAGE_COUNT) return false;
    go(openingOfPage(target));
    return true;
  }, [go, page]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if (event.defaultPrevented || panel || event.altKey || event.shiftKey) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPanel("jump");
        return;
      }
      if (event.metaKey || event.ctrlKey || (event.target instanceof HTMLElement &&
        event.target.closest('input, select, textarea, [contenteditable="true"]'))) return;
      if (event.key === "ArrowRight" && turn(1)) event.preventDefault();
      if (event.key === "ArrowLeft" && turn(-1)) event.preventDefault();
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [panel, turn]);

  function openVerse(verse: number) {
    const next = { ...address, verse, phrase: 1 };
    setAddress(next);
    setInitialPhrase(null);
    setPanel("pronunciation");
    remember(next);
    window.history.replaceState(window.history.state, "", passageHref(next));
  }

  function closePanel() {
    setPanel(null);
    if (panel === "pronunciation") {
      window.history.replaceState(window.history.state, "", passageHref(address));
      // A shared pronunciation link can be the first thing opened in a tab.
      const row = document.getElementById("verse-" + address.verse);
      requestAnimationFrame(() => row?.focus({ preventScroll: true }));
    }
  }

  function startSwipe(event: TouchEvent) {
    const finger = event.touches[0];
    const verseButton = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button.verse") : null;
    touch.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY, time: event.timeStamp, verseButton } : null;
  }
  function trackSwipe(event: TouchEvent) {
    const origin = touch.current;
    const finger = event.touches[0];
    if (origin && finger && Math.hypot(finger.clientX - origin.x, finger.clientY - origin.y) > 10) origin.verseButton = null;
  }
  function finishSwipe(event: TouchEvent) {
    const origin = touch.current;
    touch.current = null;
    if (!origin || event.touches.length || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - origin.x;
    const dy = event.changedTouches[0].clientY - origin.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      if (event.cancelable) event.preventDefault();
      // Finish the touch sequence before replacing the verse under the finger.
      requestAnimationFrame(() => turn(dx < 0 ? 1 : -1));
    } else if (event.cancelable && origin.verseButton?.isConnected && Math.hypot(dx, dy) <= 10 && event.timeStamp - origin.time < 500) {
      // Touch browsers can suppress the compatibility click immediately after a swipe.
      event.preventDefault();
      origin.verseButton.click();
    }
  }

  return <div className="reader-app">
    <a className="skip-link" href="#book-page">Skip to passage</a>
    <SiteHeader section="reader" onJump={() => setPanel("jump")} shortcut={shortcut} />
    <div className="workspace">
      <aside className="sidebar"><ChapterIndex chapter={address.chapter} onChoose={go} /></aside>
      <main className="reader-pane" id="book-page" tabIndex={-1} aria-label="Book reader">
        <div className="reader-scroll" ref={scroll} onTouchStart={startSwipe} onTouchMove={trackSwipe} onTouchEnd={finishSwipe}
          onTouchCancel={() => { touch.current = null; }}>
          <div className="page-width">
            <header className="chapter-cover">
              <div className="cover-type"><p className="kicker"><i aria-hidden="true" /> Volume {twoDigits(address.volume)}</p>
                <button className="mobile-contents" onClick={() => setPanel("contents")}><List /> Contents <ChevronDown /></button>
                <h1>Chapter <span>{twoDigits(address.chapter)}</span></h1>
                <p className="cover-stats">{VERSES_PER_CHAPTER} verses <i /> {SYLLABLES_PER_CHAPTER.toLocaleString("en-US")} syllables</p>
              </div>
              <ChapterTrace seed={digits.slice(chapterOffset, chapterOffset + 8)} />
            </header>
            {notice && <p className="feedback error" role="alert">{notice}</p>}
            <section className="passage" aria-labelledby="passage-title">
              <div className="passage-heading"><h2 id="passage-title">Verses {twoDigits(first.verse)}–{twoDigits(lastVerse)}</h2>
                <span><AudioLines /> Tap a verse for pronunciation</span></div>
              <ol className="verse-list" start={first.verse}>
                {Array.from({ length: VERSES_PER_PAGE }, (_, i) => {
                  const number = first.verse + i;
                  const phrases = phrasesOfVerse(digits, { ...first, verse: number });
                  return <li key={number}>
                    <button id={"verse-" + number} className="verse" onClick={() => openVerse(number)}
                      aria-current={number === address.verse ? "location" : undefined}
                      aria-label={"Pronunciation for verse " + number} aria-describedby={"verse-text-" + number}>
                      <span className="verse-number" aria-hidden="true">{twoDigits(number)}</span>
                      <span className="verse-text" lang="art" id={"verse-text-" + number}>
                        {phrases.map((group, j) => <span key={j}><span className="word-phrase">{group.join("-").toLowerCase()}</span>{" "}</span>)}
                      </span>
                      <Volume2 className="verse-sound" aria-hidden="true" />
                    </button>
                  </li>;
                })}
              </ol>
            </section>
          </div>
        </div>
        <nav className="pager" aria-label="Book pages"><div className="pager-inner">
          <button className="page-button" disabled={page === 0} onClick={() => turn(-1)} aria-label="Previous page">
            <ArrowLeft /> Previous</button>
          <span className="page-counter" role="status" aria-atomic="true"><span className="sr-only">Chapter {address.chapter}, </span>
            Page <strong>{page % PAGES_PER_CHAPTER + 1}</strong> of {PAGES_PER_CHAPTER}</span>
          <button className="page-button next" disabled={page === PAGE_COUNT - 1} onClick={() => turn(1)} aria-label="Next page">
            Next <ArrowRight /></button>
        </div></nav>
      </main>
    </div>
    {panel === "contents" && <ReaderDialog title="Contents" className="contents-dialog" onClose={closePanel}>
      <ChapterIndex chapter={address.chapter} onChoose={go} /></ReaderDialog>}
    {panel === "jump" && <JumpDialog digits={digits} address={address} onClose={closePanel} onGo={go} />}
    {panel === "pronunciation" && <Pronunciation address={address} phrases={phrasesOfVerse(digits, address)}
      initialPhrase={initialPhrase} onClose={closePanel} />}
  </div>;
}

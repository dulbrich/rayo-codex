import { ChevronRight, Layers } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";
import { type Address, MAX_LETTERS, MAX_SYLLABLES } from "@/lib/codex";
import { INDEXED_CHAPTERS, OPENING, passageHref, twoDigits } from "@/lib/book";

type Props = { chapter: number; onChoose: (address: Address) => void };

export default function ChapterIndex({ chapter, onChoose }: Props) {
  const list = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = list.current;
    const selected = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !selected) return;
    const frame = requestAnimationFrame(() => {
      const top = selected.offsetTop;
      if (top < nav.scrollTop) nav.scrollTop = top;
      else if (top + selected.offsetHeight > nav.scrollTop + nav.clientHeight) {
        nav.scrollTop = top + selected.offsetHeight - nav.clientHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [chapter]);

  function select(event: MouseEvent<HTMLAnchorElement>, next: Address) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onChoose(next);
  }

  return <div className="chapter-index">
    <div className="index-heading"><h2>Contents</h2></div>
    <div className="volume-heading"><Layers size={19} /><div><strong>Volume 01</strong>
      <span>{INDEXED_CHAPTERS} indexed chapters</span></div></div>
    <nav ref={list} className="chapter-list" aria-label="Chapters">
      {Array.from({ length: INDEXED_CHAPTERS }, (_, i) => {
        const next = { ...OPENING, chapter: i + 1 };
        return <a key={i} href={passageHref(next)} onClick={e => select(e, next)}
          aria-current={next.chapter === chapter ? "location" : undefined}>
          <span className="tree-branch" aria-hidden="true" />
          Chapter {twoDigits(next.chapter)}{next.chapter === chapter && <ChevronRight size={14} />}
        </a>;
      })}
    </nav>
    <div className="index-foot"><span className="status-dot" aria-hidden="true" />
      <div><strong>Indexed archive</strong>
        <span>{MAX_SYLLABLES.toLocaleString("en-US")} syllables<br />{MAX_LETTERS.toLocaleString("en-US")} letters</span>
      </div>
    </div>
  </div>;
}

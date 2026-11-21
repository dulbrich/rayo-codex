import Link from "next/link";
import { BookOpen, Info, Search } from "lucide-react";

type Props = { section: "reader" | "about"; onJump?: () => void; shortcut?: string };

export default function SiteHeader({ section, onJump, shortcut }: Props) {
  return <header className="site-header">
    <Link href="/" className="brand" aria-label="Rayo Codex reader">
      <img src="/icon.svg" width="34" height="34" alt="" />
      <span>Rayo Codex</span>
    </Link>
    <nav className="site-tabs" aria-label="Main navigation">
      <Link href="/" aria-current={section === "reader" ? "page" : undefined}><BookOpen /> Reader</Link>
      <Link href="/about" aria-current={section === "about" ? "page" : undefined}><Info /> About</Link>
    </nav>
    {onJump && <button className="jump-trigger" onClick={onJump} aria-label="Jump to a passage">
      <Search /><span>Jump to…</span><kbd>{shortcut} K</kbd>
    </button>}
  </header>;
}

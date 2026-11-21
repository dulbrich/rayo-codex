import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = { title: string; context?: string; className?: string; onClose: () => void; children: ReactNode };

export default function ReaderDialog({ title, context, className = "", onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); };
  }, []);
  return <dialog ref={dialog} className={"reader-dialog " + className} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-surface">
      <div className="dialog-heading">
        <div>{context && <p className="kicker">{context}</p>}<h2 id={titleId}>{title}</h2></div>
        <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X /></button>
      </div>
      {children}
    </div>
  </dialog>;
}

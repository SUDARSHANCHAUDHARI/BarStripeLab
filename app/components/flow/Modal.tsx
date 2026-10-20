"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { BTN_OUTLINE } from "./ui";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  // Wider sheet for the all-settings view.
  wide?: boolean;
  children: ReactNode;
}

// Native <dialog>: the browser traps focus, closes on Escape and returns focus to the opener.
export default function Modal({ open, title, onClose, wide = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself, not on its content.
      onClick={(event) => event.target === ref.current && ref.current?.close()}
      className={`w-[calc(100%-2rem)] ${wide ? "max-w-5xl" : "max-w-2xl"} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-board p-0 text-ink shadow-2xl backdrop:bg-ink/60`}
    >
      {open && (
        <div className="p-5 sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-3xl font-bold tracking-[-0.02em]">
              {title}
            </h2>
            <button type="button" onClick={() => ref.current?.close()} className={BTN_OUTLINE}>
              Close
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

"use client";

import { useState } from "react";

const SHORTCUTS = [
  ["Alt + S", "Next style"],
  ["Alt + C", "Change color"],
  ["Alt + D", "Download SVG"],
  ["Alt + P", "Download PNG"],
  ["Alt + H", "Share"],
];

export default function KeyboardShortcutsInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="shortcuts-panel"
        className="btn"
      >
        Keyboard shortcuts
      </button>

      {open && (
        <dl id="shortcuts-panel" className="mt-2 space-y-2 border-2 border-ink bg-white p-3 text-xs">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys} className="flex items-center gap-3">
              <dt>
                <kbd className="border-2 border-ink bg-field px-2 py-1 font-black">{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

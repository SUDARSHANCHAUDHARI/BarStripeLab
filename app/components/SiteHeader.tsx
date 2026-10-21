"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Panel = "settings" | "templates" | "csv";

type NavItem =
  | { label: string; href: string }
  | { label: string; panel: Panel };

// The flow listens for this event and opens the matching panel. It marks the event handled; on a page
// with no flow nobody does, so we go to the home page, which opens the panel from ?open=.
function openPanel(panel: Panel, router: ReturnType<typeof useRouter>) {
  const detail = { panel, handled: false };
  window.dispatchEvent(new CustomEvent("barstripelab:open", { detail }));
  if (!detail.handled) router.push(`/?open=${panel}`);
}

const ITEMS: NavItem[] = [
  { label: "Shapes", href: "/#shapes" },
  { label: "Templates", panel: "templates" },
  { label: "Many barcodes (CSV)", panel: "csv" },
  { label: "Do I need a GS1 number?", href: "/#gs1-number" },
];

const ITEM_CLASS =
  "flex min-h-[44px] items-center text-ink-2 hover:text-ink hover:underline";

function NavEntry({ item, onDone }: { item: NavItem; onDone: () => void }) {
  const router = useRouter();
  if ("href" in item) {
    return (
      <Link href={item.href} onClick={onDone} className={ITEM_CLASS}>
        {item.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        onDone();
        openPanel(item.panel, router);
      }}
      className={`${ITEM_CLASS} text-left`}
    >
      {item.label}
    </button>
  );
}

export default function SiteHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-[18px] font-bold leading-none text-ink sm:gap-2.5 sm:text-[22px]">
          <svg viewBox="0 0 20 16" className="h-4 w-5" fill="currentColor" aria-hidden="true" focusable="false">
            <rect x="0" width="2" height="16" />
            <rect x="4" width="1" height="16" />
            <rect x="7" width="4" height="16" />
            <rect x="13" width="1" height="16" />
            <rect x="16" width="2" height="16" />
          </svg>
          BarStripeLab
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-6 text-base">
            {ITEMS.map((item) => (
              <li key={item.label}>
                <NavEntry item={item} onDone={closeMenu} />
              </li>
            ))}
          </ul>
        </nav>

        <p className="ml-auto hidden text-[15px] text-ink-2 xl:block">Free. Made in your browser.</p>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <button
            type="button"
            onClick={() => openPanel("settings", router)}
            aria-keyshortcuts="/"
            className="flex min-h-[44px] items-center gap-2 rounded-full border-[1.5px] border-ink px-3 font-mono text-[15px] font-medium text-ink hover:bg-card sm:px-4"
          >
            {/* Short label on phones so the header fits 360 px without sideways scroll. */}
            <span className="sm:hidden">Settings</span>
            <span className="hidden sm:inline">All settings</span>
            <kbd className="hidden rounded-[5px] border border-b-2 border-rule bg-board px-1.5 py-0.5 text-[13px] sm:inline">/</kbd>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="min-h-[44px] rounded-full px-3 text-base font-bold text-ink hover:bg-card sm:px-4 lg:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-rule px-4 pb-3 lg:hidden">
          <ul className="mx-auto max-w-6xl text-base sm:px-6">
            {ITEMS.map((item) => (
              <li key={item.label}>
                <NavEntry item={item} onDone={closeMenu} />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

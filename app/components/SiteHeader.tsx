import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center px-4 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-2 text-base font-black uppercase tracking-wide text-ink">
        <svg viewBox="0 0 20 16" className="h-4 w-5" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="0" width="2" height="16" />
          <rect x="4" width="1" height="16" />
          <rect x="7" width="4" height="16" />
          <rect x="13" width="1" height="16" />
          <rect x="16" width="2" height="16" />
        </svg>
        BarStripeLab
      </Link>
    </header>
  );
}

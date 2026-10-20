import Link from "next/link";

const NOTICES_URL =
  "https://github.com/SUDARSHANCHAUDHARI/BarStripeLab/blob/main/THIRD_PARTY_NOTICES.md";

const LINK_CLASS = "font-bold text-ink underline hover:no-underline";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-10 text-[15px] text-ink-2 sm:px-6">
        <p>
          Free, with no account. Your number and design stay in your browser. The optional AI style
          maker is the only thing that goes online, and only with your own key.
        </p>
        <p>
          The scan check is a scan-safety estimate, not a GS1 verification. GS1 does not endorse
          decorated barcodes, so print a sample and test it before a full run.
        </p>
        <ul className="flex flex-wrap gap-x-6">
          <li>
            <Link href="/#shapes" className={`${LINK_CLASS} inline-flex min-h-[44px] items-center`}>
              All shapes
            </Link>
          </li>
          <li>
            <Link href="/barcode-tattoo" className={`${LINK_CLASS} inline-flex min-h-[44px] items-center`}>
              Barcode tattoos
            </Link>
          </li>
          <li>
            <Link href="/#gs1-number" className={`${LINK_CLASS} inline-flex min-h-[44px] items-center`}>
              Do I need a GS1 number?
            </Link>
          </li>
        </ul>
        <p>
          Shapes: Phosphor Icons (MIT) and game-icons.net (CC BY 3.0) &mdash;{" "}
          <a href={NOTICES_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            see notices
          </a>
        </p>
      </div>
    </footer>
  );
}

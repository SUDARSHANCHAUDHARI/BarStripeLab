import Link from "next/link";
import type { ReactNode } from "react";
import type { ShapeDef } from "@/types";
import Faq from "./Faq";
import ShapeThumb from "./ShapeThumb";

const H2_CLASS = "text-[clamp(28px,3.4vw,40px)] leading-[1.1]";

const BEFORE_DOWNLOAD = [
  {
    title: "The number is checked",
    body: "The last digit is validated as you type. If it's wrong, we show the right one.",
  },
  {
    title: "The size is exact",
    body: "SVG and PDF files come out in millimetres at the real print size, so nothing needs resizing.",
  },
  {
    title: "The artwork is read back",
    body: "We decode the finished barcode in your browser and check it matches your number.",
  },
  {
    title: "Nothing leaves your browser",
    body: "No account, no watermark, no upload. Your number and design stay on your device.",
  },
];

// Bar widths in SVG units, cycled to fill the symbol between the clear spaces.
const BAR_WIDTHS = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1];
const BARS_FROM = 22;
const BARS_TO = 218;
const BAND_TOP = 78;
const BARS_BOTTOM = 138;
const DOME = { cx: (BARS_FROM + BARS_TO) / 2, halfWidth: 62, rise: 62 };

// Retail-safe in one picture: bars follow the dome above the band and stay full height inside it.
function bandDiagram() {
  const bars: { x: number; width: number; top: number }[] = [];
  let x = BARS_FROM;
  for (let i = 0; ; i++) {
    const width = BAR_WIDTHS[i % BAR_WIDTHS.length];
    if (x + width > BARS_TO) break;
    const across = Math.max(0, 1 - ((x + width / 2 - DOME.cx) / DOME.halfWidth) ** 2);
    bars.push({ x, width, top: BAND_TOP - Math.sqrt(across) * DOME.rise });
    x += width + (i % 3 === 0 ? 3 : 2);
  }
  return bars;
}

function HowRetailSafeWorks() {
  return (
    <section aria-labelledby="how-title" className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <h2 id="how-title" className={H2_CLASS}>
          How Retail-safe works
        </h2>
        <p>
          Checkout scanners read along a line. If that line crosses a cut bar, the read fails. So
          Retail-safe keeps every bar full height along the bottom band, and the shape sits above it.
        </p>
        <p className="text-ink-2">
          Art lets the shape cut into the bars for a bolder look. Phones usually read it. Strict
          checkout scanners may not, so use it for things that don&rsquo;t need to scan at a till.
        </p>
        <p className="text-ink-2">Both modes keep the clear space on either side and the digits underneath.</p>
      </div>
      <figure className="rounded-[24px] bg-card p-5 sm:p-6">
        <svg
          viewBox="0 0 240 160"
          className="h-auto w-full"
          role="img"
          aria-label="A barcode with a dome-shaped top. The bars in the bottom band keep their full height. Only the bars above the band follow the shape."
        >
          <rect x="10" y={BAND_TOP} width="220" height={BARS_BOTTOM - BAND_TOP} rx="4" className="fill-pass-bg" />
          {bandDiagram().map((bar) => (
            <rect key={bar.x} x={bar.x} y={bar.top} width={bar.width} height={BARS_BOTTOM - bar.top} className="fill-ink" />
          ))}
          <text x="14" y="154" fontSize="10" className="fill-ink-2">Clear space</text>
          <text x="226" y="154" fontSize="10" textAnchor="end" className="fill-pass">Full-height band</text>
          <text x="120" y="12" fontSize="10" textAnchor="middle" className="fill-ink-2">Shape area</text>
        </svg>
        <figcaption className="mt-3 text-[15px] text-ink-2">
          The scanner line crosses the band, where no bar is cut.
        </figcaption>
      </figure>
    </section>
  );
}

function WhatHappens() {
  return (
    <section aria-labelledby="trust-title" className="space-y-5">
      <h2 id="trust-title" className={H2_CLASS}>
        What happens before you download
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BEFORE_DOWNLOAD.map((item) => (
          <li key={item.title} className="rounded-[14px] bg-card p-5">
            <h3 className="text-xl leading-tight">{item.title}</h3>
            <p className="mt-2 text-base text-ink-2">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ShapeLinksProps {
  shapes: ShapeDef[];
  title: string;
  id?: string;
  titleId: string;
}

// One link per shape page: the same grid on the home page and under each shape.
export function ShapeLinks({ shapes, title, id, titleId }: ShapeLinksProps) {
  return (
    <section id={id} aria-labelledby={titleId} className="space-y-5">
      <h2 id={titleId} className={H2_CLASS}>
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {shapes.map((shape) => (
          <li key={shape.id}>
            <Link
              href={`/shape/${shape.id}`}
              className="flex min-h-[56px] items-center gap-3 rounded-[14px] border-2 border-transparent bg-card px-3 py-2 leading-tight text-ink hover:border-ink"
            >
              <ShapeThumb shape={shape} className="h-8 w-8 shrink-0" />
              <span className="min-w-0 break-words text-base">{shape.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The home page slots the shape list between the explainer and the FAQ.
export default function InfoSections({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-20 space-y-20">
      <WhatHappens />
      <HowRetailSafeWorks />
      {children}
      <Faq />
    </div>
  );
}

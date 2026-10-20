import type { Metadata } from "next";
import Link from "next/link";
import Generator from "../components/Generator";

const TITLE = "Barcode tattoo generator — BarStripeLab";
const DESCRIPTION =
  "Turn a name, a date or a lucky number into a barcode for a tattoo or a gift. Free, runs in your browser, exports SVG and PNG for your tattoo artist.";
const URL_PATH = "/barcode-tattoo";
// A page's openGraph and twitter replace the layout's, so the image is repeated here.
const IMAGES = [{ url: "/og-image.png", width: 1200, height: 630, alt: "Barcode tattoo artwork by BarStripeLab" }];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL_PATH, type: "website", siteName: "BarStripeLab", images: IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: IMAGES },
};

const TIPS = [
  {
    title: "Names and dates",
    body: "Choose Code 128 to write a name or a date as text. It takes letters, numbers, spaces and symbols, up to 48 characters. A date like 14-02-1990 works as typed.",
  },
  {
    title: "Pick a bigger size",
    body: "Ink spreads a little as skin heals and ages, and thin gaps between bars can blur. Go larger than you think you need, and ask your artist what line width they can hold.",
  },
  {
    title: "Test before you book",
    body: "Print the file at the size you want and scan it with your phone. A tattooed barcode is art, and we can't promise it will scan.",
  },
];

export default function BarcodeTattooPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
      <div className="pb-10 pt-10 sm:pt-16">
        <h1 className="max-w-[16ch] text-[clamp(40px,5.4vw,68px)] leading-[1.02]">
          Barcode tattoo generator
        </h1>
        <p className="mt-4 max-w-[46ch] text-xl text-ink-2">
          Turn a birth date, a lucky number or a name into a barcode your tattoo artist can work from.
        </p>
      </div>
      <Generator mode="art" initialFormat="code128" />

      <section aria-labelledby="tattoo-tips-title" className="mt-20 space-y-5">
        <h2 id="tattoo-tips-title" className="text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
          Before you get inked
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {TIPS.map((tip) => (
            <li key={tip.title} className="rounded-[14px] bg-card p-5">
              <h3 className="text-xl leading-tight">{tip.title}</h3>
              <p className="mt-2 text-base text-ink-2">{tip.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-ink-2">
          Making a barcode for a product instead?{" "}
          <Link href="/" className="font-bold text-ink underline hover:no-underline">
            Use the main generator
          </Link>{" "}
          for the scan check and shop-ready sizes.
        </p>
      </section>
    </main>
  );
}

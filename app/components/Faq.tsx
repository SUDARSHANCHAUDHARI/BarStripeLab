"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

const GS1_US_URL = "https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode";

interface FaqItem {
  id: string;
  q: string;
  a: ReactNode;
}

const FAQ: FaqItem[] = [
  {
    id: "gs1-number",
    q: "Do I need a GS1 number?",
    a: (
      <>
        <p>
          Yes, if you sell in shops or on Amazon. Retailers and Amazon check that the number belongs
          to your brand in the GS1 registry. In the US, GS1 sells a single number for $30 with no
          renewal fee (
          <a href={GS1_US_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            GS1 US
          </a>
          ). Elsewhere, ask your local GS1 office.
        </p>
        <p>
          Numbers bought from resellers are often rejected by Amazon. For stock labels, tickets,
          posters or art, any digits work, and Code 128 takes letters as well. BarStripeLab draws the
          number you type. It can&rsquo;t issue or register one.
        </p>
      </>
    ),
  },
  {
    id: "sizes",
    q: "What size should I print?",
    a: (
      <>
        <p>
          An EAN-13 at 100% is 37.29 &times; 25.93 mm, including the clear space and the digits. You
          can print between 80% and 200%. Smaller is harder to scan, so ask your printer before you
          go below 90%. Rough or absorbent materials usually need a larger size.
        </p>
        <p>
          Download the SVG or PDF and place it at its exact size. Don&rsquo;t stretch it, and don&rsquo;t
          scale up a PNG.
        </p>
      </>
    ),
  },
  {
    id: "colours",
    q: "Which colours can I use?",
    a: (
      <>
        <p>
          Checkout scanners read with red light, so they need dark bars on a light background. Black,
          dark blue, dark green and dark brown work. Red, orange, yellow and light brown bars look
          blank to a red-light scanner, and light bars on a dark background don&rsquo;t read.
        </p>
        <p>BarStripeLab warns you when your colours are too pale and lowers the scan check.</p>
      </>
    ),
  },
  {
    id: "scanners",
    q: "Will it scan?",
    a: (
      <>
        <p>
          We can&rsquo;t promise it. The scan check is an estimate from the design: bar height, clear
          space, size and colour. Before you download, we also read the finished artwork back and check
          it decodes to your number. It is not a GS1 verification, and GS1 does not endorse decorated
          barcodes.
        </p>
        <p>
          Retail-safe keeps every bar full height along the bottom, with the shape above. Art lets the
          shape cut into the bars: phone cameras usually read it, strict checkout scanners may not.
          Print one copy at its real size and scan it with the devices you&rsquo;ll use before a full
          run. For big retailers, ask your printer for a verified print.
        </p>
      </>
    ),
  },
  {
    id: "amazon",
    q: "Will Amazon accept it?",
    a: (
      <>
        <p>
          Amazon matches your number to the GS1 registry and your brand name. A number from a reseller
          is the usual reason for a rejection. Amazon can also charge a fee for barcodes it can&rsquo;t
          read, reported at 3% of the unit cost.
        </p>
        <p>
          BarStripeLab checks your digits and your artwork. It can&rsquo;t tell you what Amazon will
          accept, so register the number to your brand first.
        </p>
      </>
    ),
  },
  {
    id: "formats",
    q: "Which formats can I make?",
    a: (
      <p>
        EAN-13, EAN-8, UPC-A and Code 128. The first three take digits only, and we add the last
        (check) digit if you leave it off. Code 128 takes letters, numbers, spaces and symbols, up to
        48 characters.
      </p>
    ),
  },
  {
    id: "privacy",
    q: "Is it free? Is my number sent anywhere?",
    a: (
      <p>
        It is free, with no account and no watermark. The page does all the work in your browser, so
        your number and your designs are never sent to a server.
      </p>
    ),
  },
  {
    id: "ai",
    q: "What is the AI style maker, and why does it want my API key?",
    a: (
      <p>
        It is optional. You describe your brand and Claude suggests a shape and a colour. It runs on
        your own Anthropic key, which stays in this tab&rsquo;s memory, goes only to api.anthropic.com
        and is never stored. Anthropic bills the requests to your account. Skip it and everything else
        works.
      </p>
    ),
  },
];

// Links such as /#gs1-number should land on an open answer.
function openFromHash() {
  const target = document.getElementById(window.location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) target.open = true;
}

export default function Faq() {
  useEffect(() => {
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <section aria-labelledby="faq-title" className="max-w-3xl space-y-5">
      <h2 id="faq-title" className="text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
        Questions people ask
      </h2>
      <div className="space-y-3">
        {FAQ.map((item) => (
          <details key={item.id} id={item.id} className="group rounded-[14px] bg-card">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 rounded-[14px] px-5 py-3 font-bold text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="shrink-0 font-mono text-xl font-medium text-ink-2 group-open:hidden">+</span>
              <span aria-hidden="true" className="hidden shrink-0 font-mono text-xl font-medium text-ink-2 group-open:inline">&minus;</span>
            </summary>
            <div className="space-y-3 px-5 pb-5 text-ink-2">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

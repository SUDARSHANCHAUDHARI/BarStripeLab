const FINE_PRINT = [
  {
    title: "Print and test",
    body: "Artistic bars are still bars. Print a sample at the real size, on the real material, and scan it with the devices your customers and shops use before you order a full run. Dark bars on a light background read best.",
  },
  {
    title: "Protected zone",
    body: "The band along the bottom keeps every bar at full height. Cropping it, covering it or squashing the image can make the code unreadable. Keep the whole picture, including the blank margins on either side.",
  },
  {
    title: "GS1 numbers",
    body: "Shops expect numbers licensed to your company by GS1. This tool draws whatever digits you enter; it cannot issue or register a number. Get yours from GS1 before you sell at retail.",
  },
];

const FAQ = [
  {
    q: "Is it free? Do I need an account?",
    a: "It is free and there is no account. The page does all the work in your browser, so your digits and designs are never sent to a server.",
  },
  {
    q: "How do I make a barcode like this?",
    a: "Pick a format, type your digits (leave off the last one and we add the check digit), choose a shape and a color, then download the SVG or PNG. The address bar always holds your exact design, so the share buttons send it as it is.",
  },
  {
    q: "Which shapes can I use?",
    a: "Browse the style grid and filter it by category. Every shape also has its own page that you can bookmark or send to a teammate.",
  },
  {
    q: "Will it scan?",
    a: "Usually, if the bars are dark, the protected bottom band is intact and the print is large enough. A warning appears under COLOR when the lightest bars are too pale. Test a printed sample either way.",
  },
  {
    q: "Do I need GS1 numbers?",
    a: "For selling through shops, yes. Retailers check numbers against the GS1 registry. For inventory labels, tickets, posters or art, any digits work, and Code 128 accepts text as well.",
  },
  {
    q: "Which formats are supported?",
    a: "EAN-13, EAN-8, UPC-A and Code 128. The first three take digits only and get a check digit if you leave it off. Code 128 takes letters, numbers, spaces and symbols, up to 48 characters.",
  },
  {
    q: "What is the AI generator and why does it want my API key?",
    a: "It is optional. You describe your brand and Claude suggests a shape and a color. It runs on your own Anthropic key, which stays in this tab's memory, goes only to api.anthropic.com and is never stored. Requests are billed to your Anthropic account. Skip it and everything else works.",
  },
];

export default function InfoSections() {
  return (
    <div className="mt-16 space-y-14">
      <section aria-labelledby="why-title" className="max-w-2xl space-y-3">
        <h2 id="why-title" className="text-lg font-black uppercase text-ink">
          Why BarStripeLab
        </h2>
        <p>
          A barcode is usually the plainest thing on a package. BarStripeLab turns it into a small
          piece of artwork: the bars are cut into a silhouette you choose, while a protected band
          along the bottom stays untouched so scanners can still read it.
        </p>
        <p>
          Pick a format, type your digits, choose a shape and a color, then take away a clean SVG or
          a high-resolution PNG. Nothing is uploaded and there is nothing to sign up for.
        </p>
      </section>

      <section aria-labelledby="fine-print-title" className="space-y-4">
        <h2 id="fine-print-title" className="text-lg font-black uppercase text-ink">
          The fine print
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FINE_PRINT.map((item) => (
            <div key={item.title} className="border-2 border-ink bg-white p-4">
              <h3 className="text-xs font-black uppercase text-ink">{item.title}</h3>
              <p className="mt-2">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-title" className="max-w-3xl space-y-4">
        <h2 id="faq-title" className="text-lg font-black uppercase text-ink">
          FAQ
        </h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-2 border-ink bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-3 text-xs font-black uppercase text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="shrink-0 group-open:hidden">+</span>
                <span aria-hidden="true" className="hidden shrink-0 group-open:inline">-</span>
              </summary>
              <p className="border-t-2 border-ink p-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

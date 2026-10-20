const NOTICES_URL =
  "https://github.com/SUDARSHANCHAUDHARI/BarStripeLab/blob/main/THIRD_PARTY_NOTICES.md";

export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-muted sm:px-6">
      <p>
        Shapes: Phosphor Icons (MIT) and game-icons.net (CC BY 3.0) &mdash;{" "}
        <a href={NOTICES_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline">
          see notices
        </a>
      </p>
    </footer>
  );
}

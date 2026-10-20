import type { ColorConfig, ScanFactor, ScanScore } from "@/types";
import { failsRedLight, lowestBarContrast } from "@/lib/colorEngine";
import type { DecodeState } from "./useDesignRender";

interface ScanCheckProps {
  score: ScanScore | null;
  decode: DecodeState;
  number: string;
  colorConfig: ColorConfig;
}

const BAND_TEXT: Record<ScanScore["band"], { label: string; tone: string }> = {
  likely: { label: "Likely fine. Test a printed sample.", tone: "text-pass" },
  risky: { label: "Risky. Test with your scanner.", tone: "text-warn" },
  fail: { label: "Likely to fail.", tone: "text-warn" },
};

// The two colour factors are explained once, in the colour notice, when they fail.
const COLOUR_FACTORS: ScanFactor["id"][] = ["redLight", "camera"];

const ICON_PATHS = {
  ok: "M3 9.5l4 4 8-9",
  warn: "M9 4v6M9 13.5v.5",
};

function Icon({ kind }: { kind: "ok" | "warn" }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={`mt-1 h-[18px] w-[18px] shrink-0 ${kind === "ok" ? "text-pass" : "text-warn"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[kind]} />
    </svg>
  );
}

export default function ScanCheck({ score, decode, number, colorConfig }: ScanCheckProps) {
  const redLight = failsRedLight(colorConfig);
  const lowContrast = !redLight && lowestBarContrast(colorConfig) < 3;
  const colourNotice = redLight || lowContrast;
  const factors = (score?.factors ?? []).filter((factor) => !(colourNotice && COLOUR_FACTORS.includes(factor.id)));
  const band = score ? BAND_TEXT[score.band] : null;

  return (
    <section aria-labelledby="scan-check-title" className="rounded-3xl bg-card p-6">
      <h3 id="scan-check-title" className="font-display text-lg font-bold text-ink">
        Scan check
      </h3>

      <div role="status" aria-live="polite">
        {score && band ? (
          <>
            <p className="mt-1 font-display text-6xl font-bold leading-none tracking-[-0.03em] text-ink">
              {score.score}
              <span className="ml-1 font-mono text-lg font-medium tracking-normal text-ink-2">/ 100</span>
            </p>
            <p className={`mb-4 mt-2 text-xl font-bold ${band.tone}`}>{band.label}</p>
          </>
        ) : (
          <p className="my-4 text-base text-ink-2">Checking your design...</p>
        )}
      </div>

      {factors.length > 0 && (
        <ul className="grid gap-2 text-base text-ink">
          {factors.map((factor) => {
            const full = factor.points >= factor.max;
            return (
              <li key={factor.id} className="flex gap-2">
                <Icon kind={full ? "ok" : "warn"} />
                <span>
                  <span className="sr-only">{full ? "Good: " : "Check: "}</span>
                  {factor.message}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {colourNotice && (
        <p className="mt-4 rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          {redLight ? (
            <>
              <strong>Red-laser scanners can&apos;t see these bars.</strong> Red, orange and pink look white under the red
              light checkout scanners use. Pick black, navy, dark green or another colour with little red.
            </>
          ) : (
            <>
              <strong>Low contrast.</strong> Light bars may not scan. Pick a darker colour so the bars stand out from the
              white background.
            </>
          )}
        </p>
      )}

      <div className="mt-4 border-t border-rule pt-4 text-base" aria-live="polite">
        {decode === "checking" && <p className="text-ink-2">Reading the barcode back...</p>}
        {decode === "ok" && (
          <p className="flex gap-2 text-ink">
            <Icon kind="ok" />
            <span>
              Decode check: we read <span className="font-mono">{number}</span> back from the picture.
            </span>
          </p>
        )}
        {decode === "failed" && (
          <p role="alert" className="flex gap-2 rounded-xl bg-warn-bg px-4 py-3 text-warn">
            <Icon kind="warn" />
            <span>
              <strong>We couldn&apos;t read this barcode back.</strong> You can still download it, but print a test copy and
              scan it before you use it.
            </span>
          </p>
        )}
      </div>

      <p className="mt-4 border-t border-rule pt-4 text-sm text-ink-2">
        Scan-safety estimate. Not a verification. It is our estimate from the design, not a GS1 check, and GS1 does not
        endorse decorated barcodes. Print one copy and scan it before a full print run.
      </p>
    </section>
  );
}

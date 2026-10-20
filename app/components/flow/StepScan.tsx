"use client";

import type { Ref } from "react";
import type { BarcodeFormat, ComposedBarcode } from "@/types";
import { magnification } from "@/lib/printSize";
import SizeControl from "./SizeControl";
import StepActions from "./StepActions";
import { sizeSummary } from "./sizes";
import { BTN_PRIMARY, BTN_QUIET, FOCUS, HINT, STEP_HEADING } from "./ui";

interface StepScanProps {
  format: BarcodeFormat;
  retailSafe: boolean;
  xMm: number;
  composed: ComposedBarcode | null;
  headingRef: Ref<HTMLHeadingElement>;
  // The label of the primary button: "Show my barcode", or a way back to the result when editing.
  continueLabel: string;
  onRetailSafe: (retailSafe: boolean) => void;
  onSize: (xMm: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

const CHOICES = [
  {
    retailSafe: true,
    title: "In shops or on Amazon",
    detail: "Retail-safe: the bars stay full height. A shape can sit on top.",
  },
  {
    retailSafe: false,
    title: "Only on phones, or just for looks",
    detail: "Art: more shape, shorter bars. Phones read it. Strict checkout scanners may not.",
  },
];

export default function StepScan({
  format,
  retailSafe,
  xMm,
  composed,
  headingRef,
  continueLabel,
  onRetailSafe,
  onSize,
  onContinue,
  onBack,
}: StepScanProps) {
  const percent = magnification(format, xMm);
  const sizeName = percent !== null ? `${percent}%${percent === 100 ? ", the standard" : ""}` : `bars ${xMm.toFixed(2)} mm wide`;
  const barcodeSize = composed ? ` (${sizeSummary(composed, xMm)})` : "";

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-ink-2">Step 2 of 4</p>
      <h2 ref={headingRef} tabIndex={-1} className={`${STEP_HEADING} max-w-[20ch]`}>
        Where will people scan it?
      </h2>
      <p className="mb-8 mt-4 max-w-[46ch] text-xl text-ink-2">
        This decides how tall the bars must be. You can change it later.
      </p>

      <fieldset>
        <legend className="sr-only">Where it will be scanned</legend>
        <div className="grid gap-3">
          {CHOICES.map((choice) => (
            <label
              key={choice.title}
              className="relative grid cursor-pointer grid-cols-[28px_1fr] gap-3 rounded-2xl border-2 border-rule bg-card p-5 has-[:checked]:border-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
            >
              <input
                type="radio"
                name="scan-where"
                checked={retailSafe === choice.retailSafe}
                onChange={() => onRetailSafe(choice.retailSafe)}
                className="mt-1 h-[22px] w-[22px] accent-ink"
              />
              <span>
                <strong className="block text-xl text-ink">
                  {choice.title}
                  {choice.retailSafe && (
                    <span className="ml-2 rounded-md bg-pass-bg px-2 py-1 align-[2px] font-mono text-xs font-medium text-pass">
                      Recommended
                    </span>
                  )}
                </strong>
                <span className="text-base text-ink-2">{choice.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <details className="group mt-6 rounded-2xl bg-card px-5 py-4">
        <summary className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md font-bold text-ink ${FOCUS}`}>
          <span>
            Size: {sizeName}
            {barcodeSize}
          </span>
          <span className="ml-auto font-normal underline underline-offset-4 group-open:hidden">Change size</span>
        </summary>
        <div className="mt-4">
          <SizeControl format={format} xMm={xMm} onChange={onSize} variant="slider" idPrefix="step2" />
          <p className={HINT}>
            This is the barcode itself: bars, clear space and numbers.{" "}
            {percent !== null
              ? "Smaller than 100% is harder to scan. Ask your printer before you go below 90%."
              : "Thinner bars are harder to print and scan. Ask your printer how thin they can print cleanly."}
          </p>
        </div>
      </details>

      <StepActions>
        <button type="button" onClick={onContinue} className={`${BTN_PRIMARY} max-sm:w-full`}>
          {continueLabel}
        </button>
        <button type="button" onClick={onBack} className={BTN_QUIET}>
          Back
        </button>
      </StepActions>
    </div>
  );
}

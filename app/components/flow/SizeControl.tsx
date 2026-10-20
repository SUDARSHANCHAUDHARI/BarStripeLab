"use client";

import type { BarcodeFormat } from "@/types";
import { magnification, xRangeMm } from "@/lib/printSize";
import { xFromPercent } from "./design";
import NumberField from "./NumberField";

interface SizeControlProps {
  format: BarcodeFormat;
  xMm: number;
  onChange: (xMm: number) => void;
  // "slider" is the folded control in step 2; "number" is the compact one in All settings.
  variant: "slider" | "number";
  idPrefix: string;
}

const PERCENT_MIN = 80;
const PERCENT_MAX = 200;

// EAN/UPC are sized in % of the standard; Code 128 by the width of its narrowest bar in mm.
export default function SizeControl({ format, xMm, onChange, variant, idPrefix }: SizeControlProps) {
  const id = `${idPrefix}-size`;
  const percent = magnification(format, xMm);
  const range = xRangeMm(format);

  if (percent !== null) {
    const set = (next: number) => onChange(xFromPercent(format, Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, next))));
    return variant === "slider" ? (
      <div className="flex items-center gap-4">
        <label htmlFor={id} className="sr-only">
          Print size in percent
        </label>
        <input
          id={id}
          type="range"
          min={PERCENT_MIN}
          max={PERCENT_MAX}
          step={5}
          value={percent}
          onChange={(event) => set(Number(event.target.value))}
          className="h-11 flex-1 accent-ink"
        />
        <output htmlFor={id} className="min-w-[4ch] font-mono text-base text-ink">
          {percent}%
        </output>
      </div>
    ) : (
      <NumberField
        id={id}
        label="Print size (%)"
        hint="80 to 200. 100 is the GS1 standard size."
        value={percent}
        min={PERCENT_MIN}
        max={PERCENT_MAX}
        step={5}
        onCommit={set}
      />
    );
  }

  const set = (next: number) => onChange(Math.min(range.max, Math.max(range.min, Number(next.toFixed(3)))));
  return variant === "slider" ? (
    <div className="flex items-center gap-4">
      <label htmlFor={id} className="sr-only">
        Width of the narrowest bar in millimetres
      </label>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={0.01}
        value={xMm}
        onChange={(event) => set(Number(event.target.value))}
        className="h-11 flex-1 accent-ink"
      />
      <output htmlFor={id} className="min-w-[9ch] font-mono text-base text-ink">
        {xMm.toFixed(2)} mm
      </output>
    </div>
  ) : (
    <NumberField
      id={id}
      label="Narrowest bar (mm)"
      hint={`${range.min} to ${range.max} mm. 0.33 is a common choice.`}
      value={xMm}
      min={range.min}
      max={range.max}
      step={0.01}
      onCommit={set}
    />
  );
}

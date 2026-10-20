import type { BarcodeFormat } from "@/types";

// GS1 minimum bar height as a multiple of the module width X. The ratio is the
// same at every magnification; shorter bars count as truncated (GS1 General
// Specifications symbol tables: 22.85 mm at X = 0.330 mm for EAN-13/UPC-A).
const MIN_BAR_HEIGHT_MODULES: Record<Exclude<BarcodeFormat, "code128">, number> = {
  ean13: 69.24,
  upca: 69.24,
  ean8: 55.24,
};

// Code 128 (AIM USS-128): at least 15% of the symbol length incl. quiet zones,
// and never under 6.35 mm (0.25") once a print size is known.
const CODE128_MIN_HEIGHT_RATIO = 0.15;
const CODE128_MIN_HEIGHT_MM = 6.35;

// Minimum blank margins in modules (GS1 for EAN/UPC, ISO/IEC 15417 for Code 128).
export const QUIET_ZONE_MODULES: Record<BarcodeFormat, { left: number; right: number }> = {
  ean13: { left: 11, right: 7 },
  ean8: { left: 7, right: 7 },
  upca: { left: 9, right: 9 },
  code128: { left: 10, right: 10 },
};

// Digit zone under the bars of an EAN/UPC symbol: GS1 gives 25.93 mm total
// height for 22.85 mm bars at X = 0.330 mm, so 3.08 mm = 9.33X.
export const HRI_ZONE_MODULES = (25.93 - 22.85) / 0.33;

export function minBarHeightModules(format: BarcodeFormat, barModules: number, xMm?: number): number {
  if (format === "code128") {
    const { left, right } = QUIET_ZONE_MODULES.code128;
    const ratioHeight = CODE128_MIN_HEIGHT_RATIO * (barModules + left + right);
    return Math.max(ratioHeight, xMm ? CODE128_MIN_HEIGHT_MM / xMm : 0);
  }
  return MIN_BAR_HEIGHT_MODULES[format];
}

import type { BarcodeFormat } from "@/types";

// GS1 minimum bar height as a multiple of the module width X. The ratio is the
// same at every magnification; shorter bars count as truncated (GS1 General
// Specifications symbol tables: 22.85 mm at X = 0.330 mm for EAN-13/UPC-A).
const MIN_BAR_HEIGHT_MODULES: Record<Exclude<BarcodeFormat, "code128">, number> = {
  ean13: 69.24,
  upca: 69.24,
  ean8: 55.24,
};

// Code 128 (AIM USS-128): at least 15% of the symbol length incl. quiet zones.
// shortcut: the 6.35 mm absolute floor needs a print size; apply it once one is chosen.
const CODE128_MIN_HEIGHT_RATIO = 0.15;
const CODE128_QUIET_MODULES = 20;

export function minBarHeightModules(format: BarcodeFormat, barModules: number): number {
  if (format === "code128") {
    return CODE128_MIN_HEIGHT_RATIO * (barModules + CODE128_QUIET_MODULES);
  }
  return MIN_BAR_HEIGHT_MODULES[format];
}

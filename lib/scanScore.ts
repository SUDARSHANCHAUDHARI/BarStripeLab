import type { BarcodeFormat, ComposedBarcode, ScanScore } from "@/types";

// Contract stub (Task 0). Task 3 (ENGINE) owns the implementation and tests.
export function scanScore(_input: {
  composed: ComposedBarcode;
  format: BarcodeFormat;
  xMm: number;
  barModules: number;
}): ScanScore {
  return { score: 0, band: "risky", capped: false, factors: [] };
}

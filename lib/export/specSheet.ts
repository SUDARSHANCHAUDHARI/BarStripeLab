import type { BarcodeFormat, ComposedBarcode, ScanScore } from "@/types";

// Contract stub (Task 0). Task 4 (EXPORT) owns the implementation and tests.
export function specSheetPdf(_input: {
  composed: ComposedBarcode;
  format: BarcodeFormat;
  value: string;
  xMm: number;
  bwrMm: number;
  retailSafe: boolean;
  score: ScanScore;
  shapeLabel: string;
}): Uint8Array {
  return new Uint8Array();
}

import type { BarcodeFormat } from "@/types";

// Contract stub (Task 0). Task 1 (ENGINE) owns the implementation and tests.

export function nominalXmm(format: BarcodeFormat): number {
  return format === "code128" ? 0.33 : 0.33;
}

export function xRangeMm(format: BarcodeFormat): { min: number; max: number } {
  return format === "code128" ? { min: 0.19, max: 1.0 } : { min: 0.264, max: 0.66 };
}

// Magnification in % for EAN/UPC; null for Code 128 (sized by X in mm).
export function magnification(format: BarcodeFormat, xMm: number): number | null {
  return format === "code128" ? null : Math.round((xMm / 0.33) * 100);
}

// SVG units to mm: BARCODE_SCALE (2) units per module.
export function sizeMm(units: number, xMm: number): number {
  return (units / 2) * xMm;
}

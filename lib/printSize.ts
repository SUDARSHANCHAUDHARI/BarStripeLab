import type { BarcodeFormat } from "@/types";
import { BARCODE_SCALE } from "@/lib/barcode";

// GS1 nominal module (100% magnification) for EAN/UPC; also the Code 128 default.
const NOMINAL_X_MM = 0.33;

export function nominalXmm(_format: BarcodeFormat): number {
  return NOMINAL_X_MM;
}

// EAN/UPC: GS1 retail POS range, 80% to 200%. Code 128: 7.5 mil (AIM USS-128) to 1 mm.
export function xRangeMm(format: BarcodeFormat): { min: number; max: number } {
  return format === "code128" ? { min: 0.19, max: 1.0 } : { min: 0.264, max: 0.66 };
}

// Magnification in %, to one decimal, for EAN/UPC; null for Code 128 (sized by X in mm).
export function magnification(format: BarcodeFormat, xMm: number): number | null {
  return format === "code128" ? null : Math.round((xMm / NOMINAL_X_MM) * 1000) / 10;
}

// SVG units to mm.
export function sizeMm(units: number, xMm: number): number {
  return (units / BARCODE_SCALE) * xMm;
}

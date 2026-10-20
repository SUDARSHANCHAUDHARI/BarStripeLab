import type { ComposedBarcode } from "@/types";

// Contract stub (Task 0). Task 4 (EXPORT) owns the implementation and tests.
export function withPngDpi(png: Uint8Array, _dpi: number): Uint8Array {
  return png;
}

export function snapPngWidth(
  composed: ComposedBarcode,
  xMm: number,
  _dpi: number
): { widthPx: number; snappedXmm: number } {
  return { widthPx: Math.round(composed.viewBox.width * 4), snappedXmm: xMm };
}

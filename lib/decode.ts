import type { BarcodeFormat, ComposedBarcode } from "@/types";

// Contract stub (Task 0). Task 2 (ENGINE) owns the implementation and tests.

// Decode one scan line of luminance samples (0 = black, 1 = white).
export function decodeScanline(_luminance: number[], _format: BarcodeFormat): string | null {
  return null;
}

// Browser only: rasterise the composed SVG and decode the middle of the band.
export async function decodeComposed(
  _composed: ComposedBarcode,
  _format: BarcodeFormat
): Promise<string | null> {
  return null;
}

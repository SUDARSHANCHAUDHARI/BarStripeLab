// @ts-ignore - bwip-js doesn't have type definitions
import bwipjs from "bwip-js";

export type BarcodeFormat = "ean13" | "ean8" | "code128";

// SVG units per barcode module; bwip-js `scale` sets it.
export const BARCODE_SCALE = 2;

export async function generateBarcodeSVG(
  text: string,
  format: BarcodeFormat = "ean13"
): Promise<string> {
  try {
    // Use toSVG which is the correct method
    const svg = await bwipjs.toSVG({
      bcid: format,
      text,
      scale: BARCODE_SCALE,
      height: 10, // in mm, will be scaled to pixels
      includetext: false,
    });
    return svg;
  } catch (error) {
    console.error("Barcode generation error:", error);
    throw new Error("Failed to generate barcode");
  }
}

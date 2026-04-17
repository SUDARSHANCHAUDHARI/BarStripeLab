// @ts-ignore - bwip-js doesn't have type definitions
import bwipjs from "bwip-js";

export type BarcodeFormat = "ean13" | "ean8" | "code128";

export async function generateBarcodeSVG(
  text: string,
  format: BarcodeFormat = "ean13"
): Promise<string> {
  try {
    // Use toSVG which is the correct method
    const svg = await bwipjs.toSVG({
      bcid: format,
      text,
      scale: 2,
      height: 10, // in mm, will be scaled to pixels
      includetext: false,
    });
    return svg;
  } catch (error) {
    console.error("Barcode generation error:", error);
    throw new Error("Failed to generate barcode");
  }
}

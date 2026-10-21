import type { BarcodeFormat, ComposedBarcode } from "@/types";
import { svgToCanvas } from "@/lib/exportImage";

// Reads an image the way phone scanner apps do: ZXing (the engine in many of
// them) with every format we make switched on. A scan line through a shape can
// hold a different, shorter valid code, and a phone app may show that instead.
export async function phoneRead(
  luminance: Uint8ClampedArray,
  width: number,
  height: number
): Promise<string | null> {
  // Loaded on demand so ZXing stays out of the initial page bundle.
  const Z = await import("@zxing/library");
  const hints = new Map<unknown, unknown>([
    [Z.DecodeHintType.TRY_HARDER, true],
    [
      Z.DecodeHintType.POSSIBLE_FORMATS,
      [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.CODE_128],
    ],
  ]);
  const bitmap = new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.RGBLuminanceSource(luminance, width, height)));
  try {
    return new Z.MultiFormatReader().decode(bitmap, hints as Map<never, never>).getText();
  } catch (err) {
    if (err instanceof Z.NotFoundException || err instanceof Z.ChecksumException || err instanceof Z.FormatException) {
      return null;
    }
    throw err;
  }
}

// True when a phone read shows a number other than the one we drew.
// UPC-A may come back as EAN-13 with a leading 0, which is the same code.
export function isOtherNumber(read: string | null, expected: string, format: BarcodeFormat): boolean {
  if (read === null || read === expected) return false;
  if (format === "upca" && read === `0${expected}`) return false;
  return !(format === "ean13" && expected.startsWith("0") && read === expected.slice(1));
}

// Phone-camera sized renders: what an app sees at arm's length and closer.
const PHONE_WIDTHS = [400, 800];

// Browser only: other numbers a phone app could read from the artwork.
export async function phoneOtherReads(
  composed: ComposedBarcode,
  format: BarcodeFormat,
  expected: string
): Promise<string[]> {
  const found = new Set<string>();
  for (const longSide of PHONE_WIDTHS) {
    const { width: w, height: h } = composed.viewBox;
    const width = Math.round(w >= h ? longSide : (longSide * w) / h);
    const canvas = await svgToCanvas(composed.svg, width);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const luminance = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < luminance.length; i++) {
      luminance[i] = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000;
    }
    const read = await phoneRead(luminance, canvas.width, canvas.height);
    if (isOtherNumber(read, expected, format)) found.add(read as string);
  }
  return [...found];
}

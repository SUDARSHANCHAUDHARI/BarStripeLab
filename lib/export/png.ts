import type { ComposedBarcode } from "@/types";
import { BARCODE_SCALE } from "@/lib/barcode";
import { crc32 } from "./crc32";

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MM_PER_INCH = 25.4;

// canvas.toBlob() writes no pHYs chunk, so print apps assume 72 dpi. This sets
// the physical resolution (pixels per metre) right after IHDR, replacing any
// existing pHYs.
export function withPngDpi(png: Uint8Array, dpi: number): Uint8Array {
  if (png.length < 33 || SIGNATURE.some((byte, i) => png[i] !== byte)) {
    throw new Error("Not a PNG file");
  }
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunkType = (offset: number) => String.fromCharCode(...png.subarray(offset + 4, offset + 8));
  if (chunkType(8) !== "IHDR") throw new Error("PNG has no IHDR chunk");

  const ppm = Math.round(dpi / (MM_PER_INCH / 1000));
  const phys = new Uint8Array(21);
  const physView = new DataView(phys.buffer);
  physView.setUint32(0, 9);
  phys.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  physView.setUint32(8, ppm);
  physView.setUint32(12, ppm);
  phys[16] = 1; // unit: metre
  physView.setUint32(17, crc32(phys.subarray(4, 17)));

  const parts: Uint8Array[] = [png.subarray(0, 8)];
  for (let offset = 8; offset < png.length; ) {
    if (offset + 12 > png.length) throw new Error("Truncated PNG chunk");
    const end = offset + 12 + view.getUint32(offset);
    if (end > png.length) throw new Error("Truncated PNG chunk");
    const type = chunkType(offset);
    if (type !== "pHYs") parts.push(png.subarray(offset, end));
    if (type === "IHDR") parts.push(phys);
    offset = end;
  }

  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  parts.reduce((offset, part) => (out.set(part, offset), offset + part.length), 0);
  return out;
}

// Whole pixels per module keep bar edges sharp; the snapped X is what prints.
export function snapPngWidth(
  composed: ComposedBarcode,
  xMm: number,
  dpi: number
): { widthPx: number; snappedXmm: number } {
  const modulePx = Math.max(1, Math.round((xMm / MM_PER_INCH) * dpi));
  return {
    widthPx: Math.round((composed.viewBox.width / BARCODE_SCALE) * modulePx),
    snappedXmm: (modulePx / dpi) * MM_PER_INCH,
  };
}

import { describe, it, expect } from "vitest";
import type { BarcodeFormat } from "@/types";
import { generateBarcodeSVG } from "./barcode";
import { extractColumns } from "./columnMapper";
import { isOtherNumber, phoneRead } from "./phoneRead";

const PX = 3; // pixels per SVG unit

// Rows of a plain symbol with white margins, as 8-bit luminance.
async function symbolRows(value: string, format: BarcodeFormat, rows: number, margin = 30) {
  const raw = await generateBarcodeSVG(value, format);
  const units = Number(raw.match(/viewBox="0 0 ([\d.]+)/)?.[1]) + 2 * margin;
  const row = new Array(Math.round(units * PX)).fill(255);
  for (const bar of extractColumns(raw)) {
    for (let x = Math.round((margin + bar.x) * PX); x < Math.round((margin + bar.x + bar.width) * PX); x++) row[x] = 0;
  }
  return { width: row.length, rows: Array.from({ length: rows }, () => row) };
}

function image(blocks: { width: number; rows: number[][] }[]) {
  const width = Math.max(...blocks.map((b) => b.width));
  const rows = blocks.flatMap((b) => b.rows.map((r) => [...r, ...new Array(width - r.length).fill(255)]));
  return { data: Uint8ClampedArray.from(rows.flat()), width, height: rows.length };
}

describe("phoneRead", () => {
  it("reads every format we make", async () => {
    for (const [value, format] of [
      ["5901234123457", "ean13"],
      ["96385074", "ean8"],
      ["036000291452", "upca"],
      ["BARSTRIPE-2026", "code128"],
    ] as const) {
      const { data, width, height } = image([await symbolRows(value, format, 40)]);
      expect(await phoneRead(data, width, height)).toBe(value);
    }
  });

  it("returns null for a blank image", async () => {
    expect(await phoneRead(new Uint8ClampedArray(300 * 40).fill(255), 300, 40)).toBeNull();
  });

  it("can read a different code than the one at the bottom, like a phone app", async () => {
    // Middle rows (where ZXing starts) hold an EAN-8; the band below holds the real UPC-A.
    const { data, width, height } = image([
      await symbolRows("96385074", "ean8", 60),
      await symbolRows("036000291452", "upca", 20),
    ]);
    const read = await phoneRead(data, width, height);
    expect(read).toBe("96385074");
    expect(isOtherNumber(read, "036000291452", "upca")).toBe(true);
  });
});

describe("isOtherNumber", () => {
  it("treats UPC-A read as EAN-13 with a leading 0 as the same code", () => {
    expect(isOtherNumber("0036000291452", "036000291452", "upca")).toBe(false);
    expect(isOtherNumber("036000291452", "036000291452", "upca")).toBe(false);
    expect(isOtherNumber("60002914", "036000291452", "upca")).toBe(true);
    expect(isOtherNumber(null, "5901234123457", "ean13")).toBe(false);
  });
});

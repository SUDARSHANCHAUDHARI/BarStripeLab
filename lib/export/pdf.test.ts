import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig } from "@/types";
import { generateBarcodeSVG } from "@/lib/barcode";
import { composeBarcode } from "@/lib/svgComposer";
import { getShape, SHAPES } from "@/lib/shapes";
import { sizeMm } from "@/lib/printSize";
import { composedToPdf, svgPathToPdf } from "./pdf";

const black: ColorConfig = {
  mode: "preset",
  solidColor: "#000000",
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
};

async function composed(value: string, format: BarcodeFormat, colorConfig = black, shapeId = "coffee") {
  return composeBarcode({
    rawBarcodeSvg: await generateBarcodeSVG(value, format),
    shape: getShape(shapeId),
    colorConfig,
    value,
    format,
    xMm: 0.33,
  });
}

const text = (pdf: Uint8Array) => new TextDecoder("latin1").decode(pdf);
const contentStream = (pdf: string) => pdf.match(/stream\n([\s\S]*?)\nendstream/)![1];
const mediaBox = (pdf: string) => pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!.slice(1).map(Number);
const PT_PER_MM = 72 / 25.4;

// Operators the writer may emit; anything else (e.g. an SVG `a`) is a bug.
const OPERATORS = new Set(["q", "Q", "cm", "rg", "re", "f", "m", "l", "c", "h", "W", "W*", "n", "BT", "ET", "Tf", "Tz", "Tm", "Tj"]);

function operators(stream: string): string[] {
  return stream
    .replace(/\((?:\\.|[^\\)])*\)/g, " ")
    .split(/\s+/)
    .filter((token) => token && !/^[-\d.]+$/.test(token) && !token.startsWith("/"));
}

function expectValidStructure(pdf: string) {
  expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
  expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
  const startxref = Number(pdf.match(/startxref\n(\d+)\n%%EOF/)![1]);
  expect(pdf.slice(startxref, startxref + 4)).toBe("xref");
  const [, count] = pdf.slice(startxref).match(/xref\n0 (\d+)\n/)!;
  const entries = [...pdf.slice(startxref).matchAll(/(\d{10}) (\d{5}) ([nf]) ?\r?\n/g)];
  expect(entries).toHaveLength(Number(count));
  entries.slice(1).forEach((entry, i) => {
    const offset = Number(entry[1]);
    expect(pdf.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`);
  });
  const length = Number(pdf.match(/\/Length (\d+)/)![1]);
  expect(contentStream(pdf).length).toBe(length);
}

describe("svgPathToPdf", () => {
  const identity = (x: number, y: number): [number, number] => [x, y];

  it("converts an arc to cubic Béziers on the circle", () => {
    const ops = svgPathToPdf("M0 0A10 10 0 0 1 20 0", identity);
    expect(operators(ops).every((op) => op === "m" || op === "c")).toBe(true);
    const curves = [...ops.matchAll(/([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+) c/g)].map((m) => m.slice(1).map(Number));
    expect(curves.length).toBeGreaterThanOrEqual(2);
    expect(curves.at(-1)!.slice(4)).toEqual([20, 0]);
    // Each segment's midpoint sits on the circle around (10, 0).
    let start = [0, 0];
    for (const [x1, y1, x2, y2, x, y] of curves) {
      const mx = (start[0] + 3 * x1 + 3 * x2 + x) / 8;
      const my = (start[1] + 3 * y1 + 3 * y2 + y) / 8;
      expect(Math.hypot(mx - 10, my)).toBeCloseTo(10, 2);
      start = [x, y];
    }
  });

  it("expands H, V, relative, Q and T commands", () => {
    expect(svgPathToPdf("M0 0H10V10h-10z", identity)).toBe("0 0 m\n10 0 l\n10 10 l\n0 10 l\nh");
    const quad = svgPathToPdf("M0 0Q10 10 20 0T40 0", identity);
    expect(operators(quad)).toEqual(["m", "c", "c"]);
    expect(quad.endsWith("40 0 c")).toBe(true);
  });

  it("reads compact arc flags and implicit repeats", () => {
    const ops = svgPathToPdf("M0 0a5 5 0 0010 0l1 1 2 2", identity);
    expect(ops.endsWith("11 1 l\n13 3 l")).toBe(true);
  });

  it("converts every shape path without NaN", () => {
    for (const shape of SHAPES) {
      for (const d of shape.paths) {
        const ops = svgPathToPdf(d, identity);
        expect(ops).not.toMatch(/NaN|Infinity/);
        expect(operators(ops).every((op) => ["m", "l", "c", "h"].includes(op))).toBe(true);
      }
    }
  });
});

describe("composedToPdf", () => {
  it("writes a valid PDF at the artwork size with bars drawn twice", async () => {
    const barcode = await composed("5901234123457", "ean13");
    const pdf = text(composedToPdf(barcode, 0.33));
    expectValidStructure(pdf);

    const [width, height] = mediaBox(pdf);
    expect(width).toBeCloseTo(sizeMm(barcode.viewBox.width, 0.33) * PT_PER_MM, 2);
    expect(height).toBeCloseTo(sizeMm(barcode.viewBox.height, 0.33) * PT_PER_MM, 2);

    const stream = contentStream(pdf);
    expect(operators(stream).every((op) => OPERATORS.has(op))).toBe(true);
    // One background rect plus every bar once per clip (one shape path + the band).
    expect(stream.match(/ re f\n/g)).toHaveLength(1 + barcode.bars.length * 2);
    expect(stream).toMatch(/W n/);
    expect(stream).toContain("(901234) Tj");
    expect(stream).toContain("/F1");
  });

  it("uses W* for even-odd shapes", async () => {
    const barcode = await composed("5901234123457", "ean13");
    const pdf = text(composedToPdf({ ...barcode, shape: { ...barcode.shape, fillRule: "evenodd" } }, 0.33));
    expect(contentStream(pdf)).toMatch(/W\* n/);
  });

  it("colours gradient bars one by one", async () => {
    const gradient: ColorConfig = {
      ...black,
      mode: "gradient",
      gradientStops: [
        { offset: 0, color: "#000000" },
        { offset: 1, color: "#0000ff" },
      ],
    };
    const barcode = await composed("5901234123457", "ean13", gradient);
    const stream = contentStream(text(composedToPdf(barcode, 0.33)));
    const fills = [...stream.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) rg/g)].map((m) => m.slice(1).map(Number));
    expect(new Set(fills.map(String)).size).toBeGreaterThan(10);
    // Skip the white background and the digit colour; left bars are near black, right bars near blue.
    const bars = fills.slice(1, 1 + barcode.bars.length * 2);
    expect(bars.every(([r, g]) => r === 0 && g === 0)).toBe(true);
    expect(bars[0][2]).toBeLessThan(0.1);
    expect(bars[barcode.bars.length - 1][2]).toBeGreaterThan(0.9);
  });

  it("handles a 48-char Code 128 without overflow", async () => {
    const value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijkl";
    const barcode = await composed(value, "code128", black, "pizza");
    const pdf = text(composedToPdf(barcode, 0.33));
    expectValidStructure(pdf);
    expect(mediaBox(pdf)[0]).toBeCloseTo(sizeMm(barcode.viewBox.width, 0.33) * PT_PER_MM, 2);
    expect(contentStream(pdf)).toContain(`(${value}) Tj`);
  });

  it("escapes PDF string delimiters in Code 128 text", async () => {
    const barcode = await composed("A(B)\\C", "code128");
    expect(contentStream(text(composedToPdf(barcode, 0.33)))).toContain("(A\\(B\\)\\\\C) Tj");
  });
});

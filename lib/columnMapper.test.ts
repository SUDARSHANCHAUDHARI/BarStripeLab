import { describe, it, expect } from "vitest";
import { generateBarcodeSVG } from "./barcode";
import { extractColumns } from "./columnMapper";

// Bars as bwip-js draws them: each stroke is centred on its x.
function bwipBars(svg: string): [number, number][] {
  const bars: [number, number][] = [];
  for (const m of svg.matchAll(/stroke-width="([\d.]+)" d="([^"]+)"/g)) {
    const width = Number(m[1]);
    for (const s of m[2].matchAll(/M([\d.]+) [\d.]+L/g)) {
      bars.push([Number(s[1]) - width / 2, width]);
    }
  }
  return bars.sort((a, b) => a[0] - b[0]);
}

describe("extractColumns", () => {
  it.each([
    ["5901234123457", "ean13"],
    ["96385074", "ean8"],
    ["HELLO WORLD", "code128"],
  ] as const)("places every bar where bwip-js drew it (%s)", async (value, format) => {
    const svg = await generateBarcodeSVG(value, format);
    const width = Number(svg.match(/viewBox="0 0 ([\d.]+)/)?.[1]);
    const columns = extractColumns(svg)
      .map((c): [number, number] => [
        Number(((c.x / 100) * width).toFixed(3)),
        Number(((c.width / 100) * width).toFixed(3)),
      ])
      .sort((a, b) => a[0] - b[0]);

    expect(columns).toEqual(bwipBars(svg));
  });
});

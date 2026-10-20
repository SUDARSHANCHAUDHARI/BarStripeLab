import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig } from "@/types";
import { generateBarcodeSVG, BARCODE_SCALE } from "./barcode";
import { composeBarcodeSvg } from "./svgComposer";
import { safeColor, buildGradientDef } from "./colorEngine";
import { SHAPES } from "./shapes";

const baseColor: ColorConfig = {
  mode: "preset",
  solidColor: "#000000",
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
};

async function compose(value: string, format: BarcodeFormat, color = baseColor) {
  const raw = await generateBarcodeSVG(value, format);
  const rawWidth = Number(raw.match(/viewBox="0 0 (\d+)/)?.[1]);
  const svg = composeBarcodeSvg({
    rawBarcodeSvg: raw,
    shape: SHAPES[0],
    colorConfig: color,
    value,
    format,
  });
  const width = Number(svg.match(/viewBox="0 0 ([\d.]+)/)?.[1]);
  const firstBarX = Number(svg.match(/<path d="M([\d.]+) /)?.[1]);
  return { svg, rawWidth, width, firstBarX };
}

describe("safeColor", () => {
  it("passes hex colors and rejects anything else", () => {
    expect(safeColor("#1DB954")).toBe("#1DB954");
    expect(safeColor("#fff")).toBe("#fff");
    expect(safeColor("red")).toBe("#000000");
    expect(safeColor('#000"/><script>')).toBe("#000000");
    expect(safeColor(undefined, "#111111")).toBe("#111111");
  });

  it("sanitizes gradient stop colors", () => {
    const def = buildGradientDef(
      { ...baseColor, mode: "gradient", gradientStops: [{ offset: 0, color: '"><x' }] },
      "g"
    );
    expect(def).not.toContain('"><x');
  });
});

describe("composeBarcodeSvg", () => {
  it("keeps markup typed into the custom color out of the SVG", async () => {
    const { svg } = await compose("5901234123457", "ean13", {
      ...baseColor,
      mode: "custom",
      solidColor: '#f00"/><script>alert(1)</script><rect fill="',
    });
    expect(svg).not.toContain("<script>");
  });

  it.each([
    ["5901234123457", "ean13", 11, 7],
    ["96385074", "ean8", 7, 7],
    ["036000291452", "upca", 9, 9],
    ["ABC", "code128", 10, 10],
  ] as const)("adds quiet zones for %s (%s)", async (value, format, left, right) => {
    const { rawWidth, width, firstBarX } = await compose(value, format);
    expect(width).toBe(rawWidth + (left + right) * BARCODE_SCALE);
    expect(firstBarX).toBe(left * BARCODE_SCALE);
  });

  it("masks the bars with the shape plus a full-width scan zone", async () => {
    const { svg } = await compose("5901234123457", "ean13");
    const mask = svg.match(/<mask[\s\S]*?<\/mask>/)?.[0] ?? "";
    expect(mask).toContain(SHAPES[0].paths[0].slice(0, 20));
    expect(mask).toMatch(/<rect x="0" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="white"\/>/);
    expect(svg).toContain('mask="url(#bsl-mask)"');
  });

  it("prints EAN-13 digits in the standard 1-6-6 groups", async () => {
    const { svg } = await compose("5901234123457", "ean13");
    const groups = [...svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
    expect(groups).toEqual(["5", "901234", "123457"]);
  });
});

describe("lowestBarContrast", () => {
  it("flags light colors and passes dark ones", async () => {
    const { lowestBarContrast } = await import("./colorEngine");
    expect(lowestBarContrast({ ...baseColor, mode: "custom", solidColor: "#000000" })).toBeCloseTo(21, 0);
    expect(lowestBarContrast({ ...baseColor, mode: "custom", solidColor: "#ffff00" })).toBeLessThan(1.5);
    expect(
      lowestBarContrast({
        ...baseColor,
        mode: "gradient",
        gradientStops: [{ offset: 0, color: "#000000" }, { offset: 1, color: "#eeeeee" }],
      })
    ).toBeLessThan(1.3);
  });
});

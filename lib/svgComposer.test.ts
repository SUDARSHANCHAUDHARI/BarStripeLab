import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig, ShapeDef } from "@/types";
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

async function compose(value: string, format: BarcodeFormat, color = baseColor, shape = SHAPES[0]) {
  const raw = await generateBarcodeSVG(value, format);
  const rawWidth = Number(raw.match(/viewBox="0 0 (\d+)/)?.[1]);
  const svg = composeBarcodeSvg({
    rawBarcodeSvg: raw,
    shape,
    colorConfig: color,
    value,
    format,
  });
  const [, , width, height] = svg.match(/viewBox="([^"]+)"/)![1].split(" ").map(Number);
  const firstBarX = Number(svg.match(/<path d="M([\d.]+) /)?.[1]);
  const mask = svg.match(/<mask[\s\S]*?<\/mask>/)?.[0] ?? "";
  const band = mask.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="white"\/><\/mask>/);
  const [bandX, bandY, bandWidth, bandHeight] = band ? band.slice(1).map(Number) : [];
  const bars = [...(svg.match(/<path d="(M[^"]+)" fill="[^"]+" mask=/)?.[1] ?? "").matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)v([\d.]+)/g)]
    .map((m) => m.slice(1).map(Number))
    .map(([x, y, w, h]) => ({ x, y, w, h }))
    .sort((a, b) => a.x - b.x);
  return { svg, raw, rawWidth, width, height, firstBarX, mask, bandX, bandY, bandWidth, bandHeight, bars };
}

const FORMATS = [
  ["5901234123457", "ean13"],
  ["96385074", "ean8"],
  ["036000291452", "upca"],
  ["ABC", "code128"],
  ["ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijkl", "code128"],
] as const;

const wideShape = { ...SHAPES[0], viewBox: [0, 0, 200, 100], paths: ["M0 0H200V100H0Z"] } as ShapeDef;
const tallShape = { ...SHAPES[0], viewBox: [0, 0, 50, 200], paths: ["M0 0H50V200H0Z"] } as ShapeDef;

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

  it.each(FORMATS)("places every %s (%s) bar exactly where bwip-js drew it", async (value, format) => {
    const { raw, bars } = await compose(value, format);
    // bwip-js draws each bar as a vertical stroke centred on x.
    const expected = [...raw.matchAll(/stroke-width="(\d+)" d="([^"]+)"/g)]
      .flatMap(([, w, d]) => [...d.matchAll(/M([\d.]+) /g)].map((m) => [Number(m[1]) - Number(w) / 2, Number(w)]))
      .sort((a, b) => a[0] - b[0]);
    // The quiet-zone test pins the first bar; this pins every other bar to it.
    const offset = bars[0].x - expected[0][0];
    expect(bars.map((bar) => [bar.x - offset, bar.w])).toEqual(expected);
  });

  it.each(FORMATS)("keeps a full-width, unmasked scan band for %s (%s)", async (value, format) => {
    const { rawWidth, width, bandX, bandY, bandWidth, bandHeight, bars } = await compose(value, format);
    expect(bandX).toBe(0);
    expect(bandWidth).toBe(width);
    expect(bandHeight).toBeGreaterThanOrEqual(rawWidth * 0.15);
    for (const bar of bars) {
      expect(bar.y).toBeLessThanOrEqual(bandY);
      expect(bar.y + bar.h).toBeGreaterThanOrEqual(bandY + bandHeight - 1e-6);
    }
  });

  it.each([
    ["wide", wideShape],
    ["tall", tallShape],
    ["default", SHAPES[0]],
  ] as const)("fits a %s shape to the bar width or the art height", async (_, shape) => {
    const { svg, rawWidth, bandY } = await compose("5901234123457", "ean13", baseColor, shape);
    const [sx, sy, s] = svg.match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/)!.slice(1).map(Number);
    const [vbX, vbY, vbW, vbH] = shape.viewBox;
    const shapeWidth = vbW * s;
    const shapeTop = sy + vbY * s;
    const shapeBottom = shapeTop + vbH * s;
    const fillsWidth = Math.abs(shapeWidth - rawWidth) < 0.01;
    const fillsHeight = shapeTop < rawWidth * 0.05; // touches the top padding
    expect(fillsWidth || fillsHeight).toBe(true);
    // No big empty strip above the shape.
    expect(shapeTop).toBeLessThan(rawWidth * 0.1);
    // Stands on the scan band: bottom edge reaches into it.
    expect(shapeBottom).toBeGreaterThan(bandY);
    expect(sx + vbX * s).toBeGreaterThanOrEqual(0);
  });

  it("keeps the art height within 0.55 to 1.5 times the bar width", async () => {
    for (const shape of [wideShape, tallShape]) {
      const { rawWidth, bandY } = await compose("5901234123457", "ean13", baseColor, shape);
      expect(bandY / rawWidth).toBeGreaterThan(0.5);
      expect(bandY / rawWidth).toBeLessThan(1.6);
    }
  });

  it("caps the art height of long Code 128 values", async () => {
    const { width, height } = await compose(FORMATS[4][0], "code128", baseColor, tallShape);
    expect(height / width).toBeLessThan(1);
  });

  it.each(FORMATS)("keeps the %s (%s) text inside the SVG", async (value, format) => {
    const { svg, width, height } = await compose(value, format);
    const texts = [...svg.matchAll(/<text([^>]*)>([^<]+)</g)];
    expect(texts.length).toBeGreaterThan(0);
    for (const [, attrs, content] of texts) {
      const attr = (name: string) => Number(attrs.match(new RegExp(` ${name}="([\\d.]+)"`))?.[1]);
      const extent = attr("textLength") || content.length * attr("font-size") * 0.62;
      expect(attr("x") - extent / 2).toBeGreaterThanOrEqual(0);
      expect(attr("x") + extent / 2).toBeLessThanOrEqual(width);
      expect(attr("y")).toBeLessThanOrEqual(height);
    }
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

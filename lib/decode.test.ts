import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig, ComposedBarcode } from "@/types";
import { BARCODE_SCALE, generateBarcodeSVG } from "./barcode";
import { calculateEAN13Checksum } from "./ean13checksum";
import { composeBarcode } from "./svgComposer";
import { contrastWithWhite, getSolidColor, normalizeStops } from "./colorEngine";
import { decodeScanline } from "./decode";
import { SHAPES } from "./shapes";

const solid = (color: string): ColorConfig => ({
  mode: "custom",
  solidColor: color,
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
});
const gradient = (from: string, to: string): ColorConfig => ({
  ...solid("#000000"),
  mode: "gradient",
  gradientStops: [{ offset: 0, color: from }, { offset: 1, color: to }],
});

const luminance = (hex: string) => 1.05 / contrastWithWhite(hex) - 0.05;

// sRGB mix of two 6-digit hex colours, as SVG interpolates gradient stops.
function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

// Colour of a bar at x: the linear gradient spans the bars path's bounding box.
function barColor(composed: ComposedBarcode, x: number): string {
  const config = composed.colorConfig;
  if (config.mode !== "gradient") return getSolidColor(config);
  const left = composed.bars[0].x;
  const last = composed.bars[composed.bars.length - 1];
  const t = (x - left) / (last.x + last.width - left);
  const stops = normalizeStops(config.gradientStops);
  const i = Math.max(0, stops.findIndex((stop) => stop.offset >= t) - 1);
  const [a, b] = [stops[i], stops[Math.min(i + 1, stops.length - 1)]];
  return mix(a.color, b.color, b.offset > a.offset ? (t - a.offset) / (b.offset - a.offset) : 0);
}

// The band row at 4 samples per SVG unit: white paper = 1, a bar = its luminance.
function scanline(composed: ComposedBarcode): number[] {
  const samples = Math.round(composed.viewBox.width * 4);
  return Array.from({ length: samples }, (_, i) => {
    const x = (i + 0.5) / 4;
    const bar = composed.bars.find((b) => x >= b.x && x < b.x + b.width);
    return bar ? luminance(barColor(composed, bar.x + bar.width / 2)) : 1;
  });
}

async function compose(value: string, format: BarcodeFormat, colorConfig = solid("#000000"), extra = {}) {
  const raw = await generateBarcodeSVG(value, format);
  return composeBarcode({ rawBarcodeSvg: raw, shape: SHAPES[0], colorConfig, value, format, ...extra });
}

const LONG_CODE128 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijkl";
const CASES = [
  ["5901234123457", "ean13"],
  ["96385074", "ean8"],
  ["036000291452", "upca"],
  ["HELLO WORLD", "code128"],
  [LONG_CODE128, "code128"],
] as const;

describe("decodeScanline", () => {
  it.each(CASES)("decodes %s (%s)", async (value, format) => {
    expect(decodeScanline(scanline(await compose(value, format)), format)).toBe(value);
  });

  it.each(CASES.slice(0, 3))("decodes a mirrored %s (%s)", async (value, format) => {
    expect(decodeScanline(scanline(await compose(value, format)).reverse(), format)).toBe(value);
  });

  it("decodes thinned bars at the extreme: 0.10 mm at 80%", async () => {
    const composed = await compose("5901234123457", "ean13", solid("#000000"), { xMm: 0.264, bwrMm: 0.1 });
    expect(decodeScanline(scanline(composed), "ean13")).toBe("5901234123457");
  });

  it("fails bars too light to tell from the paper", async () => {
    expect(decodeScanline(scanline(await compose("5901234123457", "ean13", solid("#eeeeee"))), "ean13")).toBeNull();
  });

  it("fails a gradient with a light stop and passes a dark one", async () => {
    const light = await compose("5901234123457", "ean13", gradient("#000000", "#eeeeee"));
    const dark = await compose("5901234123457", "ean13", gradient("#000000", "#14202e"));
    expect(decodeScanline(scanline(light), "ean13")).toBeNull();
    expect(decodeScanline(scanline(dark), "ean13")).toBe("5901234123457");
  });

  it("returns null for random noise and never throws", () => {
    let seed = 42;
    const random = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    for (const format of ["ean13", "ean8", "upca", "code128"] as const) {
      for (let run = 0; run < 50; run++) {
        expect(decodeScanline(Array.from({ length: 1000 }, random), format)).toBeNull();
      }
      expect(decodeScanline([], format)).toBeNull();
    }
  });

  it("rejects a wrong format and a bad check digit", async () => {
    expect(decodeScanline(scanline(await compose("96385074", "ean8")), "ean13")).toBeNull();
    // Left half of one valid EAN-13 + right half of another: every digit reads, the check digit fails.
    const a = await compose("5901234123457", "ean13");
    const b = await compose("0036000291452", "ean13");
    const middle = a.barsX + 46 * BARCODE_SCALE;
    const spliced = { ...a, bars: [...a.bars.filter((bar) => bar.x < middle), ...b.bars.filter((bar) => bar.x >= middle)] };
    expect(calculateEAN13Checksum("590123429145")).not.toBe("5901234291452");
    expect(decodeScanline(scanline(spliced), "ean13")).toBeNull();
  });
});

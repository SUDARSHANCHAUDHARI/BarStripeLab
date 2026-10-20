import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig } from "@/types";
import { generateBarcodeSVG, BARCODE_SCALE } from "./barcode";
import { composeBarcodeSvg } from "./svgComposer";
import { COLOR_PRESETS, failsRedLight, redLightReflectance } from "./colorEngine";
import { minBarHeightModules } from "./gs1";
import { getShape } from "./shapes";
import { templates } from "./templates";

const black: ColorConfig = {
  mode: "preset",
  solidColor: "#000000",
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
};

// Height of the full-width white band in the mask, in modules.
async function bandModules(value: string, format: BarcodeFormat, retailSafe: boolean) {
  const raw = await generateBarcodeSVG(value, format);
  const svg = composeBarcodeSvg({
    rawBarcodeSvg: raw,
    shape: getShape("coffee"),
    colorConfig: black,
    value,
    format,
    retailSafe,
  });
  const band = svg.match(/<rect x="0" y="[\d.]+" width="[\d.]+" height="([\d.]+)" fill="white"\/><\/mask>/);
  return Number(band?.[1]) / BARCODE_SCALE;
}

describe("retail-safe mode", () => {
  it.each([
    ["5901234123457", "ean13", 69.24],
    ["036000291452", "upca", 69.24],
    ["96385074", "ean8", 55.24],
  ] as const)("keeps %s (%s) bars at the GS1 minimum height", async (value, format, min) => {
    expect(await bandModules(value, format, true)).toBeCloseTo(min, 2);
    // Art mode is truncated: this is what the toggle explains.
    expect(await bandModules(value, format, false)).toBeLessThan(min / 2);
  });

  it("gives Code 128 at least 15% of the symbol length", async () => {
    const raw = await generateBarcodeSVG("HELLO WORLD", "code128");
    const barModules = Number(raw.match(/viewBox="0 0 (\d+)/)?.[1]) / BARCODE_SCALE;
    expect(minBarHeightModules("code128", barModules)).toBeCloseTo(0.15 * (barModules + 20), 5);
    expect(await bandModules("HELLO WORLD", "code128", true)).toBeGreaterThanOrEqual(
      0.15 * (barModules + 20) - 0.001
    );
  });
});

describe("red-light check", () => {
  it("flags red, orange and pink bars and passes dark ones", () => {
    expect(redLightReflectance("#000000")).toBe(0);
    expect(redLightReflectance("#ffffff")).toBeCloseTo(1, 5);
    for (const color of ["#ff6b35", "#ff006e", "#ff0000", "#f80"]) {
      expect(failsRedLight({ ...black, mode: "custom", solidColor: color })).toBe(true);
    }
    for (const color of ["#000000", "#0077be", "#2d6a4f", "#9b1c1c"]) {
      expect(failsRedLight({ ...black, mode: "custom", solidColor: color })).toBe(false);
    }
  });

  it("checks every gradient stop", () => {
    const gradient = (end: string): ColorConfig => ({
      ...black,
      mode: "gradient",
      gradientStops: [{ offset: 0, color: "#000000" }, { offset: 1, color: end }],
    });
    expect(failsRedLight(gradient("#ff006e"))).toBe(true);
    expect(failsRedLight(gradient("#14202e"))).toBe(false);
  });

  it("no preset or template uses a color red lasers cannot see", () => {
    for (const presetId of Object.keys(COLOR_PRESETS)) {
      expect(failsRedLight({ ...black, presetId }), presetId).toBe(false);
    }
    for (const t of templates) {
      expect(failsRedLight({ ...black, mode: "custom", solidColor: t.color }), t.name).toBe(false);
    }
  });
});

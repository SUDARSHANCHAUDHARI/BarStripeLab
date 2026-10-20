import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig, ScanFactor } from "@/types";
import { BARCODE_SCALE, generateBarcodeSVG } from "./barcode";
import { composeBarcode } from "./svgComposer";
import { scanScore } from "./scanScore";
import { SHAPES } from "./shapes";

const solid = (color: string): ColorConfig => ({
  mode: "custom",
  solidColor: color,
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
});

async function score(
  { color = solid("#000000"), xMm = 0.33, retailSafe = false, value = "5901234123457", format = "ean13" as BarcodeFormat } = {}
) {
  const raw = await generateBarcodeSVG(value, format);
  const composed = composeBarcode({ rawBarcodeSvg: raw, shape: SHAPES[0], colorConfig: color, value, format, xMm, retailSafe });
  return scanScore({ composed, format, xMm, barModules: composed.barsWidth / BARCODE_SCALE });
}

const factor = (factors: ScanFactor[], id: ScanFactor["id"]) => factors.find((f) => f.id === id)!;

describe("scanScore", () => {
  it("scores a black EAN-13 in Art mode as risky", async () => {
    const result = await score();
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.score).toBeLessThanOrEqual(80);
    expect(result.band).toBe("risky");
    expect(result.capped).toBe(false);
  });

  it("scores the same barcode Retail-safe as likely fine", async () => {
    const result = await score({ retailSafe: true });
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.band).toBe("likely");
  });

  it("caps bars red lasers cannot see", async () => {
    const result = await score({ color: solid("#ff006e") });
    expect(result.capped).toBe(true);
    expect(result.score).toBeLessThanOrEqual(20);
    expect(result.band).toBe("fail");
    expect(factor(result.factors, "redLight").message).toMatch(/red-laser scanners/i);
  });

  it("gives no print-size points below 75% and 5 in the thermal band", async () => {
    expect(factor((await score({ xMm: 0.2 })).factors, "printSize").points).toBe(0);
    expect(factor((await score({ xMm: 0.255 })).factors, "printSize").points).toBe(5);
    expect(factor((await score({ xMm: 0.33 })).factors, "printSize").points).toBe(15);
  });

  it("takes 10 off when a camera would see low contrast", async () => {
    const camera = factor((await score({ color: solid("#999999") })).factors, "camera");
    expect(camera.points).toBe(-10);
    expect(factor((await score()).factors, "camera").points).toBe(0);
  });

  it("scores a gradient by its worst stop", async () => {
    const gradient: ColorConfig = {
      ...solid("#000000"),
      mode: "gradient",
      gradientStops: [{ offset: 0, color: "#000000" }, { offset: 1, color: "#9b1c1c" }],
    };
    const worst = factor((await score({ color: solid("#9b1c1c") })).factors, "redLight").points;
    expect(factor((await score({ color: gradient })).factors, "redLight").points).toBe(worst);
    expect(worst).toBeLessThan(40);
  });

  it("measures Code 128 bar height against the 6.35 mm floor", async () => {
    const result = await score({ value: "ABC", format: "code128", xMm: 0.25, retailSafe: true });
    expect(factor(result.factors, "barHeight").points).toBe(30);
    const art = await score({ value: "ABC", format: "code128", xMm: 0.25 });
    expect(factor(art.factors, "barHeight").points).toBeLessThan(30);
  });

  it("keeps the score within 0 to 100 and the factors complete", async () => {
    const result = await score({ color: solid("#ffff00"), xMm: 0.1 });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.factors.map((f) => f.id).sort()).toEqual(
      ["barHeight", "camera", "digits", "printSize", "quietZones", "redLight"]
    );
  });
});

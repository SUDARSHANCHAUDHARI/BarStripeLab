import { describe, it, expect } from "vitest";
import type { BarcodeFormat, ColorConfig } from "@/types";
import { generateBarcodeSVG, BARCODE_SCALE } from "./barcode";
import { composeBarcodeSvg } from "./svgComposer";
import { safeColor, buildGradientDef } from "./colorEngine";

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
  const svg = composeBarcodeSvg(raw, "wave", color, "seed", value, format);
  const width = Number(svg.match(/viewBox="0 0 ([\d.]+)/)?.[1]);
  return { svg, rawWidth, width };
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
    ["ABC", "code128", 10, 10],
  ] as const)("adds quiet zones for %s (%s)", async (value, format, left, right) => {
    const { rawWidth, width, svg } = await compose(value, format);
    expect(width).toBe(rawWidth + (left + right) * BARCODE_SCALE);
    expect(svg).toContain(`translate(${left * BARCODE_SCALE} 0)`);
  });
});

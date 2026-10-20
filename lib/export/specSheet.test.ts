import { describe, it, expect } from "vitest";
import type { ColorConfig, ScanScore } from "@/types";
import { generateBarcodeSVG } from "@/lib/barcode";
import { composeBarcode } from "@/lib/svgComposer";
import { getShape } from "@/lib/shapes";
import { specSheetPdf } from "./specSheet";

const black: ColorConfig = {
  mode: "preset",
  solidColor: "#000000",
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [],
};

const score: ScanScore = { score: 97, band: "likely", capped: false, factors: [] };

async function sheet(value: string, format: "ean13" | "code128", xMm: number, colorConfig = black) {
  const composed = composeBarcode({
    rawBarcodeSvg: await generateBarcodeSVG(value, format),
    shape: getShape("coffee"),
    colorConfig,
    value,
    format,
    retailSafe: true,
    xMm,
  });
  const pdf = specSheetPdf({ composed, format, value, xMm, bwrMm: 0.02, retailSafe: true, score, shapeLabel: "Coffee" });
  return new TextDecoder("latin1").decode(pdf);
}

describe("specSheetPdf", () => {
  it("lists the printer's facts and the honest wording", async () => {
    const pdf = await sheet("5901234123457", "ean13", 0.396);
    expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    for (const expected of [
      "5901234123457",
      "EAN-13",
      "0.396 mm",
      "120%",
      "0.02 mm",
      "Retail-safe",
      "Coffee",
      "#000000",
      "97",
      "Scan-safety estimate. Not a verification.",
    ]) {
      expect(pdf).toContain(expected);
    }
    const startxref = Number(pdf.match(/startxref\n(\d+)/)![1]);
    expect(pdf.slice(startxref, startxref + 4)).toBe("xref");
  });

  it("states that Code 128 has no magnification and lists gradient stops", async () => {
    const gradient: ColorConfig = {
      ...black,
      mode: "gradient",
      gradientStops: [
        { offset: 0, color: "#111111" },
        { offset: 1, color: "#14202e" },
      ],
    };
    const pdf = await sheet("HELLO (1)", "code128", 0.5, gradient);
    expect(pdf).toContain("Code 128");
    expect(pdf).toContain("HELLO \\(1\\)");
    expect(pdf).toContain("0.5 mm");
    expect(pdf).toContain("#111111");
    expect(pdf).toContain("#14202e");
    expect(pdf).toContain("Code 128 is sized by X");
  });
});

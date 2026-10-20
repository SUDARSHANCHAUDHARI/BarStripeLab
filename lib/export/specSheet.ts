import type { BarcodeFormat, ComposedBarcode, ScanScore } from "@/types";
import { getSolidColor, normalizeStops } from "@/lib/colorEngine";
import { magnification, sizeMm } from "@/lib/printSize";
import { pdfString, PT_PER_MM, writePdf } from "./pdf";

const FORMAT_LABELS: Record<BarcodeFormat, string> = {
  ean13: "EAN-13",
  ean8: "EAN-8",
  upca: "UPC-A",
  code128: "Code 128",
};

const BAND_WORDS: Record<ScanScore["band"], string> = {
  likely: "Likely fine - test a printed sample",
  risky: "Risky - test with your scanner",
  fail: "Likely to fail",
};

// A4 portrait.
const PAGE = { width: 210 * PT_PER_MM, height: 297 * PT_PER_MM };
const MARGIN = 56;
const VALUE_X = 220;
const LINE = 18;

function mm(value: number, digits = 2): string {
  return `${Number(value.toFixed(digits))} mm`;
}

function size(width: number, height: number): string {
  const inch = (value: number) => Number((value / 25.4).toFixed(2));
  return `${Number(width.toFixed(2))} x ${Number(height.toFixed(2))} mm (${inch(width)} x ${inch(height)} in)`;
}

// One page for the printer: what was made and how to check it.
export function specSheetPdf(input: {
  composed: ComposedBarcode;
  format: BarcodeFormat;
  value: string;
  xMm: number;
  bwrMm: number;
  retailSafe: boolean;
  score: ScanScore;
  shapeLabel: string;
}): Uint8Array {
  const { composed, format, value, xMm, bwrMm, retailSafe, score, shapeLabel } = input;
  const units = (n: number) => sizeMm(n, xMm);
  const zoom = magnification(format, xMm);
  const quietRight = composed.viewBox.width - composed.barsX - composed.barsWidth;
  const { colorConfig } = composed;
  const colors =
    colorConfig.mode === "gradient"
      ? normalizeStops(colorConfig.gradientStops).map(
          (stop, i) => [i ? "" : `Gradient (${colorConfig.gradientKind})`, `${stop.color} at ${Math.round(stop.offset * 100)}%`]
        )
      : [["Bar colour", getSolidColor(colorConfig)]];

  const rows: [string, string][] = [
    ["Number", value],
    ["Format", FORMAT_LABELS[format]],
    ["Barcode size", size(units(composed.standardSize.width), units(composed.standardSize.height))],
    ["With shape", size(units(composed.viewBox.width), units(composed.viewBox.height))],
    ["Module width (X)", mm(xMm, 3)],
    ["Magnification", zoom === null ? "None: Code 128 is sized by X" : `${zoom}%`],
    ["Bar width reduction", mm(bwrMm, 3)],
    ["Quiet zones", `left ${mm(units(composed.barsX))}, right ${mm(units(quietRight))}`],
    ["Scan mode", retailSafe ? "Retail-safe (full-height bars)" : "Art (shortened bars)"],
    ...(colors as [string, string][]),
    ["Background", "#ffffff"],
    ["Shape", shapeLabel],
    ["Digits", "Live text (Courier Bold), not outlines"],
    ["Scan score", `${score.score}/100: ${BAND_WORDS[score.band]}`],
  ];
  const notes = [
    "Scan-safety estimate. Not a verification.",
    "This is not a GS1 verification. Test a printed sample with your scanner.",
    "Colours are RGB. Ask your printer to convert them to CMYK or a spot colour.",
  ];

  let y = PAGE.height - MARGIN;
  const line = (font: string, fontSize: number, x: number, text: string) =>
    `BT\n/${font} ${fontSize} Tf\n${x} ${Number(y.toFixed(2))} Td\n${pdfString(text)} Tj\nET`;
  const content = ["0.067 0.067 0.067 rg", line("F2", 18, MARGIN, "Barcode spec sheet")];
  y -= LINE * 2;
  for (const [label, text] of rows) {
    content.push(line("F2", 11, MARGIN, label), line("F1", 11, VALUE_X, text));
    y -= LINE;
  }
  y -= LINE;
  for (const note of notes) {
    content.push(line("F1", 11, MARGIN, note));
    y -= LINE;
  }

  return writePdf(PAGE.width, PAGE.height, content.join("\n"), ["Helvetica", "Helvetica-Bold"]);
}

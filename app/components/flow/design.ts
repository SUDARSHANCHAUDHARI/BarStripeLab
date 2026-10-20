import type { BarcodeFormat, ShapeDef } from "@/types";
import { getShape, isShapeId, SHAPES } from "@/lib/shapes";
import { nominalXmm, xRangeMm } from "@/lib/printSize";
import { DEFAULT_COLOR_CONFIG, NO_SHAPE_ID, type Design } from "@/lib/urlState";

export type FlowMode = "retail" | "art";

// The plain barcode: no art above the bars. The composer treats empty paths as "standard barcode only".
export const NO_SHAPE: ShapeDef = {
  id: NO_SHAPE_ID,
  label: "No shape",
  category: "symbols",
  viewBox: [0, 0, 1, 1],
  paths: [],
  source: "phosphor",
  description: "",
};

export const shapeFor = (id: string): ShapeDef => (id === NO_SHAPE_ID ? NO_SHAPE : getShape(id));

export const SHAPE_COUNT = SHAPES.length;

export function initialDesign(initialShape?: string, mode?: FlowMode): Design {
  return {
    format: "ean13",
    value: "",
    shape: initialShape && isShapeId(initialShape) ? initialShape : NO_SHAPE_ID,
    colorConfig: DEFAULT_COLOR_CONFIG,
    retailSafe: mode !== "art",
    xMm: nominalXmm("ean13"),
    bwrMm: 0,
    panel: "coffee-bag",
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Switching format keeps the print size when it still fits the new format's range.
export function withFormat(design: Design, format: BarcodeFormat): Design {
  if (format === design.format) return design;
  const { min, max } = xRangeMm(format);
  return { ...design, format, xMm: clamp(design.xMm, min, max) };
}

// EAN/UPC are sized by magnification (X = nominal x %); the stored value stays X in mm.
export const xFromPercent = (format: BarcodeFormat, percent: number) =>
  Number(((nominalXmm(format) * percent) / 100).toFixed(4));

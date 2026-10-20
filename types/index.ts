export type Column = {
  x: number;
  width: number;
  height: number;
  isBlack: boolean;
};

export type BarcodeFormat = "ean13" | "ean8" | "upca" | "code128";

export type ColorMode = "preset" | "custom" | "gradient";

export type GradientKind = "linear" | "radial";

export type GradientStop = {
  offset: number;
  color: string;
};

export type ColorConfig = {
  mode: ColorMode;
  solidColor: string;
  presetId: string;
  gradientKind: GradientKind;
  gradientStops: GradientStop[];
};

export type ShapeCategory =
  | "food"
  | "animals"
  | "people"
  | "objects"
  | "nature"
  | "symbols";

// A filled silhouette the barcode bars are masked into.
export type ShapeDef = {
  id: string;
  label: string;
  category: ShapeCategory;
  // Tight bounding box of the paths: [minX, minY, width, height].
  viewBox: [number, number, number, number];
  paths: string[];
  fillRule?: "nonzero" | "evenodd";
  source: "phosphor" | "game-icons";
  // One or two sentences for the shape's landing page.
  description: string;
};

// A complete look: what templates and the AI generator both produce.
export type StylePreset = {
  shape: string;
  color: string;
};

export type Template = StylePreset & {
  name: string;
};

// ---- Redesign contracts (see docs/superpowers/plans/2026-10-21-barstripelab-redesign.md) ----

// Geometry is in SVG units: BARCODE_SCALE units per module.
export type BarRect = { x: number; width: number };

export type DigitText = { text: string; x: number; y: number; size: number; fitWidth?: number };

// Structured layout every output (SVG, PDF, PNG, decode) draws from.
export type ComposedBarcode = {
  viewBox: { width: number; height: number };
  barsX: number;
  barsWidth: number;
  top: number;
  barHeight: number;
  bars: BarRect[];
  band: { y: number; height: number };
  shape: {
    paths: string[];
    fillRule: "nonzero" | "evenodd";
    translateX: number;
    translateY: number;
    scale: number;
  };
  digits: DigitText[];
  colorConfig: ColorConfig;
  // Standard barcode only: bars + quiet zones + digits, without the shape.
  standardSize: { width: number; height: number };
  svg: string;
};

export type PanelId = "coffee-bag" | "can" | "box" | "tag";

export type ScanFactor = {
  id: "redLight" | "barHeight" | "quietZones" | "printSize" | "digits" | "camera";
  label: string;
  points: number;
  max: number;
  message: string;
};

export type ScanScore = {
  score: number;
  band: "likely" | "risky" | "fail";
  capped: boolean;
  factors: ScanFactor[];
};

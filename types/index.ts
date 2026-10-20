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

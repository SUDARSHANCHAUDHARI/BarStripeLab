export type Column = {
  x: number;
  width: number;
  height: number;
  isBlack: boolean;
};

export type BarcodeFormat = "ean13" | "ean8" | "code128";

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

export type ModifierId =
  | "minimal"
  | "smooth"
  | "sharp"
  | "geometric"
  | "organic"
  | "bold"
  | "elegant";

export type ModifierConfig = {
  curvature: number;
  sharpness: number;
  exaggeration: number;
  simplification: number;
  symmetry: number;
  thickness: number;
};

export type SilhouetteStyleId =
  | "wave"
  | "mountain"
  | "city"
  | "palm"
  | "heart"
  | "tree"
  | "crown"
  | "coffee"
  | "star"
  | "whale";

export type SilhouetteDefinition = {
  id: string;
  label: string;
  buildPath: (
    width: number,
    height: number,
    modifier: ModifierConfig
  ) => string;
};

export type RenderedSilhouette = {
  styleId: string;
  modifierId: ModifierId;
  path: string;
};

// A complete look: what templates and the AI generator both produce.
export type StylePreset = {
  style: SilhouetteStyleId;
  modifier: ModifierId;
  color: string;
};

export type Template = StylePreset & {
  name: string;
};
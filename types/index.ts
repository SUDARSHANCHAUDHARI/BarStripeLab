export type Column = {
  x: number;
  width: number;
  height: number;
  isBlack: boolean;
};

export type Shape =
  | { type: "rect"; height: number }
  | { type: "triangle"; height: number }
  | { type: "curve"; height: number };

export type Style = Shape[];

export type Template = {
  name: string;
  color: string;
  style: Style;
};

export type ArtShape = {
  x: number;
  width: number;
  shape: Shape;
} | null;

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

export type ComposedSvgOptions = {
  rawBarcodeSvg: string;
  selectedStyle: string | Style | SilhouetteDefinition;
  colorConfig: ColorConfig;
  modifierId?: ModifierId;
  seed?: string;
};
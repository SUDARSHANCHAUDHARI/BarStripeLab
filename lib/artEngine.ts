import type {
  ModifierConfig,
  ModifierId,
  RenderedSilhouette,
  SilhouetteDefinition,
} from "@/types";
import { getStyleDefinition } from "@/lib/styles";

const MODIFIER_PRESETS: Record<ModifierId, ModifierConfig> = {
  minimal: {
    curvature: 0.18,
    sharpness: 0.24,
    exaggeration: 0.14,
    simplification: 0.94,
    symmetry: 0.86,
    thickness: 0.9,
  },
  smooth: {
    curvature: 0.92,
    sharpness: 0.12,
    exaggeration: 0.36,
    simplification: 0.6,
    symmetry: 0.58,
    thickness: 1,
  },
  sharp: {
    curvature: 0.18,
    sharpness: 0.94,
    exaggeration: 0.44,
    simplification: 0.54,
    symmetry: 0.62,
    thickness: 1,
  },
  geometric: {
    curvature: 0.1,
    sharpness: 0.82,
    exaggeration: 0.28,
    simplification: 0.86,
    symmetry: 0.94,
    thickness: 1.06,
  },
  organic: {
    curvature: 0.98,
    sharpness: 0.08,
    exaggeration: 0.42,
    simplification: 0.48,
    symmetry: 0.42,
    thickness: 1,
  },
  bold: {
    curvature: 0.44,
    sharpness: 0.56,
    exaggeration: 0.56,
    simplification: 0.52,
    symmetry: 0.66,
    thickness: 1.14,
  },
  elegant: {
    curvature: 0.84,
    sharpness: 0.2,
    exaggeration: 0.22,
    simplification: 0.78,
    symmetry: 0.82,
    thickness: 0.94,
  },
};

export const MODIFIER_IDS = Object.keys(MODIFIER_PRESETS) as ModifierId[];

export function isModifierId(value: string): value is ModifierId {
  return Object.prototype.hasOwnProperty.call(MODIFIER_PRESETS, value);
}

export function resolveStyleDefinition(
  selectedStyle: string | SilhouetteDefinition
): SilhouetteDefinition {
  return typeof selectedStyle === "string"
    ? getStyleDefinition(selectedStyle)
    : selectedStyle;
}

export function renderSilhouette(
  selectedStyle: string | SilhouetteDefinition,
  modifierId: ModifierId,
  width: number,
  height: number
): RenderedSilhouette {
  const definition = resolveStyleDefinition(selectedStyle);
  const modifier = MODIFIER_PRESETS[modifierId] ?? MODIFIER_PRESETS.smooth;

  return {
    styleId: definition.id,
    modifierId,
    path: definition.buildPath(width, height, modifier),
  };
}

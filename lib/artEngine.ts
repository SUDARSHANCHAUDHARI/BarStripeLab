import type {
  ModifierConfig,
  ModifierId,
  RenderedSilhouette,
  SilhouetteDefinition,
  Style,
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

const VALID_MODIFIERS = new Set<ModifierId>([
  "minimal",
  "smooth",
  "sharp",
  "geometric",
  "organic",
  "bold",
  "elegant",
]);

function countShapeTypes(style: Style) {
  return style.reduce(
    (acc, shape) => {
      acc[shape.type] += 1;
      return acc;
    },
    { rect: 0, triangle: 0, curve: 0 }
  );
}

export function inferStyleIdFromLegacyStyle(style: Style): string {
  if (!style.length) return "wave";

  const counts = countShapeTypes(style);

  if (counts.curve >= 2 && counts.rect >= 1) return "coffee";
  if (counts.curve >= 2 && counts.triangle >= 1) return "heart";
  if (counts.triangle >= 2 && counts.rect >= 1) return "crown";
  if (counts.rect >= counts.triangle && counts.rect >= counts.curve) return "city";
  if (counts.triangle >= counts.curve) return "mountain";
  return "wave";
}

export function inferModifierFromLegacyStyle(style: Style): ModifierId {
  if (!style.length) return "smooth";

  const avgHeight =
    style.reduce((sum, shape) => sum + shape.height, 0) / style.length;
  const counts = countShapeTypes(style);

  if (counts.rect === style.length) return "minimal";
  if (counts.triangle >= counts.curve && avgHeight > 48) return "sharp";
  if (counts.curve >= counts.triangle && avgHeight < 36) return "elegant";
  if (avgHeight > 55) return "bold";
  return "smooth";
}

export function resolveModifier(modifierId?: string, fallback: ModifierId = "smooth"): ModifierId {
  if (modifierId && VALID_MODIFIERS.has(modifierId as ModifierId)) {
    return modifierId as ModifierId;
  }
  return fallback;
}

export function resolveStyleDefinition(
  selectedStyle: string | Style | SilhouetteDefinition
): SilhouetteDefinition {
  if (Array.isArray(selectedStyle)) {
    return getStyleDefinition(inferStyleIdFromLegacyStyle(selectedStyle));
  }

  if (typeof selectedStyle === "string") {
    return getStyleDefinition(selectedStyle);
  }

  return selectedStyle;
}

export function renderSilhouette(
  selectedStyle: string | Style | SilhouetteDefinition,
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

export function resolveSelection(
  selectedStyle: string | Style | SilhouetteDefinition,
  modifierId?: string
): { styleDefinition: SilhouetteDefinition; modifierId: ModifierId } {
  if (Array.isArray(selectedStyle)) {
    const inferredModifier = inferModifierFromLegacyStyle(selectedStyle);
    return {
      styleDefinition: getStyleDefinition(inferStyleIdFromLegacyStyle(selectedStyle)),
      modifierId: resolveModifier(modifierId, inferredModifier),
    };
  }

  return {
    styleDefinition: resolveStyleDefinition(selectedStyle),
    modifierId: resolveModifier(modifierId, "smooth"),
  };
}
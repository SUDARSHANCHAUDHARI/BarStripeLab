import type { ColorConfig, GradientStop } from "@/types";

export const COLOR_PRESETS: Record<string, string> = {
  classic_black: "#000000",
  sunset_orange: "#ff6b35",
  ocean_blue: "#0077be",
  forest_green: "#2d6a4f",
  neon_pink: "#ff006e",
  royal_purple: "#5a189a",
};

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Colors are written into SVG attributes, so only hex values may pass.
export function safeColor(value: string | undefined, fallback = "#000000"): string {
  const trimmed = (value ?? "").trim();
  return HEX_COLOR.test(trimmed) ? trimmed : fallback;
}

export function normalizeStops(stops: GradientStop[]): GradientStop[] {
  if (!stops.length) {
    return [
      { offset: 0, color: "#111111" },
      { offset: 1, color: "#888888" },
    ];
  }

  return [...stops]
    .map((stop) => ({
      offset: Math.max(0, Math.min(1, stop.offset)),
      color: safeColor(stop.color),
    }))
    .sort((a, b) => a.offset - b.offset);
}

export function getSolidColor(config: ColorConfig): string {
  if (config.mode === "preset") {
    return COLOR_PRESETS[config.presetId] || "#000000";
  }

  if (config.mode === "custom") {
    return safeColor(config.solidColor);
  }

  return normalizeStops(config.gradientStops)[0]?.color || "#000000";
}

export function buildPaintValue(config: ColorConfig, gradientId: string): string {
  if (config.mode === "gradient") {
    return `url(#${gradientId})`;
  }
  return getSolidColor(config);
}

export function buildGradientDef(config: ColorConfig, gradientId: string): string {
  if (config.mode !== "gradient") {
    return "";
  }

  const stops = normalizeStops(config.gradientStops);
  const tag =
    config.gradientKind === "radial"
      ? `<radialGradient id="${gradientId}" cx="50%" cy="45%" r="75%">`
      : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">`;
  const stopTags = stops
    .map(
      (stop) =>
        `<stop offset="${Math.round(stop.offset * 100)}%" stop-color="${stop.color}" />`
    )
    .join("");
  const closeTag = config.gradientKind === "radial" ? "</radialGradient>" : "</linearGradient>";

  return `${tag}${stopTags}${closeTag}`;
}

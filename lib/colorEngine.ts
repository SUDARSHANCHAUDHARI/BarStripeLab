import type { ColorConfig, GradientStop } from "@/types";

// Every preset must stay dark under red light (see failsRedLight): orange and
// pink look white to red-laser checkout scanners.
export const COLOR_PRESETS: Record<string, string> = {
  classic_black: "#000000",
  ink_navy: "#14202e",
  ocean_blue: "#0077be",
  forest_green: "#2d6a4f",
  deep_teal: "#0b5563",
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

function relativeLuminance(hex: string): number {
  let digits = hex.slice(1);
  if (digits.length <= 4) {
    digits = digits.split("").map((d) => d + d).join("");
  }
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(digits.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG contrast ratio of a bar color against the white background (1 to 21).
export function contrastWithWhite(color: string): number {
  return 1.05 / (relativeLuminance(safeColor(color)) + 0.05);
}

// Lightest color across the active mode: what a scanner has to read.
export function lowestBarContrast(config: ColorConfig): number {
  const colors =
    config.mode === "gradient"
      ? normalizeStops(config.gradientStops).map((stop) => stop.color)
      : [getSolidColor(config)];
  return Math.min(...colors.map(contrastWithWhite));
}

// Checkout scanners read bars under red light (~660 nm), where a bar's
// reflectance is roughly its linear red channel. ISO/IEC 15416 needs the
// darkest element to reflect at most half of what the paper does.
// shortcut: screen RGB stands in for ink reflectance; a print verifier is the real test.
const RED_LIGHT_MAX_REFLECTANCE = 0.5;

export function redLightReflectance(color: string): number {
  const digits = safeColor(color).slice(1);
  const red = digits.length <= 4 ? digits[0] + digits[0] : digits.slice(0, 2);
  const channel = parseInt(red, 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

// True when any bar color (each gradient stop) would vanish for a red laser.
export function failsRedLight(config: ColorConfig): boolean {
  const colors =
    config.mode === "gradient"
      ? normalizeStops(config.gradientStops).map((stop) => stop.color)
      : [getSolidColor(config)];
  return colors.some((color) => redLightReflectance(color) > RED_LIGHT_MAX_REFLECTANCE);
}

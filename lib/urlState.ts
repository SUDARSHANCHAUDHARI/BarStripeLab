import type { BarcodeFormat, ColorConfig } from "@/types";
import { COLOR_PRESETS, safeColor } from "@/lib/colorEngine";
import { isShapeId } from "@/lib/shapes";

export type Design = {
  format: BarcodeFormat;
  value: string;
  shape: string;
  colorConfig: ColorConfig;
  retailSafe: boolean;
};

export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  mode: "preset",
  solidColor: "#000000",
  presetId: "classic_black",
  gradientKind: "linear",
  gradientStops: [
    { offset: 0, color: "#111111" },
    { offset: 1, color: "#888888" },
  ],
};

const FORMATS: BarcodeFormat[] = ["ean13", "ean8", "upca", "code128"];
// Longest value any format accepts (Code 128).
const MAX_VALUE_LENGTH = 48;

const hex = (color: string) => safeColor(color).slice(1);
const fromHex = (digits: string | undefined) => safeColor(`#${digits ?? ""}`, "");

// Color is one token: p-<preset>, h-<hex>, or g-<linear|radial>-<hex>-<hex> (hex without "#").
function encodeColor(config: ColorConfig): string {
  if (config.mode === "preset") return `p-${config.presetId}`;
  if (config.mode === "custom") return `h-${hex(config.solidColor)}`;
  const stops = config.gradientStops;
  const first = stops[0]?.color ?? "#111111";
  const last = stops[stops.length - 1]?.color ?? "#888888";
  return `g-${config.gradientKind}-${hex(first)}-${hex(last)}`;
}

function decodeColor(token: string, fallback: ColorConfig): ColorConfig {
  const [kind, ...rest] = token.split("-");

  if (kind === "p" && rest[0] && Object.prototype.hasOwnProperty.call(COLOR_PRESETS, rest[0])) {
    return { ...fallback, mode: "preset", presetId: rest[0] };
  }

  if (kind === "h" && fromHex(rest[0])) {
    return { ...fallback, mode: "custom", solidColor: fromHex(rest[0]) };
  }

  const [gradientKind, from, to] = rest;
  if (
    kind === "g" &&
    (gradientKind === "linear" || gradientKind === "radial") &&
    fromHex(from) &&
    fromHex(to)
  ) {
    return {
      ...fallback,
      mode: "gradient",
      gradientKind,
      gradientStops: [
        { offset: 0, color: fromHex(from) },
        { offset: 1, color: fromHex(to) },
      ],
    };
  }

  return fallback;
}

export function encodeDesign(design: Design): string {
  return new URLSearchParams({
    f: design.format,
    v: design.value,
    s: design.shape,
    c: encodeColor(design.colorConfig),
    r: design.retailSafe ? "1" : "0",
  }).toString();
}

// Everything in the query is untrusted: each field falls back to `fallback` unless it passes its allow-list.
export function decodeDesign(search: string, fallback: Design): Design {
  const params = new URLSearchParams(search);
  const f = params.get("f");
  const v = params.get("v");
  const s = params.get("s");
  const c = params.get("c");
  const r = params.get("r");

  return {
    format: FORMATS.find((format) => format === f) ?? fallback.format,
    value: v === null ? fallback.value : v.slice(0, MAX_VALUE_LENGTH),
    shape: s !== null && isShapeId(s) ? s : fallback.shape,
    colorConfig: c ? decodeColor(c, fallback.colorConfig) : fallback.colorConfig,
    retailSafe: r === "1" ? true : r === "0" ? false : fallback.retailSafe,
  };
}

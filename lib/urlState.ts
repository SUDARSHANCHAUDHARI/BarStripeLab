import type { BarcodeFormat, ColorConfig, PanelId } from "@/types";
import { COLOR_PRESETS, safeColor } from "@/lib/colorEngine";
import { isShapeId } from "@/lib/shapes";
import { nominalXmm, xRangeMm } from "@/lib/printSize";
import { PANELS } from "@/lib/panels";

export type Design = {
  format: BarcodeFormat;
  value: string;
  shape: string;
  colorConfig: ColorConfig;
  retailSafe: boolean;
  // Module width in mm (EAN/UPC: 0.330 x magnification).
  xMm: number;
  // Bars thinner by this many mm (0-0.10).
  bwrMm: number;
  panel: PanelId;
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

// The flow's "No shape" choice: the plain barcode.
export const NO_SHAPE_ID = "none";
const DEFAULT_PANEL: PanelId = "coffee-bag";
// Bar width reduction range in mm.
const MAX_BWR_MM = 0.1;

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

// Four decimals keep 0.3465 mm (105%) exact and drop float noise.
const round4 = (value: number) => Number(value.toFixed(4));

export function encodeDesign(design: Design): string {
  return new URLSearchParams({
    f: design.format,
    v: design.value,
    s: design.shape,
    c: encodeColor(design.colorConfig),
    r: design.retailSafe ? "1" : "0",
    x: String(round4(design.xMm)),
    b: String(round4(design.bwrMm)),
    p: design.panel,
  }).toString();
}

// Number() would accept "" and "0x10"; only plain decimals pass.
function parseDecimal(value: string | null): number | null {
  if (value === null || !/^-?\d+(\.\d+)?$/.test(value)) return null;
  return Number(value);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Everything in the query is untrusted: each field falls back to `fallback` unless it passes its allow-list.
export function decodeDesign(search: string, fallback: Design): Design {
  const params = new URLSearchParams(search);
  const f = params.get("f");
  const v = params.get("v");
  const s = params.get("s");
  const c = params.get("c");
  const r = params.get("r");
  const x = parseDecimal(params.get("x"));
  const b = parseDecimal(params.get("b"));
  const p = params.get("p");

  const format = FORMATS.find((candidate) => candidate === f) ?? fallback.format;
  const range = xRangeMm(format);
  // A link without x keeps the size, unless its format changed: then the new format's standard size.
  const defaultX = format === fallback.format ? fallback.xMm : nominalXmm(format);

  return {
    format,
    value: v === null ? fallback.value : v.slice(0, MAX_VALUE_LENGTH),
    shape: s !== null && (s === NO_SHAPE_ID || isShapeId(s)) ? s : fallback.shape,
    colorConfig: c ? decodeColor(c, fallback.colorConfig) : fallback.colorConfig,
    retailSafe: r === "1" ? true : r === "0" ? false : fallback.retailSafe,
    xMm: clamp(x ?? defaultX, range.min, range.max),
    bwrMm: b === null ? fallback.bwrMm : clamp(b, 0, MAX_BWR_MM),
    panel: p === null ? fallback.panel : (PANELS.find((panel) => panel.id === p)?.id ?? DEFAULT_PANEL),
  };
}

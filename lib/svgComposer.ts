import type { BarRect, BarcodeFormat, ColorConfig, ComposedBarcode, DigitText, ShapeDef } from "@/types";
import { extractColumns } from "@/lib/columnMapper";
import { buildGradientDef, buildPaintValue } from "@/lib/colorEngine";
import { BARCODE_SCALE } from "@/lib/barcode";
import { HRI_ZONE_MODULES, QUIET_ZONE_MODULES, minBarHeightModules } from "@/lib/gs1";
import { nominalXmm, sizeMm } from "@/lib/printSize";

// Layout ratios, relative to the layout base (see ART_BASE_MAX_MODULES).
const TOP_PAD_RATIO = 0.04;
// The art box follows the shape's aspect within these bounds.
const ART_MIN_RATIO = 0.55;
const ART_MAX_RATIO = 1.5;
// Long Code 128 values give bars up to ~560 modules wide. Scaling the art with
// that would print a 48-char label poster-tall, so the art (and text) scale
// with at most 2x an EAN-13 (95 modules) and a wide shape spreads sideways.
const ART_BASE_MAX_MODULES = 190;
// Protected band at the bottom: every bar is drawn in full here. Art mode keeps
// it at 16% of the bar width, far below the GS1 minimum bar height (truncated:
// phone apps read it, strict checkout scanners may not). Retail-safe mode
// raises it to the GS1 minimum (lib/gs1.ts).
const SCAN_ZONE_RATIO = 0.16;
const LABEL_ZONE_RATIO = 0.13;
const LABEL_FONT_RATIO = 0.72;
// Monospace glyph advance per font-size unit.
const GLYPH_WIDTH_RATIO = 0.62;
// How far the shape reaches down into the scan zone so the two join.
const SHAPE_OVERLAP_RATIO = 0.35;

// Thinned bars keep at least this width in SVG units (half a module).
const MIN_BAR_UNITS = 1;

export type ComposeOptions = {
  rawBarcodeSvg: string;
  shape: ShapeDef;
  colorConfig: ColorConfig;
  value: string;
  format: BarcodeFormat;
  // Unique per SVG on a page, so masks and gradients do not collide.
  idPrefix?: string;
  // Keep every bar at the GS1 minimum height and draw the art above it.
  retailSafe?: boolean;
  // Module width in mm: sets the SVG's physical width/height.
  xMm?: number;
  // Bars thinner by this many mm, centres kept, for ink spread.
  bwrMm?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseWidth(svg: string): number {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/\s+/).map(Number);
  return viewBox?.[2] || 190;
}

function fmt(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function renderText({ text, x, y, size, fitWidth }: DigitText): string {
  const fit = fitWidth
    ? ` textLength="${fmt(fitWidth)}" lengthAdjust="spacingAndGlyphs"`
    : "";
  return `<text x="${fmt(x)}" y="${fmt(y)}" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fmt(size)}" font-weight="700" fill="#111111"${fit}>${escapeXml(text)}</text>`;
}

// Human-readable digits in the standard groups under the bars.
function buildDigits(
  value: string,
  format: BarcodeFormat,
  barsX: number,
  barsWidth: number,
  baselineY: number,
  size: number
): DigitText[] {
  const X = BARCODE_SCALE;
  const at = (module: number) => barsX + module * X;
  const t = (text: string, x: number, s = size, fitWidth?: number): DigitText => ({
    text,
    x,
    y: baselineY,
    size: s,
    ...(fitWidth ? { fitWidth } : {}),
  });

  if (format === "ean13" && value.length === 13) {
    return [t(value[0], barsX - 4 * X), t(value.slice(1, 7), at(24), size, 38 * X), t(value.slice(7), at(71), size, 38 * X)];
  }

  if (format === "ean8" && value.length === 8) {
    return [t(value.slice(0, 4), at(17), size, 25 * X), t(value.slice(4), at(50), size, 25 * X)];
  }

  if (format === "upca" && value.length === 12) {
    return [
      t(value[0], barsX - 4 * X, size * 0.8),
      t(value.slice(1, 6), at(27.5), size, 31 * X),
      t(value.slice(6, 11), at(67.5), size, 31 * X),
      t(value[11], barsX + barsWidth + 4 * X, size * 0.8),
    ];
  }

  const fitWidth = Math.min(barsWidth, value.length * size * GLYPH_WIDTH_RATIO);
  return [t(value, barsX + barsWidth / 2, size, fitWidth)];
}

export function composeBarcode({
  rawBarcodeSvg,
  shape,
  colorConfig,
  value,
  format,
  idPrefix = "bsl",
  retailSafe = false,
  xMm,
  bwrMm = 0,
}: ComposeOptions): ComposedBarcode {
  const barsWidth = parseWidth(rawBarcodeSvg);
  const quietLeft = QUIET_ZONE_MODULES[format].left * BARCODE_SCALE;
  const quietRight = QUIET_ZONE_MODULES[format].right * BARCODE_SCALE;
  const totalWidth = quietLeft + barsWidth + quietRight;

  const base = Math.min(barsWidth, ART_BASE_MAX_MODULES * BARCODE_SCALE);
  const text = value.trim();
  // Code 128 text shrinks to fit the bars instead of squashing its glyphs.
  const fontSize = Math.min(
    base * LABEL_ZONE_RATIO * LABEL_FONT_RATIO,
    format === "code128" ? barsWidth / (text.length * GLYPH_WIDTH_RATIO) : Infinity
  );
  // EAN/UPC digits get the GS1 zone so the standard size matches GS1.
  const labelHeight =
    format === "code128" ? fontSize / LABEL_FONT_RATIO : HRI_ZONE_MODULES * BARCODE_SCALE;

  // The art box takes the shape's aspect at full bar width, within bounds, so
  // the shape fills the width or the height. Its bottom sits inside the band.
  const [vbX, vbY, vbW, vbH] = shape.viewBox;
  // No shape (empty paths): the standard barcode alone, bars at the GS1 minimum.
  const noShape = shape.paths.length === 0;
  const top = noShape ? 0 : base * TOP_PAD_RATIO;
  const artZoneHeight = barsWidth * SCAN_ZONE_RATIO;
  const retailZoneHeight =
    minBarHeightModules(format, barsWidth / BARCODE_SCALE, xMm) * BARCODE_SCALE;
  const zoneHeight = noShape
    ? retailZoneHeight
    : retailSafe
      ? Math.max(artZoneHeight, retailZoneHeight)
      : artZoneHeight;
  const boxHeight = Math.min(
    Math.max((barsWidth * vbH) / vbW, base * ART_MIN_RATIO),
    base * ART_MAX_RATIO
  );
  // The overlap stays the art-mode size so a taller band doesn't swallow the shape.
  const zoneY = noShape ? 0 : top + boxHeight - artZoneHeight * SHAPE_OVERLAP_RATIO;
  const totalHeight = zoneY + zoneHeight + labelHeight;

  // Fit the shape inside the art box, centred, standing on the scan zone.
  const scale = Math.min(barsWidth / vbW, boxHeight / vbH);
  const shapeX = quietLeft + (barsWidth - vbW * scale) / 2 - vbX * scale;
  const shapeY = top + boxHeight - vbH * scale - vbY * scale;
  const fillRule = shape.fillRule ?? "nonzero";
  const shapePaths = shape.paths
    .map(
      (d) =>
        `<path d="${escapeXml(d)}" fill="white" fill-rule="${fillRule}" transform="translate(${fmt(shapeX)} ${fmt(shapeY)}) scale(${fmt(scale)})"/>`
    )
    .join("");

  // All bars as one path, so a gradient spans the whole barcode.
  const barHeight = zoneY + zoneHeight - top;
  const reduction = (bwrMm / (xMm ?? nominalXmm(format))) * BARCODE_SCALE;
  const bars: BarRect[] = extractColumns(rawBarcodeSvg).map((column) => {
    const width = Math.max(MIN_BAR_UNITS, column.width - reduction);
    return { x: quietLeft + column.x + (column.width - width) / 2, width };
  });
  const barsPath = bars
    .map((bar) => `M${fmt(bar.x)} ${fmt(top)}h${fmt(bar.width)}v${fmt(barHeight)}h${fmt(-bar.width)}Z`)
    .join("");

  const maskId = `${idPrefix}-mask`;
  const gradientId = `${idPrefix}-gradient`;
  const paint = buildPaintValue(colorConfig, gradientId);
  const gradientDef = buildGradientDef(colorConfig, gradientId);
  const digits = buildDigits(
    text,
    format,
    quietLeft,
    barsWidth,
    zoneY + zoneHeight + labelHeight * 0.78,
    fontSize
  );

  const physicalSize = xMm
    ? ` width="${fmt(sizeMm(totalWidth, xMm))}mm" height="${fmt(sizeMm(totalHeight, xMm))}mm"`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"${physicalSize} viewBox="0 0 ${fmt(totalWidth)} ${fmt(totalHeight)}" role="img" aria-label="${escapeXml(`${shape.label} barcode ${value}`)}">
<defs>${gradientDef}<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${fmt(totalWidth)}" height="${fmt(totalHeight)}"><rect width="${fmt(totalWidth)}" height="${fmt(totalHeight)}" fill="black"/>${shapePaths}<rect x="0" y="${fmt(zoneY)}" width="${fmt(totalWidth)}" height="${fmt(zoneHeight)}" fill="white"/></mask></defs>
<rect width="${fmt(totalWidth)}" height="${fmt(totalHeight)}" fill="#ffffff"/>
<path d="${barsPath}" fill="${paint}" mask="url(#${maskId})" shape-rendering="crispEdges"/>
${digits.map(renderText).join("")}
</svg>`;

  return {
    viewBox: { width: totalWidth, height: totalHeight },
    barsX: quietLeft,
    barsWidth,
    top,
    barHeight,
    bars,
    band: { y: zoneY, height: zoneHeight },
    shape: { paths: shape.paths, fillRule, translateX: shapeX, translateY: shapeY, scale },
    digits,
    colorConfig,
    // GS1 symbol: minimum-height bars plus the digit zone, whatever the band is.
    standardSize: { width: totalWidth, height: retailZoneHeight + labelHeight },
    svg,
  };
}

export function composeBarcodeSvg(options: ComposeOptions): string {
  return composeBarcode(options).svg;
}

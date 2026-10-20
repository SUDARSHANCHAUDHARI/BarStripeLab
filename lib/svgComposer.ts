import type { BarcodeFormat, ColorConfig, ShapeDef } from "@/types";
import { extractColumns } from "@/lib/columnMapper";
import { buildGradientDef, buildPaintValue } from "@/lib/colorEngine";
import { BARCODE_SCALE } from "@/lib/barcode";

// Layout ratios, relative to the width of the bars.
const TOP_PAD_RATIO = 0.04;
const ART_HEIGHT_RATIO = 1.15;
// Protected band at the bottom: every bar is drawn in full here.
const SCAN_ZONE_RATIO = 0.16;
const LABEL_ZONE_RATIO = 0.13;
// How far the shape reaches down into the scan zone so the two join.
const SHAPE_OVERLAP_RATIO = 0.35;

// Minimum blank margins in modules (GS1 for EAN/UPC, ISO/IEC 15417 for Code 128).
const QUIET_ZONE_MODULES: Record<BarcodeFormat, { left: number; right: number }> = {
  ean13: { left: 11, right: 7 },
  ean8: { left: 7, right: 7 },
  upca: { left: 9, right: 9 },
  code128: { left: 10, right: 10 },
};

export type ComposeOptions = {
  rawBarcodeSvg: string;
  shape: ShapeDef;
  colorConfig: ColorConfig;
  value: string;
  format: BarcodeFormat;
  // Unique per SVG on a page, so masks and gradients do not collide.
  idPrefix?: string;
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

function buildText(
  text: string,
  centerX: number,
  baselineY: number,
  size: number,
  fitWidth?: number
): string {
  const fit = fitWidth
    ? ` textLength="${fmt(fitWidth)}" lengthAdjust="spacingAndGlyphs"`
    : "";
  return `<text x="${fmt(centerX)}" y="${fmt(baselineY)}" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fmt(size)}" font-weight="700" fill="#111111"${fit}>${escapeXml(text)}</text>`;
}

// Human-readable digits in the standard groups under the bars.
function buildDigits(
  value: string,
  format: BarcodeFormat,
  barsX: number,
  barsWidth: number,
  baselineY: number,
  size: number
): string {
  const X = BARCODE_SCALE;
  const at = (module: number) => barsX + module * X;

  if (format === "ean13" && value.length === 13) {
    return [
      buildText(value[0], barsX - 4 * X, baselineY, size),
      buildText(value.slice(1, 7), at(24), baselineY, size, 38 * X),
      buildText(value.slice(7), at(71), baselineY, size, 38 * X),
    ].join("");
  }

  if (format === "ean8" && value.length === 8) {
    return [
      buildText(value.slice(0, 4), at(17), baselineY, size, 25 * X),
      buildText(value.slice(4), at(50), baselineY, size, 25 * X),
    ].join("");
  }

  if (format === "upca" && value.length === 12) {
    return [
      buildText(value[0], barsX - 4 * X, baselineY, size * 0.8),
      buildText(value.slice(1, 6), at(27.5), baselineY, size, 31 * X),
      buildText(value.slice(6, 11), at(67.5), baselineY, size, 31 * X),
      buildText(value[11], barsX + barsWidth + 4 * X, baselineY, size * 0.8),
    ].join("");
  }

  const fitWidth = Math.min(barsWidth, value.length * size * 0.62);
  return buildText(value, barsX + barsWidth / 2, baselineY, size, fitWidth);
}

export function composeBarcodeSvg({
  rawBarcodeSvg,
  shape,
  colorConfig,
  value,
  format,
  idPrefix = "bsl",
}: ComposeOptions): string {
  const barsWidth = parseWidth(rawBarcodeSvg);
  const quietLeft = QUIET_ZONE_MODULES[format].left * BARCODE_SCALE;
  const quietRight = QUIET_ZONE_MODULES[format].right * BARCODE_SCALE;
  const totalWidth = quietLeft + barsWidth + quietRight;

  const top = barsWidth * TOP_PAD_RATIO;
  const artHeight = barsWidth * ART_HEIGHT_RATIO;
  const zoneHeight = barsWidth * SCAN_ZONE_RATIO;
  const labelHeight = barsWidth * LABEL_ZONE_RATIO;
  const zoneY = top + artHeight;
  const totalHeight = zoneY + zoneHeight + labelHeight;

  // Fit the shape inside the art box, centred, standing on the scan zone.
  const [vbX, vbY, vbW, vbH] = shape.viewBox;
  const boxHeight = artHeight + zoneHeight * SHAPE_OVERLAP_RATIO;
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
  const barHeight = artHeight + zoneHeight;
  const barsPath = extractColumns(rawBarcodeSvg)
    .filter((column) => column.isBlack)
    .map((column) => {
      const x = quietLeft + (column.x / 100) * barsWidth;
      const w = (column.width / 100) * barsWidth;
      return `M${fmt(x)} ${fmt(top)}h${fmt(w)}v${fmt(barHeight)}h${fmt(-w)}Z`;
    })
    .join("");

  const maskId = `${idPrefix}-mask`;
  const gradientId = `${idPrefix}-gradient`;
  const paint = buildPaintValue(colorConfig, gradientId);
  const gradientDef = buildGradientDef(colorConfig, gradientId);
  const digits = buildDigits(
    value.trim(),
    format,
    quietLeft,
    barsWidth,
    zoneY + zoneHeight + labelHeight * 0.78,
    labelHeight * 0.72
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(totalWidth)} ${fmt(totalHeight)}" role="img" aria-label="${escapeXml(`${shape.label} barcode ${value}`)}">
<defs>${gradientDef}<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${fmt(totalWidth)}" height="${fmt(totalHeight)}"><rect width="${fmt(totalWidth)}" height="${fmt(totalHeight)}" fill="black"/>${shapePaths}<rect x="0" y="${fmt(zoneY)}" width="${fmt(totalWidth)}" height="${fmt(zoneHeight)}" fill="white"/></mask></defs>
<rect width="${fmt(totalWidth)}" height="${fmt(totalHeight)}" fill="#ffffff"/>
<path d="${barsPath}" fill="${paint}" mask="url(#${maskId})" shape-rendering="crispEdges"/>
${digits}
</svg>`;
}

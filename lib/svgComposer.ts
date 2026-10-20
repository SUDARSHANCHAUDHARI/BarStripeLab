import type {
  BarcodeFormat,
  ColorConfig,
  Column,
  Style,
  SilhouetteDefinition,
} from "@/types";
import { extractColumns } from "@/lib/columnMapper";
import { buildGradientDef, buildPaintValue } from "@/lib/colorEngine";
import { renderSilhouette, resolveStyleDefinition } from "@/lib/artEngine";
import { BARCODE_SCALE } from "@/lib/barcode";

const SAFE_ZONE_RATIO = 0.2;
const DEFAULT_VIEWBOX = "0 0 190 58";
const OUTPUT_HEIGHT_RATIO = 0.5;
const LABEL_ZONE_RATIO = 0.1;
const PALM_OUTPUT_HEIGHT_RATIO = 1.14;
const PALM_SAFE_ZONE_RATIO = 0.26;
const PALM_LABEL_ZONE_RATIO = 0.13;

// Minimum blank margins in modules (GS1 for EAN, ISO/IEC 15417 for Code 128).
const QUIET_ZONE_MODULES: Record<BarcodeFormat, { left: number; right: number }> = {
  ean13: { left: 11, right: 7 },
  ean8: { left: 7, right: 7 },
  code128: { left: 10, right: 10 },
};

function parseViewBox(svg: string): { width: number; height: number; viewBox: string } {
  const match = svg.match(/viewBox="([^"]+)"/);

  if (!match) {
    return { width: 190, height: 58, viewBox: DEFAULT_VIEWBOX };
  }

  const parts = match[1].split(/\s+/).map(Number);

  return {
    width: parts[2] || 190,
    height: parts[3] || 58,
    viewBox: match[1] || DEFAULT_VIEWBOX,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildBarcodeRects(
  columns: Column[],
  svgWidth: number,
  sourceHeight: number,
  targetHeight: number
): string {
  const heightScale = targetHeight / sourceHeight;

  return columns
    .filter((column) => column.isBlack)
    .map((column) => {
      const x = (column.x / 100) * svgWidth;
      const width = (column.width / 100) * svgWidth;
      const rawHeight = column.height || sourceHeight;
      const barHeight = Math.max(1, Math.min(targetHeight, rawHeight * heightScale));
      const y = targetHeight - barHeight;

      return `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${width.toFixed(
        3
      )}" height="${barHeight.toFixed(3)}" fill="#000000" />`;
    })
    .join("");
}

function buildTextNode(
  text: string,
  x: number,
  y: number,
  size: number,
  anchor: "start" | "middle" | "end" = "middle"
): string {
  return `<text x="${x.toFixed(2)}" y="${y.toFixed(
    2
  )}" text-anchor="${anchor}" font-family="Arial, Helvetica, sans-serif" font-size="${size.toFixed(
    2
  )}" font-weight="700" letter-spacing="0.3" fill="#111111">${escapeXml(text)}</text>`;
}

function buildDigitsLabel(
  value: string,
  format: BarcodeFormat,
  width: number,
  barcodeHeight: number,
  outputHeight: number
): string {
  const label = value.trim();
  if (!label) return "";

  const labelHeight = outputHeight - barcodeHeight;
  const baselineY = barcodeHeight + labelHeight * 0.72;

  if (format === "ean13" && label.length === 13) {
    const leadSize = Math.max(5.2, width * 0.06);
    const groupSize = Math.max(5.4, width * 0.062);

    return [
      buildTextNode(label.slice(0, 1), width * 0.055, baselineY, leadSize, "middle"),
      buildTextNode(label.slice(1, 7), width * 0.31, baselineY, groupSize),
      buildTextNode(label.slice(7), width * 0.73, baselineY, groupSize),
    ].join("");
  }

  if (format === "ean8" && label.length === 8) {
    const size = Math.max(5.2, width * 0.062);
    return [
      buildTextNode(label.slice(0, 4), width * 0.34, baselineY, size),
      buildTextNode(label.slice(4), width * 0.68, baselineY, size),
    ].join("");
  }

  return buildTextNode(label, width / 2, baselineY, Math.max(4.8, width * 0.05));
}

function buildArtBars(
  columns: Column[],
  width: number,
  topHeight: number,
  fill: string
): string {
  return columns
    .filter((column) => column.isBlack)
    .map((column) => {
      const x = (column.x / 100) * width;
      const barWidth = (column.width / 100) * width;
      const y = 0;
      const height = topHeight;

      return `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${barWidth.toFixed(
        3
      )}" height="${height.toFixed(3)}" fill="${fill}" />`;
    })
    .join("");
}

function isInsideRotatedEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number
): boolean {
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;

  return (localX * localX) / (rx * rx) + (localY * localY) / (ry * ry) <= 1;
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}

function isInsidePalmShape(x: number, y: number, width: number, height: number): boolean {
  const crownX = width * 0.5;
  const trunkCenterX = crownX;
  const trunkHalfWidth = width * 0.042;
  const trunkTopY = height * 0.16;
  const crownCoreX = width * 0.5;
  const crownCoreY = height * 0.17;

  const inTrunk =
    y >= trunkTopY &&
    Math.abs(x - trunkCenterX) <= trunkHalfWidth;

  const fronds = [
    { cx: width * 0.37, cy: height * 0.1, rx: width * 0.14, ry: height * 0.052, angle: -18 },
    { cx: width * 0.63, cy: height * 0.1, rx: width * 0.14, ry: height * 0.052, angle: 18 },
    { cx: width * 0.2, cy: height * 0.26, rx: width * 0.17, ry: height * 0.055, angle: -4 },
    { cx: width * 0.8, cy: height * 0.26, rx: width * 0.17, ry: height * 0.055, angle: 4 },
    { cx: width * 0.27, cy: height * 0.5, rx: width * 0.13, ry: height * 0.085, angle: -50 },
    { cx: width * 0.73, cy: height * 0.5, rx: width * 0.13, ry: height * 0.085, angle: 50 },
  ];

  if (inTrunk) {
    return true;
  }

  const inCrownCore = isInsideRotatedEllipse(
    x,
    y,
    crownCoreX,
    crownCoreY,
    width * 0.06,
    height * 0.1,
    0
  );

  if (inCrownCore) {
    return true;
  }

  const branchAnchors = [
    { x: width * 0.42, y: height * 0.14, thickness: width * 0.014 },
    { x: width * 0.35, y: height * 0.24, thickness: width * 0.015 },
    { x: width * 0.39, y: height * 0.41, thickness: width * 0.017 },
    { x: width * 0.58, y: height * 0.14, thickness: width * 0.014 },
    { x: width * 0.65, y: height * 0.24, thickness: width * 0.015 },
    { x: width * 0.61, y: height * 0.41, thickness: width * 0.017 },
  ];

  const inBranch = branchAnchors.some((anchor) => {
    const thicknessBoost = y > height * 0.32 ? 1.08 : 1;
    return (
      distanceToSegment(x, y, crownCoreX, crownCoreY, anchor.x, anchor.y) <=
      anchor.thickness * thicknessBoost
    );
  });

  if (inBranch) {
    return true;
  }

  return fronds.some((frond) =>
    isInsideRotatedEllipse(
      x,
      y,
      frond.cx,
      frond.cy,
      frond.rx,
      frond.ry,
      frond.angle
    )
  );
}

function buildPalmArtBars(
  columns: Column[],
  width: number,
  topHeight: number,
  fill: string
): string {
  const sampleStep = Math.max(0.7, topHeight / 220);
  const crownJoinTop = topHeight * 0.08;
  const crownJoinBottom = topHeight * 0.34;
  const trunkJoinHalfWidth = width * 0.19;
  const maxJoinGap = topHeight * 0.055;

  return columns
    .filter((column) => column.isBlack)
    .map((column) => {
      const x = (column.x / 100) * width;
      const barWidth = (column.width / 100) * width;
      const centerX = x + barWidth / 2;
      const rawSegments: Array<{ start: number; end: number }> = [];
      let currentStart: number | null = null;

      for (let y = 0; y <= topHeight; y += sampleStep) {
        const inside = isInsidePalmShape(centerX, y, width, topHeight);

        if (inside && currentStart === null) {
          currentStart = y;
        }

        if (!inside && currentStart !== null) {
          rawSegments.push({ start: currentStart, end: y });
          currentStart = null;
        }
      }

      if (currentStart !== null) {
        rawSegments.push({ start: currentStart, end: topHeight });
      }

      const segments = rawSegments.reduce<Array<{ start: number; end: number }>>(
        (acc, segment) => {
          const previous = acc[acc.length - 1];

          if (!previous) {
            acc.push(segment);
            return acc;
          }

          const gap = segment.start - previous.end;
          const overlapsJoinZone =
            previous.end >= crownJoinTop &&
            segment.start <= crownJoinBottom &&
            Math.abs(centerX - width * 0.5) <= trunkJoinHalfWidth;

          if (gap <= maxJoinGap && overlapsJoinZone) {
            previous.end = segment.end;
            return acc;
          }

          acc.push(segment);
          return acc;
        },
        []
      );

      return segments
        .filter((segment) => segment.end - segment.start >= sampleStep * 1.2)
        .map((segment) => {
          const y = Math.max(0, segment.start);
          const height = Math.min(topHeight, segment.end) - y;

          return `<rect x="${x.toFixed(3)}" y="${y.toFixed(3)}" width="${barWidth.toFixed(
            3
          )}" height="${height.toFixed(3)}" fill="${fill}" />`;
        })
        .join("");
    })
    .join("");
}

export function composeBarcodeSvg(
  rawBarcodeSvg: string,
  selectedStyle: string | Style | SilhouetteDefinition,
  colorConfig: ColorConfig,
  seed: string,
  barcodeValue: string,
  format: BarcodeFormat
): string {
  const { width, height: sourceHeight } = parseViewBox(rawBarcodeSvg);
  const styleDefinition = resolveStyleDefinition(selectedStyle);
  const isPalmLayout = styleDefinition.id === "palm";
  const outputHeight = Math.max(
    sourceHeight,
    width * (isPalmLayout ? PALM_OUTPUT_HEIGHT_RATIO : OUTPUT_HEIGHT_RATIO)
  );
  const labelZoneRatio = isPalmLayout ? PALM_LABEL_ZONE_RATIO : LABEL_ZONE_RATIO;
  const barcodeHeight = outputHeight * (1 - labelZoneRatio);
  const quietLeft = QUIET_ZONE_MODULES[format].left * BARCODE_SCALE;
  const quietRight = QUIET_ZONE_MODULES[format].right * BARCODE_SCALE;
  const totalWidth = width + quietLeft + quietRight;
  const outputViewBox = `0 0 ${totalWidth} ${outputHeight}`;
  const columns = extractColumns(rawBarcodeSvg);
  const barcodeRects = buildBarcodeRects(columns, width, sourceHeight, barcodeHeight);

  const safeZoneRatio = isPalmLayout ? PALM_SAFE_ZONE_RATIO : SAFE_ZONE_RATIO;
  const scanZoneY = barcodeHeight * (1 - safeZoneRatio);
  const artHeight = scanZoneY;
  const renderedSilhouette = renderSilhouette(
    selectedStyle,
    isPalmLayout ? "organic" : "smooth",
    width,
    artHeight
  );

  const gradientId = `art-gradient-${seed.length || 1}`;
  const accentPaint = buildPaintValue(colorConfig, gradientId);
  const accentGradientDef = buildGradientDef(colorConfig, gradientId);
  const artBars = isPalmLayout
    ? buildPalmArtBars(columns, width, artHeight, accentPaint)
    : buildArtBars(columns, width, artHeight, accentPaint);

  const defs = isPalmLayout
    ? `
    <defs>
      ${accentGradientDef}
      <clipPath id="barstripelab-bottom-zone">
        <rect x="0" y="${scanZoneY.toFixed(3)}" width="${width.toFixed(3)}" height="${(
        barcodeHeight - scanZoneY
      ).toFixed(3)}" />
      </clipPath>
    </defs>
  `
    : `
    <defs>
      ${accentGradientDef}
      <clipPath id="barstripelab-art-shape">
        <path d="${renderedSilhouette.path}" />
      </clipPath>
      <clipPath id="barstripelab-bottom-zone">
        <rect x="0" y="${scanZoneY.toFixed(3)}" width="${width.toFixed(3)}" height="${(
    barcodeHeight - scanZoneY
  ).toFixed(3)}" />
      </clipPath>
    </defs>
  `;

  const bottomSafeBars = `
    <g clip-path="url(#barstripelab-bottom-zone)">
      ${barcodeRects}
    </g>
  `;

  const topArtwork = isPalmLayout
    ? `
    <g>
      ${artBars}
    </g>
  `
    : `
    <g clip-path="url(#barstripelab-art-shape)">
      ${artBars}
    </g>
  `;

  const digitsLabel = buildDigitsLabel(
    barcodeValue,
    format,
    width,
    barcodeHeight,
    outputHeight
  );

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${outputViewBox}" role="img" aria-label="Art barcode">
      <desc>Masked barcode art with preserved bottom scan zone.</desc>
      ${defs}
      <rect width="${totalWidth}" height="${outputHeight}" fill="#ffffff" />
      <g transform="translate(${quietLeft} 0)">
        ${topArtwork}
        ${bottomSafeBars}
        ${digitsLabel}
      </g>
    </svg>
  `.trim();
}

import type { ComposedBarcode } from "@/types";
import { sizeMm } from "@/lib/printSize";

const MM_PER_INCH = 25.4;

export type Size = { widthMm: number; heightMm: number };

// The standard barcode (bars, quiet zones, digits) and the whole artwork including the shape.
export function artworkSizes(composed: ComposedBarcode, xMm: number): { standard: Size; withShape: Size } {
  return {
    standard: {
      widthMm: sizeMm(composed.standardSize.width, xMm),
      heightMm: sizeMm(composed.standardSize.height, xMm),
    },
    withShape: {
      widthMm: sizeMm(composed.viewBox.width, xMm),
      heightMm: sizeMm(composed.viewBox.height, xMm),
    },
  };
}

export const formatSize = ({ widthMm, heightMm }: Size) =>
  `${widthMm.toFixed(2)} × ${heightMm.toFixed(2)} mm (${(widthMm / MM_PER_INCH).toFixed(2)} × ${(heightMm / MM_PER_INCH).toFixed(2)} in)`;

export const formatMmShort = ({ widthMm, heightMm }: Size) => `${widthMm.toFixed(2)} × ${heightMm.toFixed(2)} mm`;

// One line for every size display: the standard barcode, and the whole artwork when a shape makes it larger.
export function sizeSummary(composed: ComposedBarcode, xMm: number): string {
  const { standard, withShape } = artworkSizes(composed, xMm);
  const grew = Math.abs(withShape.widthMm - standard.widthMm) > 0.005 || Math.abs(withShape.heightMm - standard.heightMm) > 0.005;
  return grew ? `${formatMmShort(standard)} · with shape ${formatMmShort(withShape)}` : formatMmShort(standard);
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

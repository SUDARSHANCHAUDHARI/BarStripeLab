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

export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

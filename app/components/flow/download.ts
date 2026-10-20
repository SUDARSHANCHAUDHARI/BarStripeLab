import type { BarcodeFormat, ComposedBarcode, ScanScore } from "@/types";
import { svgToPngBlob } from "@/lib/exportImage";
import { composedToPdf } from "@/lib/export/pdf";
import { snapPngWidth, withPngDpi } from "@/lib/export/png";
import { specSheetPdf } from "@/lib/export/specSheet";

export const PNG_DPI_OPTIONS = [150, 300, 600] as const;
export const DEFAULT_PNG_DPI = 300;

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// File names carry the number but never path characters.
export const baseName = (value: string) => `barstripelab-${value.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;

const bytesBlob = (bytes: Uint8Array, type: string) => new Blob([bytes as BlobPart], { type });

export function downloadSvg(composed: ComposedBarcode, value: string): void {
  saveBlob(new Blob([composed.svg], { type: "image/svg+xml" }), `${baseName(value)}.svg`);
}

export function downloadPdf(composed: ComposedBarcode, xMm: number, value: string): void {
  saveBlob(bytesBlob(composedToPdf(composed, xMm), "application/pdf"), `${baseName(value)}.pdf`);
}

export async function downloadPng(composed: ComposedBarcode, xMm: number, dpi: number, value: string): Promise<void> {
  const { widthPx } = snapPngWidth(composed, xMm, dpi);
  const png = new Uint8Array(await (await svgToPngBlob(composed.svg, widthPx)).arrayBuffer());
  saveBlob(bytesBlob(withPngDpi(png, dpi), "image/png"), `${baseName(value)}-${dpi}dpi.png`);
}

export function downloadSpecSheet(input: {
  composed: ComposedBarcode;
  format: BarcodeFormat;
  value: string;
  xMm: number;
  bwrMm: number;
  retailSafe: boolean;
  score: ScanScore;
  shapeLabel: string;
}): void {
  saveBlob(bytesBlob(specSheetPdf(input), "application/pdf"), `${baseName(input.value)}-spec-sheet.pdf`);
}

export const saveBytes = (bytes: Uint8Array, type: string, filename: string) => saveBlob(bytesBlob(bytes, type), filename);

export async function copySvg(composed: ComposedBarcode): Promise<void> {
  await navigator.clipboard.writeText(composed.svg);
}

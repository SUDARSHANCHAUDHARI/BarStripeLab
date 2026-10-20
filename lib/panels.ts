import type { PanelId } from "@/types";

export type PanelDef = {
  id: PanelId;
  label: string;
  widthMm: number;
  heightMm: number;
  // SVG inner markup in mm units (viewBox 0 0 widthMm heightMm). Elements carry
  // data-role (kraft, proof, cut, fold, ink, ink-2, mat) and the renderer paints
  // them from the page's colour tokens, so no colour lives here.
  art: string;
  // Where the barcode artwork sits on the panel.
  slot: { xMm: number; yMm: number; widthMm: number; heightMm: number };
};

// Sample copy lines: rounded bars standing in for ingredients and warnings.
const lines = (x: number, y: number, widths: number[]) =>
  widths
    .map((w, i) => `<rect data-role="ink-2" opacity=".4" x="${x}" y="${y + i * 4.5}" width="${w}" height="1.6" rx=".8"/>`)
    .join("");

const wordmark = (x: number, y: number, size: number, text: string, anchor = "start") =>
  `<text data-role="ink" x="${x}" y="${y}" font-size="${size}" font-weight="700" text-anchor="${anchor}">${text}</text>`;

const cut = (d: string) => `<path data-role="cut" fill="none" stroke-width=".6" d="${d}"/>`;
const fold = (d: string) => `<path data-role="fold" fill="none" stroke-width=".5" stroke-dasharray="2.5 1.8" d="${d}"/>`;

const COFFEE_BAG =
  `<path data-role="kraft" d="M0 0H120V180H0Z"/>` +
  // Crimped top seal.
  Array.from({ length: 23 }, (_, i) => `<path data-role="fold" fill="none" stroke-width=".35" opacity=".6" d="M${3 + i * 5} 1.5V12.5"/>`).join("") +
  cut("M0 0H120V180H0Z") +
  fold("M0 14H120M60 14V180") +
  wordmark(8, 34, 9, "Hillside Roast") +
  lines(8, 41, [44, 38, 40, 30]) +
  wordmark(8, 168, 5, "Net wt 250 g");

const CAN =
  `<path data-role="proof" d="M0 0H160V110H0Z"/>` +
  cut("M0 0H160V110H0Z") +
  fold("M6 0V110M154 0V110") +
  wordmark(14, 30, 9, "Tidepool Pale Ale") +
  lines(14, 38, [62, 54, 44]) +
  wordmark(14, 98, 5, "330 ml");

const BOX =
  `<path data-role="proof" d="M0 0H140V100H0Z"/>` +
  cut("M0 0H140V100H0Z") +
  fold("M0 20H140") +
  wordmark(10, 40, 9, "Crunch &amp; Co.") +
  lines(10, 47, [52, 46, 50]) +
  wordmark(10, 90, 5, "6 × 30 g");

const TAG_OUTLINE = "M11 0H49L60 12V110H0V12Z";
const TAG =
  `<path data-role="kraft" d="${TAG_OUTLINE}"/>` +
  cut(TAG_OUTLINE) +
  `<circle data-role="mat" cx="30" cy="9" r="3.2"/><circle data-role="cut" fill="none" stroke-width=".6" cx="30" cy="9" r="3.2"/>` +
  wordmark(30, 24, 7, "Fieldwork", "middle");

// Slots leave room for a standard EAN-13 with its tallest shape (about 37 x 70 mm at 100%, Retail-safe).
export const PANELS: PanelDef[] = [
  { id: "coffee-bag", label: "Coffee bag", widthMm: 120, heightMm: 180, art: COFFEE_BAG, slot: { xMm: 62, yMm: 92, widthMm: 50, heightMm: 72 } },
  { id: "can", label: "Can label", widthMm: 160, heightMm: 110, art: CAN, slot: { xMm: 98, yMm: 30, widthMm: 52, heightMm: 72 } },
  { id: "box", label: "Snack box", widthMm: 140, heightMm: 100, art: BOX, slot: { xMm: 80, yMm: 22, widthMm: 52, heightMm: 72 } },
  { id: "tag", label: "Swing tag", widthMm: 60, heightMm: 110, art: TAG, slot: { xMm: 6, yMm: 30, widthMm: 48, heightMm: 74 } },
];

// Centre the artwork on the slot, resting on its bottom edge. `fits` is false when
// the artwork is bigger than the slot: it is still placed at true size, never scaled.
export function placeOnPanel(
  panel: PanelDef,
  artwork: { widthMm: number; heightMm: number }
): { xMm: number; yMm: number; fits: boolean } {
  const { slot } = panel;
  return {
    xMm: slot.xMm + (slot.widthMm - artwork.widthMm) / 2,
    yMm: slot.yMm + slot.heightMm - artwork.heightMm,
    fits: artwork.widthMm <= slot.widthMm && artwork.heightMm <= slot.heightMm,
  };
}

import type { PanelId } from "@/types";

export type PanelDef = {
  id: PanelId;
  label: string;
  widthMm: number;
  heightMm: number;
  // SVG inner markup in mm units (viewBox 0 0 widthMm heightMm).
  art: string;
  // Where the barcode artwork sits on the panel.
  slot: { xMm: number; yMm: number; widthMm: number; heightMm: number };
};

// Contract stub (Task 0). Task 5 (FLOW) owns the real line art and tests.
export const PANELS: PanelDef[] = [
  { id: "coffee-bag", label: "Coffee bag", widthMm: 120, heightMm: 180, art: "", slot: { xMm: 20, yMm: 110, widthMm: 80, heightMm: 60 } },
  { id: "can", label: "Can label", widthMm: 160, heightMm: 110, art: "", slot: { xMm: 100, yMm: 40, widthMm: 55, heightMm: 60 } },
  { id: "box", label: "Snack box", widthMm: 140, heightMm: 100, art: "", slot: { xMm: 80, yMm: 30, widthMm: 55, heightMm: 65 } },
  { id: "tag", label: "Swing tag", widthMm: 60, heightMm: 100, art: "", slot: { xMm: 8, yMm: 45, widthMm: 44, heightMm: 50 } },
];

import { Column } from "@/types";

// Bars of a bwip-js SVG, in its own units. bwip-js draws each bar as a
// vertical stroke centred on x: `<path stroke-width="4" d="M18 58L18 0...">`.
export function extractColumns(svg: string): Column[] {
  const columns: Column[] = [];

  for (const [, strokeWidth, pathData] of svg.matchAll(/<path[^>]*stroke-width="([\d.]+)"[^>]*d="([^"]*)"/g)) {
    const width = parseFloat(strokeWidth);
    for (const [, x1, y1, x2, y2] of pathData.matchAll(/M([\d.]+)\s+([\d.]+)L([\d.]+)\s+([\d.]+)/g)) {
      if (Math.abs(parseFloat(x1) - parseFloat(x2)) < 0.1) {
        columns.push({
          x: parseFloat(x1) - width / 2,
          width,
          height: Math.abs(parseFloat(y2) - parseFloat(y1)),
          isBlack: true,
        });
      }
    }
  }

  return columns.sort((a, b) => a.x - b.x);
}

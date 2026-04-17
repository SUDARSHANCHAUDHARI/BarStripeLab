import { Column } from "@/types";

export function extractColumns(svg: string): Column[] {
  try {
    // Extract viewBox to get dimensions
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    if (!viewBoxMatch) return [];

    const [, , , viewHeight] = viewBoxMatch[1]
      .split(" ")
      .map(Number);

    const columns: Column[] = [];

    // Extract all path elements
    const pathRegex = /<path[^>]*>/g;
    let pathMatch;

    while ((pathMatch = pathRegex.exec(svg)) !== null) {
      const pathElement = pathMatch[0];

      // Extract d attribute (path data)
      const dMatch = pathElement.match(/d="([^"]*)"/);
      if (!dMatch) continue;
      const pathData = dMatch[1];

      // Extract stroke-width attribute
      const strokeMatch = pathElement.match(/stroke-width="([^"]*)"/);
      const strokeWidth = strokeMatch ? parseFloat(strokeMatch[1]) : 1;

      // Parse multiple line commands in the path: M1 58L1 0M5 58L5 0M13 58L13 0...
      // Format: Mx1 y1Lx1 y2Mx2 y1Lx2 y2...
      // Each Mx yLx y2 is a vertical bar at x position with stroke-width as width
      const lineRegex = /M([\d.]+)\s+([\d.]+)L([\d.]+)\s+([\d.]+)/g;
      let lineMatch;
      
      while ((lineMatch = lineRegex.exec(pathData)) !== null) {
        const x1 = parseFloat(lineMatch[1]);
        const y1 = parseFloat(lineMatch[2]);
        const x2 = parseFloat(lineMatch[3]);
        const y2 = parseFloat(lineMatch[4]);

        // Verify it's a vertical line (x1 == x2)
        if (Math.abs(x1 - x2) < 0.1) {
          const x = x1;
          const width = strokeWidth;
          const height = Math.abs(y2 - y1);

          columns.push({
            x,
            width,
            height,
            isBlack: true,
          });
        }
      }
    }

    // If no columns found from paths, try to extract from rect elements
    if (columns.length === 0) {
      const rectRegex = /<rect[^>]*>/g;
      while ((pathMatch = rectRegex.exec(svg)) !== null) {
        const rectElement = pathMatch[0];

        const xMatch = rectElement.match(/x="([^"]*)"/);
        const widthMatch = rectElement.match(/width="([^"]*)"/);

        if (xMatch && widthMatch) {
          const x = parseFloat(xMatch[1]);
          const width = parseFloat(widthMatch[1]);

          columns.push({
            x,
            width,
            height: viewHeight,
            isBlack: true,
          });
        }
      }
    }

    return normalizeColumns(columns);
  } catch (error) {
    console.error("Column extraction error:", error);
    return [];
  }
}

function normalizeColumns(columns: Column[]): Column[] {
  if (columns.length === 0) return [];

  // Find min/max x to normalize
  const minX = Math.min(...columns.map((c) => c.x));
  const maxX = Math.max(...columns.map((c) => c.x + c.width));
  const totalWidth = maxX - minX;

  if (totalWidth === 0) return columns;

  // Normalize all positions to 0-100% range
  return columns.map((col) => ({
    ...col,
    x: ((col.x - minX) / totalWidth) * 100,
    width: (col.width / totalWidth) * 100,
  }));
}

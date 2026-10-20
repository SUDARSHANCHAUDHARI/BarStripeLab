import type { ColorConfig, ComposedBarcode } from "@/types";
import { getSolidColor, normalizeStops } from "@/lib/colorEngine";
import { sizeMm } from "@/lib/printSize";

export const PT_PER_MM = 72 / 25.4;
// Courier glyph advance per font-size unit (all base-14 Courier faces).
const COURIER_ADVANCE = 0.6;
const DIGIT_COLOR = "#111111";

type Point = [number, number];

function num(value: number, digits = 3): string {
  return Number(value.toFixed(digits)).toString();
}

// A PDF literal string. shortcut: base-14 fonts without an encoding only do
// ASCII, so anything else prints as "?"; embed a font if non-ASCII is ever allowed.
export function pdfString(text: string): string {
  const ascii = text.replace(/[^\x20-\x7e]/g, "?");
  return `(${ascii.replace(/[\\()]/g, (c) => `\\${c}`)})`;
}

function rgb(hex: string): [number, number, number] {
  let digits = hex.slice(1);
  if (digits.length <= 4) digits = digits.split("").map((d) => d + d).join("");
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255) as [number, number, number];
}

function fill([r, g, b]: [number, number, number]): string {
  return `${num(r)} ${num(g)} ${num(b)} rg`;
}

// ---- SVG path data to PDF path operators ----

const ARG_COUNT: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;

// Splits path data into commands with absolute-or-relative args as written.
// Arc flags are single characters ("a5 5 0 0010 0" is valid SVG).
function* commands(d: string): Generator<[string, number[]]> {
  let i = 0;
  let command = "";
  const skip = () => {
    while (i < d.length && /[\s,]/.test(d[i])) i++;
  };
  const number = () => {
    skip();
    NUMBER.lastIndex = i;
    const match = NUMBER.exec(d);
    if (!match) throw new Error(`Bad path data at ${i}`);
    i = NUMBER.lastIndex;
    return Number(match[0]);
  };
  const flag = () => {
    skip();
    const c = d[i++];
    if (c !== "0" && c !== "1") throw new Error(`Bad arc flag at ${i - 1}`);
    return Number(c);
  };

  for (;;) {
    skip();
    if (i >= d.length) return;
    if (/[a-z]/i.test(d[i])) command = d[i++];
    const lower = command.toLowerCase();
    if (!(lower in ARG_COUNT)) throw new Error(`Bad path command at ${i}`);
    const args =
      lower === "a"
        ? [number(), number(), number(), flag(), flag(), number(), number()]
        : Array.from({ length: ARG_COUNT[lower] }, number);
    yield [command, args];
    // Extra pairs after a moveto are linetos; nothing may follow a closepath.
    if (lower === "m") command = command === "m" ? "l" : "L";
    if (lower === "z") command = "";
  }
}

// SVG arc (endpoint form) to cubic Béziers, at most 90° each (SVG 1.1 F.6.5).
function arcToCubics(
  x1: number,
  y1: number,
  rxIn: number,
  ryIn: number,
  angle: number,
  largeArc: number,
  sweep: number,
  x2: number,
  y2: number
): number[][] | null {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (x1 === x2 && y1 === y2) return [];
  if (!rx || !ry) return null;

  const phi = (angle * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const numerator = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = (largeArc === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

  const vectorAngle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const theta1 = vectorAngle(1, 0, ux, uy);
  let delta = vectorAngle(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const count = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2) - 1e-9));
  const step = delta / count;
  const k = (4 / 3) * Math.tan(step / 4);
  const at = (t: number): Point => [
    cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
    cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
  ];
  const tangent = (t: number): Point => [
    -rx * Math.sin(t) * cos - ry * Math.cos(t) * sin,
    -rx * Math.sin(t) * sin + ry * Math.cos(t) * cos,
  ];

  return Array.from({ length: count }, (_, i) => {
    const t1 = theta1 + i * step;
    const t2 = t1 + step;
    const [p1x, p1y] = at(t1);
    const [d1x, d1y] = tangent(t1);
    const [p2x, p2y] = i === count - 1 ? [x2, y2] : at(t2);
    const [d2x, d2y] = tangent(t2);
    return [p1x + k * d1x, p1y + k * d1y, p2x - k * d2x, p2y - k * d2y, p2x, p2y];
  });
}

// Every SVG path command as PDF m/l/c/h, with points passed through `map`.
export function svgPathToPdf(d: string, map: (x: number, y: number) => Point): string {
  const ops: string[] = [];
  const pt = (x: number, y: number) => map(x, y).map((v) => num(v)).join(" ");
  const curve = (c: number[]) => ops.push(`${pt(c[0], c[1])} ${pt(c[2], c[3])} ${pt(c[4], c[5])} c`);
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  // Last control points, reflected by S and T.
  let lastCubic: Point | null = null;
  let lastQuad: Point | null = null;

  const quadTo = (qx: number, qy: number, ex: number, ey: number) => {
    curve([x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey), ex, ey]);
  };

  for (const [command, a] of commands(d)) {
    const lower = command.toLowerCase();
    const ox = command === lower ? x : 0;
    const oy = command === lower ? y : 0;
    let cubic: Point | null = null;
    let quad: Point | null = null;

    switch (lower) {
      case "m":
        x = startX = ox + a[0];
        y = startY = oy + a[1];
        ops.push(`${pt(x, y)} m`);
        break;
      case "l":
      case "h":
      case "v":
        if (lower !== "v") x = ox + a[0];
        if (lower === "l") y = oy + a[1];
        if (lower === "v") y = oy + a[0];
        ops.push(`${pt(x, y)} l`);
        break;
      case "c":
        curve([ox + a[0], oy + a[1], ox + a[2], oy + a[3], ox + a[4], oy + a[5]]);
        cubic = [ox + a[2], oy + a[3]];
        x = ox + a[4];
        y = oy + a[5];
        break;
      case "s": {
        const [x1, y1] = lastCubic ? [2 * x - lastCubic[0], 2 * y - lastCubic[1]] : [x, y];
        curve([x1, y1, ox + a[0], oy + a[1], ox + a[2], oy + a[3]]);
        cubic = [ox + a[0], oy + a[1]];
        x = ox + a[2];
        y = oy + a[3];
        break;
      }
      case "q":
      case "t": {
        const control: Point =
          lower === "q" ? [ox + a[0], oy + a[1]] : lastQuad ? [2 * x - lastQuad[0], 2 * y - lastQuad[1]] : [x, y];
        const [ex, ey] = lower === "q" ? [ox + a[2], oy + a[3]] : [ox + a[0], oy + a[1]];
        quadTo(control[0], control[1], ex, ey);
        quad = control;
        x = ex;
        y = ey;
        break;
      }
      case "a": {
        const [ex, ey] = [ox + a[5], oy + a[6]];
        const curves = arcToCubics(x, y, a[0], a[1], a[2], a[3], a[4], ex, ey);
        if (curves) curves.forEach(curve);
        else ops.push(`${pt(ex, ey)} l`);
        x = ex;
        y = ey;
        break;
      }
      case "z":
        ops.push("h");
        x = startX;
        y = startY;
        break;
    }
    lastCubic = cubic;
    lastQuad = quad;
  }
  return ops.join("\n");
}

// ---- Document writer ----

// One page, ASCII only, so byte offsets are string lengths.
export function writePdf(widthPt: number, heightPt: number, content: string, fonts: string[]): Uint8Array {
  const fontRefs = fonts.map((_, i) => `/F${i + 1} ${5 + i} 0 R`).join(" ");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(widthPt)} ${num(heightPt)}] /Resources << /Font << ${fontRefs} >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    ...fonts.map((font) => `<< /Type /Font /Subtype /Type1 /BaseFont /${font} >>`),
  ];

  let out = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const offset = out.length;
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Uint8Array.from(out, (c) => c.charCodeAt(0));
}

// ---- Barcode artwork ----

// Bar colour per bar: solid, or the gradient sampled at the bar centre (the
// SVG gradient spans the bars' bounding box). shortcut: radial gradients are
// sampled on the scan band's centre line only, so colour does not vary up a bar.
function barColors(composed: ComposedBarcode): [number, number, number][] {
  const { bars, colorConfig } = composed;
  if (colorConfig.mode !== "gradient") return bars.map(() => rgb(getSolidColor(colorConfig)));

  const stops = normalizeStops(colorConfig.gradientStops).map((stop) => ({ ...stop, rgb: rgb(stop.color) }));
  const minX = bars[0]?.x ?? 0;
  const spanX = (bars.at(-1) ? bars.at(-1)!.x + bars.at(-1)!.width : 1) - minX || 1;
  const v = (composed.band.y + composed.band.height / 2 - composed.top) / composed.barHeight;
  return bars.map((bar) => {
    const u = (bar.x + bar.width / 2 - minX) / spanX;
    const t = gradientT(colorConfig, u, v);
    const next = stops.findIndex((stop) => stop.offset >= t);
    if (next <= 0) return (next === 0 ? stops[0] : stops[stops.length - 1]).rgb;
    const a = stops[next - 1];
    const b = stops[next];
    const f = b.offset === a.offset ? 0 : (t - a.offset) / (b.offset - a.offset);
    return a.rgb.map((c, i) => c + (b.rgb[i] - c) * f) as [number, number, number];
  });
}

// Matches buildGradientDef: linear 0%→100% across, radial at (50%, 45%) r 75%.
function gradientT(config: ColorConfig, u: number, v: number): number {
  return config.gradientKind === "radial" ? Math.hypot(u - 0.5, v - 0.45) / 0.75 : u;
}

// The composed barcode at its exact print size: bars clipped to each shape path
// and, separately, to the scan band. Drawing them per clip instead of as one
// union avoids even-odd shapes cutting holes where the shape overlaps the band.
export function composedToPdf(composed: ComposedBarcode, xMm: number): Uint8Array {
  const { viewBox, bars, band, shape, top, barHeight, digits } = composed;
  const widthPt = sizeMm(viewBox.width, xMm) * PT_PER_MM;
  const heightPt = sizeMm(viewBox.height, xMm) * PT_PER_MM;
  const colors = barColors(composed);
  const solid = composed.colorConfig.mode !== "gradient";

  const drawBars = () =>
    [
      ...(solid && colors.length ? [fill(colors[0])] : []),
      ...bars.map(
        (bar, i) => `${solid ? "" : `${fill(colors[i])}\n`}${num(bar.x)} ${num(top)} ${num(bar.width)} ${num(barHeight)} re f`
      ),
    ].join("\n");
  const clipOp = shape.fillRule === "evenodd" ? "W* n" : "W n";
  const toArt = (x: number, y: number): Point => [x * shape.scale + shape.translateX, y * shape.scale + shape.translateY];
  const clips = [
    ...shape.paths.map((d) => `${svgPathToPdf(d, toArt)}\n${clipOp}`),
    `0 ${num(band.y)} ${num(viewBox.width)} ${num(band.height)} re\nW n`,
  ];

  const text = digits.map(({ text, x, y, size, fitWidth }) => {
    const natural = text.length * size * COURIER_ADVANCE;
    const width = fitWidth ?? natural;
    const scale = natural ? (width / natural) * 100 : 100;
    // The page is flipped to SVG's y-down; the text matrix flips glyphs back.
    return `BT\n/F1 ${num(size)} Tf\n${num(scale)} Tz\n1 0 0 -1 ${num(x - width / 2)} ${num(y)} Tm\n${pdfString(text)} Tj\nET`;
  });

  const content = [
    "q",
    `${num(widthPt / viewBox.width, 6)} 0 0 ${num(-heightPt / viewBox.height, 6)} 0 ${num(heightPt)} cm`,
    "1 1 1 rg",
    `0 0 ${num(viewBox.width)} ${num(viewBox.height)} re f`,
    ...clips.map((clip) => `q\n${clip}\n${drawBars()}\nQ`),
    fill(rgb(DIGIT_COLOR)),
    ...text,
    "Q",
  ].join("\n");

  return writePdf(widthPt, heightPt, content, ["Courier-Bold"]);
}

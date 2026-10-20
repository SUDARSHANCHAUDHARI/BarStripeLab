import type { BarcodeFormat, ComposedBarcode } from "@/types";
import { calculateEAN13Checksum, calculateEAN8Checksum } from "@/lib/ean13checksum";
import { svgToCanvas } from "@/lib/exportImage";

// EAN/UPC L-code digits 0-9 as module widths (space, bar, space, bar). R codes
// have the same widths with bar and space swapped; G codes are L reversed.
const EAN_DIGITS = ["3211", "2221", "2122", "1411", "1132", "1231", "1114", "1312", "1213", "3112"];
// EAN-13 first digit, from the L/G parity of the six left digits.
const EAN13_PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

// Code 128 values 0-106 as module widths (bar, space, ...); 106 is the stop.
const CODE128 = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];
const CODE128_START_A = 103;
const CODE128_STOP = 106;

// ISO/IEC 15416: the darkest bar may reflect at most half of what the paper does.
const MAX_DARK_RATIO = 0.5;

// Rasterised samples per SVG unit, so the narrowest (1 unit) bar spans 4 pixels.
const SAMPLES_PER_UNIT = 4;

// Widths of the dark and light runs from the first dark sample to the last.
function toRuns(luminance: number[]): number[] {
  const min = luminance.reduce((a, b) => Math.min(a, b), Infinity);
  const max = luminance.reduce((a, b) => Math.max(a, b), -Infinity);
  if (!(max > 0) || !(min <= MAX_DARK_RATIO * max)) return [];
  const threshold = (min + max) / 2;
  const runs: number[] = [];
  let dark = false;
  for (const value of luminance) {
    const isDark = value < threshold;
    if (!runs.length && !isDark) continue;
    if (runs.length && isDark === dark) runs[runs.length - 1]++;
    else runs.push(1);
    dark = isDark;
  }
  if (!dark) runs.pop();
  return runs;
}

// Rounds a group of runs to whole modules, given how many modules it spans.
function toModules(group: number[], total: number): string {
  const sum = group.reduce((a, b) => a + b, 0);
  const widths = group.map((width) => Math.round((width * total) / sum));
  const ok = widths.every((width) => width >= 1) && widths.reduce((a, b) => a + b, 0) === total;
  return ok ? widths.join("") : "";
}

// Ink spread or bar width reduction moves every edge: bars come out wider or
// thinner by the same amount and spaces the opposite. Measure it on a 1-module
// bar between two 1-module spaces and take it out. Runs start with a bar.
function undoGain(runs: number[], bar: number): number[] {
  const gain = (runs[bar] - (runs[bar - 1] + runs[bar + 1]) / 2) / 2;
  return runs.map((width, i) => (i % 2 === 0 ? width - gain : width + gain));
}

function decodeEan(measured: number[], half: 4 | 6): string | null {
  if (measured.length !== 11 + 8 * half) return null;
  // The middle guard is space, bar, space, bar, space, all 1 module.
  const runs = undoGain(measured, 4 + 4 * half);
  let at = 0;
  const take = (count: number, total: number) => toModules(runs.slice(at, (at += count)), total);
  const digits = (side: "left" | "right") => {
    let value = "";
    let parity = "";
    for (let i = 0; i < half; i++) {
      const widths = take(4, 7);
      const l = EAN_DIGITS.indexOf(widths);
      const g = side === "left" ? EAN_DIGITS.indexOf([...widths].reverse().join("")) : -1;
      if (l < 0 && g < 0) return null;
      value += l >= 0 ? l : g;
      parity += l >= 0 ? "L" : "G";
    }
    return { value, parity };
  };

  if (take(3, 3) !== "111") return null;
  const left = digits("left");
  if (!left || take(5, 5) !== "11111") return null;
  const right = digits("right");
  if (!right || take(3, 3) !== "111") return null;

  if (half === 4) {
    const value = left.value + right.value;
    return left.parity === "LLLL" && calculateEAN8Checksum(value.slice(0, 7)) === value ? value : null;
  }
  const first = EAN13_PARITY.indexOf(left.parity);
  const value = `${first}${left.value}${right.value}`;
  return first >= 0 && calculateEAN13Checksum(value.slice(0, 12)) === value ? value : null;
}

function decodeCode128(measured: number[]): string | null {
  if (measured.length < 25 || (measured.length - 7) % 6) return null;
  // The stop pattern 2331112 ends in space, bar, space of 1 module each.
  const runs = undoGain(measured, measured.length - 3);
  if (toModules(runs.slice(-7), 13) !== CODE128[CODE128_STOP]) return null;
  const values: number[] = [];
  for (let at = 0; at < runs.length - 7; at += 6) {
    const value = CODE128.indexOf(toModules(runs.slice(at, at + 6), 11));
    if (value < 0) return null;
    values.push(value);
  }

  const [start, ...data] = values;
  const check = data.pop()!;
  const sum = data.reduce((total, value, i) => total + value * (i + 1), start);
  if (start < CODE128_START_A || sum % 103 !== check) return null;

  let set = "ABC"[start - CODE128_START_A];
  let shift = false;
  let text = "";
  for (const value of data) {
    const current = shift ? (set === "A" ? "B" : "A") : set;
    shift = false;
    if (current === "C" && value < 100) text += String(value).padStart(2, "0");
    else if (value < 96) text += String.fromCharCode(current === "A" && value >= 64 ? value - 64 : value + 32);
    else if (value === 98) shift = true;
    else if (value === 99) set = "C";
    // In its own set, 100 (B) or 101 (A) is FNC4 (extended ASCII): never generated here.
    else if (value === 100 || value === 101) {
      const target = value === 100 ? "B" : "A";
      if (current === target) return null;
      set = target;
    } else if (value > 102) return null;
    // 96, 97 and 102 are FNC3, FNC2 and FNC1: no text.
  }
  return text;
}

function decodeRuns(runs: number[], format: BarcodeFormat): string | null {
  if (format === "code128") return decodeCode128(runs);
  if (format === "ean8") return decodeEan(runs, 4);
  const value = decodeEan(runs, 6);
  if (format === "ean13" || value === null) return value;
  return value.startsWith("0") ? value.slice(1) : null;
}

// Decode one scan line of luminance samples (0 = black, 1 = white), read in
// either direction. Null when it does not decode or fails its check digit.
export function decodeScanline(luminance: number[], format: BarcodeFormat): string | null {
  const runs = toRuns(luminance);
  if (!runs.length) return null;
  return decodeRuns(runs, format) ?? decodeRuns([...runs].reverse(), format);
}

const linear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// Browser only: rasterise the composed SVG and decode the middle row of the
// band. Rejects if the browser cannot rasterise the SVG.
export async function decodeComposed(composed: ComposedBarcode, format: BarcodeFormat): Promise<string | null> {
  const canvas = await svgToCanvas(composed.svg, Math.round(composed.viewBox.width * SAMPLES_PER_UNIT));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");
  const row = Math.floor(((composed.band.y + composed.band.height / 2) / composed.viewBox.height) * canvas.height);
  const { data } = context.getImageData(0, row, canvas.width, 1);
  const luminance: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    luminance.push(0.2126 * linear(data[i]) + 0.7152 * linear(data[i + 1]) + 0.0722 * linear(data[i + 2]));
  }
  return decodeScanline(luminance, format);
}

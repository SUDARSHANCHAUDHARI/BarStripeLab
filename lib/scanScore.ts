import type { BarcodeFormat, ComposedBarcode, ScanFactor, ScanScore } from "@/types";
import { BARCODE_SCALE } from "@/lib/barcode";
import {
  failsRedLight,
  getSolidColor,
  lowestBarContrast,
  normalizeStops,
  redLightReflectance,
} from "@/lib/colorEngine";
import { QUIET_ZONE_MODULES, minBarHeightModules } from "@/lib/gs1";
import { xRangeMm } from "@/lib/printSize";

// Scan-safety estimate (heuristic, not a verification). Weights and grades
// follow docs/superpowers/specs/2026-10-21-barstripelab-redesign-design.md §7.

// White paper reflects about 85% under red light.
const PAPER_REFLECTANCE = 85;
// ISO/IEC 15416 symbol contrast grades A to D, as red-light points.
const CONTRAST_GRADES = [
  { min: 70, points: 40 },
  { min: 55, points: 30 },
  { min: 40, points: 20 },
  { min: 20, points: 5 },
];
const RED_LIGHT_CAP = 20;
// GS1 allows 0.249 mm up to 80% only for print-on-demand (thermal, laser).
const THERMAL_MIN_X_MM = 0.249;
const CAMERA_MIN_CONTRAST = 3;
const CAMERA_PENALTY = -10;
// Tolerance for X values computed from a magnification, e.g. 0.33 × 0.8.
const EPSILON = 1e-9;

export function scanScore({
  composed,
  format,
  xMm,
  barModules,
}: {
  composed: ComposedBarcode;
  format: BarcodeFormat;
  xMm: number;
  barModules: number;
}): ScanScore {
  const config = composed.colorConfig;
  const colors =
    config.mode === "gradient"
      ? normalizeStops(config.gradientStops).map((stop) => stop.color)
      : [getSolidColor(config)];

  // The lightest colour under red light is what the scanner has to see.
  const contrast = PAPER_REFLECTANCE * (1 - Math.max(...colors.map(redLightReflectance)));
  const capped = failsRedLight(config);
  const redPoints = CONTRAST_GRADES.find((grade) => contrast >= grade.min)?.points ?? 0;
  const redLight: ScanFactor = {
    id: "redLight",
    label: "Red-light contrast",
    points: redPoints,
    max: 40,
    message: capped
      ? "Red-laser scanners will not see these bars: red, orange and pink look like white paper to them. Use black, navy, dark green or dark brown."
      : redPoints === 40
        ? "Bars stay dark under a red scanner light."
        : "Bars are only partly dark under a red scanner light. A darker colour is safer.",
  };

  const minHeight = minBarHeightModules(format, barModules, xMm) * BARCODE_SCALE;
  const heightRatio = Math.min(1, composed.band.height / minHeight);
  const barHeight: ScanFactor = {
    id: "barHeight",
    label: "Bar height",
    points: Math.round(30 * heightRatio),
    max: 30,
    message:
      heightRatio >= 1
        ? "Every bar is drawn at least at the GS1 minimum height."
        : `Full-height bars reach ${Math.round(heightRatio * 100)}% of the GS1 minimum height. Retail-safe mode raises them to 100%.`,
  };

  const quiet = QUIET_ZONE_MODULES[format];
  const rightMargin = composed.viewBox.width - composed.barsX - composed.barsWidth;
  const quietOk =
    composed.barsX >= quiet.left * BARCODE_SCALE - EPSILON && rightMargin >= quiet.right * BARCODE_SCALE - EPSILON;
  const quietZones: ScanFactor = {
    id: "quietZones",
    label: "Quiet zones",
    points: quietOk ? 10 : 0,
    max: 10,
    message: quietOk
      ? "Blank margins on both sides meet the standard."
      : "Blank margins are narrower than the standard.",
  };

  const range = xRangeMm(format);
  const inRange = xMm >= range.min - EPSILON && xMm <= range.max + EPSILON;
  const thermal = format !== "code128" && !inRange && xMm >= THERMAL_MIN_X_MM - EPSILON && xMm < range.min;
  const printSize: ScanFactor = {
    id: "printSize",
    label: "Print size",
    points: inRange ? 15 : thermal ? 5 : 0,
    max: 15,
    message: inRange
      ? "Print size is inside the range scanners are built for."
      : thermal
        ? "Below 80%: only allowed for thermal and laser label printers."
        : `Module width ${xMm} mm is outside the ${range.min} to ${range.max} mm range.`,
  };

  const digitsShown = composed.digits.some((digit) => digit.text.trim());
  const digits: ScanFactor = {
    id: "digits",
    label: "Digits",
    points: digitsShown ? 5 : 0,
    max: 5,
    message: digitsShown
      ? "Digits are printed under the bars, so a cashier can type them in."
      : "No digits under the bars. Retail barcodes need them.",
  };

  const lowContrast = lowestBarContrast(config) < CAMERA_MIN_CONTRAST;
  const camera: ScanFactor = {
    id: "camera",
    label: "Camera contrast",
    points: lowContrast ? CAMERA_PENALTY : 0,
    max: 0,
    message: lowContrast
      ? "Low contrast: phone cameras may struggle to read these bars."
      : "Enough contrast for phone cameras.",
  };

  const factors = [redLight, barHeight, quietZones, printSize, digits, camera];
  const total = Math.max(0, Math.min(100, factors.reduce((sum, factor) => sum + factor.points, 0)));
  const score = capped ? Math.min(total, RED_LIGHT_CAP) : total;
  return {
    score,
    band: score >= 80 ? "likely" : score >= 50 ? "risky" : "fail",
    capped,
    factors,
  };
}

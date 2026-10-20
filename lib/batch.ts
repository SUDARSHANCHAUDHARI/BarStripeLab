import type { BarcodeFormat } from "@/types";
import { detectFormat } from "@/lib/formatDetect";
import { normalizeCODE128, normalizeEAN13, normalizeEAN8, normalizeUPCA } from "@/lib/ean13checksum";

export type BatchResult = {
  rows: { line: number; value: string; format: BarcodeFormat; normalized: string }[];
  invalid: { line: number; value: string; reason: string }[];
  truncated: boolean;
};

const NORMALIZE: Record<BarcodeFormat, (value: string) => string | null> = {
  ean13: normalizeEAN13,
  ean8: normalizeEAN8,
  upca: normalizeUPCA,
  code128: normalizeCODE128,
};

// First CSV field: comma, semicolon (European Excel) or tab separated, optionally quoted.
function firstField(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('"')) return trimmed.split(/[,;\t]/)[0].trim();
  const match = trimmed.match(/^"((?:[^"]|"")*)"/);
  return (match ? match[1] : trimmed.slice(1)).replace(/""/g, '"').trim();
}

// One value per line (or the first CSV column); blank lines are skipped and at
// most `limit` valid rows are kept. The format is detected per row.
export function parseBatch(text: string, limit = 500): BatchResult {
  const result: BatchResult = { rows: [], invalid: [], truncated: false };
  const lines = text.split(/\r\n|\r|\n/);

  for (let i = 0; i < lines.length; i++) {
    const value = firstField(lines[i]);
    if (!value) continue;
    if (result.rows.length >= limit) {
      result.truncated = true;
      break;
    }

    const line = i + 1;
    const detected = detectFormat(value);
    // Detection picks the format; the check digit is checked again here so a
    // loose detector can never let a bad number into the batch.
    const normalized = detected.normalized === null ? null : NORMALIZE[detected.format](detected.normalized);
    if (normalized === null || detected.fix) {
      const reason = detected.fix
        ? `Wrong check digit: did you mean ${detected.fix}?`
        : detected.message || "Not a valid barcode number";
      result.invalid.push({ line, value, reason });
    } else {
      result.rows.push({ line, value, format: detected.format, normalized });
    }
  }
  return result;
}

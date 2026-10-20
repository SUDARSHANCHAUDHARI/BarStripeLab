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

// Column names people put above a list of codes: "GTIN-13", "EAN13", "SKU", "Barcode".
const HEADER_WORD = /^(?:gtin|ean|upc(?:-?a)?|sku|barcode|code|number|value)[^a-z]*$/i;

// The first row is a header when it is a column name, or when it is text that is not a
// valid barcode of the format most of the other rows use. A row of digits is always data,
// so a typo keeps its check-digit message instead of vanishing as a "header".
function isHeader(first: string, rest: string[]): boolean {
  if (HEADER_WORD.test(first)) return true;
  if (/^[\d\s-]+$/.test(first) || rest.length === 0) return false;
  const counts = new Map<BarcodeFormat, number>();
  for (const value of rest) {
    const { format } = detectFormat(value);
    counts.set(format, (counts.get(format) ?? 0) + 1);
  }
  const [majority, count] = [...counts].sort((a, b) => b[1] - a[1])[0];
  if (count * 2 <= rest.length) return false;
  return majority !== "code128" || detectFormat(first, "code128").normalized === null;
}

// One value per line (or the first CSV column); blank lines are skipped and at
// most `limit` valid rows are kept. The format is detected per row.
export function parseBatch(text: string, limit = 500): BatchResult {
  const result: BatchResult = { rows: [], invalid: [], truncated: false };
  const values = text
    .split(/\r\n|\r|\n/)
    .map((line, i) => ({ line: i + 1, value: firstField(line) }))
    .filter(({ value }) => value);

  let start = 0;
  if (values.length > 0 && isHeader(values[0].value, values.slice(1, limit + 1).map(({ value }) => value))) {
    result.invalid.push({ ...values[0], reason: "Header row" });
    start = 1;
  }

  for (const { line, value } of values.slice(start)) {
    if (result.rows.length >= limit) {
      result.truncated = true;
      break;
    }

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

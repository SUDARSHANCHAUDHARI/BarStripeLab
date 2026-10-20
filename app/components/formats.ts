import type { BarcodeFormat } from "@/types";
import {
  normalizeEAN13,
  normalizeEAN8,
  normalizeCODE128,
  normalizeUPCA,
} from "@/lib/ean13checksum";

type FormatInfo = {
  label: string;
  inputLabel: string;
  placeholder: string;
  help: string;
  invalid: string;
  maxLength: number;
  normalize: (value: string) => string | null;
};

export const FORMAT_INFO: Record<BarcodeFormat, FormatInfo> = {
  ean13: {
    label: "EAN-13",
    inputLabel: "Barcode digits",
    placeholder: "12 or 13 digits",
    help: "Enter 12 digits and we'll calculate the checksum, or paste 13 digits",
    invalid: "Enter a valid 12 or 13 digit barcode. We auto-generate checksum for 12 digits.",
    // Limits leave room for pasted separators; normalization strips them.
    maxLength: 20,
    normalize: normalizeEAN13,
  },
  ean8: {
    label: "EAN-8",
    inputLabel: "Barcode digits",
    placeholder: "7 or 8 digits",
    help: "Enter 7 digits and we'll calculate the checksum, or paste 8 digits",
    invalid: "Enter a valid 7 or 8 digit barcode. We auto-generate checksum for 7 digits.",
    maxLength: 12,
    normalize: normalizeEAN8,
  },
  upca: {
    label: "UPC-A",
    inputLabel: "Barcode digits",
    placeholder: "11 or 12 digits",
    help: "Enter 11 digits and we'll calculate the checksum, or paste 12 digits",
    invalid: "Enter a valid 11 or 12 digit UPC-A. We auto-generate checksum for 11 digits.",
    maxLength: 20,
    normalize: normalizeUPCA,
  },
  code128: {
    label: "CODE 128",
    inputLabel: "Barcode text",
    placeholder: "Letters, numbers, symbols",
    help: "Letters, numbers, spaces and symbols (no accents or emoji). Variable length barcode.",
    invalid: "Enter up to 48 letters, numbers, spaces or symbols (no accents or emoji).",
    maxLength: 48,
    normalize: normalizeCODE128,
  },
};

export const FORMAT_IDS = Object.keys(FORMAT_INFO) as BarcodeFormat[];

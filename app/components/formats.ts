import type { BarcodeFormat } from "@/types";

export const FORMAT_LABEL: Record<BarcodeFormat, string> = {
  ean13: "EAN-13",
  ean8: "EAN-8",
  upca: "UPC-A",
  code128: "Code 128",
};

export const FORMAT_IDS = Object.keys(FORMAT_LABEL) as BarcodeFormat[];

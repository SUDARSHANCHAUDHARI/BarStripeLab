import type { BarcodeFormat } from "@/types";

// Contract stub (Task 0). Task 5 (FLOW) owns the implementation and tests.
export function detectFormat(
  input: string,
  preferred?: BarcodeFormat
): { format: BarcodeFormat; normalized: string | null; fix: string | null; message: string } {
  return { format: preferred ?? "ean13", normalized: input.trim() || null, fix: null, message: "" };
}

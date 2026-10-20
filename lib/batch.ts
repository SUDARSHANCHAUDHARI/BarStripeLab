import type { BarcodeFormat } from "@/types";

export type BatchResult = {
  rows: { line: number; value: string; format: BarcodeFormat; normalized: string }[];
  invalid: { line: number; value: string; reason: string }[];
  truncated: boolean;
};

// Contract stub (Task 0). Task 4 (EXPORT) owns the implementation and tests.
export function parseBatch(_text: string, _limit = 500): BatchResult {
  return { rows: [], invalid: [], truncated: false };
}

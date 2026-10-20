import type { BarcodeFormat } from "@/types";
import Flow from "./flow/Flow";

interface GeneratorProps {
  // Shape landing pages preselect their own shape.
  initialShape?: string;
  // "art" starts in Art mode instead of Retail-safe (the tattoo page).
  mode?: "retail" | "art";
  // The barcode type to start with, e.g. Code 128 on the tattoo page so a date stays as typed.
  initialFormat?: BarcodeFormat;
}

// The page-facing entry point: the Till Check flow.
export default function Generator(props: GeneratorProps) {
  return <Flow {...props} />;
}

"use client";

import { useEffect, useState } from "react";
import type { ComposedBarcode, ScanScore } from "@/types";
import type { Design } from "@/lib/urlState";
import { BARCODE_SCALE, generateBarcodeSVG } from "@/lib/barcode";
import { composeBarcode } from "@/lib/svgComposer";
import { decodeComposed } from "@/lib/decode";
import { detectFormat } from "@/lib/formatDetect";
import { scanScore } from "@/lib/scanScore";
import { NO_SHAPE, shapeFor } from "./design";

export type DecodeState = "checking" | "ok" | "failed";

export type Rendered = {
  // The number that was drawn (check digit added), null when the input is unusable.
  normalized: string | null;
  // Shape the composed artwork was made with; lags design.shape by the debounce.
  shapeId: string;
  composed: ComposedBarcode | null;
  // Same design without a shape, for the reveal.
  plain: ComposedBarcode | null;
  score: ScanScore | null;
  decode: DecodeState;
  error: string;
};

const EMPTY: Rendered = {
  normalized: null,
  shapeId: "",
  composed: null,
  plain: null,
  score: null,
  decode: "checking",
  error: "",
};

const DEBOUNCE_MS = 150;

// Composes the design, scores it and decodes it back. Keeps the previous artwork while a new one is made,
// so the preview never flashes empty.
export function useDesignRender(design: Design, enabled: boolean): Rendered {
  const [rendered, setRendered] = useState<Rendered>(EMPTY);
  const { format, value, shape, colorConfig, retailSafe, xMm, bwrMm } = design;

  useEffect(() => {
    if (!enabled) return;

    const { normalized } = detectFormat(value, format);
    if (!normalized) {
      setRendered(EMPTY);
      return;
    }

    let cancelled = false;
    setRendered((prev) => ({ ...prev, normalized, decode: "checking", error: "" }));

    const timer = setTimeout(async () => {
      let composed: ComposedBarcode;
      let plain: ComposedBarcode;
      let score: ScanScore;
      try {
        const rawBarcodeSvg = await generateBarcodeSVG(normalized, format);
        const options = { rawBarcodeSvg, colorConfig, value: normalized, format, retailSafe, xMm, bwrMm };
        composed = composeBarcode({ ...options, shape: shapeFor(shape) });
        plain = shape === NO_SHAPE.id ? composed : composeBarcode({ ...options, shape: NO_SHAPE });
        score = scanScore({ composed, format, xMm, barModules: composed.barsWidth / BARCODE_SCALE });
      } catch (err) {
        console.error("Render error:", err);
        if (!cancelled) {
          setRendered({ ...EMPTY, normalized, error: "We couldn't draw this barcode. Try another number." });
        }
        return;
      }
      if (cancelled) return;
      setRendered({ normalized, shapeId: shape, composed, plain, score, decode: "checking", error: "" });

      let decoded: string | null = null;
      try {
        decoded = await decodeComposed(composed, format);
      } catch (err) {
        console.error("Decode error:", err);
      }
      if (!cancelled) {
        setRendered((prev) => ({ ...prev, decode: decoded === normalized ? "ok" : "failed" }));
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, format, value, shape, colorConfig, retailSafe, xMm, bwrMm]);

  return rendered;
}

"use client";

import type { Ref } from "react";
import type { BarcodeFormat, PanelId } from "@/types";
import type { Design } from "@/lib/urlState";
import { NO_SHAPE_ID } from "@/lib/urlState";
import { FORMAT_LABEL } from "../formats";
import ExportBar from "./ExportBar";
import ProductPanel from "./ProductPanel";
import ScanCheck from "./ScanCheck";
import { shapeFor } from "./design";
import { artworkSizes, formatSize } from "./sizes";
import type { Rendered } from "./useDesignRender";
import { BTN_QUIET, STEP_HEADING } from "./ui";

interface StepResultProps {
  design: Design;
  rendered: Rendered;
  format: BarcodeFormat;
  headingRef: Ref<HTMLHeadingElement>;
  dpi: number;
  onDpi: (dpi: number) => void;
  onPanel: (panel: PanelId) => void;
  getShareUrl: () => string;
  onBatch: () => void;
  onSettings: () => void;
  onRestart: () => void;
}

export default function StepResult({
  design,
  rendered,
  format,
  headingRef,
  dpi,
  onDpi,
  onPanel,
  getShareUrl,
  onBatch,
  onSettings,
  onRestart,
}: StepResultProps) {
  const { composed, score, decode, normalized, error } = rendered;
  const number = normalized ?? design.value;
  const hasShape = design.shape !== NO_SHAPE_ID;
  const shapeLabel = shapeFor(design.shape).label;
  const sizes = composed ? artworkSizes(composed, design.xMm) : null;
  const description = `${FORMAT_LABEL[format]} barcode ${number}${hasShape ? ` in the shape of ${shapeLabel.toLowerCase()}` : ""}`;

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-ink-2">Step 4 of 4</p>
      <h2 ref={headingRef} tabIndex={-1} className={`${STEP_HEADING} max-w-[24ch]`}>
        Your barcode on your pack. Download your files.
      </h2>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <ProductPanel panelId={design.panel} onPanel={onPanel} composed={composed} xMm={design.xMm} description={description} />
          <div role="status" className="mt-4 text-base text-ink">
            {sizes ? (
              <dl className="grid gap-1">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-bold">Barcode</dt>
                  <dd>{formatSize(sizes.standard)}</dd>
                </div>
                {hasShape && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold">With shape</dt>
                    <dd>{formatSize(sizes.withShape)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-ink-2">Working out the printed size...</p>
            )}
            <p className="mt-1 text-sm text-ink-2">The barcode is the bars, clear space and numbers. The shape is extra.</p>
          </div>
        </div>
        <ScanCheck score={score} decode={decode} number={number} colorConfig={design.colorConfig} />
      </div>

      <h3 className="mb-3 mt-10 font-display text-2xl font-bold text-ink">Download</h3>
      <ExportBar
        composed={composed}
        score={score}
        decode={decode}
        format={format}
        number={number}
        xMm={design.xMm}
        bwrMm={design.bwrMm}
        retailSafe={design.retailSafe}
        shapeLabel={shapeLabel}
        dpi={dpi}
        onDpi={onDpi}
        getShareUrl={getShareUrl}
        onBatch={onBatch}
        onSettings={onSettings}
      />

      <p className="mt-8">
        <button type="button" onClick={onRestart} className={BTN_QUIET}>
          Make another barcode
        </button>
      </p>
    </div>
  );
}

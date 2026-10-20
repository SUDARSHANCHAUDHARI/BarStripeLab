"use client";

import type { FormEvent, Ref } from "react";
import type { BarcodeFormat } from "@/types";
import type { Detection } from "@/lib/formatDetect";
import { getShape } from "@/lib/shapes";
import ShapeThumb from "../ShapeThumb";
import { FORMAT_IDS, FORMAT_LABEL } from "../formats";
import ScanLine from "./ScanLine";
import StepActions from "./StepActions";
import { SHAPE_COUNT } from "./design";
import { BTN_PRIMARY, BTN_QUIET, FIELD, FOCUS, LABEL } from "./ui";

const TEASER_SHAPES = ["cat", "palm-tree", "heart", "coffee"].map(getShape);

interface StepNumberProps {
  value: string;
  detection: Detection;
  // The user's own choice of type; undefined means "detect it".
  override: BarcodeFormat | undefined;
  headingRef: Ref<HTMLHeadingElement>;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onOverride: (format: BarcodeFormat | undefined) => void;
  onSubmit: () => void;
  onOpenGs1: () => void;
}

export default function StepNumber({
  value,
  detection,
  override,
  headingRef,
  inputRef,
  onChange,
  onOverride,
  onSubmit,
  onOpenGs1,
}: StepNumberProps) {
  const { normalized, fix, message } = detection;
  const tone = normalized ? "text-pass" : fix ? "text-warn" : "text-ink-2";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-ink-2">Step 1 of 4</p>
      {/* The page owns the visible headline and intro; this keeps a heading for focus and screen readers. */}
      <h2 ref={headingRef} tabIndex={-1} className="sr-only focus:outline-none">
        Your product number
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="barcode-number" className={LABEL}>
          Your product number
        </label>
        <input
          ref={inputRef}
          id="barcode-number"
          type="text"
          inputMode={detection.format === "code128" ? "text" : "numeric"}
          autoComplete="off"
          spellCheck={false}
          maxLength={60}
          placeholder="5901234123457"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(fix)}
          aria-describedby="barcode-number-status"
          className={`w-full rounded-2xl border-2 border-ink bg-card px-5 py-4 font-mono text-[clamp(1.75rem,3.4vw,2.5rem)] font-medium tracking-[0.08em] text-ink placeholder:font-normal placeholder:text-ink-2 ${FOCUS}`}
        />
        <ScanLine pass={Boolean(normalized)} />

        <div id="barcode-number-status" role="status" aria-live="polite" className={`min-h-[2.6em] text-[1.0625rem] ${tone}`}>
          {message}{" "}
          {fix && (
            <button type="button" onClick={() => onChange(fix)} className="font-bold underline underline-offset-4">
              Use {fix}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label htmlFor="barcode-type" className="text-sm font-bold text-ink">
            Barcode type
          </label>
          <select
            id="barcode-type"
            value={override ?? ""}
            onChange={(event) => onOverride((event.target.value as BarcodeFormat) || undefined)}
            className={`${FIELD} !w-auto`}
          >
            <option value="">{override ? "Detect automatically" : `Detected: ${FORMAT_LABEL[detection.format]}`}</option>
            {FORMAT_IDS.map((id) => (
              <option key={id} value={id}>
                {FORMAT_LABEL[id]}
              </option>
            ))}
          </select>
        </div>

        <StepActions>
          <button type="submit" className={`${BTN_PRIMARY} max-sm:w-full`}>
            Make my barcode
          </button>
          <button type="button" onClick={onOpenGs1} className={BTN_QUIET}>
            I don&apos;t have a number yet
          </button>
        </StepActions>
      </form>

      <div className="mt-16 flex flex-col gap-4 text-base text-ink-2 sm:flex-row sm:items-end sm:gap-6">
        <div aria-hidden="true" className="flex items-end gap-4 text-ink">
          {TEASER_SHAPES.map((shape) => (
            <ShapeThumb key={shape.id} shape={shape} className="h-14 w-14" />
          ))}
        </div>
        <p className="max-w-[26ch]">
          Later, you can turn it into one of {SHAPE_COUNT} shapes. The bars underneath stay the same.
        </p>
      </div>
    </div>
  );
}

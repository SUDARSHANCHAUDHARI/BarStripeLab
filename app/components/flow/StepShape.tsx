"use client";

import type { Ref } from "react";
import type { ComposedBarcode, Template } from "@/types";
import { NO_SHAPE_ID } from "@/lib/urlState";
import AIInput from "../AIInput";
import ShapeGrid from "../ShapeGrid";
import TemplateSelector from "../TemplateSelector";
import RevealStage from "./RevealStage";
import StepActions from "./StepActions";
import { shapeFor } from "./design";
import { BTN_PRIMARY, BTN_QUIET, FOCUS, STEP_HEADING } from "./ui";

interface StepShapeProps {
  shape: string;
  number: string;
  composed: ComposedBarcode | null;
  plain: ComposedBarcode | null;
  // Shape the composed artwork was made with (lags `shape` while it is being made).
  renderedShape: string;
  error: string;
  headingRef: Ref<HTMLHeadingElement>;
  continueLabel: string;
  onShape: (shape: string) => void;
  onTemplate: (template: Template) => void;
  onAI: (prompt: string, apiKey: string) => Promise<void>;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepShape({
  shape,
  number,
  composed,
  plain,
  renderedShape,
  error,
  headingRef,
  continueLabel,
  onShape,
  onTemplate,
  onAI,
  onContinue,
  onBack,
}: StepShapeProps) {
  const note =
    shape === NO_SHAPE_ID ? "Pick a shape below to see it." : `${shapeFor(shape).label}. Same number, same bars.`;

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-ink-2">Step 3 of 4</p>
      <h2 ref={headingRef} tabIndex={-1} className={`${STEP_HEADING} max-w-[22ch]`}>
        Here&apos;s your barcode. Want to give it a shape?
      </h2>
      <p className="mb-8 mt-4 max-w-[46ch] text-xl text-ink-2">Your bars don&apos;t change. The shape sits on top.</p>

      <RevealStage composed={composed} plain={plain} shapeId={renderedShape} number={number} />
      <p role="status" className="mt-4 text-center text-base text-ink-2">
        {error || note}
      </p>

      <h3 className="mb-3 mt-8 text-lg font-bold text-ink">Pick a shape</h3>
      <ShapeGrid shape={shape} setShape={onShape} />

      <details className="group mt-6 rounded-2xl bg-card px-5 py-4">
        <summary className={`flex min-h-[44px] cursor-pointer items-center rounded-md font-bold text-ink ${FOCUS}`}>
          Need ideas? Try a template or the AI style maker
        </summary>
        <div className="mt-4 space-y-4">
          <TemplateSelector onSelect={onTemplate} />
          <AIInput onGenerate={onAI} />
        </div>
      </details>

      <StepActions>
        <button type="button" onClick={onContinue} className={`${BTN_PRIMARY} max-sm:w-full`}>
          {continueLabel}
        </button>
        <button type="button" onClick={onBack} className={BTN_QUIET}>
          Back
        </button>
      </StepActions>
    </div>
  );
}

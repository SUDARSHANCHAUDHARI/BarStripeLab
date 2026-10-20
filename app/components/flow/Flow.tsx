"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BarcodeFormat, StylePreset } from "@/types";
import { generateAIStyle } from "@/lib/aiStyleGenerator";
import { COLOR_PRESETS, safeColor } from "@/lib/colorEngine";
import { detectFormat } from "@/lib/formatDetect";
import { magnification } from "@/lib/printSize";
import { SHAPE_IDS, isShapeId } from "@/lib/shapes";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { NO_SHAPE_ID, decodeDesign, encodeDesign, type Design } from "@/lib/urlState";
import AIInput from "../AIInput";
import { FORMAT_LABEL } from "../formats";
import { shareApp } from "../ShareButton";
import TemplateSelector from "../TemplateSelector";
import AllSettings from "./AllSettings";
import BatchDialog from "./BatchDialog";
import GS1Explainer from "./GS1Explainer";
import Modal from "./Modal";
import StepNumber from "./StepNumber";
import StepResult from "./StepResult";
import StepScan from "./StepScan";
import StepShape from "./StepShape";
import { DEFAULT_PNG_DPI, downloadPng, downloadSvg } from "./download";
import { initialDesign, shapeFor, withFormat, type FlowMode } from "./design";
import { useDesignRender } from "./useDesignRender";
import { BTN_OUTLINE, BTN_QUIET } from "./ui";

type Step = 1 | 2 | 3 | 4;
type Panel = "settings" | "templates" | "csv";

interface FlowProps {
  // Shape landing pages preselect their own shape.
  initialShape?: string;
  // "art" starts in Art mode (the tattoo page); the default is Retail-safe.
  mode?: FlowMode;
  // The barcode type to start with. It also counts as the user's choice, so the number is kept as typed.
  initialFormat?: BarcodeFormat;
}

// The header opens these panels; the same names are used by the keyboard shortcut.
const OPEN_EVENT = "barstripelab:open";
const LAST_DESIGN_KEY = "barstripelab:last-design";
const SAMPLE_NUMBER = "5901234123457";
const PRESET_IDS = Object.keys(COLOR_PRESETS);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable);

function readLastDesign(fallback: Design): Design | null {
  try {
    const stored = window.localStorage.getItem(LAST_DESIGN_KEY);
    if (!stored) return null;
    const design = decodeDesign(stored, fallback);
    return detectFormat(design.value, design.format).normalized ? design : null;
  } catch {
    return null; // storage blocked (private mode, policy): this is only a convenience
  }
}

function rememberDesign(design: Design): void {
  try {
    window.localStorage.setItem(LAST_DESIGN_KEY, encodeDesign(design));
  } catch {
    // storage full or blocked: nothing depends on it
  }
}

interface AnswerLine {
  step: Step;
  label: string;
  value: string;
}

function AnswerList({ lines, onChange }: { lines: AnswerLine[]; onChange: (step: Step) => void }) {
  if (lines.length === 0) return null;
  return (
    <ul aria-label="Your answers so far" className="my-8 border-t border-rule">
      {lines.map((line) => (
        <li key={line.step} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule py-3 text-base">
          <span className="min-w-[9ch] text-ink-2">{line.label}</span>
          <span className="min-w-0 break-words font-mono text-[15px] text-ink">{line.value}</span>
          <button
            type="button"
            onClick={() => onChange(line.step)}
            aria-label={`Change ${line.label.toLowerCase()}`}
            className={`${BTN_QUIET} ml-auto min-h-[44px] text-[15px]`}
          >
            Change
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Flow({ initialShape, mode, initialFormat }: FlowProps) {
  const [design, setDesign] = useState<Design>(() => initialDesign(initialShape, mode, initialFormat));
  // The user's own choice of barcode type; undefined means "detect it from the number".
  const [override, setOverride] = useState<BarcodeFormat | undefined>(initialFormat);
  const [step, setStep] = useState<Step>(1);
  // Furthest step reached: once the result has been seen, every edit returns straight to it.
  const [reached, setReached] = useState<Step>(1);
  const [dpi, setDpi] = useState(DEFAULT_PNG_DPI);
  const [urlRead, setUrlRead] = useState(false);
  const [restore, setRestore] = useState<Design | null>(null);
  const [panel, setPanel] = useState<Panel | "gs1" | null>(null);
  const [notice, setNotice] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const numberInput = useRef<HTMLInputElement>(null);
  // The step last shown, and whether the number field (not the heading) should take focus on arrival.
  const shownStep = useRef<Step>(1);
  const fieldWantsFocus = useRef(false);

  const detection = detectFormat(design.value, override);
  const settingsOpen = panel === "settings";
  const rendered = useDesignRender(design, step >= 2 || settingsOpen);

  const patch = useCallback((changes: Partial<Design>) => setDesign((prev) => ({ ...prev, ...changes })), []);

  const go = useCallback((next: Step) => {
    setStep(next);
    setReached((prev) => (next > prev ? next : prev));
  }, []);

  // The query string is read after mount so the static HTML and the first client render match.
  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const decoded = decodeDesign(search, design);
    setDesign(decoded);
    if (params.has("f")) setOverride(decoded.format);
    if (params.has("v") && detectFormat(decoded.value, decoded.format).normalized) {
      go(4);
    } else {
      setRestore(readLastDesign(design));
    }
    // The header sends visitors here with ?open=<panel> from pages that have no flow (the 404 page).
    const open = params.get("open");
    if (open === "settings" || open === "templates" || open === "csv") {
      setPanel(open);
      params.delete("open");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`);
    }
    setUrlRead(true);
    // Runs once: `design` is the pre-URL default it is read against.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // At the result, keep the address bar equal to the design so the link can be shared as is.
  useEffect(() => {
    if (!urlRead || step !== 4 || !rendered.normalized) return;
    const shared = { ...design, value: rendered.normalized };
    const timer = setTimeout(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?${encodeDesign(shared)}`);
      rememberDesign(shared);
    }, 300);
    return () => clearTimeout(timer);
  }, [urlRead, step, design, rendered.normalized]);

  // Move focus to the new step's heading so keyboard and screen reader users land on it.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    if (fieldWantsFocus.current) {
      fieldWantsFocus.current = false;
      numberInput.current?.focus();
    } else {
      headingRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<{ panel?: Panel; handled?: boolean }>).detail;
      const next = detail?.panel;
      if (next === "settings" || next === "templates" || next === "csv") {
        setPanel(next);
        // Tells the header a flow took it; otherwise the header navigates to the flow.
        detail.handled = true;
      }
    };
    const slash = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return;
      event.preventDefault();
      setPanel("settings");
    };
    window.addEventListener(OPEN_EVENT, open);
    window.addEventListener("keydown", slash);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener("keydown", slash);
    };
  }, []);

  // Focus the number field; from another step, the field takes focus once the step has changed.
  function focusNumberField() {
    if (step === 1) numberInput.current?.focus();
    else fieldWantsFocus.current = true;
  }

  function changeNumber(value: string) {
    const next = detectFormat(value, override);
    setDesign((prev) => withFormat({ ...prev, value }, next.format));
  }

  function changeOverride(format: BarcodeFormat | undefined) {
    setOverride(format);
    const next = detectFormat(design.value, format);
    setDesign((prev) => withFormat(prev, next.format));
  }

  function useSample() {
    setOverride(undefined);
    setDesign((prev) => withFormat({ ...prev, value: SAMPLE_NUMBER }, "ean13"));
    setPanel(null);
    setStep(1);
    focusNumberField();
  }

  function submitNumber() {
    if (!detection.normalized) {
      focusNumberField();
      return;
    }
    patch({ value: detection.normalized, format: detection.format });
    go(reached === 4 ? 4 : 2);
  }

  function applyPreset(preset: StylePreset) {
    setDesign((prev) => ({
      ...prev,
      shape: isShapeId(preset.shape) ? preset.shape : prev.shape,
      colorConfig: { ...prev.colorConfig, mode: "custom", solidColor: safeColor(preset.color) },
    }));
  }

  async function makeAIStyle(prompt: string, apiKey: string) {
    applyPreset(await generateAIStyle(prompt, apiKey));
  }

  // From the header: a chosen template lands on the result when there is a number to show.
  function chooseTemplate(preset: StylePreset) {
    applyPreset(preset);
    setPanel(null);
    if (detection.normalized) go(4);
    else {
      setStep(1);
      focusNumberField();
    }
  }

  function closeSettings() {
    // Opening another panel from inside the sheet also closes it; that must not close the new panel.
    setPanel((p) => (p === "settings" ? null : p));
    if (detection.normalized) {
      patch({ value: detection.normalized });
      go(4);
    }
  }

  function restart() {
    setDesign((prev) => ({ ...prev, value: "" }));
    setOverride(initialFormat);
    setReached(1);
    setStep(1);
    focusNumberField();
  }

  function continueRestore() {
    if (!restore) return;
    setDesign(restore);
    setOverride(restore.format);
    setRestore(null);
    go(4);
  }

  const shareUrl = () =>
    `${window.location.origin}${window.location.pathname}?${encodeDesign({ ...design, value: rendered.normalized ?? design.value })}`;

  async function shortcutDownload(task: () => void | Promise<void>) {
    setNotice("");
    try {
      await task();
    } catch (err) {
      console.error("Export error:", err);
      setNotice("That download failed. Try again, or use another browser.");
    }
  }

  useKeyboardShortcuts({
    toggleStyle: () =>
      setDesign((prev) => ({
        ...prev,
        shape: SHAPE_IDS[(SHAPE_IDS.indexOf(prev.shape) + 1) % SHAPE_IDS.length],
      })),
    toggleColor: () =>
      setDesign((prev) => ({
        ...prev,
        colorConfig: {
          ...prev.colorConfig,
          mode: "preset",
          presetId: PRESET_IDS[(PRESET_IDS.indexOf(prev.colorConfig.presetId) + 1) % PRESET_IDS.length],
        },
      })),
    downloadSVG: () => {
      const { composed, normalized } = rendered;
      if (composed && normalized) shortcutDownload(() => downloadSvg(composed, normalized));
    },
    downloadPNG: () => {
      const { composed, normalized } = rendered;
      if (composed && normalized) shortcutDownload(() => downloadPng(composed, design.xMm, dpi, normalized));
    },
    share: () => {
      shareApp(shareUrl());
    },
  });

  const number = detection.normalized ?? design.value;
  const percent = magnification(design.format, design.xMm);
  const answers: AnswerLine[] = [
    {
      step: 1,
      label: "Number",
      value: `${number} · ${FORMAT_LABEL[design.format]}${detection.normalized && design.format !== "code128" ? " · check digit correct" : ""}`,
    },
    {
      step: 2,
      label: "Scanned at",
      value: `${design.retailSafe ? "Shops or Amazon · Retail-safe" : "Phones or looks · Art"} · ${
        percent !== null ? `${percent}%` : `${design.xMm.toFixed(2)} mm bars`
      }`,
    },
    {
      step: 3,
      label: "Shape",
      value: design.shape === NO_SHAPE_ID ? "No shape" : shapeFor(design.shape).label,
    },
  ];
  // Steps already done sit above the open one as one-line answers; after an edit from the result,
  // the later ones fold below it.
  const above = answers.filter((answer) => answer.step < step);
  const below = answers.filter((answer) => answer.step > step && answer.step <= reached);

  const continueLabel = (fresh: string) => (reached === 4 ? "Back to my barcode" : fresh);
  const next = (from: Step) => go(reached === 4 ? 4 : ((from + 1) as Step));

  return (
    <div className={`mx-auto w-full font-body text-ink ${step === 4 ? "max-w-5xl" : "max-w-2xl"}`}>
      {notice && (
        <p role="alert" className="mb-4 rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          {notice}
        </p>
      )}

      {step === 1 && restore && !design.value && (
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-card p-4 text-base">
          <p className="min-w-0 flex-1">
            Continue where you left off: <span className="font-mono">{restore.value}</span> ({FORMAT_LABEL[restore.format]})
          </p>
          <button type="button" onClick={continueRestore} className={BTN_OUTLINE}>
            Continue
          </button>
          <button type="button" onClick={() => setRestore(null)} className={BTN_QUIET}>
            Start fresh
          </button>
        </div>
      )}

      <AnswerList lines={above} onChange={setStep} />

      {step === 1 && (
        <StepNumber
          value={design.value}
          detection={detection}
          override={override}
          headingRef={headingRef}
          inputRef={numberInput}
          onChange={changeNumber}
          onOverride={changeOverride}
          onSubmit={submitNumber}
          onOpenGs1={() => setPanel("gs1")}
        />
      )}

      {step === 2 && (
        <StepScan
          format={design.format}
          retailSafe={design.retailSafe}
          xMm={design.xMm}
          composed={rendered.composed}
          headingRef={headingRef}
          continueLabel={continueLabel("Show my barcode")}
          onRetailSafe={(retailSafe) => patch({ retailSafe })}
          onSize={(xMm) => patch({ xMm })}
          onContinue={() => next(2)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepShape
          shape={design.shape}
          number={number}
          composed={rendered.composed}
          plain={rendered.plain}
          renderedShape={rendered.shapeId}
          error={rendered.error}
          headingRef={headingRef}
          continueLabel={continueLabel("Check and download")}
          onShape={(shape) => patch({ shape })}
          onTemplate={applyPreset}
          onAI={makeAIStyle}
          onContinue={() => go(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepResult
          design={design}
          rendered={rendered}
          format={design.format}
          headingRef={headingRef}
          dpi={dpi}
          onDpi={setDpi}
          onPanel={(next) => patch({ panel: next })}
          getShareUrl={shareUrl}
          onBatch={() => setPanel("csv")}
          onSettings={() => setPanel("settings")}
          onRestart={restart}
        />
      )}

      <AnswerList lines={below} onChange={setStep} />

      <Modal open={panel === "gs1"} title="Do I need a GS1 number?" onClose={() => setPanel((p) => (p === "gs1" ? null : p))}>
        <GS1Explainer onUseSample={useSample} />
      </Modal>

      <Modal open={panel === "csv"} title="Many barcodes (CSV)" onClose={() => setPanel((p) => (p === "csv" ? null : p))}>
        <BatchDialog design={design} />
      </Modal>

      <Modal open={panel === "templates"} title="Templates and AI style" onClose={() => setPanel((p) => (p === "templates" ? null : p))}>
        <div className="space-y-5">
          <TemplateSelector onSelect={chooseTemplate} />
          <AIInput
            onGenerate={async (prompt, apiKey) => {
              chooseTemplate(await generateAIStyle(prompt, apiKey));
            }}
          />
        </div>
      </Modal>

      <Modal open={settingsOpen} title="All settings" wide onClose={closeSettings}>
        <AllSettings
          design={design}
          detection={detection}
          rendered={rendered}
          dpi={dpi}
          onDpi={setDpi}
          onNumber={changeNumber}
          onFormat={changeOverride}
          onChange={patch}
          onTemplate={applyPreset}
          onAI={makeAIStyle}
          getShareUrl={shareUrl}
          onBatch={() => setPanel("csv")}
        />
      </Modal>
    </div>
  );
}

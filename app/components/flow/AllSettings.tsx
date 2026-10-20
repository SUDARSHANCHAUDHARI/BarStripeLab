"use client";

import type { ReactNode } from "react";
import type { BarcodeFormat, PanelId, Template } from "@/types";
import type { Detection } from "@/lib/formatDetect";
import type { Design } from "@/lib/urlState";
import { NO_SHAPE_ID } from "@/lib/urlState";
import { magnification } from "@/lib/printSize";
import { PANELS } from "@/lib/panels";
import { SHAPES } from "@/lib/shapes";
import { templates } from "@/lib/templates";
import AIInput from "../AIInput";
import ColorPanel from "../ColorPanel";
import { FORMAT_IDS, FORMAT_LABEL } from "../formats";
import KeyboardShortcutsInfo from "../KeyboardShortcutsInfo";
import Segmented from "../Segmented";
import ExportBar from "./ExportBar";
import NumberField from "./NumberField";
import SizeControl from "./SizeControl";
import { artworkSizes, formatMmShort, svgDataUri } from "./sizes";
import type { Rendered } from "./useDesignRender";
import { FIELD, HINT, LABEL } from "./ui";

interface AllSettingsProps {
  design: Design;
  detection: Detection;
  rendered: Rendered;
  dpi: number;
  onDpi: (dpi: number) => void;
  onNumber: (value: string) => void;
  onFormat: (format: BarcodeFormat) => void;
  onChange: (changes: Partial<Design>) => void;
  onTemplate: (template: Template) => void;
  onAI: (prompt: string, apiKey: string) => Promise<void>;
  getShareUrl: () => string;
  onBatch: () => void;
}

const SCAN_MODES = [
  { value: "retail", label: "Retail-safe" },
  { value: "art", label: "Art" },
] as const;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-card p-5">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

// Shown inside a Modal. Every option on one sheet, in two columns; it edits the same design as the steps.
export default function AllSettings({
  design,
  detection,
  rendered,
  dpi,
  onDpi,
  onNumber,
  onFormat,
  onChange,
  onTemplate,
  onAI,
  getShareUrl,
  onBatch,
}: AllSettingsProps) {
  const { composed, score } = rendered;
  const percent = magnification(design.format, design.xMm);
  const shapeLabel = design.shape === NO_SHAPE_ID ? "No shape" : (SHAPES.find((s) => s.id === design.shape)?.label ?? "No shape");
  const summary = composed
    ? [
        `${FORMAT_LABEL[design.format]} · ${rendered.normalized}`,
        `${percent !== null ? `${percent}%` : `bars ${design.xMm.toFixed(2)} mm`} · ${formatMmShort(artworkSizes(composed, design.xMm).standard)} · bars thinner by ${design.bwrMm.toFixed(3)} mm`,
        `${design.retailSafe ? "Retail-safe" : "Art"}${score ? ` · scan check ${score.score}` : ""}`,
      ]
    : [detection.message];

  return (
    <div className="space-y-5">
      <p className="text-base text-ink-2">Changes show straight away. Your answers in the steps stay in sync.</p>

      <div className="flex flex-wrap items-end gap-5 rounded-2xl bg-card p-4" role="status" aria-live="polite">
        {composed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={svgDataUri(composed.svg)}
            alt={`Preview of ${FORMAT_LABEL[design.format]} barcode ${rendered.normalized}, shape: ${shapeLabel.toLowerCase()}`}
            style={{ aspectRatio: `${composed.viewBox.width} / ${composed.viewBox.height}` }}
            className="h-28 w-auto"
          />
        )}
        <p className="font-mono text-sm leading-relaxed text-ink-2">
          {summary.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Group title="Barcode">
          <div>
            <label htmlFor="settings-type" className={LABEL}>
              Barcode type
            </label>
            <select
              id="settings-type"
              value={design.format}
              onChange={(event) => onFormat(event.target.value as BarcodeFormat)}
              className={FIELD}
            >
              {FORMAT_IDS.map((id) => (
                <option key={id} value={id}>
                  {FORMAT_LABEL[id]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="settings-number" className={LABEL}>
              Number
            </label>
            <input
              id="settings-number"
              type="text"
              inputMode={design.format === "code128" ? "text" : "numeric"}
              autoComplete="off"
              spellCheck={false}
              maxLength={60}
              value={design.value}
              onChange={(event) => onNumber(event.target.value)}
              aria-invalid={Boolean(detection.fix)}
              aria-describedby="settings-number-status"
              className={`${FIELD} font-mono`}
            />
            <p
              id="settings-number-status"
              className={`${HINT} ${detection.normalized ? "text-pass" : detection.fix ? "text-warn" : ""}`}
            >
              {detection.message}{" "}
              {detection.fix && (
                <button type="button" onClick={() => onNumber(detection.fix ?? "")} className="font-bold underline underline-offset-4">
                  Use {detection.fix}
                </button>
              )}
            </p>
          </div>

          <Segmented
            label="Scan mode"
            options={[...SCAN_MODES]}
            value={design.retailSafe ? "retail" : "art"}
            onChange={(mode) => onChange({ retailSafe: mode === "retail" })}
          />

          <SizeControl format={design.format} xMm={design.xMm} onChange={(xMm) => onChange({ xMm })} variant="number" idPrefix="settings" />

          <NumberField
            id="settings-bwr"
            label="Bar width reduction (mm)"
            hint="Makes bars thinner to allow for ink spread. 0 to 0.10 mm. Ask your printer."
            value={design.bwrMm}
            min={0}
            max={0.1}
            step={0.005}
            onCommit={(bwrMm) => onChange({ bwrMm })}
          />

          <div>
            <label htmlFor="settings-panel" className={LABEL}>
              Product preview
            </label>
            <select
              id="settings-panel"
              value={design.panel}
              onChange={(event) => onChange({ panel: event.target.value as PanelId })}
              className={FIELD}
            >
              {PANELS.map((panel) => (
                <option key={panel.id} value={panel.id}>
                  {panel.label}
                </option>
              ))}
            </select>
          </div>
        </Group>

        <div className="space-y-5">
          <Group title="Look">
            <div>
              <label htmlFor="settings-shape" className={LABEL}>
                Shape
              </label>
              <select
                id="settings-shape"
                value={design.shape}
                onChange={(event) => onChange({ shape: event.target.value })}
                className={FIELD}
              >
                <option value={NO_SHAPE_ID}>No shape</option>
                {SHAPES.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-template" className={LABEL}>
                Template
              </label>
              <select
                id="settings-template"
                value=""
                onChange={(event) => {
                  const template = templates.find((t) => t.name === event.target.value);
                  if (template) onTemplate(template);
                }}
                className={FIELD}
              >
                <option value="">Choose a template</option>
                {templates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <ColorPanel colorConfig={design.colorConfig} setColorConfig={(colorConfig) => onChange({ colorConfig })} />
          </Group>

          <AIInput onGenerate={onAI} />
        </div>
      </div>

      <Group title="Download">
        <ExportBar
          compact
          composed={composed}
          score={score}
          decode={rendered.decode}
          format={design.format}
          number={rendered.normalized ?? design.value}
          xMm={design.xMm}
          bwrMm={design.bwrMm}
          retailSafe={design.retailSafe}
          shapeLabel={shapeLabel}
          dpi={dpi}
          onDpi={onDpi}
          getShareUrl={getShareUrl}
          onBatch={onBatch}
        />
      </Group>

      <Group title="Keyboard shortcuts">
        <KeyboardShortcutsInfo />
      </Group>
    </div>
  );
}

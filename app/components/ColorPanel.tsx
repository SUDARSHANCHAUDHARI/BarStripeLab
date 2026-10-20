"use client";

import { useId } from "react";
import { COLOR_PRESETS, failsRedLight, lowestBarContrast, safeColor } from "@/lib/colorEngine";
import type { ColorConfig } from "@/types";
import Segmented from "./Segmented";
import { BTN_OUTLINE, FIELD, FOCUS, HINT, LABEL } from "./flow/ui";

interface ColorPanelProps {
  colorConfig: ColorConfig;
  setColorConfig: (config: ColorConfig) => void;
}

const GRADIENT_KINDS = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
] as const;

// <input type="color"> only accepts #rrggbb.
const pickerValue = (color: string | undefined, fallback: string) =>
  /^#[0-9a-f]{6}$/i.test(color ?? "") ? (color as string) : fallback;

const PICKER = `h-11 w-14 cursor-pointer rounded-lg border-2 border-ink-2 bg-card p-0.5 ${FOCUS}`;

export default function ColorPanel({ colorConfig, setColorConfig }: ColorPanelProps) {
  const id = useId();
  const { mode } = colorConfig;
  const isValidColor = safeColor(colorConfig.solidColor, "") !== "";
  const [from, to] = [colorConfig.gradientStops[0], colorConfig.gradientStops[1]];

  function setStop(index: 0 | 1, color: string) {
    const stops = [
      from ?? { offset: 0, color: "#111111" },
      to ?? { offset: 1, color: "#888888" },
    ];
    stops[index] = { offset: index, color };
    setColorConfig({ ...colorConfig, gradientStops: stops });
  }

  return (
    <div className="space-y-4">
      <div>
        <span id={`${id}-label`} className={LABEL}>
          Bar colour
        </span>
        <div role="group" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2">
          {Object.entries(COLOR_PRESETS).map(([id, color]) => {
            const selected = mode === "preset" && colorConfig.presetId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                aria-label={id.replace(/_/g, " ")}
                title={id.replace(/_/g, " ")}
                onClick={() => setColorConfig({ ...colorConfig, mode: "preset", presetId: id })}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                  selected ? "border-ink ring-2 ring-inset ring-card" : "border-rule"
                } ${FOCUS}`}
                style={{ backgroundColor: color }}
              >
                {selected && (
                  <svg viewBox="0 0 18 18" className="h-4 w-4 text-card" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" focusable="false">
                    <path d="M3 9.5l4 4 8-9" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={mode === "custom"}
            onClick={() => setColorConfig({ ...colorConfig, mode: "custom" })}
            className={BTN_OUTLINE}
          >
            Custom colour
          </button>
          <button
            type="button"
            aria-pressed={mode === "gradient"}
            onClick={() => setColorConfig({ ...colorConfig, mode: "gradient" })}
            className={BTN_OUTLINE}
          >
            Gradient
          </button>
        </div>
      </div>

      {mode === "custom" && (
        <div className="flex items-end gap-2">
          <input
            type="color"
            aria-label="Pick a bar colour"
            value={pickerValue(colorConfig.solidColor, "#000000")}
            onChange={(e) => setColorConfig({ ...colorConfig, solidColor: e.target.value })}
            className={PICKER}
          />
          <div className="flex-1">
            <label htmlFor={`${id}-hex`} className={LABEL}>
              Hex code
            </label>
            <input
              id={`${id}-hex`}
              type="text"
              spellCheck={false}
              autoComplete="off"
              value={colorConfig.solidColor}
              onChange={(e) => setColorConfig({ ...colorConfig, solidColor: e.target.value })}
              aria-invalid={!isValidColor}
              aria-describedby={isValidColor ? undefined : `${id}-hex-error`}
              className={FIELD}
            />
          </div>
        </div>
      )}
      {mode === "custom" && !isValidColor && (
        <p id={`${id}-hex-error`} className="text-sm font-bold text-warn">
          Use a hex code like #1DB954.
        </p>
      )}

      {mode === "gradient" && (
        <div className="space-y-4">
          <Segmented
            label="Gradient type"
            options={[...GRADIENT_KINDS]}
            value={colorConfig.gradientKind}
            onChange={(gradientKind) => setColorConfig({ ...colorConfig, gradientKind })}
          />
          <div className="flex gap-6">
            {([0, 1] as const).map((index) => (
              <label key={index} className={LABEL}>
                {index === 0 ? "From" : "To"}
                <input
                  type="color"
                  value={pickerValue(
                    colorConfig.gradientStops[index]?.color,
                    index === 0 ? "#111111" : "#888888"
                  )}
                  onChange={(e) => setStop(index, e.target.value)}
                  className={`${PICKER} mt-1 block`}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {failsRedLight(colorConfig) && (
        <p role="status" className="rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          <strong>Red-laser scanners can&apos;t see these bars.</strong> Red, orange and pink look white under the red
          light checkout scanners use. Pick black, navy, dark green or another colour with little red.
        </p>
      )}

      {!failsRedLight(colorConfig) && lowestBarContrast(colorConfig) < 3 && (
        <p role="status" className="rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          <strong>Low contrast.</strong> Light bars may not scan. Pick a darker colour so the bars stand out clearly
          from the white background.
        </p>
      )}
      <p className={HINT}>Dark bars on white scan best.</p>
    </div>
  );
}

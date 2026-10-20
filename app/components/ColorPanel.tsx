"use client";

import { COLOR_PRESETS, lowestBarContrast, safeColor } from "@/lib/colorEngine";
import type { ColorConfig } from "@/types";
import Segmented from "./Segmented";

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

const PICKER = "h-10 w-14 cursor-pointer border-2 border-ink bg-white p-0";

export default function ColorPanel({ colorConfig, setColorConfig }: ColorPanelProps) {
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
        <span id="color-label" className="field-label">
          Color
        </span>
        <div role="group" aria-labelledby="color-label" className="mt-2 flex flex-wrap gap-2">
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
                className="flex h-10 w-10 items-center justify-center border-2 border-ink"
                style={{ backgroundColor: color }}
              >
                {selected && <span aria-hidden="true" className="block h-3 w-3 border-2 border-ink bg-white" />}
              </button>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={mode === "custom"}
            onClick={() => setColorConfig({ ...colorConfig, mode: "custom" })}
            className="btn"
          >
            Custom color
          </button>
          <button
            type="button"
            aria-pressed={mode === "gradient"}
            onClick={() => setColorConfig({ ...colorConfig, mode: "gradient" })}
            className="btn"
          >
            Gradient
          </button>
        </div>
      </div>

      {mode === "custom" && (
        <div className="flex items-end gap-2">
          <input
            type="color"
            aria-label="Pick a bar color"
            value={pickerValue(colorConfig.solidColor, "#000000")}
            onChange={(e) => setColorConfig({ ...colorConfig, solidColor: e.target.value })}
            className={PICKER}
          />
          <div className="flex-1">
            <label htmlFor="color-hex" className="field-label">
              Hex code
            </label>
            <input
              id="color-hex"
              type="text"
              spellCheck={false}
              autoComplete="off"
              value={colorConfig.solidColor}
              onChange={(e) => setColorConfig({ ...colorConfig, solidColor: e.target.value })}
              aria-invalid={!isValidColor}
              title={isValidColor ? undefined : "Use a hex color like #1DB954"}
              className={`field mt-1 py-2 ${isValidColor ? "" : "outline outline-2 outline-danger"}`}
            />
          </div>
        </div>
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
              <label key={index} className="field-label">
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

      {lowestBarContrast(colorConfig) < 3 && (
        <p role="status" className="notice">
          <strong className="font-black uppercase">Low contrast.</strong> Light bars may not scan.
          Pick a darker color so the bars stand out clearly from the white background.
        </p>
      )}
    </div>
  );
}

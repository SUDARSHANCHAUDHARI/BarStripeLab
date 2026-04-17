"use client";

import { COLOR_PRESETS } from "@/lib/colorEngine";
import type { ColorConfig } from "@/types";

interface ColorPanelProps {
  colorConfig: ColorConfig;
  setColorConfig: (config: ColorConfig) => void;
}

export default function ColorPanel({ colorConfig, setColorConfig }: ColorPanelProps) {
  return (
    <div className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4">
      <label className="block text-sm font-medium text-gray-700">Color Mode</label>
      <select
        className="w-full rounded border border-gray-300 p-2 text-sm"
        value={colorConfig.mode}
        onChange={(e) =>
          setColorConfig({
            ...colorConfig,
            mode: e.target.value as ColorConfig["mode"],
          })
        }
      >
        <option value="preset">Preset Palette</option>
        <option value="custom">Custom Color</option>
        <option value="gradient">Gradient</option>
      </select>

      {colorConfig.mode === "preset" && (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(COLOR_PRESETS).map(([id, color]) => (
            <button
              key={id}
              type="button"
              onClick={() => setColorConfig({ ...colorConfig, presetId: id })}
              className={`h-9 rounded border ${
                colorConfig.presetId === id ? "border-black" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={id}
            />
          ))}
        </div>
      )}

      {colorConfig.mode === "custom" && (
        <div className="flex gap-2">
          <input
            type="color"
            value={colorConfig.solidColor}
            onChange={(e) =>
              setColorConfig({ ...colorConfig, solidColor: e.target.value })
            }
            className="h-10 w-16 rounded border border-gray-300"
          />
          <input
            type="text"
            value={colorConfig.solidColor}
            onChange={(e) =>
              setColorConfig({ ...colorConfig, solidColor: e.target.value })
            }
            className="flex-1 rounded border border-gray-300 p-2 text-sm"
          />
        </div>
      )}

      {colorConfig.mode === "gradient" && (
        <div className="space-y-2">
          <select
            className="w-full rounded border border-gray-300 p-2 text-sm"
            value={colorConfig.gradientKind}
            onChange={(e) =>
              setColorConfig({
                ...colorConfig,
                gradientKind: e.target.value as ColorConfig["gradientKind"],
              })
            }
          >
            <option value="linear">Linear Gradient</option>
            <option value="radial">Radial Gradient</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="color"
              value={colorConfig.gradientStops[0]?.color || "#111111"}
              onChange={(e) =>
                setColorConfig({
                  ...colorConfig,
                  gradientStops: [
                    { offset: 0, color: e.target.value },
                    colorConfig.gradientStops[1] || { offset: 1, color: "#888888" },
                  ],
                })
              }
              className="h-10 rounded border border-gray-300"
            />
            <input
              type="color"
              value={colorConfig.gradientStops[1]?.color || "#888888"}
              onChange={(e) =>
                setColorConfig({
                  ...colorConfig,
                  gradientStops: [
                    colorConfig.gradientStops[0] || { offset: 0, color: "#111111" },
                    { offset: 1, color: e.target.value },
                  ],
                })
              }
              className="h-10 rounded border border-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}

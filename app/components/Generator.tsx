"use client";

import { useEffect, useState } from "react";
import type { Design } from "@/lib/urlState";
import type { StylePreset } from "@/types";
import { generateBarcodeSVG } from "@/lib/barcode";
import { generateAIStyle } from "@/lib/aiStyleGenerator";
import { SHAPE_IDS, getShape, isShapeId } from "@/lib/shapes";
import { COLOR_PRESETS, safeColor } from "@/lib/colorEngine";
import { composeBarcodeSvg } from "@/lib/svgComposer";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { DEFAULT_COLOR_CONFIG, decodeDesign, encodeDesign } from "@/lib/urlState";

import BarcodeCanvas from "./BarcodeCanvas";
import Controls from "./Controls";
import DownloadButton, { copySVG, downloadPNG, downloadSVG } from "./DownloadButton";
import ShapeGrid from "./ShapeGrid";
import TemplateSelector from "./TemplateSelector";
import AIInput from "./AIInput";
import ColorPanel from "./ColorPanel";
import ShareButton, { shareApp } from "./ShareButton";
import KeyboardShortcutsInfo from "./KeyboardShortcutsInfo";
import { FORMAT_INFO } from "./formats";
import Segmented from "./Segmented";

const SCAN_MODE_OPTIONS: { value: "art" | "retail"; label: string }[] = [
  { value: "art", label: "Art" },
  { value: "retail", label: "Retail-safe" },
];

const PRESET_IDS = Object.keys(COLOR_PRESETS);
const DEFAULT_SHAPE = isShapeId("coffee") ? "coffee" : SHAPE_IDS[0];

interface GeneratorProps {
  // Shape landing pages preselect their own shape.
  initialShape?: string;
}

export default function Generator({ initialShape }: GeneratorProps) {
  const [design, setDesign] = useState<Design>({
    format: "ean13",
    value: "5901234123457",
    shape: initialShape && isShapeId(initialShape) ? initialShape : DEFAULT_SHAPE,
    colorConfig: DEFAULT_COLOR_CONFIG,
    retailSafe: false,
    xMm: 0.33,
    bwrMm: 0,
    panel: "coffee-bag",
  });
  // The query string is read after mount so the static HTML and the first client render match.
  const [urlRead, setUrlRead] = useState(false);
  const [composedSvg, setComposedSvg] = useState("");
  // True until the first debounced render finishes, so the preview never claims the input is invalid early.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");

  const { format, value, shape, colorConfig, retailSafe } = design;
  const patch = (changes: Partial<Design>) => setDesign((prev) => ({ ...prev, ...changes }));

  useEffect(() => {
    setDesign((prev) => decodeDesign(window.location.search, prev));
    setUrlRead(true);
  }, []);

  // Keep the address bar equal to the current design so the link can be shared as is.
  useEffect(() => {
    if (!urlRead) return;
    const timer = setTimeout(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?${encodeDesign(design)}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [urlRead, design]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setError("");

      const normalized = FORMAT_INFO[format].normalize(value);

      if (!normalized) {
        setComposedSvg("");
        setError(FORMAT_INFO[format].invalid);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const svgCode = await generateBarcodeSVG(normalized, format);
        const finalSvg = composeBarcodeSvg({
          rawBarcodeSvg: svgCode,
          shape: getShape(shape),
          colorConfig,
          value: normalized,
          format,
          retailSafe,
        });

        if (!cancelled) setComposedSvg(finalSvg);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setComposedSvg("");
          setError("Failed to generate barcode. Try another value.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, format, shape, colorConfig, retailSafe]);

  function applyPreset(preset: StylePreset): void {
    setDesign((prev) => ({
      ...prev,
      shape: isShapeId(preset.shape) ? preset.shape : prev.shape,
      colorConfig: { ...prev.colorConfig, mode: "custom", solidColor: safeColor(preset.color) },
    }));
  }

  async function handleAIGenerate(prompt: string, apiKey: string): Promise<void> {
    applyPreset(await generateAIStyle(prompt, apiKey));
  }

  async function runExport(task: () => void | Promise<void>): Promise<void> {
    setExportError("");
    try {
      await task();
    } catch (err) {
      console.error("Export error:", err);
      setExportError("Export failed. Try again, or use another browser.");
    }
  }

  async function copyDesignSVG(): Promise<boolean> {
    setExportError("");
    try {
      await copySVG(composedSvg);
      return true;
    } catch (err) {
      console.error("Copy error:", err);
      setExportError("Could not copy to the clipboard. Use Download SVG instead.");
      return false;
    }
  }

  const shareUrl = () => `${window.location.origin}${window.location.pathname}?${encodeDesign(design)}`;

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
          presetId:
            PRESET_IDS[(PRESET_IDS.indexOf(prev.colorConfig.presetId) + 1) % PRESET_IDS.length],
        },
      })),
    downloadSVG: () => {
      runExport(() => downloadSVG(composedSvg));
    },
    downloadPNG: () => {
      runExport(() => downloadPNG(composedSvg));
    },
    share: () => {
      shareApp(shareUrl());
    },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-12">
      <section
        aria-label="Preview"
        className="space-y-3 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:max-w-[500px] lg:self-start"
      >
        <BarcodeCanvas
          composedSvg={composedSvg}
          loading={loading}
          alt={`Barcode artwork in the shape of ${getShape(shape).label.toLowerCase()}`}
        />
        <p className="text-xs text-muted">
          The protected band along the bottom stays full height so the code still scans. Never crop it.
        </p>
      </section>

      <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
        <Controls
          value={value}
          setValue={(next) => patch({ value: next })}
          format={format}
          setFormat={(next) => patch({ format: next })}
          error={error}
        />

        <ShapeGrid shape={shape} setShape={(next) => patch({ shape: next })} />

        <div>
          <Segmented
            label="Scan mode"
            options={SCAN_MODE_OPTIONS}
            value={retailSafe ? "retail" : "art"}
            onChange={(mode) => patch({ retailSafe: mode === "retail" })}
          />
          <p className="mt-2 text-xs text-muted">
            {retailSafe
              ? "Retail-safe: every bar keeps the GS1 minimum height for checkout scanners; the shape sits on top."
              : "Art: more shape, shorter bars. Phone apps read it; strict checkout scanners may reject it."}
          </p>
        </div>

        <ColorPanel
          colorConfig={colorConfig}
          setColorConfig={(next) => patch({ colorConfig: next })}
        />

        <TemplateSelector onSelect={applyPreset} />

        <div className="space-y-2">
          <DownloadButton
            disabled={!composedSvg}
            onSVG={() => {
              runExport(() => downloadSVG(composedSvg));
            }}
            onPNG={() => runExport(() => downloadPNG(composedSvg))}
            onCopy={copyDesignSVG}
          />
          {exportError && (
            <p role="alert" className="text-xs font-bold text-danger">
              {exportError}
            </p>
          )}
        </div>

        <AIInput onGenerate={handleAIGenerate} />

        <ShareButton getUrl={shareUrl} />
        <KeyboardShortcutsInfo />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type {
  BarcodeFormat,
  ColorConfig,
  Style,
  Template,
  SilhouetteDefinition,
} from "@/types";
import { generateBarcodeSVG } from "@/lib/barcode";
import { generateAIStyle } from "@/lib/aiStyleGenerator";
import {
  normalizeEAN13,
  normalizeEAN8,
  normalizeCODE128,
} from "@/lib/ean13checksum";
import { styles } from "@/lib/styles";
import { composeBarcodeSvg } from "@/lib/svgComposer";

import BarcodeCanvas from "./components/BarcodeCanvas";
import Controls from "./components/Controls";
import DownloadButton from "./components/DownloadButton";
import TemplateSelector from "./components/TemplateSelector";
import AIInput from "./components/AIInput";
import ColorPanel from "./components/ColorPanel";

export default function Page() {
  const [value, setValue] = useState("5901234123457");
  const [format, setFormat] = useState<BarcodeFormat>("ean13");
  const [composedSvg, setComposedSvg] = useState("");
  const [style, setStyle] = useState("palm");
  const [customStyle, setCustomStyle] = useState<Style | null>(null);
  const [colorConfig, setColorConfig] = useState<ColorConfig>({
    mode: "preset",
    solidColor: "#000000",
    presetId: "classic_black",
    gradientKind: "linear",
    gradientStops: [
      { offset: 0, color: "#111111" },
      { offset: 1, color: "#888888" },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStyle: string | Style | SilhouetteDefinition =
    customStyle || styles[style] || styles.wave;

  function normalizeBarcode(
    barcodeValue: string,
    barcodeFormat: BarcodeFormat
  ): string | null {
    switch (barcodeFormat) {
      case "ean13":
        return normalizeEAN13(barcodeValue);
      case "ean8":
        return normalizeEAN8(barcodeValue);
      case "code128":
        return normalizeCODE128(barcodeValue);
      default:
        return null;
    }
  }

  function getValidationError(barcodeFormat: BarcodeFormat): string {
    switch (barcodeFormat) {
      case "ean13":
        return "Enter a valid 12 or 13 digit barcode. We auto-generate checksum for 12 digits.";
      case "ean8":
        return "Enter a valid 7 or 8 digit barcode. We auto-generate checksum for 7 digits.";
      case "code128":
        return "Enter up to 48 letters, numbers, spaces or symbols (no accents or emoji).";
      default:
        return "Invalid barcode";
    }
  }

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setError("");

      const normalized = normalizeBarcode(value, format);

      if (!normalized) {
        setComposedSvg("");
        setError(getValidationError(format));
        return;
      }

      try {
        setLoading(true);

        const svgCode = await generateBarcodeSVG(normalized, format);
        const seed = `${format}|${normalized}|${style}|${JSON.stringify(colorConfig)}`;
        const finalSvg = composeBarcodeSvg(
          svgCode,
          activeStyle,
          colorConfig,
          seed,
          normalized,
          format
        );

        setComposedSvg(finalSvg);
      } catch (err) {
        console.error(err);
        setComposedSvg("");
        setError("Failed to generate barcode. Try another value.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, format, style, activeStyle, colorConfig]);

  function handleTemplateSelect(template: Template): void {
    setCustomStyle(template.style);
    setColorConfig((prev) => ({
      ...prev,
      mode: "custom",
      solidColor: template.color,
    }));
  }

  async function handleAIGenerate(prompt: string): Promise<void> {
    setAiLoading(true);

    try {
      const newStyle = await generateAIStyle(prompt);
      setCustomStyle(newStyle);
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI style");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            BarStripeLab
          </h1>
          <p className="text-lg text-gray-600">
            Turn barcodes into brand assets
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <Controls
            value={value}
            setValue={setValue}
            format={format}
            setFormat={setFormat}
            style={style}
            setStyle={(nextStyle: string) => {
              setStyle(nextStyle);
              setCustomStyle(null);
            }}
            stylesList={Object.keys(styles)}
          />

          <ColorPanel
            colorConfig={colorConfig}
            setColorConfig={setColorConfig}
          />

          <TemplateSelector onSelect={handleTemplateSelect} />

          <AIInput
            onGenerate={handleAIGenerate}
            isLoading={aiLoading}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">Generating barcode...</p>
            </div>
          )}

          {composedSvg && !loading && (
            <>
              <BarcodeCanvas ref={canvasRef} composedSvg={composedSvg} />

              <DownloadButton
                svgRef={canvasRef}
                composedSvg={composedSvg}
              />

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✅ Scan-safe mode is on. The top region is masked artwork and the bottom barcode zone stays standard for reliability.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Created with Next.js & bwip-js</p>
        </div>
      </div>
    </main>
  );
}

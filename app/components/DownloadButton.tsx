"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

interface DownloadButtonProps {
  svgRef: React.RefObject<HTMLDivElement>;
  composedSvg: string;
}

export async function downloadPNG(node: HTMLElement | null): Promise<void> {
  if (!node) return;

  try {
    const dataUrl = await toPng(node, {
      backgroundColor: "white",
      pixelRatio: 4,
      cacheBust: true,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "barstripelab.png";
    a.click();
  } catch (err) {
    console.error("PNG export error:", err);
    alert("Failed to export PNG");
  }
}

export function downloadSVG(composedSvg: string): void {
  if (!composedSvg) return;

  try {
    const blob = new Blob([composedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "barstripelab.svg";
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("SVG export error:", err);
    alert("Failed to export SVG");
  }
}

export default function DownloadButton({
  svgRef,
  composedSvg,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handlePNG() {
    setDownloading(true);
    try {
      await downloadPNG(svgRef.current);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-2 mt-6">
      <button
        onClick={handlePNG}
        disabled={downloading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition"
      >
        {downloading ? "Exporting PNG..." : "Download PNG"}
      </button>

      <button
        onClick={() => downloadSVG(composedSvg)}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition"
      >
        Download SVG
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { svgToPngBlob } from "@/lib/exportImage";

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSVG(composedSvg: string): void {
  if (!composedSvg) return;
  saveBlob(new Blob([composedSvg], { type: "image/svg+xml" }), "barstripelab.svg");
}

export async function downloadPNG(composedSvg: string): Promise<void> {
  if (!composedSvg) return;
  saveBlob(await svgToPngBlob(composedSvg), "barstripelab.png");
}

export async function copySVG(composedSvg: string): Promise<void> {
  if (!composedSvg) return;
  await navigator.clipboard.writeText(composedSvg);
}

interface DownloadButtonProps {
  disabled: boolean;
  onSVG: () => void;
  onPNG: () => Promise<void>;
  onCopy: () => Promise<boolean>;
}

export default function DownloadButton({ disabled, onSVG, onPNG, onCopy }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handlePNG() {
    setBusy(true);
    try {
      await onPNG();
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (await onCopy()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={onSVG} disabled={disabled} className="btn py-3">
        Download SVG
      </button>
      <button type="button" onClick={handlePNG} disabled={disabled || busy} className="btn py-3">
        {busy ? "Exporting..." : "Download PNG"}
      </button>
      <button type="button" onClick={handleCopy} disabled={disabled} className="btn col-span-2 py-3">
        {copied ? "Copied" : "Copy SVG"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "SVG copied to clipboard" : ""}
      </span>
    </div>
  );
}

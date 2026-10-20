"use client";

import { useMemo } from "react";

interface BarcodeCanvasProps {
  composedSvg: string;
  loading: boolean;
  alt: string;
}

const FALLBACK_ASPECT = "190 / 58";

export default function BarcodeCanvas({ composedSvg, loading, alt }: BarcodeCanvasProps) {
  const aspect = useMemo(() => {
    const [, , width, height] = (composedSvg.match(/viewBox="([^"]+)"/)?.[1] ?? "")
      .trim()
      .split(/\s+/)
      .map(Number);
    return width && height ? `${width} / ${height}` : FALLBACK_ASPECT;
  }, [composedSvg]);

  const svgDataUri = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composedSvg)}`,
    [composedSvg]
  );

  return (
    <div className="border-2 border-ink bg-white p-4 sm:p-6" aria-busy={loading}>
      {composedSvg ? (
        // Data-URI SVG in a static export: next/image has nothing to optimize.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={svgDataUri}
          alt={alt}
          className={`block w-full bg-white ${loading ? "opacity-50" : ""}`}
          style={{ aspectRatio: aspect }}
        />
      ) : (
        <div
          className="flex w-full items-center justify-center bg-field p-4 text-center text-xs font-black uppercase text-muted"
          style={{ aspectRatio: FALLBACK_ASPECT }}
        >
          {loading ? "Generating barcode..." : "Enter a valid barcode to see your design"}
        </div>
      )}
    </div>
  );
}

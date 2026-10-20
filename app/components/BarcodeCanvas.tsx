"use client";

import React, { forwardRef, useMemo } from "react";

interface BarcodeCanvasProps {
  composedSvg: string;
}

const BarcodeCanvas = forwardRef<HTMLDivElement, BarcodeCanvasProps>(
  ({ composedSvg }, ref) => {
    // Extract viewBox from barcode SVG to match dimensions
    const barcodeDimensions = useMemo(() => {
      try {
        const match = composedSvg.match(/viewBox="([^"]+)"/);
        if (match) {
          const [, , width, height] = match[1].split(" ").map(Number);
          return { width, height, viewBox: match[1] };
        }
        return { width: 190, height: 58, viewBox: "0 0 190 58" };
      } catch {
        return { width: 190, height: 58, viewBox: "0 0 190 58" };
      }
    }, [composedSvg]);

    // Calculate display height based on aspect ratio
    const displayWidth = 500; // max-width in px
    const displayHeight = useMemo(() => {
      const aspectRatio = barcodeDimensions.height / barcodeDimensions.width;
      return displayWidth * aspectRatio;
    }, [barcodeDimensions]);
    const svgDataUri = useMemo(
      () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composedSvg)}`,
      [composedSvg]
    );

    return (
      <div
        ref={ref}
        className="relative mt-8 mb-8 flex flex-col items-center"
      >
        {/* Barcode container */}
        <div 
          style={{
            position: "relative",
            width: "100%",
            maxWidth: `${displayWidth}px`,
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Data-URI SVG in a static export: next/image has nothing to optimize. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgDataUri}
            alt="Generated artistic barcode"
            style={{
              display: "block",
              width: "100%",
              height: `${displayHeight}px`,
              backgroundColor: "white",
              border: "1px solid #f3f4f6",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
    );
  }
);

BarcodeCanvas.displayName = "BarcodeCanvas";

export default BarcodeCanvas;

import React from "react";
import { Shape } from "@/types";

export function renderShape(
  shape: Shape,
  xNormalized: number, // 0-100% range
  widthNormalized: number, // 0-100% range
  color: string,
  key: React.Key,
  barcodeHeight: number = 58,
  barcodeWidth: number = 190
): React.ReactElement | null {
  if (!shape) return null;

  // Convert from normalized 0-100 to viewBox coordinates
  const x = (xNormalized / 100) * barcodeWidth;
  const width = (widthNormalized / 100) * barcodeWidth;
  const SAFE_ZONE_RATIO = 0.25; // Bottom 25% stays as plain bar
  
  const safeZoneHeight = barcodeHeight * SAFE_ZONE_RATIO;
  const artZoneHeight = barcodeHeight - safeZoneHeight;

  return (
    <g key={key}>
      {/* Bottom safe zone - plain bar for scanner reliability */}
      <rect
        x={x}
        y={barcodeHeight - safeZoneHeight}
        width={width}
        height={safeZoneHeight}
        fill={color}
      />
      
      {/* Top artistic zone - silhouette shape */}
      {renderSilhouette(shape.type, x, width, artZoneHeight, color)}
    </g>
  );
}

function renderSilhouette(
  type: string,
  x: number,
  width: number,
  height: number,
  color: string
): React.ReactElement {
  const centerX = x + width / 2;
  
  switch (type) {
    case "mountain":
      // Triangle mountain shape
      return (
        <polygon
          points={`${x},${height} ${centerX},0 ${x + width},${height}`}
          fill={color}
        />
      );
      
    case "palm":
      // Palm tree - triangle with fronds
      return (
        <g>
          <polygon
            points={`${x},${height} ${centerX},0 ${x + width},${height}`}
            fill={color}
          />
          {/* Fronds */}
          <line x1={centerX} y1={height * 0.3} x2={x} y2={0} stroke={color} strokeWidth="0.5" />
          <line x1={centerX} y1={height * 0.3} x2={x + width} y2={0} stroke={color} strokeWidth="0.5" />
        </g>
      );
      
    case "tree":
      // Tree - triangle
      return (
        <polygon
          points={`${x},${height} ${centerX},0 ${x + width},${height}`}
          fill={color}
        />
      );
      
    case "cloud":
      // Cloud - wavy top
      return (
        <path
          d={`M${x} ${height} Q${x},${height * 0.5} ${centerX},${height * 0.2} T${x + width} ${height}`}
          fill={color}
        />
      );
      
    case "wave":
      // Wave - sine pattern
      return (
        <path
          d={`M${x} ${height} Q${x + width * 0.25},${height * 0.2} ${x + width * 0.5},${height} T${x + width},${height}`}
          fill={color}
        />
      );
      
    case "rect":
    default:
      // Default rectangle
      return (
        <rect
          x={x}
          y={0}
          width={width}
          height={height}
          fill={color}
        />
      );
  }
}

"use client";

import { useId, type ReactNode } from "react";
import type { ComposedBarcode, PanelId } from "@/types";
import { PANELS, placeOnPanel } from "@/lib/panels";
import { artworkSizes, svgDataUri } from "./sizes";

interface ProductPanelProps {
  panelId: PanelId;
  onPanel: (id: PanelId) => void;
  composed: ComposedBarcode | null;
  xMm: number;
  // What the barcode is, for the picture's text alternative.
  description: string;
}

const ICONS: Record<PanelId, ReactNode> = {
  "coffee-bag": (
    <>
      <path d="M9 5h18l-1 4 2 22H8l2-22z" />
      <path d="M10 9h16" />
    </>
  ),
  can: (
    <>
      <rect x="10" y="4" width="16" height="28" rx="3" />
      <path d="M10 9h16M10 27h16" />
    </>
  ),
  box: (
    <>
      <path d="M6 11l12-6 12 6v16l-12 6-12-6z" />
      <path d="M6 11l12 6 12-6M18 17v16" />
    </>
  ),
  tag: (
    <>
      <path d="M12 4h12l4 5v23H8V9z" />
      <circle cx="18" cy="10" r="2" />
    </>
  ),
};

// Margins around the panel inside the picture, in mm: the left and top hold the rulers.
const MARGIN = { left: 14, top: 16, right: 8, bottom: 8 };
// Pixels per mm: never bigger than this, and never taller than MAX_HEIGHT_PX.
const MAX_PX_PER_MM = 3.6;
const MAX_HEIGHT_PX = 520;
const DIM_GAP = 2.4;

// Paints the panel art's data-role elements from the page's colour tokens.
const ROLE_COLOURS =
  "[&_[data-role=kraft]]:fill-kraft [&_[data-role=proof]]:fill-proof [&_[data-role=cut]]:stroke-cut [&_[data-role=fold]]:stroke-fold [&_[data-role=ink]]:fill-ink [&_[data-role=ink-2]]:fill-ink-2 [&_[data-role=mat]]:fill-mat";

function ticks(from: number, to: number): number[] {
  const out: number[] = [];
  for (let value = Math.ceil(from / 5) * 5; value <= to; value += 5) out.push(value);
  return out;
}

export default function ProductPanel({ panelId, onPanel, composed, xMm, description }: ProductPanelProps) {
  const gridId = useId().replace(/:/g, "");
  const panel = PANELS.find((candidate) => candidate.id === panelId) ?? PANELS[0];

  const art = composed ? artworkSizes(composed, xMm).withShape : null;
  const place = art ? placeOnPanel(panel, art) : null;
  const box = art && place ? { x: place.xMm, y: place.yMm, w: art.widthMm, h: art.heightMm } : null;

  // The picture grows to hold artwork that is larger than the panel, so nothing is cropped.
  const minX = Math.min(0, box?.x ?? 0);
  const maxX = Math.max(panel.widthMm, box ? box.x + box.w : 0);
  const minY = Math.min(0, box ? box.y - DIM_GAP - 4 : 0);
  const maxY = Math.max(panel.heightMm, box ? box.y + box.h : 0);
  const view = {
    x: minX - MARGIN.left,
    y: minY - MARGIN.top,
    width: maxX - minX + MARGIN.left + MARGIN.right,
    height: maxY - minY + MARGIN.top + MARGIN.bottom,
  };
  const pxPerMm = Math.min(MAX_PX_PER_MM, MAX_HEIGHT_PX / view.height);
  const labelEvery = view.width > 220 ? 20 : 10;
  const dimLabel = box ? `${box.w.toFixed(2)} mm` : "";

  return (
    <div>
      <fieldset>
        <legend className="mb-2 text-lg font-bold text-ink">What&apos;s it going on?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PANELS.map((candidate) => (
            <label
              key={candidate.id}
              className="relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-rule bg-card p-2 text-base font-bold text-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-card has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
            >
              <input
                type="radio"
                name="product-panel"
                checked={candidate.id === panel.id}
                onChange={() => onPanel(candidate.id)}
                className="sr-only"
              />
              <svg viewBox="0 0 36 36" className="h-9 w-9 fill-none stroke-current stroke-[1.5]" aria-hidden="true" focusable="false">
                {ICONS[candidate.id]}
              </svg>
              {candidate.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="on-mat mt-4 overflow-hidden rounded-2xl bg-mat p-2 sm:p-3">
        <svg
          role="img"
          aria-label={`${panel.label} drawn to scale with ${description} placed on it`}
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          style={{ width: `min(100%, ${Math.round(view.width * pxPerMm)}px)` }}
          className={`mx-auto block h-auto font-display ${ROLE_COLOURS}`}
        >
          <defs>
            <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0V10" fill="none" className="stroke-mat-grid" strokeWidth=".25" />
            </pattern>
          </defs>
          <rect x={view.x} y={view.y} width={view.width} height={view.height} className="fill-mat" />
          <rect x={view.x} y={view.y} width={view.width} height={view.height} fill={`url(#${gridId})`} />

          <g className="font-mono" fontSize="3.2">
            {ticks(minX, maxX).map((mm) => (
              <g key={`x${mm}`}>
                <path d={`M${mm} ${minY - 3}v${mm % 10 === 0 ? -3.4 : -1.8}`} className="stroke-proof" strokeWidth=".3" opacity=".8" />
                {mm % labelEvery === 0 && (
                  <text x={mm + 0.8} y={minY - 7} className="fill-proof">
                    {mm}
                  </text>
                )}
              </g>
            ))}
            {ticks(minY, maxY).map((mm) => (
              <g key={`y${mm}`}>
                <path d={`M${minX - 3} ${mm}h${mm % 10 === 0 ? -3.4 : -1.8}`} className="stroke-proof" strokeWidth=".3" opacity=".8" />
                {mm % labelEvery === 0 && (
                  <text x={minX - 7} y={mm + 1.1} textAnchor="end" className="fill-proof">
                    {mm}
                  </text>
                )}
              </g>
            ))}
          </g>

          <g dangerouslySetInnerHTML={{ __html: panel.art }} />

          {box && composed && (
            <g>
              {/* Data-URI SVG drawn at its printed size, so the proportions to the panel are true. */}
              <image href={svgDataUri(composed.svg)} x={box.x} y={box.y} width={box.w} height={box.h} />
              <path
                d={`M${box.x} ${box.y - DIM_GAP - 1.2}v2.4M${box.x + box.w} ${box.y - DIM_GAP - 1.2}v2.4M${box.x} ${box.y - DIM_GAP}H${box.x + box.w}`}
                fill="none"
                className="stroke-cut"
                strokeWidth=".35"
              />
              <rect
                x={box.x + box.w / 2 - (dimLabel.length * 1.05 + 1.6)}
                y={box.y - DIM_GAP - 2.4}
                width={dimLabel.length * 2.1 + 3.2}
                height="4.8"
                rx=".6"
                className="fill-cut"
              />
              <text x={box.x + box.w / 2} y={box.y - DIM_GAP + 1.1} textAnchor="middle" fontSize="3.2" className="fill-proof font-mono">
                {dimLabel}
              </text>
            </g>
          )}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-6 border-t-2 border-cut" />
          Cut line: the edge of your pack
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-fold" />
          Fold line: keep the code off it
        </li>
      </ul>
      <p className="mt-1 text-sm text-ink-2">
        Drawn to scale. Your screen shows it bigger or smaller than the printed size.
      </p>
      {place && !place.fits && (
        <p role="status" className="mt-3 rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          <strong>Too big for this pack.</strong> At this size the barcode is larger than the space kept for it on the{" "}
          {panel.label.toLowerCase()}. Pick a smaller size or another product.
        </p>
      )}
    </div>
  );
}

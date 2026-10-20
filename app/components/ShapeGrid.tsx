"use client";

import { useState } from "react";
import type { ShapeCategory } from "@/types";
import { SHAPES } from "@/lib/shapes";
import { NO_SHAPE_ID } from "@/lib/urlState";
import ShapeThumb from "./ShapeThumb";
import { FOCUS } from "./flow/ui";

interface ShapeGridProps {
  shape: string;
  setShape: (shape: string) => void;
}

const CATEGORIES = Array.from(new Set(SHAPES.map((s) => s.category)));

const TILE = `flex min-h-[96px] w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-rule bg-card p-2 text-center text-sm leading-tight text-ink hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-card sm:w-auto ${FOCUS}`;
const CHIP = `min-h-[44px] rounded-full border-[1.5px] border-rule bg-card px-4 text-base capitalize text-ink-2 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-card ${FOCUS}`;

// Four bars of different widths: the plain barcode.
function NoShapeGlyph() {
  return (
    <svg viewBox="0 0 28 36" className="h-10 w-8" fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="1" width="2" height="36" />
      <rect x="5" width="4" height="32" />
      <rect x="11" width="2" height="32" />
      <rect x="15" width="3" height="36" />
      <rect x="20" width="2" height="32" />
      <rect x="24" width="3" height="36" />
    </svg>
  );
}

export default function ShapeGrid({ shape, setShape }: ShapeGridProps) {
  const [category, setCategory] = useState<ShapeCategory | "all">("all");
  const visible = category === "all" ? SHAPES : SHAPES.filter((s) => s.category === category);

  return (
    <div>
      <div role="group" aria-label="Filter shapes by category" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {(["all", ...CATEGORIES] as const).map((id) => (
          <button key={id} type="button" aria-pressed={category === id} onClick={() => setCategory(id)} className={`${CHIP} shrink-0`}>
            {id === "all" ? `All ${SHAPES.length}` : id}
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="Shape"
        className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:max-h-[26rem] sm:grid-cols-4 sm:overflow-y-auto sm:overflow-x-hidden sm:p-1 md:grid-cols-5"
      >
        <button type="button" aria-pressed={shape === NO_SHAPE_ID} onClick={() => setShape(NO_SHAPE_ID)} className={TILE}>
          <NoShapeGlyph />
          <span>No shape</span>
        </button>
        {visible.map((s) => (
          <button key={s.id} type="button" aria-pressed={shape === s.id} onClick={() => setShape(s.id)} className={TILE}>
            <ShapeThumb shape={s} className="h-10 w-10" />
            <span className="break-words">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

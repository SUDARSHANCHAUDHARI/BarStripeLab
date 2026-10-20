"use client";

import { useState } from "react";
import type { ShapeCategory } from "@/types";
import { SHAPES } from "@/lib/shapes";
import ShapeThumb from "./ShapeThumb";

interface ShapeGridProps {
  shape: string;
  setShape: (shape: string) => void;
}

const CATEGORIES = Array.from(new Set(SHAPES.map((s) => s.category)));

export default function ShapeGrid({ shape, setShape }: ShapeGridProps) {
  const [category, setCategory] = useState<ShapeCategory | "all">("all");
  const visible = category === "all" ? SHAPES : SHAPES.filter((s) => s.category === category);

  return (
    <div>
      <span id="shape-grid-label" className="field-label">
        Barcode style
      </span>

      {CATEGORIES.length > 1 && (
        <div role="group" aria-label="Filter styles by category" className="mt-2 flex flex-wrap gap-2">
          {(["all", ...CATEGORIES] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={category === id}
              onClick={() => setCategory(id)}
              className="btn px-2 py-1"
            >
              {id}
            </button>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-labelledby="shape-grid-label"
        className="mt-2 grid max-h-[22rem] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3"
      >
        {visible.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={shape === s.id}
            onClick={() => setShape(s.id)}
            className="btn flex min-h-[44px] items-center gap-2 px-2 text-left leading-tight"
          >
            <ShapeThumb shape={s} className="h-6 w-6 shrink-0" />
            <span className="min-w-0 break-words">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

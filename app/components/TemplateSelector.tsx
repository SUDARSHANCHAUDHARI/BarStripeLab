"use client";

import { useId } from "react";
import { templates } from "@/lib/templates";
import { getShape } from "@/lib/shapes";
import type { Template } from "@/types";
import ShapeThumb from "./ShapeThumb";
import { FOCUS } from "./flow/ui";

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const labelId = useId();

  return (
    <div>
      <h3 id={labelId} className="mb-2 text-base font-bold text-ink">
        Templates
      </h3>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-2 gap-2">
        {templates.map((tmpl) => (
          <button
            key={tmpl.name}
            type="button"
            onClick={() => onSelect(tmpl)}
            className={`flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-rule bg-card px-3 py-2 text-left text-base leading-tight text-ink hover:border-ink ${FOCUS}`}
          >
            <span style={{ color: tmpl.color }} className="shrink-0">
              <ShapeThumb shape={getShape(tmpl.shape)} className="h-6 w-6" />
            </span>
            <span className="min-w-0 break-words">{tmpl.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { templates } from "@/lib/templates";
import { getShape } from "@/lib/shapes";
import type { Template } from "@/types";
import ShapeThumb from "./ShapeThumb";

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div>
      <span id="templates-label" className="field-label">
        Quick templates
      </span>
      <div role="group" aria-labelledby="templates-label" className="mt-2 grid grid-cols-2 gap-2">
        {templates.map((tmpl) => (
          <button
            key={tmpl.name}
            type="button"
            onClick={() => onSelect(tmpl)}
            className="btn flex min-h-[44px] items-center gap-2 px-2 text-left leading-tight"
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

"use client";

import { templates } from "@/lib/templates";
import type { Template } from "@/types";

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quick Templates
      </label>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {templates.map((tmpl) => (
          <button
            key={tmpl.name}
            onClick={() => onSelect(tmpl)}
            className="p-3 border border-gray-300 rounded hover:bg-gray-100 transition flex flex-col items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded border border-gray-400"
              style={{ backgroundColor: tmpl.color }}
            />
            <span className="text-xs text-center font-medium">
              {tmpl.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

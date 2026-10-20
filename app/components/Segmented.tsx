"use client";

import { useId } from "react";
import { FOCUS } from "./flow/ui";

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const labelId = useId();

  return (
    <div>
      <span id={labelId} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="inline-flex flex-wrap gap-1 rounded-full border-[1.5px] border-rule bg-card p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-[44px] rounded-full px-4 text-base font-bold text-ink-2 hover:text-ink aria-pressed:bg-ink aria-pressed:text-card ${FOCUS}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

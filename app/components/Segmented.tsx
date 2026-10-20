"use client";

import { useId } from "react";

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
      <span id={labelId} className="field-label">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="btn px-1"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FIELD, HINT, LABEL } from "./ui";

interface NumberFieldProps {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onCommit: (value: number) => void;
}

// Typing never fights the user: a value is committed as soon as it is in range, and a half-typed
// or out-of-range entry reverts to the last good value when the field loses focus.
export default function NumberField({ id, label, hint, value, min, max, step, onCommit }: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        aria-describedby={hintId}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = Number(event.target.value);
          if (event.target.value.trim() !== "" && Number.isFinite(next) && next >= min && next <= max) onCommit(next);
        }}
        onBlur={() => setDraft(null)}
        className={FIELD}
      />
      <p id={hintId} className={HINT}>
        {hint}
      </p>
    </div>
  );
}

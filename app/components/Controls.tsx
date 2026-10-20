"use client";

import type { BarcodeFormat } from "@/types";
import Segmented from "./Segmented";
import { FORMAT_IDS, FORMAT_INFO } from "./formats";

interface ControlsProps {
  value: string;
  setValue: (value: string) => void;
  format: BarcodeFormat;
  setFormat: (format: BarcodeFormat) => void;
  error: string;
}

const FORMAT_OPTIONS = FORMAT_IDS.map((id) => ({ value: id, label: FORMAT_INFO[id].label }));

export default function Controls({ value, setValue, format, setFormat, error }: ControlsProps) {
  const info = FORMAT_INFO[format];

  return (
    <div className="space-y-6">
      <Segmented
        label="Format"
        options={FORMAT_OPTIONS}
        value={format}
        onChange={setFormat}
      />

      <div>
        <label htmlFor="barcode-value" className="field-label">
          {info.inputLabel}
        </label>
        <input
          id="barcode-value"
          type="text"
          inputMode={format === "code128" ? "text" : "numeric"}
          autoComplete="off"
          spellCheck={false}
          className="field mt-2 text-lg"
          placeholder={info.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={info.maxLength}
          aria-invalid={error !== ""}
          aria-describedby="barcode-value-note"
        />
        <p id="barcode-value-note" className="mt-2 text-xs text-muted">
          {info.help}
        </p>
        {error && (
          <p role="alert" className="mt-2 border-2 border-danger bg-white p-2 text-xs font-bold text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

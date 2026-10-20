"use client";

import type { BarcodeFormat } from "@/types";
import { SHAPES } from "@/lib/shapes";

interface ControlsProps {
  value: string;
  setValue: (value: string) => void;
  format: BarcodeFormat;
  setFormat: (format: BarcodeFormat) => void;
  shape: string;
  setShape: (shape: string) => void;
}

export default function Controls({
  value,
  setValue,
  format,
  setFormat,
  shape,
  setShape,
}: ControlsProps) {
  const getPlaceholderByFormat = () => {
    switch (format) {
      case "ean8":
        return "Enter 7-8 digits";
      case "upca":
        return "Enter 11-12 digits";
      case "code128":
        return "Enter alphanumeric text (up to 48 chars)";
      case "ean13":
      default:
        return "Enter barcode or let us auto-generate checksum";
    }
  };

  const getHelpTextByFormat = () => {
    switch (format) {
      case "ean8":
        return "Enter 7 digits and we'll calculate the checksum, or paste 8 digits";
      case "upca":
        return "Enter 11 digits and we'll calculate the checksum, or paste 12 digits";
      case "code128":
        return "Letters, numbers, spaces and symbols (no accents or emoji). Variable length barcode.";
      case "ean13":
      default:
        return "Enter 12 digits and we'll calculate the checksum, or paste 13 digits";
    }
  };

  const getMaxLengthByFormat = () => {
    switch (format) {
      // EAN limits leave room for pasted separators; normalization strips them.
      case "ean8":
        return 12;
      case "code128":
        return 48;
      case "ean13":
      default:
        return 20;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barcode Format
        </label>
        <select
          className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={format}
          onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
        >
          <option value="ean13">EAN-13 (13 digits)</option>
          <option value="ean8">EAN-8 (8 digits)</option>
          <option value="upca">UPC-A (12 digits)</option>
          <option value="code128">CODE 128 (variable)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barcode Value
        </label>
        <input
          type="text"
          className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={getPlaceholderByFormat()}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={getMaxLengthByFormat()}
        />
        <p className="text-xs text-gray-500 mt-1">{getHelpTextByFormat()}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Style
        </label>
        <select
          className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
        >
          {SHAPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Design } from "@/lib/urlState";
import { generateBarcodeSVG } from "@/lib/barcode";
import { parseBatch } from "@/lib/batch";
import { composedToPdf } from "@/lib/export/pdf";
import { createZip } from "@/lib/export/zip";
import { xRangeMm } from "@/lib/printSize";
import { composeBarcode } from "@/lib/svgComposer";
import { shapeFor } from "./design";
import { saveBytes } from "./download";
import { BTN_PRIMARY, FIELD, HINT, LABEL } from "./ui";

interface BatchDialogProps {
  design: Design;
}

const LIST_LIMIT = 50;
const MAX_FILE_BYTES = 1_000_000;
// Let the browser paint between barcodes so the progress count moves.
const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// A first row with no digits (a "gtin" heading) is dropped when the rows after it are numeric.
// It is blanked, not removed, so the line numbers in the skipped list still match the user's file.
function skipHeaderRow(text: string): string {
  const lines = text.split(/\r?\n/);
  const first = lines.findIndex((line) => line.trim() !== "");
  if (first === -1 || /\d/.test(lines[first])) return text;
  const rest = lines.slice(first + 1).filter((line) => line.trim() !== "");
  const numeric = rest.length > 0 && rest.every((line) => /^[\d\s,;-]+/.test(line.trim()));
  return numeric ? lines.map((line, index) => (index === first ? "" : line)).join("\n") : text;
}

const fileStem = (value: string) => value.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "barcode";

// Shown inside a Modal. Everything happens in the browser; the ZIP is built from the user's own list.
export default function BatchDialog({ design }: BatchDialogProps) {
  const [text, setText] = useState("");
  const [withPdf, setWithPdf] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseBatch(skipHeaderRow(text)), [text]);
  const busy = progress !== null;

  async function readFile(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is too big. Use a file under 1 MB, or split your list.");
      return;
    }
    try {
      setText(await file.text());
    } catch (err) {
      console.error("Read file error:", err);
      setError("We couldn't read that file. Try pasting the numbers instead.");
    }
  }

  async function build() {
    setError("");
    setProgress(0);
    try {
      const encoder = new TextEncoder();
      const used = new Map<string, number>();
      const files: { name: string; data: Uint8Array }[] = [];

      for (const [index, row] of parsed.rows.entries()) {
        const range = xRangeMm(row.format);
        const xMm = Math.min(range.max, Math.max(range.min, design.xMm));
        const rawBarcodeSvg = await generateBarcodeSVG(row.normalized, row.format);
        const composed = composeBarcode({
          rawBarcodeSvg,
          shape: shapeFor(design.shape),
          colorConfig: design.colorConfig,
          value: row.normalized,
          format: row.format,
          retailSafe: design.retailSafe,
          xMm,
          bwrMm: design.bwrMm,
        });

        const stem = fileStem(row.normalized);
        const seen = used.get(stem) ?? 0;
        used.set(stem, seen + 1);
        const name = seen === 0 ? stem : `${stem}-${seen + 1}`;
        files.push({ name: `${name}.svg`, data: encoder.encode(composed.svg) });
        if (withPdf) files.push({ name: `${name}.pdf`, data: composedToPdf(composed, xMm) });

        setProgress(index + 1);
        await nextFrame();
      }

      saveBytes(createZip(files), "application/zip", "barstripelab-barcodes.zip");
    } catch (err) {
      console.error("Batch error:", err);
      setError("We couldn't make the ZIP. Try fewer rows, or another browser.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-5 text-base">
      <p className="text-lg">
        Paste your numbers, one per line, or the first column of a CSV. Every barcode uses your current colour, shape,
        size and scan mode. Nothing leaves your browser.
      </p>

      <div>
        <label htmlFor="batch-text" className={LABEL}>
          Numbers
        </label>
        <textarea
          id="batch-text"
          rows={7}
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          placeholder={"5901234123457\n96385074\n036000291452"}
          className={`${FIELD} font-mono`}
        />
      </div>

      <div>
        <label htmlFor="batch-file" className={LABEL}>
          Or choose a CSV or text file
        </label>
        <input
          id="batch-file"
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          onChange={(event) => readFile(event.target.files?.[0])}
          className="block w-full text-base text-ink file:mr-3 file:min-h-[44px] file:rounded-full file:border-2 file:border-ink file:bg-card file:px-5 file:font-bold file:text-ink"
        />
      </div>

      <div role="status" aria-live="polite" className="space-y-2 rounded-2xl bg-card p-4">
        <p className="font-bold text-ink">
          {parsed.rows.length} ready{parsed.invalid.length > 0 ? `, ${parsed.invalid.length} skipped` : ""}
        </p>
        {parsed.truncated && <p className="text-warn">Only the first 500 rows are used.</p>}
        {parsed.invalid.length > 0 && (
          <ul className="max-h-40 space-y-1 overflow-y-auto text-ink-2">
            {parsed.invalid.slice(0, LIST_LIMIT).map((row) => (
              <li key={row.line}>
                Line {row.line}: <span className="font-mono">{row.value}</span> - {row.reason}
              </li>
            ))}
            {parsed.invalid.length > LIST_LIMIT && <li>And {parsed.invalid.length - LIST_LIMIT} more.</li>}
          </ul>
        )}
      </div>

      <label className="flex min-h-[44px] items-center gap-3 text-ink">
        <input
          type="checkbox"
          checked={withPdf}
          onChange={(event) => setWithPdf(event.target.checked)}
          className="h-5 w-5 accent-ink"
        />
        Also include a PDF for each barcode
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={build} disabled={busy || parsed.rows.length === 0} className={BTN_PRIMARY}>
          {busy ? `Making ${progress} of ${parsed.rows.length}...` : `Download ZIP (${parsed.rows.length})`}
        </button>
        {parsed.rows.length === 0 && !busy && <p className={HINT}>Add at least one valid number to download.</p>}
      </div>

      {error && (
        <p role="alert" className="font-bold text-warn">
          {error}
        </p>
      )}
    </div>
  );
}

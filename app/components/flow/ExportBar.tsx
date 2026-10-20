"use client";

import { useId, useState } from "react";
import type { BarcodeFormat, ComposedBarcode, ScanScore } from "@/types";
import { magnification } from "@/lib/printSize";
import { snapPngWidth } from "@/lib/export/png";
import ShareButton from "../ShareButton";
import {
  PNG_DPI_OPTIONS,
  copySvg,
  downloadPdf,
  downloadPng,
  downloadSpecSheet,
  downloadSvg,
} from "./download";
import type { DecodeState } from "./useDesignRender";
import { BTN_OUTLINE, FIELD, FOCUS } from "./ui";

interface ExportBarProps {
  composed: ComposedBarcode | null;
  score: ScanScore | null;
  decode: DecodeState;
  format: BarcodeFormat;
  number: string;
  xMm: number;
  bwrMm: number;
  retailSafe: boolean;
  shapeLabel: string;
  dpi: number;
  onDpi: (dpi: number) => void;
  getShareUrl: () => string;
  onBatch: () => void;
  // Opens All settings; left out when the bar is already inside it.
  onSettings?: () => void;
  // One row of small buttons, for the All settings sheet.
  compact?: boolean;
}

type Task = "svg" | "pdf" | "png" | "copy" | "spec";

interface CardProps {
  primary?: boolean;
  title: string;
  detail: string;
  busy?: boolean;
  disabled: boolean;
  onClick: () => void;
}

function DownloadCard({ primary = false, title, detail, busy = false, disabled, onClick }: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`block w-full rounded-2xl border-2 border-ink p-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
        primary ? "bg-ink text-card" : "bg-card text-ink hover:bg-board"
      } ${FOCUS}`}
    >
      <strong className="block font-display text-2xl leading-tight">{busy ? "Making..." : title}</strong>
      <span className={`text-base ${primary ? "text-rule" : "text-ink-2"}`}>{detail}</span>
    </button>
  );
}

export default function ExportBar({
  composed,
  score,
  decode,
  format,
  number,
  xMm,
  bwrMm,
  retailSafe,
  shapeLabel,
  dpi,
  onDpi,
  getShareUrl,
  onBatch,
  onSettings,
  compact = false,
}: ExportBarProps) {
  const dpiId = useId();
  const [busy, setBusy] = useState<Task | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const disabled = !composed;

  async function run(task: Task, work: (composed: ComposedBarcode) => void | Promise<void>) {
    if (!composed) return;
    setError("");
    setBusy(task);
    try {
      await work(composed);
    } catch (err) {
      console.error("Export error:", err);
      setError(
        task === "copy"
          ? "Could not copy to the clipboard. Download the SVG instead."
          : "That download failed. Try again, or use another browser."
      );
    } finally {
      setBusy(null);
    }
  }

  const snapped = composed ? snapPngWidth(composed, xMm, dpi).snappedXmm : xMm;
  const snapPercent = magnification(format, snapped);
  const snapMoved = Math.abs(snapped - xMm) > 0.0005;

  const dpiSelect = (
    <div className="flex items-center gap-2">
      <label htmlFor={dpiId} className="text-sm font-bold text-ink">
        PNG resolution
      </label>
      <select
        id={dpiId}
        value={dpi}
        onChange={(event) => onDpi(Number(event.target.value))}
        className={`${FIELD} !w-auto`}
      >
        {PNG_DPI_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} dpi
          </option>
        ))}
      </select>
    </div>
  );

  const downloadSvgNow = () => run("svg", (c) => downloadSvg(c, number));
  const downloadPdfNow = () => run("pdf", (c) => downloadPdf(c, xMm, number));
  const downloadPngNow = () => run("png", (c) => downloadPng(c, xMm, dpi, number));

  return (
    <div>
      {decode === "failed" && (
        <p role="alert" className="mb-4 rounded-xl bg-warn-bg px-4 py-3 text-base text-warn">
          <strong>The decode check failed.</strong> These files still download, but print a test copy before you rely on
          them.
        </p>
      )}

      {compact ? (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={downloadSvgNow} disabled={disabled || busy === "svg"} className={BTN_OUTLINE}>
            SVG
          </button>
          <button type="button" onClick={downloadPdfNow} disabled={disabled || busy === "pdf"} className={BTN_OUTLINE}>
            PDF
          </button>
          <button type="button" onClick={downloadPngNow} disabled={disabled || busy === "png"} className={BTN_OUTLINE}>
            {busy === "png" ? "Making..." : "PNG"}
          </button>
          {dpiSelect}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <DownloadCard
              primary
              title="SVG"
              detail="For print and design apps. Exact size."
              disabled={disabled}
              busy={busy === "svg"}
              onClick={downloadSvgNow}
            />
            <DownloadCard
              title="PDF"
              detail="For your printer. Exact size."
              disabled={disabled}
              busy={busy === "pdf"}
              onClick={downloadPdfNow}
            />
            <DownloadCard
              title="PNG"
              detail={`For web pages and listings. ${dpi} dpi.`}
              disabled={disabled}
              busy={busy === "png"}
              onClick={downloadPngNow}
            />
          </div>
          <div className="mt-3">{dpiSelect}</div>
          {snapMoved && (
            <p className="mt-2 text-sm text-ink-2">
              At {dpi} dpi every bar snaps to whole pixels, so the PNG prints with bars {snapped.toFixed(4)} mm wide
              {snapPercent !== null ? ` (${snapPercent}%)` : ""} instead of {xMm.toFixed(4)} mm.
            </p>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || busy === "copy"}
          onClick={() =>
            run("copy", async (c) => {
              await copySvg(c);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          className={BTN_OUTLINE}
        >
          {copied ? "SVG copied" : "Copy SVG"}
        </button>
        <button
          type="button"
          disabled={disabled || !score || busy === "spec"}
          onClick={() =>
            run("spec", (c) => {
              if (score) downloadSpecSheet({ composed: c, format, value: number, xMm, bwrMm, retailSafe, score, shapeLabel });
            })
          }
          className={BTN_OUTLINE}
        >
          Spec sheet for your printer
        </button>
        <ShareButton getUrl={getShareUrl} />
        {onSettings && (
          <button type="button" onClick={onSettings} className={BTN_OUTLINE}>
            Printer settings
          </button>
        )}
        <button type="button" onClick={onBatch} className={BTN_OUTLINE}>
          Many barcodes (CSV)
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "SVG copied to clipboard" : ""}
      </span>
      {error && (
        <p role="alert" className="mt-3 text-base font-bold text-warn">
          {error}
        </p>
      )}
    </div>
  );
}

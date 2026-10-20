"use client";

import { useEffect, useState } from "react";
import { BTN_OUTLINE } from "./flow/ui";

interface ShareButtonProps {
  // Read at click time so the link always matches the current design.
  getUrl: () => string;
  title?: string;
}

const DEFAULT_TITLE = "Check out BarStripeLab - Turn barcodes into brand assets!";

async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error("Copy link failed:", err);
    return false;
  }
}

// Native share sheet when available, otherwise copy the link.
export async function shareApp(
  url = window.location.href,
  title = DEFAULT_TITLE
): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share({ title: "BarStripeLab", text: title, url });
      return "shared";
    } catch {
      return "failed"; // user cancelled the share sheet
    }
  }

  return (await copyToClipboard(url)) ? "copied" : "failed";
}

export default function ShareButton({ getUrl, title = DEFAULT_TITLE }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  // Checked after mount so the static HTML and the first client render match.
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare("share" in navigator);
  }, []);

  async function copyLink() {
    const ok = await copyToClipboard(getUrl());
    setFailed(!ok);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {canShare && (
        <button type="button" onClick={() => shareApp(getUrl(), title)} className={BTN_OUTLINE} title="Share (Alt+H)">
          Share
        </button>
      )}
      <button type="button" onClick={copyLink} className={BTN_OUTLINE}>
        {copied ? "Link copied" : "Copy share link"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : failed ? "Could not copy the link" : ""}
      </span>
    </>
  );
}

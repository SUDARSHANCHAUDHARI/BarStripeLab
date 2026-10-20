"use client";

import { useEffect, useState } from "react";

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
  // Checked after mount so the static HTML and the first client render match.
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare("share" in navigator);
  }, []);

  async function copyLink() {
    if (await copyToClipboard(getUrl())) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openPopup(href: string) {
    window.open(href, "_blank", "noopener,noreferrer,width=500,height=500");
  }

  return (
    <div>
      <span id="share-label" className="field-label">
        Share this design
      </span>
      <div role="group" aria-labelledby="share-label" className="mt-2 flex flex-wrap gap-2">
        {canShare && (
          <button type="button" onClick={() => shareApp(getUrl(), title)} className="btn" title="Share (Alt+H)">
            Share
          </button>
        )}
        <button type="button" onClick={copyLink} className="btn">
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            openPopup(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`
            )
          }
        >
          X
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            openPopup(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`
            )
          }
        >
          LinkedIn
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            window.location.href = `mailto:?subject=BarStripeLab&body=${encodeURIComponent(`${title}\n\n${getUrl()}`)}`;
          }}
        >
          Email
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}

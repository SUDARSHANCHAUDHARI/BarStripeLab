"use client";

import { useEffect, useState } from "react";

interface ShareButtonProps {
  title?: string;
  url?: string;
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

export default function ShareButton({
  title = DEFAULT_TITLE,
  url = typeof window !== "undefined" ? window.location.href : "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  // Checked after mount so the static HTML and the first client render match.
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare("share" in navigator);
  }, []);

  async function shareNative() {
    await shareApp(url, title);
  }

  async function copyLink() {
    if (await copyToClipboard(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=500,height=500"
    );
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=500,height=500"
    );
  }

  function shareEmail() {
    window.location.href = `mailto:?subject=BarStripeLab&body=${encodeURIComponent(title + "\n\n" + url)}`;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {canShare ? (
        <button
          onClick={shareNative}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition"
          title="Share (Alt+H)"
        >
          📤 Share
        </button>
      ) : null}

      <button
        onClick={shareTwitter}
        className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition"
        title="Share to Twitter"
      >
        𝕏 Tweet
      </button>

      <button
        onClick={shareLinkedIn}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition"
        title="Share to LinkedIn"
      >
        💼 LinkedIn
      </button>

      <button
        onClick={shareEmail}
        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition"
        title="Share via Email"
      >
        ✉️ Email
      </button>

      <button
        onClick={copyLink}
        className={`px-3 py-2 rounded text-sm font-medium transition ${
          copied
            ? "bg-green-600 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
        title="Copy link"
      >
        {copied ? "✓ Copied!" : "🔗 Copy"}
      </button>
    </div>
  );
}

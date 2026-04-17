"use client";

import { useState } from "react";

interface ShareButtonProps {
  title?: string;
  url?: string;
}

export default function ShareButton({
  title = "Check out BarStripeLab - Turn barcodes into brand assets!",
  url = typeof window !== "undefined" ? window.location.href : "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BarStripeLab",
          text: title,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
      return;
    }

    // Fallback: copy to clipboard
    copyLink();
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <button
          onClick={shareNative}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition"
          title="Share (Ctrl+Shift+S)"
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
        title="Copy link (Ctrl+Shift+C)"
      >
        {copied ? "✓ Copied!" : "🔗 Copy"}
      </button>
    </div>
  );
}

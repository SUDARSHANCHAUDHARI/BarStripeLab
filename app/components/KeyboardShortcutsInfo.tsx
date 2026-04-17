"use client";

import { useState } from "react";

export default function KeyboardShortcutsInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-500 hover:text-gray-700 transition"
        title="Show keyboard shortcuts"
      >
        ⌨️ Shortcuts
      </button>

      {open && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Keyboard Shortcuts</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <p>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  Alt + S
                </kbd>{" "}
                <span className="text-gray-700">Next Style</span>
              </p>
              <p>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  Alt + C
                </kbd>{" "}
                <span className="text-gray-700">Change Color</span>
              </p>
            </div>

            <div className="space-y-1">
              <p>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  Alt + D
                </kbd>{" "}
                <span className="text-gray-700">Download SVG</span>
              </p>
              <p>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  Alt + P
                </kbd>{" "}
                <span className="text-gray-700">Download PNG</span>
              </p>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <p>
                <kbd className="px-2 py-1 bg-white border rounded text-xs font-mono">
                  Alt + H
                </kbd>{" "}
                <span className="text-gray-700">Share</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

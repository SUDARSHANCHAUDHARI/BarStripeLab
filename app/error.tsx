"use client";

import React from "react";
import { BTN_PRIMARY, STEP_HEADING } from "./components/flow/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for debugging
  React.useEffect(() => {
    console.error("Barcode app error:", error);
  }, [error]);

  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-start justify-center gap-4 px-4">
      <h1 className={STEP_HEADING}>Something went wrong</h1>
      <p className="text-xl text-ink-2">An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={() => reset()} className={BTN_PRIMARY}>
        Try again
      </button>
    </main>
  );
}

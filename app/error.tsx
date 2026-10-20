"use client";

import React from "react";

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
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-start justify-center gap-4 px-4">
      <h1 className="text-lg font-black uppercase text-ink">Something went wrong</h1>
      <p className="text-muted">An unexpected error occurred. Please try again.</p>
      <button type="button" onClick={() => reset()} className="btn px-6 py-3">
        Try again
      </button>
    </main>
  );
}

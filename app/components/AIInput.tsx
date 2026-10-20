"use client";

import { useId, useState } from "react";
import { AIStyleError } from "@/lib/aiStyleGenerator";
import { BTN_OUTLINE, FIELD, FOCUS, HINT, LABEL } from "./flow/ui";

interface AIInputProps {
  onGenerate: (prompt: string, apiKey: string) => Promise<void>;
}

export default function AIInput({ onGenerate }: AIInputProps) {
  const id = useId();
  const [prompt, setPrompt] = useState("");
  // Kept in memory only: never stored, gone when the tab closes.
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = !isLoading && prompt.trim() !== "" && apiKey.trim() !== "";

  async function handleGenerate() {
    if (!canGenerate) return;

    setIsLoading(true);
    setError("");
    try {
      await onGenerate(prompt.trim(), apiKey.trim());
    } catch (err) {
      console.error(err);
      setError(err instanceof AIStyleError ? err.message : "Failed to generate a style. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <details className="group rounded-2xl border-2 border-rule bg-card">
      <summary
        className={`flex min-h-[44px] cursor-pointer list-none items-center justify-between rounded-2xl px-4 text-base font-bold text-ink ${FOCUS} [&::-webkit-details-marker]:hidden`}
      >
        AI style maker
        <span aria-hidden="true" className="group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden group-open:inline">-</span>
      </summary>
      <div className="space-y-3 border-t-2 border-rule p-4">
        <div>
          <label htmlFor={`${id}-key`} className={LABEL}>
            Anthropic API key
          </label>
          <input
            id={`${id}-key`}
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor={`${id}-prompt`} className={LABEL}>
            Describe the brand
          </label>
          <input
            id={`${id}-prompt`}
            type="text"
            maxLength={200}
            placeholder="Cosy coffee shop by the sea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            aria-describedby={error ? `${id}-error` : undefined}
            className={FIELD}
          />
        </div>
        <button type="button" onClick={handleGenerate} disabled={!canGenerate} className={`${BTN_OUTLINE} w-full`}>
          {isLoading ? "Making a style..." : "Make a style"}
        </button>
        {!canGenerate && !isLoading && <p className={HINT}>Add your key and a short description to make a style.</p>}
        {error && (
          <p id={`${id}-error`} role="alert" className="text-base font-bold text-warn">
            {error}
          </p>
        )}
        <p className={HINT}>
          Uses Claude with your own key. The key stays in this tab and is sent only to api.anthropic.com; each request is billed to your Anthropic account.
        </p>
      </div>
    </details>
  );
}

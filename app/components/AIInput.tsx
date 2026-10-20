"use client";

import { useState } from "react";
import { AIStyleError } from "@/lib/aiStyleGenerator";

interface AIInputProps {
  onGenerate: (prompt: string, apiKey: string) => Promise<void>;
}

export default function AIInput({ onGenerate }: AIInputProps) {
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
    <details className="group border-2 border-ink bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-xs font-black uppercase text-ink [&::-webkit-details-marker]:hidden">
        AI style generator
        <span aria-hidden="true" className="group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden group-open:inline">-</span>
      </summary>
      <div className="space-y-3 border-t-2 border-ink p-3">
        <div>
          <label htmlFor="ai-key" className="field-label">
            Anthropic API key
          </label>
          <input
            id="ai-key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="field mt-1 py-2"
          />
        </div>
        <div>
          <label htmlFor="ai-prompt" className="field-label">
            Describe the brand
          </label>
          <input
            id="ai-prompt"
            type="text"
            maxLength={200}
            placeholder="Cosy coffee shop by the sea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="field mt-1 py-2"
          />
        </div>
        <button type="button" onClick={handleGenerate} disabled={!canGenerate} className="btn w-full py-3">
          {isLoading ? "Generating..." : "Generate style"}
        </button>
        {error && (
          <p role="alert" className="text-xs font-bold text-danger">
            {error}
          </p>
        )}
        <p className="text-xs text-muted">
          Uses Claude with your own key. The key stays in this tab and is sent only to api.anthropic.com; each request is billed to your Anthropic account.
        </p>
      </div>
    </details>
  );
}

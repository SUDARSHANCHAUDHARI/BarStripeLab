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
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        AI Style Generator
      </label>
      <input
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder="Your Anthropic API key (sk-ant-...)"
        aria-label="Anthropic API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={200}
          placeholder="Describe the brand, e.g. cosy coffee shop by the sea"
          aria-label="Style description"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1 border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium text-sm transition"
        >
          {isLoading ? "..." : "Generate"}
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <p className="text-xs text-gray-500">
        Uses Claude with your own key. The key stays in this tab and is sent only to api.anthropic.com; each request is billed to your Anthropic account.
      </p>
    </div>
  );
}

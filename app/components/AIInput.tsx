"use client";

import { useState } from "react";

interface AIInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export default function AIInput({ onGenerate, isLoading }: AIInputProps) {
  const [prompt, setPrompt] = useState("");

  async function handleGenerate() {
    if (prompt.trim()) {
      await onGenerate(prompt);
      setPrompt("");
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        🤖 AI Style Generator (Beta)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g., coffee, ocean, mountain, tech..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1 border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium text-sm transition"
        >
          {isLoading ? "..." : "Generate"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Try: coffee, ocean, mountain, city, tech, organic, minimal, flowing
      </p>
    </div>
  );
}

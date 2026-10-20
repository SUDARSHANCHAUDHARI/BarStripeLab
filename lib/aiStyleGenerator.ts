import type { StylePreset } from "@/types";
import { STYLE_IDS, isStyleId } from "@/lib/styles";
import { MODIFIER_IDS, isModifierId } from "@/lib/artEngine";
import { safeColor } from "@/lib/colorEngine";

export const AI_MODEL = "claude-opus-5-5";

const SYSTEM_PROMPT = `You choose the look of an artistic barcode. The top of the barcode is masked into a silhouette shape and the bottom stays a plain black scan zone.
Pick the silhouette, the shape modifier and one accent color that best match the user's brand or mood description.
The accent color fills the artwork bars on a white background, so choose a color with clear contrast against white.`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    style: { type: "string", enum: STYLE_IDS },
    modifier: { type: "string", enum: MODIFIER_IDS },
    color: {
      type: "string",
      description: "Accent color as a 6-digit hex value, for example #1DB954",
    },
  },
  required: ["style", "modifier", "color"],
  additionalProperties: false,
};

// Errors whose message is safe and useful to show in the UI.
export class AIStyleError extends Error {}

export function parseStylePreset(text: string): StylePreset {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AIStyleError("The AI returned an unreadable answer. Try again.");
  }

  const { style, modifier, color } = (data ?? {}) as Record<string, unknown>;
  const safe = typeof color === "string" ? safeColor(color, "") : "";

  if (
    typeof style !== "string" ||
    !isStyleId(style) ||
    typeof modifier !== "string" ||
    !isModifierId(modifier) ||
    !safe
  ) {
    throw new AIStyleError("The AI returned a style this app does not know. Try again.");
  }

  return { style, modifier, color: safe };
}

export async function generateAIStyle(prompt: string, apiKey: string): Promise<StylePreset> {
  // Loaded on demand so the SDK stays out of the initial page bundle.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  // The viewer's own key, sent only from their browser to the Anthropic API.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let response;
  try {
    response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new AIStyleError("That API key was rejected. Check it and try again.");
    }
    if (error instanceof Anthropic.PermissionDeniedError) {
      throw new AIStyleError("This API key is not allowed to use this model.");
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new AIStyleError("Rate limited by the Anthropic API. Wait a moment and try again.");
    }
    if (error instanceof Anthropic.APIConnectionError) {
      throw new AIStyleError("Could not reach the Anthropic API. Check your connection.");
    }
    if (error instanceof Anthropic.APIError) {
      throw new AIStyleError(`Anthropic API error (${error.status ?? "unknown"}). Try again.`);
    }
    throw error;
  }

  if (response.stop_reason === "refusal") {
    throw new AIStyleError("The AI declined this prompt. Try describing the brand differently.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new AIStyleError("The AI answer was cut off. Try a shorter prompt.");
  }

  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("");

  return parseStylePreset(text);
}

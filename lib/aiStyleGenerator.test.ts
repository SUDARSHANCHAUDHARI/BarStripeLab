import { describe, it, expect, vi, beforeEach } from "vitest";

const create = vi.fn();
const constructorArgs: unknown[] = [];

vi.mock("@anthropic-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/sdk")>();
  class MockAnthropic {
    static APIError = actual.default.APIError;
    static AuthenticationError = actual.default.AuthenticationError;
    static PermissionDeniedError = actual.default.PermissionDeniedError;
    static RateLimitError = actual.default.RateLimitError;
    static APIConnectionError = actual.default.APIConnectionError;
    beta = { messages: { create } };
    constructor(options: unknown) {
      constructorArgs.push(options);
    }
  }
  return { default: MockAnthropic };
});

import Anthropic from "@anthropic-ai/sdk";
import { AIStyleError, AI_MODEL, generateAIStyle, parseStylePreset } from "./aiStyleGenerator";
import { STYLE_IDS } from "./styles";
import { MODIFIER_IDS } from "./artEngine";
import { templates } from "./templates";

function textResponse(text: string, stop_reason = "end_turn") {
  return { stop_reason, content: [{ type: "text", text }] };
}

beforeEach(() => {
  create.mockReset();
  constructorArgs.length = 0;
});

describe("parseStylePreset", () => {
  it("accepts a known style, modifier and hex color", () => {
    expect(parseStylePreset('{"style":"coffee","modifier":"organic","color":"#6F4E37"}')).toEqual({
      style: "coffee",
      modifier: "organic",
      color: "#6F4E37",
    });
  });

  it("rejects unknown ids, non-hex colors and invalid JSON", () => {
    expect(() => parseStylePreset('{"style":"rocket","modifier":"smooth","color":"#000000"}')).toThrow(AIStyleError);
    expect(() => parseStylePreset('{"style":"wave","modifier":"wobbly","color":"#000000"}')).toThrow(AIStyleError);
    expect(() => parseStylePreset('{"style":"wave","modifier":"smooth","color":"red\\"/>"}')).toThrow(AIStyleError);
    expect(() => parseStylePreset("not json")).toThrow(AIStyleError);
  });
});

describe("generateAIStyle", () => {
  it("sends the viewer's key from the browser with a constrained schema", async () => {
    create.mockResolvedValue(textResponse('{"style":"whale","modifier":"elegant","color":"#0077BE"}'));

    const preset = await generateAIStyle("seaside surf shop", "sk-ant-test");

    expect(preset).toEqual({ style: "whale", modifier: "elegant", color: "#0077BE" });
    expect(constructorArgs[0]).toEqual({ apiKey: "sk-ant-test", dangerouslyAllowBrowser: true });

    const params = create.mock.calls[0][0];
    expect(params.model).toBe(AI_MODEL);
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(params.output_config.format.schema.properties.style.enum).toEqual(STYLE_IDS);
    expect(params.output_config.format.schema.properties.modifier.enum).toEqual(MODIFIER_IDS);
    expect(params.messages).toEqual([{ role: "user", content: "seaside surf shop" }]);
  });

  it("reports refusals and truncation instead of parsing them", async () => {
    create.mockResolvedValueOnce(textResponse("", "refusal"));
    await expect(generateAIStyle("x", "k")).rejects.toThrow(/declined/);

    create.mockResolvedValueOnce(textResponse('{"style":', "max_tokens"));
    await expect(generateAIStyle("x", "k")).rejects.toThrow(/cut off/);
  });

  it("turns a rejected key into a readable error", async () => {
    create.mockRejectedValue(
      new Anthropic.AuthenticationError(401, undefined, "invalid x-api-key", new Headers())
    );
    await expect(generateAIStyle("x", "bad")).rejects.toThrow(/key was rejected/);
  });
});

describe("templates", () => {
  it("each template uses a real style and modifier, and no two look the same", () => {
    for (const t of templates) {
      expect(STYLE_IDS).toContain(t.style);
      expect(MODIFIER_IDS).toContain(t.modifier);
    }
    expect(new Set(templates.map((t) => t.style)).size).toBe(templates.length);
  });
});

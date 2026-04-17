import type { Shape, Style } from "@/types";

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function deterministicJitter(seed: string, index: number): number {
  const n = hashString(`${seed}-${index}`) % 1000;
  return n / 1000 - 0.5;
}

export function getDeterministicShape(
  style: Style,
  index: number,
  seed: string
): Shape {
  const baseShape = style[index % style.length] || { type: "rect", height: 40 };
  const jitter = deterministicJitter(seed, index) * 8;
  const nextHeight = Math.max(8, Math.min(95, baseShape.height + jitter));
  return {
    ...baseShape,
    height: nextHeight,
  };
}

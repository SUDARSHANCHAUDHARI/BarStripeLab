import { Style, Shape } from "@/types";

const styleMap: Record<string, Style> = {
  coffee: [
    { type: "curve", height: 25 },
    { type: "curve", height: 30 },
  ],
  ocean: [
    { type: "curve", height: 35 },
    { type: "curve", height: 20 },
  ],
  mountain: [
    { type: "triangle", height: 50 },
    { type: "triangle", height: 40 },
  ],
  city: [
    { type: "rect", height: 60 },
    { type: "rect", height: 45 },
  ],
  tech: [{ type: "rect", height: 35 }],
  organic: [
    { type: "curve", height: 40 },
    { type: "triangle", height: 25 },
  ],
  minimal: [{ type: "rect", height: 30 }],
  flowing: [
    { type: "curve", height: 45 },
    { type: "curve", height: 15 },
  ],
};

export async function generateAIStyle(prompt: string): Promise<Style> {
  // Simple keyword matching for MVP
  const lowerPrompt = prompt.toLowerCase();

  for (const [keyword, style] of Object.entries(styleMap)) {
    if (lowerPrompt.includes(keyword)) {
      return style;
    }
  }

  // Add slight randomness if no match
  const randomHeight = Math.floor(Math.random() * 40) + 20;
  const shapes: Shape[] = [
    {
      type: ["rect", "triangle", "curve"][
        Math.floor(Math.random() * 3)
      ] as any,
      height: randomHeight,
    },
  ];

  return shapes;
}

import { Template } from "@/types";

export const templates: Template[] = [
  {
    name: "Spotify Style",
    color: "#1DB954",
    style: [
      { type: "curve", height: 20 },
      { type: "curve", height: 25 },
    ],
  },

  {
    name: "Coffee Brand",
    color: "#6F4E37",
    style: [
      { type: "curve", height: 30 },
      { type: "triangle", height: 20 },
    ],
  },

  {
    name: "Tech Minimal",
    color: "#000000",
    style: [{ type: "rect", height: 40 }],
  },

  {
    name: "Ocean Wave",
    color: "#0077BE",
    style: [
      { type: "curve", height: 35 },
      { type: "curve", height: 28 },
    ],
  },

  {
    name: "Forest",
    color: "#2D5016",
    style: [
      { type: "triangle", height: 45 },
      { type: "triangle", height: 35 },
    ],
  },

  {
    name: "Sunset",
    color: "#FF6B35",
    style: [
      { type: "curve", height: 30 },
      { type: "rect", height: 25 },
    ],
  },
];

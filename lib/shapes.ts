import type { ShapeDef } from "@/types";

// Shape artwork: Phosphor Icons (MIT) and game-icons.net (CC BY 3.0).
// See THIRD_PARTY_NOTICES.md for licenses and credits.
export const SHAPES: ShapeDef[] = [
  {
    id: "coffee",
    label: "Coffee",
    category: "food",
    viewBox: [24, 16, 224, 208],
    paths: [
      "M208,80H32a8,8,0,0,0-8,8v48a96.3,96.3,0,0,0,32.54,72H32a8,8,0,0,0,0,16H208a8,8,0,0,0,0-16H183.46a96.59,96.59,0,0,0,27-40.09A40,40,0,0,0,248,128v-8A40,40,0,0,0,208,80Zm24,48a24,24,0,0,1-17.2,23,95.78,95.78,0,0,0,1.2-15V97.38A24,24,0,0,1,232,120ZM112,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm32,0V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0ZM80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Z",
    ],
    source: "phosphor",
    description: "A steaming coffee cup for cafes, roasters and coffee subscriptions.",
  },
  {
    id: "heart",
    label: "Heart",
    category: "symbols",
    viewBox: [16, 40, 224, 192],
    paths: [
      "M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z",
    ],
    source: "phosphor",
    description: "A full heart for gifts, weddings, beauty and anything made with love.",
  },
];

export const SHAPE_IDS = SHAPES.map((shape) => shape.id);

const SHAPES_BY_ID = new Map(SHAPES.map((shape) => [shape.id, shape]));

export function isShapeId(value: string): boolean {
  return SHAPES_BY_ID.has(value);
}

export function getShape(id: string): ShapeDef {
  return SHAPES_BY_ID.get(id) ?? SHAPES[0];
}

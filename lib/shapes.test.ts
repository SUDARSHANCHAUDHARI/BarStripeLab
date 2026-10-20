import { describe, it, expect } from "vitest";
import type { ShapeCategory } from "@/types";
import { SHAPES, SHAPE_IDS, getShape, isShapeId } from "./shapes";
import { templates } from "./templates";
import { contrastWithWhite } from "./colorEngine";

const CATEGORIES: ShapeCategory[] = ["food", "animals", "people", "objects", "nature", "symbols"];

describe("SHAPES", () => {
  it("has unique kebab-case ids", () => {
    expect(new Set(SHAPE_IDS).size).toBe(SHAPE_IDS.length);
    for (const id of SHAPE_IDS) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("has a positive viewBox, paths, label and description on every shape", () => {
    for (const shape of SHAPES) {
      const [, , width, height] = shape.viewBox;
      expect(width, shape.id).toBeGreaterThan(0);
      expect(height, shape.id).toBeGreaterThan(0);
      expect(shape.paths.length, shape.id).toBeGreaterThan(0);
      for (const d of shape.paths) expect(d.trim(), shape.id).not.toBe("");
      expect(shape.label.trim(), shape.id).not.toBe("");
      expect(shape.description.trim(), shape.id).not.toBe("");
    }
  });

  it("uses every category", () => {
    const used = new Set(SHAPES.map((shape) => shape.category));
    for (const category of CATEGORIES) expect(used, category).toContain(category);
  });

  it("starts with coffee and falls back to it for unknown ids", () => {
    expect(SHAPES[0].id).toBe("coffee");
    expect(isShapeId("not-a-shape")).toBe(false);
    expect(getShape("not-a-shape")).toBe(SHAPES[0]);
  });
});

describe("templates", () => {
  it("uses existing shapes in a color readable on white", () => {
    for (const template of templates) {
      expect(isShapeId(template.shape), template.name).toBe(true);
      expect(contrastWithWhite(template.color), template.name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

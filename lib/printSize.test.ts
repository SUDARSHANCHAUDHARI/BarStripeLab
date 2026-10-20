import { describe, it, expect } from "vitest";
import { magnification, nominalXmm, sizeMm, xRangeMm } from "./printSize";

describe("print size", () => {
  it("uses the GS1 nominal module and ranges", () => {
    expect(nominalXmm("ean13")).toBe(0.33);
    expect(xRangeMm("ean13")).toEqual({ min: 0.264, max: 0.66 });
    expect(xRangeMm("code128")).toEqual({ min: 0.19, max: 1.0 });
  });

  it("gives magnification for EAN/UPC only", () => {
    expect(magnification("ean13", 0.396)).toBe(120);
    expect(magnification("ean13", 0.3387)).toBe(102.6);
    expect(magnification("code128", 0.33)).toBeNull();
  });

  it("converts SVG units to mm", () => {
    // EAN-13 width incl. quiet zones: 113 modules, 2 units each.
    expect(sizeMm(226, 0.33)).toBeCloseTo(37.29, 5);
  });
});

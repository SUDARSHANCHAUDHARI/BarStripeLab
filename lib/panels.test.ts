import { describe, expect, it } from "vitest";
import { PANELS, placeOnPanel } from "@/lib/panels";

// EAN-13 at 100%: 113 modules x 0.33 mm wide, 25.93 mm tall; a shape adds up to ~16 mm.
const EAN13 = { widthMm: 37.29, heightMm: 25.93 };
const EAN13_WITH_SHAPE = { widthMm: 37.29, heightMm: 41.2 };

describe("PANELS", () => {
  it("has the four product panels", () => {
    expect(PANELS.map((panel) => panel.id)).toEqual(["coffee-bag", "can", "box", "tag"]);
  });

  it("keeps every slot inside its panel", () => {
    for (const { slot, widthMm, heightMm } of PANELS) {
      expect(slot.xMm).toBeGreaterThanOrEqual(0);
      expect(slot.yMm).toBeGreaterThanOrEqual(0);
      expect(slot.xMm + slot.widthMm).toBeLessThanOrEqual(widthMm);
      expect(slot.yMm + slot.heightMm).toBeLessThanOrEqual(heightMm);
    }
  });

  it("fits EAN-13 at 100%, with and without a shape, in every slot", () => {
    for (const panel of PANELS) {
      expect(placeOnPanel(panel, EAN13).fits).toBe(true);
      expect(placeOnPanel(panel, EAN13_WITH_SHAPE).fits).toBe(true);
    }
  });

  it("draws art for every panel", () => {
    for (const panel of PANELS) expect(panel.art).toContain("<");
  });
});

describe("placeOnPanel", () => {
  const panel = PANELS[0];

  it("centres the artwork on the slot and rests it on the slot's bottom edge", () => {
    const { xMm, yMm } = placeOnPanel(panel, EAN13);
    expect(xMm).toBeCloseTo(panel.slot.xMm + (panel.slot.widthMm - EAN13.widthMm) / 2, 6);
    expect(yMm).toBeCloseTo(panel.slot.yMm + panel.slot.heightMm - EAN13.heightMm, 6);
  });

  it("reports artwork larger than the slot instead of clipping or throwing", () => {
    expect(placeOnPanel(panel, { widthMm: 192, heightMm: 40 }).fits).toBe(false);
    expect(placeOnPanel(panel, { widthMm: 74.58, heightMm: 51.86 }).fits).toBe(false);
  });
});

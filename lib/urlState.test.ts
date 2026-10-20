import { describe, expect, it } from "vitest";
import { SHAPE_IDS } from "@/lib/shapes";
import { DEFAULT_COLOR_CONFIG, NO_SHAPE_ID, decodeDesign, encodeDesign, type Design } from "@/lib/urlState";

const base: Design = {
  format: "ean13",
  value: "5901234123457",
  shape: SHAPE_IDS[0],
  colorConfig: DEFAULT_COLOR_CONFIG,
  retailSafe: false,
  xMm: 0.33,
  bwrMm: 0,
  panel: "coffee-bag",
};

describe("urlState", () => {
  it("round-trips preset, custom and gradient designs", () => {
    const designs: Design[] = [
      { ...base, format: "code128", value: "AB 12&x", shape: SHAPE_IDS[SHAPE_IDS.length - 1] },
      { ...base, retailSafe: true },
      { ...base, colorConfig: { ...DEFAULT_COLOR_CONFIG, mode: "preset", presetId: "ocean_blue" } },
      { ...base, colorConfig: { ...DEFAULT_COLOR_CONFIG, mode: "custom", solidColor: "#1db954" } },
      {
        ...base,
        colorConfig: {
          ...DEFAULT_COLOR_CONFIG,
          mode: "gradient",
          gradientKind: "radial",
          gradientStops: [
            { offset: 0, color: "#112233" },
            { offset: 1, color: "#445566" },
          ],
        },
      },
    ];
    for (const design of designs) {
      expect(decodeDesign(encodeDesign(design), base)).toEqual(design);
    }
  });

  it("falls back on every field that fails validation", () => {
    const hostile = "f=qr&s=__proto__&c=h-%22%3E%3Cscript%3E";
    expect(decodeDesign(hostile, base)).toEqual(base);
    expect(decodeDesign("c=p-nope", base)).toEqual(base);
    expect(decodeDesign("c=p-__proto__", base)).toEqual(base);
    expect(decodeDesign("c=g-conic-111111-222222", base)).toEqual(base);
    expect(decodeDesign("", base)).toEqual(base);
  });

  it("caps the value length", () => {
    expect(decodeDesign(`v=${"1".repeat(200)}`, base).value).toHaveLength(48);
  });

  it("round-trips xMm, bwrMm and panel", () => {
    const design: Design = { ...base, xMm: 0.396, bwrMm: 0.025, panel: "can" };
    expect(decodeDesign(encodeDesign(design), base)).toEqual(design);
  });

  it("opens links from before this release with defaults, not an error", () => {
    const old = "f=ean8&v=96385074&s=heart&c=p-ocean_blue&r=1";
    const result = decodeDesign(old, base);
    expect(result).toMatchObject({ format: "ean8", value: "96385074", shape: "heart", retailSafe: true });
    expect(result.xMm).toBe(0.33);
    expect(result.bwrMm).toBe(0);
    expect(result.panel).toBe("coffee-bag");
    expect(decodeDesign("f=code128&v=ABC", base).xMm).toBe(0.33);
  });

  it("falls back on an old shape id that no longer exists", () => {
    expect(decodeDesign("s=pineapple-2019", base).shape).toBe(base.shape);
  });

  it("accepts the no-shape choice", () => {
    expect(decodeDesign("s=none", base).shape).toBe(NO_SHAPE_ID);
    expect(decodeDesign(encodeDesign({ ...base, shape: NO_SHAPE_ID }), base).shape).toBe(NO_SHAPE_ID);
  });

  it("clamps x to the format's range and ignores junk", () => {
    expect(decodeDesign("f=ean13&x=5", base).xMm).toBe(0.66);
    expect(decodeDesign("f=ean13&x=0.01", base).xMm).toBe(0.264);
    expect(decodeDesign("f=code128&x=0.1", base).xMm).toBe(0.19);
    expect(decodeDesign("f=code128&x=3", base).xMm).toBe(1);
    expect(decodeDesign("x=abc", base).xMm).toBe(0.33);
    expect(decodeDesign("x=Infinity", base).xMm).toBe(0.33);
  });

  it("clamps b to 0-0.10 and an unknown panel to coffee-bag", () => {
    expect(decodeDesign("b=0.5", base).bwrMm).toBe(0.1);
    expect(decodeDesign("b=-1", base).bwrMm).toBe(0);
    expect(decodeDesign("b=abc", base).bwrMm).toBe(0);
    expect(decodeDesign("p=__proto__", base).panel).toBe("coffee-bag");
    expect(decodeDesign("p=tin", { ...base, panel: "can" }).panel).toBe("coffee-bag");
  });

  it("reads a design from a stored query string without a leading ?", () => {
    expect(decodeDesign(encodeDesign(base), { ...base, value: "" })).toEqual(base);
  });
});

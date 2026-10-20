import { describe, expect, it } from "vitest";
import { SHAPE_IDS } from "@/lib/shapes";
import { DEFAULT_COLOR_CONFIG, decodeDesign, encodeDesign, type Design } from "@/lib/urlState";

const base: Design = {
  format: "ean13",
  value: "5901234123457",
  shape: SHAPE_IDS[0],
  colorConfig: DEFAULT_COLOR_CONFIG,
};

describe("urlState", () => {
  it("round-trips preset, custom and gradient designs", () => {
    const designs: Design[] = [
      { ...base, format: "code128", value: "AB 12&x", shape: SHAPE_IDS[SHAPE_IDS.length - 1] },
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
});

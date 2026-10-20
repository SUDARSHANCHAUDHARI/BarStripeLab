import { describe, it, expect } from "vitest";
import type { ComposedBarcode } from "@/types";
import { withPngDpi, snapPngWidth } from "./png";
import { crc32 } from "./crc32";

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function chunk(type: string, data: number[]): number[] {
  const typeBytes = [...type].map((c) => c.charCodeAt(0));
  const crc = crc32(new Uint8Array([...typeBytes, ...data]));
  const be = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  return [...be(data.length), ...typeBytes, ...data, ...be(crc)];
}

// A 1x1 PNG skeleton: chunk walking does not inflate IDAT, so its body can be anything.
const png = new Uint8Array([
  ...SIGNATURE,
  ...chunk("IHDR", [0, 0, 0, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0]),
  ...chunk("IDAT", [1, 2, 3]),
  ...chunk("IEND", []),
]);

function chunks(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: { type: string; data: Uint8Array; crc: number }[] = [];
  for (let offset = 8; offset < bytes.byteLength; ) {
    const length = view.getUint32(offset);
    out.push({
      type: String.fromCharCode(...bytes.subarray(offset + 4, offset + 8)),
      data: bytes.subarray(offset + 8, offset + 8 + length),
      crc: view.getUint32(offset + 8 + length),
    });
    offset += 12 + length;
  }
  return out;
}

describe("withPngDpi", () => {
  it("inserts one pHYs chunk after IHDR with 11811 ppm at 300 dpi and a valid CRC", () => {
    const out = withPngDpi(png, 300);
    expect([...out.subarray(0, 8)]).toEqual(SIGNATURE);
    const list = chunks(out);
    expect(list.map((c) => c.type)).toEqual(["IHDR", "pHYs", "IDAT", "IEND"]);
    const phys = list[1];
    const view = new DataView(phys.data.buffer, phys.data.byteOffset, phys.data.byteLength);
    expect(phys.data.byteLength).toBe(9);
    expect(view.getUint32(0)).toBe(11811);
    expect(view.getUint32(4)).toBe(11811);
    expect(view.getUint8(8)).toBe(1);
    expect(phys.crc).toBe(crc32(new Uint8Array([0x70, 0x48, 0x59, 0x73, ...phys.data])));
  });

  it("replaces an existing pHYs instead of adding a second", () => {
    const out = withPngDpi(withPngDpi(png, 72), 600);
    const phys = chunks(out).filter((c) => c.type === "pHYs");
    expect(phys).toHaveLength(1);
    expect(new DataView(phys[0].data.buffer, phys[0].data.byteOffset).getUint32(0)).toBe(23622);
  });

  it("rejects bytes that are not a PNG", () => {
    expect(() => withPngDpi(new Uint8Array([1, 2, 3]), 300)).toThrow();
  });
});

describe("snapPngWidth", () => {
  const composed = { viewBox: { width: 226, height: 160 } } as ComposedBarcode;

  it("snaps the module to whole pixels: 300 dpi, X 0.33 mm -> 4 px, X 0.3387 mm", () => {
    const { widthPx, snappedXmm } = snapPngWidth(composed, 0.33, 300);
    expect(snappedXmm).toBeCloseTo(0.3387, 4);
    expect(widthPx).toBe((226 / 2) * 4);
  });

  it("never goes below 1 px per module", () => {
    expect(snapPngWidth(composed, 0.19, 72).widthPx).toBe(113);
  });
});

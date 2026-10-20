import { describe, it, expect } from "vitest";
import { crc32 } from "./crc32";

describe("crc32", () => {
  it("matches the standard check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it("is 0 for no bytes and always unsigned", () => {
    expect(crc32(new Uint8Array())).toBe(0);
    expect(crc32(new Uint8Array([0xff, 0xff, 0xff, 0xff]))).toBeGreaterThanOrEqual(0);
  });
});

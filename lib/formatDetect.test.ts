import { describe, expect, it } from "vitest";
import { detectFormat } from "@/lib/formatDetect";

describe("detectFormat", () => {
  it("accepts a valid EAN-13", () => {
    const result = detectFormat("5901234123457");
    expect(result).toMatchObject({ format: "ean13", normalized: "5901234123457", fix: null });
  });

  it("offers a one-click fix for a wrong check digit", () => {
    const result = detectFormat("5901234123450");
    expect(result.format).toBe("ean13");
    expect(result.normalized).toBeNull();
    expect(result.fix).toBe("5901234123457");
    expect(result.message).toContain("7");
  });

  it("adds the check digit to 12 digits and says so", () => {
    const result = detectFormat("590123412345");
    expect(result).toMatchObject({ format: "ean13", normalized: "5901234123457", fix: null });
    expect(result.message).toMatch(/check digit/i);
  });

  it("reads 12 digits as UPC-A when the last digit is a valid UPC check digit", () => {
    expect(detectFormat("036000291452")).toMatchObject({ format: "upca", normalized: "036000291452" });
  });

  it("reads 12 digits as UPC-A when the caller prefers it", () => {
    expect(detectFormat("590123412345", "upca")).toMatchObject({ format: "upca", normalized: null });
    expect(detectFormat("036000291452", "upca")).toMatchObject({ format: "upca", normalized: "036000291452" });
  });

  it("detects UPC-A and EAN-8 and adds their check digits", () => {
    expect(detectFormat("03600029145")).toMatchObject({ format: "upca", normalized: "036000291452" });
    expect(detectFormat("96385074")).toMatchObject({ format: "ean8", normalized: "96385074" });
    expect(detectFormat("9638507")).toMatchObject({ format: "ean8", normalized: "96385074" });
  });

  it("strips spaces and hyphens from digit input", () => {
    expect(detectFormat("400-638-133-393")).toMatchObject({ format: "ean13", normalized: "4006381333931" });
    expect(detectFormat(" 5901 2341 2345 7 ")).toMatchObject({ format: "ean13", normalized: "5901234123457" });
  });

  it("picks Code 128 when letters or symbols are present", () => {
    const result = detectFormat("HELLO 1");
    expect(result).toMatchObject({ format: "code128", normalized: "HELLO 1", fix: null });
  });

  it("returns a message and no value for empty or unusable input, never throwing", () => {
    for (const input of ["", "   ", "1234567890123456", "12345678901234", "123", "é€", "x".repeat(60)]) {
      const result = detectFormat(input);
      expect(result.normalized).toBeNull();
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("keeps the preferred format and explains a mismatch", () => {
    expect(detectFormat("5901234123457", "code128")).toMatchObject({ format: "code128", normalized: "5901234123457" });
    const result = detectFormat("5901234123457", "ean8");
    expect(result.format).toBe("ean8");
    expect(result.normalized).toBeNull();
    expect(result.message).toMatch(/EAN-8/);
  });
});

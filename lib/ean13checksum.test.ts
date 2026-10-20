import { describe, it, expect } from "vitest";
import {
  calculateEAN13Checksum,
  calculateEAN8Checksum,
  isValidEAN13,
  isValidEAN8,
  isValidCODE128,
  normalizeEAN13,
  normalizeEAN8,
  normalizeCODE128,
} from "./ean13checksum";

describe("calculateEAN13Checksum", () => {
  // Verified against the EAN-13 examples on Wikipedia.
  it("appends the correct check digit (4006381333931)", () => {
    expect(calculateEAN13Checksum("400638133393")).toBe("4006381333931");
  });

  it("appends the correct check digit for an ISBN-13 (9780201379624)", () => {
    expect(calculateEAN13Checksum("978020137962")).toBe("9780201379624");
  });
});

describe("calculateEAN8Checksum", () => {
  // Verified against the EAN-8 example on Wikipedia.
  it("appends the correct check digit (96385074)", () => {
    expect(calculateEAN8Checksum("9638507")).toBe("96385074");
  });
});

describe("isValidEAN13", () => {
  it("accepts a 12-digit partial code", () => {
    expect(isValidEAN13("400638133393")).toBe(true);
  });

  it("accepts a 13-digit code with a valid checksum", () => {
    expect(isValidEAN13("4006381333931")).toBe(true);
  });

  it("rejects a 13-digit code with a wrong checksum", () => {
    expect(isValidEAN13("4006381333939")).toBe(false);
  });

  it("rejects non-numeric or wrong-length input", () => {
    expect(isValidEAN13("abc")).toBe(false);
    expect(isValidEAN13("12345")).toBe(false);
  });
});

describe("isValidEAN8", () => {
  it("accepts a valid 8-digit code", () => {
    expect(isValidEAN8("96385074")).toBe(true);
  });

  it("rejects a wrong checksum", () => {
    expect(isValidEAN8("96385070")).toBe(false);
  });
});

describe("isValidCODE128", () => {
  it("accepts non-empty strings up to 48 chars", () => {
    expect(isValidCODE128("HELLO-123")).toBe(true);
  });

  it("rejects empty or overly long input", () => {
    expect(isValidCODE128("")).toBe(false);
    expect(isValidCODE128("x".repeat(49))).toBe(false);
  });

  it("accepts inner spaces and rejects non-ASCII", () => {
    expect(isValidCODE128("HELLO WORLD")).toBe(true);
    expect(isValidCODE128("héllo")).toBe(false);
    expect(isValidCODE128("emoji😀")).toBe(false);
  });
});

describe("normalize helpers", () => {
  it("normalizeEAN13 strips non-digits and adds a checksum", () => {
    expect(normalizeEAN13("400-638-133-393")).toBe("4006381333931");
  });

  it("normalizeEAN13 returns null for invalid input", () => {
    expect(normalizeEAN13("123")).toBeNull();
  });

  it("normalizeEAN8 adds a checksum to a 7-digit code", () => {
    expect(normalizeEAN8("9638507")).toBe("96385074");
  });

  it("normalizeCODE128 trims and validates", () => {
    expect(normalizeCODE128("  ABC123  ")).toBe("ABC123");
    expect(normalizeCODE128("")).toBeNull();
  });
});

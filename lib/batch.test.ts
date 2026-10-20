import { describe, it, expect, vi } from "vitest";
import { parseBatch } from "./batch";

// A fake that follows the detectFormat contract, so these tests do not depend
// on lib/formatDetect.ts (Task 5). It reports a check-digit fix but, like the
// stub, leaves `normalized` unchecked: parseBatch must validate it itself.
vi.mock("@/lib/formatDetect", async () => {
  const { calculateEAN13Checksum } = await import("@/lib/ean13checksum");
  return {
    detectFormat: (input: string) => {
      const digits = input.replace(/[\s-]/g, "");
      const byLength: Record<number, "ean13" | "ean8" | "upca"> = { 13: "ean13", 12: "ean13", 8: "ean8", 11: "upca" };
      const format = /^\d+$/.test(digits) ? byLength[digits.length] ?? "code128" : "code128";
      const expected = format === "ean13" && digits.length === 13 ? calculateEAN13Checksum(digits.slice(0, 12)) : digits;
      return {
        format,
        normalized: format === "code128" ? input.trim() || null : digits,
        fix: expected !== digits ? expected : null,
        message: "",
      };
    },
  };
});

describe("parseBatch", () => {
  it("reads one value per line and skips blank lines", () => {
    const result = parseBatch("5901234123457\n\n  \n96385074\r\n");
    expect(result.rows).toEqual([
      { line: 1, value: "5901234123457", format: "ean13", normalized: "5901234123457" },
      { line: 4, value: "96385074", format: "ean8", normalized: "96385074" },
    ]);
    expect(result.invalid).toEqual([]);
    expect(result.truncated).toBe(false);
  });

  it("takes the first CSV column (comma, semicolon, tab, quoted)", () => {
    const result = parseBatch('5901234123457,Coffee 250g\n"96385074",Tea\n03600029145;Beans\n4006381333931\tSauce');
    expect(result.rows.map((row) => row.normalized)).toEqual(["5901234123457", "96385074", "036000291452", "4006381333931"]);
  });

  it("normalises hyphens and adds the check digit", () => {
    expect(parseBatch("400-638-133-393").rows[0]).toMatchObject({ value: "400-638-133-393", format: "ean13", normalized: "4006381333931" });
  });

  it("lists a bad check digit as invalid with the reason", () => {
    const { rows, invalid } = parseBatch("5901234123450\n96385075");
    expect(rows).toEqual([]);
    expect(invalid[0]).toMatchObject({ line: 1, value: "5901234123450" });
    expect(invalid[0].reason).toContain("5901234123457");
    // No fix from detection: parseBatch's own check still rejects it.
    expect(invalid[1]).toMatchObject({ line: 2, value: "96385075" });
    expect(invalid[1].reason).not.toBe("");
  });

  it("detects mixed formats per row", () => {
    const { rows } = parseBatch("5901234123457\nHELLO 1\n03600029145");
    expect(rows.map((row) => [row.format, row.normalized])).toEqual([
      ["ean13", "5901234123457"],
      ["code128", "HELLO 1"],
      ["upca", "036000291452"],
    ]);
  });

  it("stops at the limit and says so", () => {
    const lines = (n: number) => Array.from({ length: n }, () => "5901234123457").join("\n");
    const over = parseBatch(lines(501));
    expect(over.rows).toHaveLength(500);
    expect(over.truncated).toBe(true);
    expect(parseBatch(lines(500)).truncated).toBe(false);
    expect(parseBatch(lines(3), 2)).toMatchObject({ truncated: true });
  });

  it("never throws on empty or odd input", () => {
    expect(parseBatch("")).toEqual({ rows: [], invalid: [], truncated: false });
    expect(() => parseBatch('"unterminated,\n,,,\néé')).not.toThrow();
  });
});

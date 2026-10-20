import { describe, it, expect } from "vitest";
import { parseBatch } from "./batch";

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

  it("keeps duplicates as they are", () => {
    expect(parseBatch("5901234123457\n5901234123457").rows).toHaveLength(2);
  });
});

describe("parseBatch header row", () => {
  it("skips a GTIN-13 header above EAN-13 rows and keeps its line number", () => {
    const { rows, invalid } = parseBatch("GTIN-13\n5901234123457\n4006381333931");
    expect(rows.map((row) => [row.line, row.normalized])).toEqual([
      [2, "5901234123457"],
      [3, "4006381333931"],
    ]);
    expect(invalid).toEqual([{ line: 1, value: "GTIN-13", reason: "Header row" }]);
  });

  it("skips a SKU header above Code 128 rows", () => {
    const { rows, invalid } = parseBatch("\nSKU,Name\nBOX-001,Mug\nBOX-002,Cup");
    expect(rows.map((row) => [row.line, row.format, row.normalized])).toEqual([
      [3, "code128", "BOX-001"],
      [4, "code128", "BOX-002"],
    ]);
    expect(invalid).toEqual([{ line: 2, value: "SKU", reason: "Header row" }]);
  });

  it("skips a heading that is not a barcode of the format the rows use", () => {
    const { rows, invalid } = parseBatch('"Product number",Name\n5901234123457,Coffee\n96385074,Tea\n4006381333931,Sauce');
    expect(rows).toHaveLength(3);
    expect(invalid).toEqual([{ line: 1, value: "Product number", reason: "Header row" }]);
  });

  it("leaves a header-less file unchanged", () => {
    const { rows, invalid } = parseBatch("BOX-001\nBOX-002\nBOX-003");
    expect(rows.map((row) => row.normalized)).toEqual(["BOX-001", "BOX-002", "BOX-003"]);
    expect(invalid).toEqual([]);
  });

  it("keeps a numeric first row that is a valid barcode", () => {
    const { rows, invalid } = parseBatch("96385074\nBOX-001\nBOX-002");
    expect(rows.map((row) => [row.line, row.format])).toEqual([
      [1, "ean8"],
      [2, "code128"],
      [3, "code128"],
    ]);
    expect(invalid).toEqual([]);
  });

  it("does not count the header towards the limit", () => {
    const result = parseBatch("EAN13\n5901234123457\n5901234123457", 2);
    expect(result.rows).toHaveLength(2);
    expect(result.truncated).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { createZip } from "./zip";
import { crc32 } from "./crc32";

// Minimal reader: walks the local file headers from the start of the archive.
function readLocalFiles(zip: Uint8Array) {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const files: { name: string; data: Uint8Array; crc: number }[] = [];
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const crc = view.getUint32(offset + 14, true);
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    files.push({
      name: new TextDecoder().decode(zip.subarray(nameStart, nameStart + nameLength)),
      data: zip.subarray(dataStart, dataStart + size),
      crc,
    });
    offset = dataStart + size;
  }
  return files;
}

describe("createZip", () => {
  const encoder = new TextEncoder();
  const files = [
    { name: "5901234123457.svg", data: encoder.encode("<svg>one</svg>") },
    { name: "96385074.svg", data: encoder.encode("<svg>two, longer</svg>") },
  ];

  it("starts with a local file header and ends with the end-of-central-directory record", () => {
    const zip = createZip(files);
    expect([...zip.subarray(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    const eocd = zip.byteLength - 22;
    expect(view.getUint32(eocd, true)).toBe(0x06054b50);
    expect(view.getUint16(eocd + 8, true)).toBe(2);
    expect(view.getUint16(eocd + 10, true)).toBe(2);
    // The central directory offset points at a central directory header.
    const cdOffset = view.getUint32(eocd + 16, true);
    expect(view.getUint32(cdOffset, true)).toBe(0x02014b50);
    expect(cdOffset + view.getUint32(eocd + 12, true)).toBe(eocd);
  });

  it("round-trips two files with valid CRCs", () => {
    const read = readLocalFiles(createZip(files));
    expect(read.map((f) => f.name)).toEqual(files.map((f) => f.name));
    read.forEach((file, i) => {
      expect([...file.data]).toEqual([...files[i].data]);
      expect(file.crc).toBe(crc32(files[i].data));
    });
  });

  it("writes an empty archive as just the end record", () => {
    expect(createZip([]).byteLength).toBe(22);
  });
});

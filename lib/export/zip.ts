import { crc32 } from "./crc32";

// DOS date for 1980-01-01, time 00:00: a fixed stamp keeps the output reproducible.
const DOS_DATE = (1 << 5) | 1;
// General purpose flag bit 11: file names are UTF-8.
const UTF8_FLAG = 0x0800;

// Store-only ZIP (no compression, no ZIP64): fine for a few hundred SVGs.
export function createZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((file) => ({ ...file, nameBytes: encoder.encode(file.name), crc: crc32(file.data) }));
  const localSize = entries.reduce((sum, e) => sum + 30 + e.nameBytes.length + e.data.length, 0);
  const centralSize = entries.reduce((sum, e) => sum + 46 + e.nameBytes.length, 0);
  if (entries.length > 0xffff || localSize + centralSize > 0xffffffff) {
    throw new Error("Too many or too large files for a ZIP without ZIP64");
  }

  const out = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(out.buffer);
  let offset = 0;
  const u16 = (value: number) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const u32 = (value: number) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };
  const bytes = (data: Uint8Array) => {
    out.set(data, offset);
    offset += data.length;
  };

  const localOffsets: number[] = [];
  for (const e of entries) {
    localOffsets.push(offset);
    u32(0x04034b50);
    u16(20); // version needed
    u16(UTF8_FLAG);
    u16(0); // method: store
    u16(0); // time
    u16(DOS_DATE);
    u32(e.crc);
    u32(e.data.length); // compressed size
    u32(e.data.length); // uncompressed size
    u16(e.nameBytes.length);
    u16(0); // extra length
    bytes(e.nameBytes);
    bytes(e.data);
  }

  const centralOffset = offset;
  entries.forEach((e, i) => {
    u32(0x02014b50);
    u16(20); // version made by
    u16(20); // version needed
    u16(UTF8_FLAG);
    u16(0);
    u16(0);
    u16(DOS_DATE);
    u32(e.crc);
    u32(e.data.length);
    u32(e.data.length);
    u16(e.nameBytes.length);
    u16(0); // extra length
    u16(0); // comment length
    u16(0); // disk number
    u16(0); // internal attributes
    u32(0); // external attributes
    u32(localOffsets[i]);
    bytes(e.nameBytes);
  });

  u32(0x06054b50);
  u16(0); // this disk
  u16(0); // disk with the central directory
  u16(entries.length);
  u16(entries.length);
  u32(centralSize);
  u32(centralOffset);
  u16(0); // comment length
  return out;
}

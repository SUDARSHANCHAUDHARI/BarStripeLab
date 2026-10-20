# BarStripeLab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Barkod-like UI with the "Till Check" 4-step flow and an on-the-pack result screen, backed by exact print size, bar width reduction, a decode check, a scan score, PDF/PNG-DPI/ZIP export, a spec sheet and CSV batch.

**Architecture:** The renderer gains a structured layout (`ComposedBarcode`) that every output (SVG, PDF, PNG, decode) draws from. Pure logic lives in `lib/` with node tests; the flow UI lives in `app/` and only calls `lib/` through the interfaces below. Work runs as four parallel packages in separate git worktrees after Task 0 lands the shared contracts as typed stubs.

**Tech Stack:** Next.js static export (15.5 after `chore/next-15` merges; 14.2 on this branch), React, TypeScript, Tailwind 3, bwip-js, vitest. No new runtime dependency unless vetted with `supply-chain-check`.

**Spec:** `docs/superpowers/specs/2026-10-21-barstripelab-redesign-design.md`

## Global Constraints

- Branch base: `feat/real-styles-ai-shortcuts` @ `7d08bfd`. Each package works in its own worktree branch `wt/<package>`; the lead merges.
- Copy never says "guaranteed to scan", "GS1 certified" or "passes verification"; scan check label: "Scan-safety estimate. Not a verification."
- Everything runs in the browser; the only network call is the AI generator to `https://api.anthropic.com` with the user's key.
- CSP unchanged: fonts self-hosted (`font-src 'self'`), no external scripts or styles.
- WCAG 2.2 AA contrast, keyboard for everything, visible focus `#1D4ED8`, `prefers-reduced-motion` turns the sweep into an instant swap.
- Page palette: board `#EDF0EA`, card `#FFFFFF`, ink `#16211C`, ink-2 `#4A5650`, rule `#C9D0C8`, pass `#1F7A4D`/`#E2F0E7`, warn `#B3192E`/`#FBE9EB`, laser `#D7263D` (sweep only). Result stage: mat `#24493F`, grid `#3B675B`, proof `#FBFAF6`, kraft `#C89F70`, cut `#C0186A`, fold `#00739E`.
- Type: Bricolage Grotesque (display), Atkinson Hyperlegible (body), IBM Plex Mono (digits only), all OFL, self-hosted under `public/fonts/`.
- Not Barkod: no `#f5f5f7`, no all-monospace, no square black-bordered chips, sentence case, no controls-left/preview-right tool layout.
- Size semantics: stated size = standard barcode (bars + quiet zones + digits); shape is extra; always show both sizes.
- EAN/UPC: X = 0.330 mm × magnification (80–200%). Code 128: X in mm (0.19–1.00, default 0.33). Stored as `xMm`.
- Engine APIs are extended, never broken: existing tests in `lib/*.test.ts` keep passing.
- Every check: `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` (static export). `next-env.d.ts` changes from builds are reverted, never committed.
- Stage files by name; commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; never push.

## Review Focus

1. Long Code 128 (48 chars) through every output: PDF page size, PNG width, decode, panel placement must not overflow or crash. Owner: Tasks 2, 3, 6.
2. Gradient bars through PDF and decode: PDF samples colour per bar; decode reads luminance; a light stop must be able to fail the decode. Owner: Tasks 2, 3.
3. Bar width reduction at the extremes (0.10 mm at 80%): bars must stay ≥ 1 SVG unit wide and keep their centres; decode must still pass. Owner: Task 2.
4. Ambiguous or broken input in step 1 (12 digits, spaces/hyphens, letters, 14 digits, empty): detection must pick one format, show it, and never throw. Owner: Task 5.
5. Share links from before this release (no `x`, `b`, `p` params; old preset ids) must open the result screen with defaults, not an error. Owner: Task 5.

---

### Task 0 (lead): Shared contracts as typed stubs

**Files:**
- Modify: `types/index.ts` (add the types below)
- Modify: `tailwind.config.js` (add the colour token names and `display`/`body`/`mono` font families from Global Constraints, with system-font fallbacks until Task 6 adds the font files)
- Create: `lib/printSize.ts`, `lib/scanScore.ts`, `lib/decode.ts`, `lib/formatDetect.ts`, `lib/panels.ts`, `lib/batch.ts`, `lib/export/crc32.ts`, `lib/export/pdf.ts`, `lib/export/png.ts`, `lib/export/zip.ts`, `lib/export/specSheet.ts` — each exporting the signatures below with a minimal working stub (simple correct-shape return) so the app compiles.

**Interfaces (produced):**
```ts
// types/index.ts
type BarRect = { x: number; width: number };                 // SVG units, left edge
type DigitText = { text: string; x: number; y: number; size: number; fitWidth?: number };
type ComposedBarcode = {
  viewBox: { width: number; height: number };                // SVG units (BARCODE_SCALE per module)
  barsX: number; barsWidth: number; top: number; barHeight: number;
  bars: BarRect[];                                            // after bar width reduction
  band: { y: number; height: number };                       // protected scan band
  shape: { paths: string[]; fillRule: "nonzero" | "evenodd"; translateX: number; translateY: number; scale: number };
  digits: DigitText[];
  colorConfig: ColorConfig;
  standardSize: { width: number; height: number };            // SVG units: bars + quiet zones + digits
  svg: string;                                                // the rendered SVG (mm width/height when xMm given)
};
type PanelId = "coffee-bag" | "can" | "box" | "tag";
type ScanFactor = { id: "redLight" | "barHeight" | "quietZones" | "printSize" | "digits" | "camera"; label: string; points: number; max: number; message: string };
type ScanScore = { score: number; band: "likely" | "risky" | "fail"; capped: boolean; factors: ScanFactor[] };
```
- `lib/svgComposer.ts`: `composeBarcode(options: ComposeOptions & { xMm?: number; bwrMm?: number }): ComposedBarcode`; `composeBarcodeSvg(options)` stays and returns `composeBarcode(options).svg`.
- `lib/printSize.ts`: `nominalXmm(format: BarcodeFormat): number`; `xRangeMm(format): { min: number; max: number }`; `magnification(format, xMm): number | null` (null for code128); `sizeMm(units: number, xMm: number): number`.
- `lib/scanScore.ts`: `scanScore(input: { composed: ComposedBarcode; format: BarcodeFormat; xMm: number; barModules: number }): ScanScore`.
- `lib/decode.ts`: `decodeScanline(luminance: number[], format: BarcodeFormat): string | null` (pure); `decodeComposed(composed: ComposedBarcode, format: BarcodeFormat): Promise<string | null>` (browser).
- `lib/formatDetect.ts`: `detectFormat(input: string, preferred?: BarcodeFormat): { format: BarcodeFormat; normalized: string | null; fix: string | null; message: string }`.
- `lib/panels.ts`: `PANELS: { id: PanelId; label: string; widthMm: number; heightMm: number; art: string /* SVG inner markup, mm units */; slot: { xMm: number; yMm: number; widthMm: number; heightMm: number } }[]`.
- `lib/batch.ts`: `parseBatch(text: string, limit = 500): { rows: { line: number; value: string; format: BarcodeFormat; normalized: string }[]; invalid: { line: number; value: string; reason: string }[]; truncated: boolean }`.
- `lib/export/crc32.ts`: `crc32(bytes: Uint8Array): number`.
- `lib/export/pdf.ts`: `composedToPdf(composed: ComposedBarcode, xMm: number): Uint8Array`.
- `lib/export/png.ts`: `withPngDpi(png: Uint8Array, dpi: number): Uint8Array`; `snapPngWidth(composed: ComposedBarcode, xMm: number, dpi: number): { widthPx: number; snappedXmm: number }`.
- `lib/export/zip.ts`: `createZip(files: { name: string; data: Uint8Array }[]): Uint8Array` (store-only).
- `lib/export/specSheet.ts`: `specSheetPdf(input: { composed: ComposedBarcode; format: BarcodeFormat; value: string; xMm: number; bwrMm: number; retailSafe: boolean; score: ScanScore; shapeLabel: string }): Uint8Array`.
- `lib/urlState.ts`: `Design` gains `xMm: number`, `bwrMm: number`, `panel: PanelId` (params `x`, `b`, `p`); defaults `xMm = nominalXmm(format)`, `bwrMm = 0`, `panel = "coffee-bag"`.

- [ ] **Step 1:** Add the types and stub files; `composeBarcode` initially wraps today's composer and fills the new fields from values it already computes.
- [ ] **Step 2:** Run `pnpm typecheck && pnpm test` — Expected: clean, 68 tests pass.
- [ ] **Step 3:** Commit `chore: contracts for redesign packages`; create worktrees `wt/engine`, `wt/export`, `wt/flow`, `wt/shell` from it.

---

### Task 1 (package ENGINE): print size and bar width reduction in the composer

**Files:** Modify `lib/svgComposer.ts`, `lib/gs1.ts`; Create `lib/printSize.test.ts`; Test `lib/svgComposer.test.ts`
**Interfaces:** Consumes Task 0 types. Produces real `composeBarcode`, `printSize.ts`.

- [ ] **Step 1: Failing tests**
  - `nominalXmm("ean13") === 0.33`; `xRangeMm("ean13")` → `{min: 0.264, max: 0.66}`; `xRangeMm("code128")` → `{min: 0.19, max: 1.0}`; `magnification("ean13", 0.396) === 120`; `magnification("code128", 0.33) === null`.
  - EAN-13 `5901234123457` at `xMm: 0.33`: `sizeMm(composed.standardSize.width, 0.33)` ≈ 37.29 (±0.01) and `sizeMm(composed.standardSize.height, 0.33)` ≈ 25.93 (±0.3, digit-height dependent); the `svg` root has `width`/`height` in `mm` equal to `sizeMm(viewBox.width/height, xMm)`; without `xMm` the root has no width/height (today's behaviour).
  - `bwrMm: 0.033` at `xMm: 0.33` makes every bar 0.2 SVG units narrower with the same centre; bars never go below 1 SVG unit.
  - Code 128 Retail-safe band ≥ `6.35 mm / xMm × BARCODE_SCALE` units when that exceeds 15% of length.
- [ ] **Step 2:** `pnpm test lib/printSize.test.ts lib/svgComposer.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement; `minBarHeightModules(format, barModules, xMm?)` gains the optional `xMm` for the Code 128 6.35 mm floor.
- [ ] **Step 4:** Tests pass, plus all existing composer/scan-safety tests.
- [ ] **Step 5:** Commit `feat(engine): exact print size and bar width reduction`.

### Task 2 (package ENGINE): decode check

**Files:** Create `lib/decode.ts`, `lib/decode.test.ts`
**Interfaces:** Consumes `ComposedBarcode`. Produces `decodeScanline`, `decodeComposed`.

- [ ] **Step 1: Failing tests** (node): build a luminance array by sampling `composed.bars` along the band at 4 samples per SVG unit (white = 1, bar = luminance of its colour): EAN-13 `5901234123457`, EAN-8 `96385074`, UPC-A `036000291452`, Code 128 `HELLO WORLD` and a 48-char value decode to the input; a bar colour of `#eeeeee` returns `null`; a reversed (mirrored) scanline still decodes EAN/UPC; random noise returns `null`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement `decodeScanline`: threshold at the midpoint of min/max luminance, run-length encode, normalise to modules by the guard pattern (EAN/UPC) or start code (Code 128), decode with the standard tables, verify check digit / Code 128 checksum. No dependency. `decodeComposed` rasterises `composed.svg` via `lib/exportImage.ts` to a canvas and reads the row at `band.y + band.height / 2`.
- [ ] **Step 4:** Pass.
- [ ] **Step 5:** Commit `feat(engine): in-browser decode check`.

### Task 3 (package ENGINE): scan score

**Files:** Create `lib/scanScore.ts`, `lib/scanScore.test.ts`
**Interfaces:** Consumes `ComposedBarcode`, `failsRedLight`, `redLightReflectance`, `lowestBarContrast`, `minBarHeightModules`, `xRangeMm`. Produces `scanScore`.

- [ ] **Step 1: Failing tests** with the spec's weights: black EAN-13 Art at 0.33 mm → score in 75–80, band `"risky"`; same Retail-safe → ≥ 95, `"likely"`; `#ff006e` bars → capped, score ≤ 20, `"fail"`, a `redLight` factor message mentioning red-laser scanners; X 0.20 mm EAN-13 → `printSize` points 0; X 0.255 mm → 5; WCAG contrast < 3 → `camera` −10; gradient with one light stop scored by the worst stop.
- [ ] **Step 2:** Run — FAIL. **Step 3:** Implement per spec section 7. **Step 4:** Pass.
- [ ] **Step 5:** Commit `feat(engine): scan-safety score`.

---

### Task 4 (package EXPORT): PDF, PNG DPI, ZIP, spec sheet, CSV batch parsing

**Files:** Create `lib/export/crc32.ts`, `lib/export/pdf.ts`, `lib/export/png.ts`, `lib/export/zip.ts`, `lib/export/specSheet.ts`, `lib/batch.ts` and a `*.test.ts` next to each.
**Interfaces:** Consumes `ComposedBarcode` (Task 0 shape; works against the stub until merge), `normalizeEAN13/EAN8/UPCA/CODE128`. Produces the export functions listed in Task 0.

- [ ] **Step 1: Failing tests**
  - `crc32(new TextEncoder().encode("123456789")) === 0xCBF43926`.
  - `createZip` output starts with `PK\x03\x04`, ends with an end-of-central-directory record listing the file count; a 2-file zip round-trips through a minimal local-header reader in the test.
  - `withPngDpi(png, 300)` inserts one `pHYs` chunk after `IHDR` with ppm 11811 and a valid CRC; calling it twice replaces, not duplicates.
  - `snapPngWidth` at 300 dpi, X 0.33 → module 4 px, `snappedXmm` ≈ 0.3387.
  - `composedToPdf`: starts `%PDF-1.4`, ends `%%EOF`, xref offsets point at `n 0 obj`, MediaBox equals the artwork size in points (mm × 72/25.4), bars drawn twice (shape clip + band clip), no SVG arc commands left (`a`/`A` converted to curves), gradient bars use per-bar fill colours.
  - `composedToPdf` for a 48-char Code 128 produces a valid file whose MediaBox width matches `sizeMm(viewBox.width, xMm)` (no overflow, no throw).
  - `specSheetPdf` contains the number, format, X mm, magnification, BWR, scan mode and the exact wording "Scan-safety estimate. Not a verification."
  - `parseBatch`: one per line or first CSV column; blank lines skipped; `400-638-133-393` normalised; bad check digit listed in `invalid` with reason; 501 rows → 500 + `truncated: true`; mixed formats detected per row via `detectFormat` (import from Task 5's module path; use its stub until merge).
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement. PDF: hand-written objects (Catalog, Pages, Page, content stream, Helvetica/Courier base-14 for digits), arc-to-Bézier converter for `A/a` and expansion of `H/V/S/Q/T` and relative commands, clip with `W n` / `W* n` per shape fillRule.
- [ ] **Step 4:** Pass. **Step 5:** Commit `feat(export): pdf, png dpi, zip, spec sheet, batch parsing`.

---

### Task 5 (package FLOW): state, detection, the 4 steps, result screen, all-settings sheet

**Files:**
- Create `lib/formatDetect.ts` + test, `lib/panels.ts` + test; Modify `lib/urlState.ts` + test.
- Create `app/components/flow/` — `Flow.tsx` (orchestrates steps and collapsed answer lines), `StepNumber.tsx`, `StepScan.tsx`, `StepShape.tsx` (grid + sweep reveal), `StepResult.tsx`, `ProductPanel.tsx`, `ScanCheck.tsx`, `ExportBar.tsx`, `AllSettings.tsx`, `BatchDialog.tsx`, `GS1Explainer.tsx`.
- Modify `app/components/Generator.tsx` to render `Flow` (or replace it), reuse `AIInput.tsx`, `ShapeThumb.tsx`, `ShareButton.tsx`, `TemplateSelector.tsx`; delete components the flow replaces once nothing imports them.
**Interfaces:** Consumes everything from Tasks 0–4 by name (stubs until merge). Produces `<Flow initialShape?: string mode?: "retail" | "art" />` used by Task 6 pages.

- [ ] **Step 1: Failing tests** (node, pure modules):
  - `detectFormat`: `"5901234123457"` → ean13 valid; `"5901234123450"` → `fix: "5901234123457"`; `"590123412345"` → ean13 with check digit added (rule shown in `message`: 12 digits = EAN-13 without check digit unless `preferred` is `"upca"`); `"03600029145"` → upca; `"96385074"` → ean8; `"HELLO 1"` → code128; `""` and `"1234567890123456"` → `normalized: null` with a message, never throws.
  - `urlState`: round-trips `xMm`, `bwrMm`, `panel`; old links without them get defaults; `x` outside the format's range clamps; `b` clamps to 0–0.10; unknown `p` → `"coffee-bag"`.
  - `PANELS` has 4 entries; every slot fits inside its panel; EAN-13 at 100% fits every slot.
- [ ] **Step 2:** Run — FAIL. **Step 3:** Implement the pure modules.
- [ ] **Step 4:** Build the UI per spec 5.1–5.6 and 5.8: home = step 1 with number field and live check; step 2 two choices + folded size control (% for EAN/UPC, mm for Code 128); step 3 shape grid with category filter, "No shape", templates and AI under "Need ideas?", sweep reveal (CSS clip-path animation, reduced-motion swap); step 4 product panel on the mat stage with both sizes stated, `ScanCheck` showing score, band words and factor messages, decode result, downloads (SVG, PDF, PNG with DPI choice, Copy SVG, spec sheet, share, CSV batch dialog); finished steps collapse to one editable line; `/` and header "All settings" open the compact two-column sheet; share link and `localStorage` "Continue where you left off" (try/catch) open straight to the result.
- [ ] **Step 5:** Verify `pnpm test && pnpm typecheck && pnpm lint && pnpm build` clean; commit `feat(flow): till-check flow with on-the-pack result`.

---

### Task 6 (package SHELL): visual system, fonts, site shell, pages

**Files:** Modify `tailwind.config.js`, `app/globals.css`, `app/layout.tsx` (body/fonts only; metadata untouched except new page metadata), `app/components/SiteHeader.tsx`, `app/components/SiteFooter.tsx`, `app/components/InfoSections.tsx`, `app/page.tsx`, `app/shape/[id]/page.tsx` (body copy only), `app/sitemap.ts`; Create `public/fonts/*` (+ OFL licence files), `app/barcode-tattoo/page.tsx`, `app/components/Faq.tsx`.
**Interfaces:** Consumes `<Flow />` from Task 5 (render the current `Generator` until merge). Produces Tailwind tokens `board, card, ink, ink-2, rule, pass, pass-bg, warn, warn-bg, laser, focus, mat, mat-grid, proof, kraft, cut, fold` and font families `display, body, mono`, used by Task 5 — Task 0 adds these token names to `tailwind.config.js` so Task 5 can use them from the start.

- [ ] **Step 1:** Download the three OFL font families from their official repos (Google Fonts GitHub) as woff2 subsets (Latin), verify licences, add `@font-face` with `font-display: swap`.
- [ ] **Step 2:** Implement header (logo, Shapes, Templates, Many barcodes (CSV), Do I need a GS1 number?, All settings), footer with shape credits, home below-the-fold (why trust it, how Retail-safe works, FAQ: GS1 number, sizes, colours, scanners, Amazon), `/barcode-tattoo` (Art default, Code 128 for names and dates), shape page copy with suited industries, sitemap entry for the tattoo page. All copy in sentence case, honest wording per Global Constraints.
- [ ] **Step 3:** Verify build lists `/barcode-tattoo`, CSP still satisfied (no external font/style URLs in `out/`: `grep -r "fonts.googleapis\|fonts.gstatic" out` returns nothing), contrast of every token pair used for text ≥ 4.5:1 (script check).
- [ ] **Step 4:** Commit `feat(shell): visual system, self-hosted fonts, pages`.

---

### Task 7 (lead): integrate, verify, evaluate

- [ ] **Step 1:** Merge `wt/engine`, `wt/export`, `wt/flow`, `wt/shell` into the feature branch; resolve conflicts; replace any remaining stubs.
- [ ] **Step 2:** `pnpm test && pnpm typecheck && pnpm lint && pnpm build` — all clean; record counts.
- [ ] **Step 3:** In the owner's Chrome (plain osascript, own tab by id): run the flow for EAN-13, UPC-A, EAN-8, a 48-char Code 128; Retail-safe and Art; a red colour (warning + capped score); BWR 0.10 at 80%; download SVG/PDF/PNG/ZIP and check file headers and sizes on disk; reload an old-format share link; mobile width via a narrow window is the owner's check (no viewport automation).
- [ ] **Step 4:** Dispatch the `evaluator` agent on the whole diff against the spec; loop until PASS.
- [ ] **Step 5:** Update README, STATUS, CHANGELOG; commit; ask the owner before pushing or opening the PR.

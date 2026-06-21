# Status — BarStripeLab

**Last updated:** 2026-06-21
**Maturity:** 🟢 `status-production-ready`

## What's done

- Barcode generation via `bwip-js`: EAN-13, EAN-8, CODE 128
- Style overlays + color presets (artEngine, styleEngine, shapeRenderer, colorEngine, colorPresets)
- SVG composer + downloadable PNG export
- AI-driven style generator
- Templates + column mapper
- Keyboard shortcuts
- Share button
- API key input UI
- ESLint configured (was missing — `next lint` had been prompting interactively)
- 15 tests for `lib/ean13checksum.ts` — checksum calculation, validation, normalization. EAN test vectors verified against the Wikipedia EAN-13 / EAN-8 reference examples (4006381333931, 9780201379624, 96385074)
- Build, lint (0 errors), typecheck, tests all green

## What's left

- **2 pre-existing lint warnings** (not blocking): `<img>` should be `next/image` in BarcodeCanvas, missing `useEffect` dep on `page.tsx:128`. Worth addressing but not regressions.
- **Live deploy** via existing `pnpm deploy:gh` (GitHub Pages static export) — zero env vars needed
- Optional: tests for the style/art/color engines (currently only the EAN checksum module is unit-tested)

## Quality gates

| Gate | Status |
|---|---|
| Build | ✅ |
| Lint | ✅ 0 errors (2 warnings, pre-existing) |
| Typecheck | ✅ |
| Tests | ✅ 15 / 1 suite |

## Deployment

Not yet deployed. `pnpm deploy:gh` is wired up for **GitHub Pages** (uses `gh-pages` to publish `out/`).

## File-by-file checklist

### App shell
- [x] `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/error.tsx` — full editor UI

### Components (`app/components/`)
- [x] `BarcodeCanvas.tsx` — barcode render surface (uses `<img>` — flagged as lint warning)
- [x] `Controls.tsx` — primary editor controls
- [x] `DownloadButton.tsx` — PNG / SVG export
- [x] `ColorPanel.tsx` — color picker + presets
- [x] `TemplateSelector.tsx` — style template chooser
- [x] `ShareButton.tsx` — share link
- [x] `AIInput.tsx` — AI style prompt input
- [x] `KeyboardShortcutsInfo.tsx` — shortcuts panel

### Lib
- [x] `lib/barcode.ts` — bwip-js wrapper
- [x] `lib/ean13checksum.ts` — EAN-13 / EAN-8 / CODE128 checksum logic (verified against Wikipedia vectors)
- [x] `lib/colorEngine.ts`, `lib/colorPresets.ts` — color handling
- [x] `lib/styles.ts`, `lib/styleEngine.ts` — style application
- [x] `lib/templates.ts` — style templates
- [x] `lib/artEngine.ts` — composition engine
- [x] `lib/svgComposer.ts` — SVG assembly
- [x] `lib/shapeRenderer.tsx` — shape primitives
- [x] `lib/columnMapper.ts` — column mapping
- [x] `lib/aiStyleGenerator.ts` — AI style integration
- [x] `lib/useKeyboardShortcuts.ts` — keyboard hooks

### Types
- [x] `types/index.ts`

### Tests
- [x] `lib/ean13checksum.test.ts` — 15 tests

### Quality + scaffolding
- [x] ESLint configured (0 errors, 2 pre-existing warnings)
- [x] `typecheck` + `test` scripts
- [x] Build + lint + typecheck green
- [x] `pnpm deploy:gh` wired for GitHub Pages static export

### Not done (small)
- [ ] Fix `<img>` → `next/image` in `BarcodeCanvas.tsx` (lint warning)
- [ ] Fix missing `useEffect` dep in `app/page.tsx:128` (lint warning)
- [ ] Tests for style / art / color engines (currently only EAN checksum module is unit-tested)
- [ ] Live deploy via `pnpm deploy:gh` (zero env vars needed)

## Categorized work remaining

| Item | Effort | Bucket | Blocker | Priority |
|------|--------|--------|---------|----------|
| Fix `<img>` → `next/image` in `BarcodeCanvas.tsx` | ~30m | 🟦 Pure code | none | P3 |
| Fix missing `useEffect` dep at `app/page.tsx:128` | ~15m | 🟦 Pure code | none | P3 |
| Add tests for `styleEngine`, `colorEngine`, `artEngine` | ~3h | 🟦 Pure code | none | P2 |
| Deploy to your domain via `pnpm deploy:gh` | ~15m | 🔑 Needs hosting | GitHub Pages already in place; or use static output for your host | P1 |

## Release plan

1. **Polish:** address the 2 lint warnings and add the engine tests (each warning is one-line; tests are bounded).
2. **Deploy:**
   - Easy path: `pnpm deploy:gh` publishes the static export to GitHub Pages
   - Custom domain: add a `CNAME` file inside `out/` (or set in repo Settings → Pages) before deploy
   - Custom host: `pnpm export` then `rsync out/ user@host:/path/`
3. **Tag release:** `gh release create v1.0.0 --title "BarStripeLab v1.0.0 — barcode art generator"`

### Deploy prerequisites
**None for the basic flow.** Optional:
- Your custom domain pointing at GitHub Pages (or wherever you deploy)
- AI provider key only if using the AI style generator feature

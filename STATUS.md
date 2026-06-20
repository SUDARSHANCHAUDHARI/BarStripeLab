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

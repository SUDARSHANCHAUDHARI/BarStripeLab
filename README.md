# BarStripeLab

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Release](https://img.shields.io/badge/release-production%20candidate-orange.svg)](RELEASE_MEMORY.md)

Artistic barcode generator that turns EAN-style barcodes into brandable, scannable assets with custom overlays, colors, and SVG/PNG export.

> **Status:** Production web candidate · build verified · final release needs scanner-app QA and live Cloudflare Pages URL

## Why This Exists

Most barcode tools produce plain utility output. BarStripeLab explores a practical middle ground: keep barcode scan safety while adding enough art direction for packaging, brand mockups, and visual experiments.

## Status

| Item | State |
|---|---|
| Release type | Production web candidate |
| Build | Verified |
| Deployment target | Cloudflare Pages |
| Manual QA | Scanner tests pending |
| Last verified | 2026-06-04 |

## Key Technical Decisions

**EAN safety is protected by preserving scan-critical regions.** The app keeps the bottom scan area untouched so visual styling does not fully override barcode readability.

**SVG and PNG exports serve different production needs.** SVG gives scalable artwork; PNG gives high-resolution export for quick previews and sharing.

**The app is self-contained.** Barcode generation and export happen in-browser without requiring accounts, server storage, or user data.

**Cloudflare Pages is the intended production host.** The app builds as a lightweight web app with static headers and no backend dependency.

## Features

- artistic barcode styling
- 12-digit input with EAN-13 checksum support
- 13-digit barcode input support
- style presets such as wave, mountain, and city concepts
- color customization
- SVG export
- high-resolution PNG export
- responsive desktop/mobile interface

## Getting Started

```bash
pnpm install
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Deployment

| Setting | Value |
|---|---|
| Release scope | Production web candidate |
| Framework preset | `Next.js` |
| Build command | `pnpm build` |
| Build output directory | `out` |
| Node version | `20.19.6` |

After deployment, add the live URL here and run scanner QA against real exported barcodes.

## Verification

```bash
pnpm build
pnpm exec tsc --noEmit
```

Manual release checks:

- generate a 12-digit barcode and verify checksum behavior
- generate a 13-digit barcode
- export SVG
- export PNG
- scan several generated outputs with real scanner apps
- test desktop and mobile layout

## Known Limits

- Artistic overlays can reduce scan reliability if pushed too far.
- Final production launch should include real scanner-app validation.
- No backend persistence or saved style history yet.

## Author

Built by **Sudarshan Chaudhari** — SudarshanTechLabs.

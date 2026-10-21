# Changelog

All notable changes to BarStripeLab are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-10-21

### Added
- Phone-read check: the scan check reads the artwork with ZXing at phone-camera sizes and warns when a scan line through the shape could show a different number.
- Shape-mask renderer: the bars are cut into one of 46 shapes (Phosphor Icons, MIT; game-icons.net, CC BY 3.0), with a protected full-height band and standard quiet zones.
- UPC-A and Code 128 next to EAN-13 and EAN-8.
- A page per shape at `/shape/<id>`, and shareable links that encode the full design.
- Low-contrast warning and direct SVG-to-PNG export.
- AI style generator using `claude-opus-5-5` with the visitor's own Anthropic key, sent only to api.anthropic.com.
- Production metadata for https://barstripelab.sudarshantechlabs.com: canonical URLs, Open Graph and Twitter cards, and a 1200x630 `og-image.png` drawn by the app's own renderer.
- Generated `sitemap.xml` (home and every shape page) and `robots.txt`.
- Content-Security-Policy and Permissions-Policy in `public/_headers`.
- Four-step flow: number (live check-digit validation and format detection), where it will be scanned, shape (46 shapes), and the result on a product panel (coffee bag, can, box or swing tag).
- "All settings" sheet, opened from the header or with the `/` key.
- Exact print size: EAN-13, EAN-8 and UPC-A from 80% to 200% (X = 0.330 mm times the magnification); Code 128 X from 0.19 mm to 1.00 mm.
- Bar width reduction from 0 to 0.10 mm, for ink spread.
- In-browser decode check of the rendered barcode.
- Scan-safety estimate from 0 to 100 (`lib/scanScore.ts`), with a red-laser colour check.
- Retail-safe mode: every bar stays at full height, and the shape sits above the band.
- Export as SVG and PDF at the exact printed size, PNG at 150, 300 or 600 dpi with the dpi written into the file, and a spec-sheet PDF for the printer.
- CSV batch: up to 500 numbers, downloaded as a ZIP of SVG files (PDF optional).
- Share links carry the full design in the parameters `f`, `v`, `s`, `c`, `r`, `x`, `b` and `p`.
- `/barcode-tattoo` page, which opens in Art mode.
- Self-hosted fonts in `public/fonts` (Bricolage Grotesque, Atkinson Hyperlegible Next, IBM Plex Mono), licensed under the SIL Open Font License.

### Changed
- UI redesign: the guided Till Check flow replaces the single-page tool, with a new visual system.
- Colour presets `ink_navy` and `deep_teal` replace `sunset_orange` and `neon_pink`. Orange and pink look white to red-laser scanners.
- Next.js 14.2 to 15.5, React 18 to 19, vitest 3 to 4.1.12 (security advisories); all pinned exactly.
- Node version pinned to 20.19.6 in `.nvmrc`, matching Cloudflare Pages.
- Canonical URLs, social cards, the sitemap and robots use the custom domain https://barstripelab.sudarshantechlabs.com.
- `.env.example` now documents that no environment variables are needed.
- README and STATUS rewritten for the current product and Cloudflare Pages deployment.

### Removed
- The `start`, `export` and `deploy:gh` scripts. `next start` does not work with a static export, and GitHub Pages is not used.
- The style overlay engine (wave, mountain, city and similar styles), replaced by shapes.
- `GITHUB_PAGES_SETUP.md`, `DEPLOY.md`, `QUICKSTART.md`, `PROJECT_SUMMARY.md` and `RELEASE_MEMORY.md`, which described GitHub Pages deployment and the old style engine. README covers setup and deployment.
- Unused `html-to-image` and `gh-pages` dependencies.

### Fixed
- Bars wider than one module were drawn 0.5 to 1.5 modules off their true position (all formats).
- Colours are sanitised before they are written into the SVG.
- Input limits per format.
- CSV header rows are skipped instead of becoming barcodes.
- No sideways scroll on phones (header at 360 to 390 px).

## [1.0.0] - 2026-04-15

### Added
- ✨ Barcode generation with bwip-js
- 🎨 5 artistic styles (wave, mountain, city, minimal, flowing)
- 🎁 6 pre-made templates (Spotify, Coffee, Tech, Ocean, Forest, Sunset)
- 📥 SVG export
- 📥 PNG export (4x pixel ratio)
- 🤖 AI style generator (beta, keyword-based)
- ✅ EAN-13 validation with auto-checksum
- 📱 Mobile responsive design
- 🎯 Real-time preview
- 🛡️ Error boundary & error handling
- 🚀 GitHub Actions CI/CD pipeline

### Features
- Input validation (12-13 digit barcodes)
- Automatic EAN-13 checksum generation
- Safe scan zone preservation (bottom 35%)
- Custom color support
- Debounced input (300ms)
- Loading states
- Error messages
- Template quick-select

### Tech
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- bwip-js for barcode generation
- html-to-image for PNG export

### Documentation
- README.md - Complete user guide
- QUICKSTART.md - 2-minute setup
- DEPLOY.md - Deployment options
- PROJECT_SUMMARY.md - Technical reference
- This changelog

### Deployment
- GitHub Pages ready (via `pnpm deploy:gh`)
- Self-hostable on any Node-capable host
- Docker support

## [Planned Features]

### Phase 2
- [ ] Enhanced AI style generation (OpenAI)
- [ ] Save/export design history
- [ ] More template styles
- [ ] Improved alignment engine

### Phase 3
- [ ] User accounts & authentication
- [ ] Cloud storage for designs
- [ ] Design sharing & social features
- [ ] Analytics dashboard
- [ ] API access

### Phase 4
- [ ] Shopify integration
- [ ] White-label solution
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Versioning

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes & improvements

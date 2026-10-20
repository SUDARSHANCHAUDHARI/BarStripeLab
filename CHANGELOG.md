# Changelog

All notable changes to BarStripeLab are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Shape-mask renderer: the bars are cut into one of 46 shapes (Phosphor Icons, MIT; game-icons.net, CC BY 3.0), with a protected full-height band and standard quiet zones.
- UPC-A and Code 128 next to EAN-13 and EAN-8.
- A page per shape at `/shape/<id>`, and shareable links that encode the full design.
- Low-contrast warning and direct SVG-to-PNG export.
- AI style generator using `claude-opus-5-5` with the visitor's own Anthropic key, sent only to api.anthropic.com.
- Production metadata for https://barstripelab.pages.dev: canonical URLs, Open Graph and Twitter cards, and a 1200x630 `og-image.png` drawn by the app's own renderer.
- Generated `sitemap.xml` (home and every shape page) and `robots.txt`.
- Content-Security-Policy and Permissions-Policy in `public/_headers`.

### Changed
- Brutalist UI redesign.
- Node version pinned to 20.19.6 in `.nvmrc`, matching Cloudflare Pages.
- `.env.example` now documents that no environment variables are needed.
- README and STATUS rewritten for the current product and Cloudflare Pages deployment.

### Removed
- The `start`, `export` and `deploy:gh` scripts. `next start` does not work with a static export, and GitHub Pages is not used.
- The style overlay engine (wave, mountain, city and similar styles), replaced by shapes.
- `GITHUB_PAGES_SETUP.md`, `DEPLOY.md`, `QUICKSTART.md`, `PROJECT_SUMMARY.md` and `RELEASE_MEMORY.md`, which described GitHub Pages deployment and the old style engine. README covers setup and deployment.

### Fixed
- Colours are sanitised before they are written into the SVG.
- Input limits per format.

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
- [ ] Batch barcode generator
- [ ] More template styles
- [ ] Improved alignment engine
- [ ] Code128 barcode support

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

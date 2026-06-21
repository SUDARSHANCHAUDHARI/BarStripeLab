# Changelog

All notable changes to BarStripeLab are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

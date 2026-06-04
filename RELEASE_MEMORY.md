# Release Memory: BarStripeLab
_Last updated: 2026-06-04_

## Current Status

BarStripeLab is the best next production web release after the already-live projects. It is a self-contained Next.js app for artistic, scannable barcode generation with export support.

Known verification: `pnpm build` and `pnpm exec tsc --noEmit` passed on 2026-06-04. The latest `pnpm build` also confirmed static output with `out/index.html` and `out/_headers`.

## Release Target

Production web release on Cloudflare Pages with a custom domain.

## Success Criteria

- Production build passes.
- Main barcode generation flow works on desktop and mobile.
- SVG and PNG exports work.
- Generated barcodes scan reliably with real scanner apps.
- Production URL is added to README.

## Ordered Plan

1. Run `pnpm build`.
2. Run `pnpm lint` if configured and not blocked by legacy Next lint behavior.
3. Manually test 12-digit and 13-digit EAN flows.
4. Test templates, AI-style keyword presets, color customization, SVG export, and PNG export.
5. Scan several generated barcodes with real scanner apps.
6. Deploy to Cloudflare Pages.
7. Add live URL and launch notes to README.

## Risks

- Barcode art may make some outputs less scannable.
- Cloudflare Pages needs build command `pnpm build`, output directory `out`, and Node 18.17.0 or newer.
- Existing untracked `CLAUDE_TASKS.md` should not be accidentally committed unless wanted.

## First Task

Run scanner-focused manual QA, then deploy.

## Latest Prep Notes

- Added README release status note.
- Added Cloudflare Pages deployment instructions and static `_headers`.
- Standalone `next lint` is not configured and prompts interactively; use build/typecheck as current release gate until ESLint is migrated.
- Polished README with production-candidate status, technical decisions, setup, deployment, verification, scanner QA, known limits, and author section.

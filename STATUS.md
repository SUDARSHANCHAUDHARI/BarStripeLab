# Status — BarStripeLab

Last updated: 2026-10-21

## Where it is

The live site at https://barstripelab.sudarshantechlabs.com (also served at barstripelab.pages.dev) is built by Cloudflare Pages from `main`. The Cloudflare setting is in the dashboard, so it is not checked from this repo.

Version 2.0.0 is on `main`. The home page is a four-step flow. It takes a number, asks where the barcode will be scanned, lets you pick one of 46 shapes, and shows the result on a product panel: a coffee bag, a can, a snack box or a swing tag.

Retail-safe mode is the default. It keeps every bar at full height along the bottom band, and the shape sits above it. Art mode shortens the bars so the shape can take more room. Art mode is for phones and looks, not for strict checkout scanners.

Each design gets a scan-safety estimate from 0 to 100, an in-browser decode check and, for shaped barcodes, a phone-read check with ZXing that warns when a scan line through the shape could read a different number. The estimate is a heuristic, not a GS1 verification.

Exports are SVG and PDF at the exact printed size, PNG at 150, 300 or 600 dpi, a spec-sheet PDF, and a ZIP of up to 500 barcodes from a list or CSV. A share link holds the whole design.

The AI generator uses `claude-opus-5-5` with the visitor's own Anthropic key. The key is sent only to api.anthropic.com.

There is a `/barcode-tattoo` page that opens in Art mode. Every shape has its own page. The sitemap lists the home page, the tattoo page and the 46 shape pages.

Fonts are self-hosted in `public/fonts` under the OFL.

`public/_headers` adds a Content-Security-Policy and a Permissions-Policy next to the existing security headers. On 2026-10-21 the live site served them, and the full flow, the decode check, the fonts and the AI generator's call to api.anthropic.com all worked under that policy in Chrome.

On 2026-10-21, `pnpm test` passed 164 tests in 18 files, `pnpm typecheck` and `pnpm lint` passed, and `pnpm build` produced the static export on Next.js 15.5.

## Not yet verified

- No exported barcode has been scanned with a real scanner or phone app. This matters most in Art mode, where the bars are shorter than the GS1 minimum.
- The in-browser decode check reads the rendered pixels. It has not been compared with a real scanner.
- The phone-read check has not been compared with real phone scanner apps.
- Social previews (Open Graph and Twitter cards) have not been checked with the platforms' validators.
- The mobile layout was checked in a narrow desktop window at 360 and 390 px, not on real phones.
- The shape credits in `THIRD_PARTY_NOTICES.md` have not been checked against the upstream sources. The Phosphor version number there is not checked against the copied paths.

## Next

- Scan printed exports (SVG, PDF and PNG) of each format with several scanner apps.
- Load the production site with the browser console open and check for CSP violations, including the AI generator call and the PNG export.
- Decide on branch `chore/next-15`. It upgrades Next.js to 15.5 and React to 19, and removes `gh-pages` and `html-to-image` from `package.json`. It has no pull request yet.
- Remove `html-to-image` from `package.json` on `feat/real-styles-ai-shortcuts`. No source file imports it now.

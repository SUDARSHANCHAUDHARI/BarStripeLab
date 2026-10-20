# Status — BarStripeLab

Last updated: 2026-10-20

## Where it is

BarStripeLab is live on Cloudflare Pages at https://barstripelab.pages.dev. Cloudflare builds and deploys it from `main`.

The app turns EAN-13, EAN-8, UPC-A and Code 128 barcodes into 46 shapes. The shape renderer keeps a protected band at full bar height and adds standard quiet zones on both sides.

Exports are SVG and PNG. Designs are encoded in the URL, so a link reproduces the exact barcode.

The optional AI generator uses `claude-opus-5-5` with the visitor's own Anthropic key. The key is sent only to api.anthropic.com.

Every shape has its own page. The home page and all shape pages have canonical URLs, Open Graph and Twitter cards, and are listed in `/sitemap.xml`.

`public/_headers` adds a Content-Security-Policy and a Permissions-Policy next to the existing security headers.

Tests, typecheck, lint and the static build pass locally. The suite has 61 tests in 5 files.

## Not yet verified

- No exported barcode has been scanned with a real scanner or phone app yet. This matters most for the shapes that leave few bars above the protected band.
- The Content-Security-Policy has not been checked in a real browser on Cloudflare Pages. Local servers do not apply `_headers`.
- Social previews (Open Graph and Twitter cards) have not been checked with the platforms' validators.

## Next

- Scan printed and on-screen exports of every format with several scanner apps.
- Load the production site with the browser console open and confirm there are no CSP violations, including the AI generator call and PNG export.
- Upgrade Next.js 14 to 15.
- Remove the unused `gh-pages` dev dependency.

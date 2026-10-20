# BarStripeLab redesign: "Till Check" flow with an on-the-pack result

Date: 2026-10-21. Status: draft for owner approval.

## 1. Intent and why

BarStripeLab becomes a **free, trustworthy barcode generator with shapes as the twist**. The owner chose this after seeing the research (2026-10-20/21):

- Search demand is plain generation: "barcode generator" ~301k searches/month in the US, "upc generator" ~33k, "free barcode generator" ~27k. Decorative phrases are too small to measure.
- barkod.studio (the closest competitor, shapes-first) shows novelty traffic: 15-second visits, 1.02 pages per visit, 65% bounce (SimilarWeb, Sept 2026).
- The people who pay for decorated barcodes are packaging designers working for indie food & drink brands (craft beer, coffee, snacks, sauces). Agencies charged USD 200–375 per design and sold *scan safety*, not decoration.
- The common fear is a barcode that fails at the checkout: retailer chargebacks, Amazon fees (3% of cost per unit), relabeling.
- GS1 officially does not endorse decorated barcodes (GS1 FAQ, 2024-08-30), so the product must be honest about it.

The current UI (a near-copy of barkod.studio's look) is replaced entirely. The engine work already on `feat/real-styles-ai-shortcuts` stays: 46 licensed shapes, the mask renderer with quiet zones, Retail-safe mode, the red-laser colour check, the AI generator, share links, shape pages.

Research files (not in the repo): `scratchpad/research/users-search.md`, `users-market.md`, `users-workflow.md`, `specs.md`, `market.md`.

## 2. Users

1. **First-timer (most traffic).** Searched "barcode generator" or "upc generator". Often a small seller moving onto Amazon or into shops, unsure whether they need a GS1 number, what size to print, or whether it will scan. Wants a correct file in under a minute.
2. **Packaging designer (highest value).** Works for an indie food & drink brand. Needs an exact-size vector file, on-brand, that won't fail at the till. Hands it to a printer.
3. **Novelty user (secondary).** Tattoo, gift, wedding. Doesn't need retail scanning. Served by Art mode and a separate page, never the main message.

## 3. Goals, non-goals, anti-goals

Goals:
- A first-timer gets a correct, scannable file in under a minute, with confidence.
- A designer gets exact-size vector output with the settings printers expect.
- Shapes are the memorable moment, not the entry point.
- The look is clearly BarStripeLab's own, not Barkod's.

Non-goals (this release): accounts or saved projects; QR codes; EPS output; CMYK/spot-colour output; a GS1 number shop; real ISO grading.

Anti-goals (a failure even if it works):
- Any claim like "guaranteed to scan", "GS1 certified", "passes verification".
- Looking like barkod.studio (light gray #f5f5f7, all-monospace, square black-bordered chips, all caps, controls-left/preview-right).
- A long settings form as the first thing people see.
- Sending the user's number or design to any server (everything runs in the browser; the only network call is the optional AI generator to api.anthropic.com with the user's own key).

## 4. Constraints

- Next.js static export on Cloudflare Pages (`main` deploys `barstripelab.pages.dev`). No backend. Base: Next 15.5 + React 19 (branch `chore/next-15`, PR 3) is expected to merge first or alongside.
- No new runtime dependencies without `supply-chain-check`. PDF, PNG DPI and ZIP are hand-written unless a vetted package is clearly cheaper (see 9).
- CSP in `public/_headers` stays strict: self-hosted fonts (`font-src 'self'`), `connect-src` only `'self'` and `https://api.anthropic.com`.
- Accessibility: WCAG 2.2 AA contrast, keyboard for everything, visible focus, `prefers-reduced-motion` respected (the scan sweep becomes an instant swap).
- The engine's public APIs (`composeBarcodeSvg`, `lib/shapes.ts`, `lib/colorEngine.ts`, `lib/gs1.ts`, `lib/urlState.ts`) are extended, not rewritten.

## 5. Experience (decided with the owner)

Structure comes from the "Till Check" concept; the result screen comes from the "On the Pack" concept. Reference mockups (static, not code to copy): `scratchpad/brainstorm/.../content/concept-flow.html` and `concept-pack.html`.

### 5.1 Home = step 1: the number
- Headline: "Make a barcode that scans at the checkout." Sub: type the number from your packaging or GS1 certificate; it is checked as you type.
- One large number field. The format (EAN-13, EAN-8, UPC-A, Code 128) is detected from what is typed and shown as a small editable label; the user can override it.
- Check digit validated live. A wrong last digit shows the correct one with a one-click fix. 12 digits get the check digit added (existing behaviour).
- "I don't have a number yet" opens a short GS1 explainer (US: a single GTIN costs $30 from GS1; reseller codes often get rejected by Amazon) and a "use a sample number" link.
- Primary button: "Make my barcode".

### 5.2 Step 2: where it will be scanned
- Two plain choices: "In shops or on Amazon" → **Retail-safe** (default), "Only on phones, or just for looks" → **Art**. One-line explanation under each (Retail-safe: full-height bars, shape sits on top; Art: more shape, phones read it, strict checkout scanners may not).
- Print size is folded away at 100% (EAN-13 37.29 × 25.93 mm), with "change size" opening the size control (80–200%).

### 5.3 Step 3: the shape reveal (the memorable moment)
- The user's plain barcode is shown first. Choosing a shape (grid of 46, filterable by category, plus "No shape") triggers the **scan sweep**: a red line moves up the barcode and the shape appears behind it.
- Reduced motion: no sweep, a direct swap.
- Templates and the AI style generator live here as secondary options ("Need ideas?").

### 5.4 Step 4: result on your product + download
- The barcode appears **on a product panel**: coffee bag, can label, snack box or swing tag (chooser above the panel). The panel is drawn as simple line art on a cutting-mat stage with a die-line feel (cut line, fold line, mm ruler) and the barcode placed at its true proportion to the panel at the chosen print size.
- The page does not claim on-screen 1:1 size (screens vary); it states the printed size in mm/in next to the panel.
- Beside or under the panel: the **scan check** (see 7) in plain words, colour warnings, and the honest line "This is a scan-safety estimate, not a GS1 verification. Test a printed sample."
- Downloads: SVG and PDF at exact size (primary), PNG at a chosen DPI, Copy SVG, share link, and "Many barcodes (CSV)".
- Each finished step above collapses to a one-line editable answer ("Number: 5901234123457 ✓ · Shops · 100% · Cat"), so going back is one click.

### 5.5 All settings (experts)
- "All settings" in the header or the `/` key opens a compact full-width sheet with every option on one screen: format, number, scan mode, print size, bar width reduction, colour (solid/preset/gradient), shape, product panel, export options.
- It edits the same design as the flow; closing it lands on the result screen.
- It must stay compact (grouped, two columns on desktop); it must not become a long scrolling form.

### 5.6 Returning users and links
- A share link (`?f=&v=&s=&c=&r=` plus new size/BWR/panel params) opens straight to the result screen with every step collapsed.
- The last design is remembered in `localStorage` (convenience only; wrapped in try/catch) and offered as "Continue where you left off".

### 5.7 Pages
- `/` the flow above. Below the fold: short "why trust it" points, how Retail-safe works, FAQ (GS1 number, sizes, colours, scanners, Amazon).
- `/shape/<id>` keeps one page per shape (SEO), opening the flow with that shape preselected and a line about which industries it suits.
- `/barcode-tattoo` (new): the novelty use, Art mode by default, Code 128 for names/dates. My call, from the search research.
- Header: logo, Shapes, Templates, Many barcodes (CSV), Do I need a GS1 number?, All settings.
- Footer keeps the shape-licence credits (CC BY 3.0 requires visible attribution).

### 5.8 Mobile
- Same steps, one per screen, sticky primary button at the bottom, shape grid scrolls sideways, product panel above downloads. No horizontal page scroll, 16 px side gutter.

## 6. Visual system (from the chosen concepts)

- Page palette (Till Check): board `#EDF0EA`, card `#FFFFFF`, ink `#16211C`, ink-2 `#4A5650`, rule `#C9D0C8`, pass `#1F7A4D` on `#E2F0E7`, warn text `#B3192E` on `#FBE9EB`, focus `#1D4ED8`.
- Laser red `#D7263D` is used **only** for the scan sweep and the scan line motif, never for progress or decoration (fix for the concept's own weakness: red reads as error).
- Result stage (On the Pack): mat `#24493F` with grid `#3B675B`, proof paper `#FBFAF6`, kraft `#C89F70`, cut line `#C0186A`, fold line `#00739E`.
- Type: Bricolage Grotesque (display), Atkinson Hyperlegible (body), IBM Plex Mono for digits only. Self-hosted (OFL) to keep the CSP and privacy.
- Shape language: rounded cards (radius ~14 px), pill buttons, sentence case. No all-caps labels, no hairline-only boxes.
- Signature element: the red scan line (sweep on reveal; thin motif under the number field while checking).
- Dark mode: not in this release (my call; the concepts were light-only).

## 7. Scan check (0–100)

Heuristic from `specs.md`, labelled "Scan-safety estimate. Not a verification."
- Red-light contrast (40): from the worst bar colour/stop, SC = 85 × (1 − linear red); ≥70 → 40, ≥55 → 30, ≥40 → 20, ≥20 → 5, else 0. Red-laser fail (linear red > 0.5) caps the total at 20.
- Bar height vs GS1 minimum (30): 30 × min(1, band height / minimum) (69.24X EAN-13/UPC-A, 55.24X EAN-8, Code 128 max(15% of length, 6.35 mm)).
- Quiet zones (10), print size in range (15: X 0.264–0.660 mm for EAN/UPC; ≥0.191 mm for Code 128), digits present (5).
- Camera-contrast penalty −10 if WCAG contrast < 3.
- Plus a real **decode check**: the exported SVG is decoded in the browser before download, and the number must match. If it can't be decoded, downloads show a clear warning. (Builder chooses the decoder; see 9.)
- Bands: ≥80 "Likely fine — test a printed sample", 50–79 "Risky — test with your scanner", <50 "Likely to fail".
- A black EAN-13 in Art mode lands around 77 (risky); in Retail-safe around 97. That gap is the point of the mode switch.

## 8. Output

- **Print size**: magnification 80–200% (EAN/UPC), X = 0.330 mm × magnification; Code 128 by X in mm (default 0.33). Shown in mm and inches.
- **What the size covers (owner decision, option A):** the stated print size is the standard barcode itself: bars, quiet zones and digits at exact GS1 dimensions (EAN-13 at 100% = 37.29 × 25.93 mm). The shape is extra artwork above it. Every place that shows size (step 2, result panel, export, spec sheet) shows both: "Barcode 37.29 × 25.93 mm · with shape 37.29 × 41.2 mm". SVG/PDF `width`/`height` are the full artwork including the shape. No shape-height control in this release; the engine's existing 0.55–1.5× bounds apply.
- **SVG**: `width`/`height` in mm; digits as outlines is desirable (printers dislike live text) — builder decides if feasible without a font dependency; otherwise keep text and say so in the spec sheet.
- **PDF**: vector, exact size, hand-written (about 150 lines per `specs.md`): bars drawn twice (once clipped to the shape, once to the band) to avoid even-odd holes; arcs converted to Béziers; gradients sampled per bar. RGB only, stated in the UI.
- **PNG**: chosen DPI (default 300) with a `pHYs` chunk; module snapped to whole pixels and the snapped magnification shown.
- **Bar width reduction**: "Make bars thinner by ___ mm" (0–0.10, default 0), keeping bar centres. Applies to SVG/PDF/PNG.
- **Spec sheet**: a one-page PDF for the printer (number, format, size, X, BWR, quiet zones, scan mode, colours, scan estimate wording). My call; strongly evidenced as a pro must-have.
- **CSV batch**: paste or upload numbers (one per line or CSV column), same design for all, invalid rows listed and skipped, download a ZIP of SVGs (PDF optional). Limit 500 rows (my call).

## 9. Left to the builder

- How format auto-detection resolves ambiguous input (e.g. 12 digits = UPC-A or EAN-13 without check digit): pick a rule, show it, let the user switch.
- Decoder for the decode check (a vetted small library vs. a minimal hand-written EAN/UPC/Code 128 decoder reading our own SVG geometry), after `supply-chain-check`.
- ZIP writer (hand-written store-only ZIP is fine) and fonts for outlined digits.
- Exact animation timing of the sweep, component structure, file layout.
- Whether to merge the redesign as one PR or several, following the repo's one-feature-one-PR rule; ask the owner before opening each.

## 10. Calls I made (owner to check)

- `/barcode-tattoo` page; dark mode out of scope; CSV limit 500; spec-sheet PDF included; fonts self-hosted; on-screen size not claimed as 1:1; last design remembered in `localStorage`; red used only for the sweep.
- **Base branch and order:** build on `feat/real-styles-ai-shortcuts`. It already draws bars at the bwip-js positions (its renderer rewrite of `lib/columnMapper.ts`, commit 96de0ad, with per-bar tests), so it does not need `dff85de` from PR #19; when rebasing onto `main` after PR #19 merges, keep the feat branch's `columnMapper.ts`. Merge order: PR #19 → redesign → `chore/next-15` (rebased).
- **Decode check:** decode the rendered pixels, not the SVG geometry. Rasterise the composed SVG (same path as PNG export), read one horizontal scan line through the middle of the protected band (every bar is full there in both modes), convert to luminance and decode EAN-13/EAN-8/UPC-A/Code 128. The result must equal the number. Colour problems can therefore fail it; the red-laser rule stays a separate check because cameras see luminance, not red light.
- **Code 128 size:** sized by X in mm (UI range 0.19–1.00 mm, default 0.33), not by magnification. EAN/UPC use magnification 80–200%. Internally and in the share link both are stored as X in mm (`x=`), the UI shows % for EAN/UPC and mm for Code 128. The 6.35 mm minimum-height floor in `lib/gs1.ts` applies once X is known.

# BarStripeLab

Shape barcode generator. BarStripeLab cuts the bars of a real EAN-13, EAN-8, UPC-A or Code 128 barcode into a silhouette, such as a coffee cup, a cat or a palm tree, and keeps a protected band along the bottom so the code still scans.

It is free, has no account and runs entirely in your browser. Exports are SVG and PNG.

**Live:** https://barstripelab.pages.dev

![BarStripeLab: barcodes shaped as a coffee cup, a cat, a palm tree and a heart](public/og-image.png)

## Features

- 46 shapes in six categories: animals, food, nature, objects, people and symbols. Every shape has its own page at `/shape/<id>`.
- Four formats: EAN-13, EAN-8 and UPC-A (digits only; the check digit is added if you leave it off) and Code 128 (letters, numbers, spaces and symbols, up to 48 characters).
- Colour presets, a custom colour and two-stop gradients, plus quick-start templates.
- Export as SVG (scalable artwork) or high-resolution PNG, or copy the SVG to the clipboard.
- Shareable links: the address bar always holds the exact design.
- Keyboard shortcuts for style, colour, SVG and PNG download, and share.
- Optional AI styling: describe your brand and Claude suggests a shape and a colour.

## Scan safety

- **Protected band.** The bottom of the barcode keeps every bar at full height, whatever the shape. Do not crop, cover or squash it.
- **Quiet zones.** Blank margins are added on both sides to the GS1 minimum for EAN/UPC and the ISO/IEC 15417 minimum for Code 128. Keep them when you place the artwork.
- **Contrast warning.** A warning appears under the colour controls when the lightest bars are too pale to scan reliably. Dark bars on a light background read best.
- **Print and test.** Artistic bars are still bars. Print a sample at the real size, on the real material, and scan it with the devices your customers and shops use before a full run.
- **GS1 numbers.** Retailers expect numbers licensed to your company by GS1. BarStripeLab draws whatever digits you enter; it cannot issue or register a number.

## AI generator (bring your own key)

The AI generator is optional and uses the Claude model `claude-opus-5-5` with your own Anthropic API key. The key stays in the browser tab's memory, is never stored, and is sent only to `api.anthropic.com`. Requests are billed to your Anthropic account. Everything else works without a key.

## Shapes and licenses

The shape artwork comes from [Phosphor Icons](https://phosphoricons.com) (MIT) and [game-icons.net](https://game-icons.net) (CC BY 3.0). The full licenses, credits and the changes made to each game-icons.net shape are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The app code is MIT, see [LICENSE](LICENSE).

## Development

Requires Node 20.19.6 (see `.nvmrc`) and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # vitest
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
pnpm build        # static export to out/
```

No environment variables are needed. `.env.example` documents the one optional setting.

## Deployment

The site is a Next.js static export (`output: "export"`) deployed by Cloudflare Pages from the `main` branch.

- Build command: `pnpm build`
- Build output directory: `out`
- Node version: `20.19.6`

`public/_headers` sets the security headers (including the Content-Security-Policy) and long-lived caching for `/_next/static/*`. The sitemap (`/sitemap.xml`) and `robots.txt` are generated at build time.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)

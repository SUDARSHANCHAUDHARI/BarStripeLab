# BarStripeLab

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Release](https://img.shields.io/badge/release-production%20candidate-orange.svg)](RELEASE_MEMORY.md)

Artistic barcode generator that turns EAN-style barcodes into brandable, scannable assets with custom overlays, colors, and SVG/PNG export.

> **Status:** Production web candidate · build verified · final release needs scanner-app QA and live Cloudflare Pages URL

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Status](#status)
- [Key Technical Decisions](#key-technical-decisions)
- [Features](#features)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Verification](#verification)
- [Known Limits](#known-limits)
- [About](#about)

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

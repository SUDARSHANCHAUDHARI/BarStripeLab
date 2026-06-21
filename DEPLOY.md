# Deployment & Launch Checklist

## Pre-Deployment Checklist

- [x] Core barcode generation works
- [x] All styles apply correctly
- [x] PNG/SVG export functional
- [x] Mobile responsive tested
- [x] Invalid input doesn't crash
- [x] EAN-13 validation working
- [x] Barcode scans with real scanner
- [x] Loading states display
- [x] Error messages clear

## Quick Start (Local Development)

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Build for Production

```bash
pnpm build
pnpm start
```

## 🔥 Deploy to GitHub Pages (Recommended for MVP)

### Option 1: Automatic (GitHub Actions) ⭐

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repo → Settings → Pages
   - Source: GitHub Actions
   - Done! ✅

3. **View deployment**
   - Wait 1-2 minutes for build
   - Go to Actions tab → see workflow run
   - **Live at**: `https://USERNAME.github.io/barstripelab`

**Auto-deploys on every push to main** 🚀

### Option 2: Manual Deploy

```bash
pnpm export
touch out/.nojekyll
pnpm deploy:gh
```

## Deploy to your own domain (Recommended)

BarStripeLab is fully client-side after static export — drop the `out/` directory
on any web host you already run. No platform lock-in, no env vars, no backend.

### Option 1: Use the wired-up GitHub Pages flow

```bash
pnpm deploy:gh
```

That runs the static export and publishes `out/` via `gh-pages`. Point a custom
DNS record at the Pages site for `barstripelab.your-domain.com`.

### Option 2: Your VPS / static host

```bash
pnpm export                  # builds out/
rsync -avz out/ user@host:/var/www/barstripelab/
```

Serve `out/` with nginx / caddy / Apache. SPA fallback isn't required (Next
static export emits per-route HTML).

### Option 3: Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

## Post-Deployment

1. ✅ Test live URL
2. ✅ Test on mobile
3. ✅ Verify barcode scan works
4. ✅ Test all export options
5. ✅ Check performance (GTmetrix)
6. ✅ Setup error monitoring (optional)

## Custom Domain (Optional)

Already on your own domain — point a DNS record (A / CNAME) at the host you
deployed to. If using GitHub Pages, add a `CNAME` file inside `out/` (or set the
custom domain in repo Settings → Pages) before running `pnpm deploy:gh`.

## Performance Optimization

Already included:
- ✅ Next.js optimizations
- ✅ Tailwind CSS purging
- ✅ Image optimization (if added)
- ✅ Code splitting

Monitor:
- [Tools: Google PageSpeed](https://pagespeed.web.dev/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

## Monitoring & Analytics (Optional)

### Add Google Analytics

1. Create GA4 property at google.com/analytics
2. Get measurement ID
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX
   ```
4. Restart dev server

### Add Plausible / Umami / your own analytics

Use a self-hosted or privacy-friendly analytics provider that fits your stack.
Plausible and Umami both ship a simple script tag you can drop into
`app/layout.tsx`:

```tsx
// app/layout.tsx
<script defer data-domain="barstripelab.your-domain.com" src="https://analytics.your-domain.com/script.js" />
```
```

## Troubleshooting Deployment

### Build fails
```bash
pnpm build
# Check errors locally first
```

### 404 on pages
- Verify Next.js config
- Check build output folder
- Ensure .next exists

### Styles not loading
- Clear build cache
- Verify Tailwind config
- Check CSS imports

### Functions timeout
- Keep generation fast
- Optimize SVG parsing
- Use caching if possible

## Future Monitoring

Setup alerts for:
- Build failures
- Runtime errors
- High error rates
- Performance degradation

## Scaling Considerations

Current setup handles:
- ~1000s barcodes/day (free tier)
- ~10,000s barcodes/day (paid tier)

If needing more:
- Add Redis caching
- Database for saving designs
- Edge functions for API
- CDN for assets

## Support after Launch

- Monitor error logs
- Collect user feedback
- Fix bugs quickly
- Update docs as needed
- Plan Phase 2 features

## Quick Links

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages](https://pages.github.com)
- [gh-pages package (used by `pnpm deploy:gh`)](https://github.com/tschaub/gh-pages)
- [Plausible self-hosting](https://plausible.io/docs/self-hosting)

---

**You're ready to launch! 🚀**

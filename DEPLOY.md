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

## Deploy to Vercel (Recommended for Production)

### Option 1: Web Dashboard
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repo
4. Click "Deploy"
5. Done ✅

### Option 2: Vercel CLI
```bash
pnpm add -g vercel
vercel
# Follow prompts
```

### Environment Variables (if needed)
Settings → Environment Variables → Add as needed

## Deploy to Netlify

### Option 1: Web Dashboard
1. Go to https://netlify.com
2. Click "New site from Git"
3. Select your GitHub repo
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Deploy

### Option 2: CLI
```bash
npm i -g netlify-cli
netlify deploy
```

## Deploy to Other Platforms

### AWS Amplify
```bash
amplify init
amplify hosting add
amplify publish
```

### Azure Static Web Apps
```bash
az staticwebapp create \
  --resource-group <group> \
  --name barstripelab \
  --source https://github.com/yourname/barstripelab \
  --branch main
```

### Self-Hosted (Docker)

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

### Vercel
1. Go to Project Settings
2. Domains → Add Domain
3. Update DNS records

### Netlify
1. Site settings → Domain management
2. Add custom domain
3. Update DNS records

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

### Add Vercel Analytics

```bash
pnpm add @vercel/analytics
```

In `app/page.tsx`:
```typescript
import { Analytics } from "@vercel/analytics/react";

export default function Page() {
  return (
    <>
      {/* content */}
      <Analytics />
    </>
  );
}
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

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Netlify Docs](https://docs.netlify.com)
- [GitHub Pages](https://pages.github.com)

---

**You're ready to launch! 🚀**

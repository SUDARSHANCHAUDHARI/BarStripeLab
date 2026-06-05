# GitHub Pages Setup Guide

## 5-Minute Setup

### Step 1: Create GitHub Repo

```bash
# Create new repo at github.com/new
# Name: barstripelab
# Description: Turn barcodes into brand assets
# Public repo
```

### Step 2: Push Code

```bash
cd /path/to/BarStripeLab

git init
git add .
git commit -m "Initial commit: BarStripeLab MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/barstripelab.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to repo **Settings**
2. Scroll to **Pages** section
3. **Source**: Select "GitHub Actions"
4. Save

### Step 4: Wait for Deploy

- Go to **Actions** tab
- Wait for "Deploy to GitHub Pages" workflow to complete (1-2 min)
- You'll see ✅ when done

### Step 5: View Your App

**Live URL**: `https://YOUR-USERNAME.github.io/barstripelab`

---

## How It Works

### Automated Workflow

Every push to `main` triggers:
1. ✅ Install dependencies
2. ✅ Build static export
3. ✅ Deploy to GitHub Pages
4. ✅ Live in 1-2 minutes

File: `.github/workflows/pages.yml`

### Static Export

Next.js builds a static site (HTML/CSS/JS):
```bash
pnpm build  # Creates /out folder with static files
```

Base path is set automatically:
```
/barstripelab/
├── index.html
├── page.html  
├── _next/
├── public/
└── ...
```

---

## Custom Domain (Optional)

### 1. Buy Domain

- GoDaddy, Namecheap, etc.
- Example: `barstripelab.com`

### 2. Configure DNS

**Option A: CNAME** (Recommended)

Add DNS record:
```
Type: CNAME
Name: @
Value: USERNAME.github.io
TTL: 3600
```

**Option B: A Records**

Add DNS records:
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 3. Update GitHub

Repo → Settings → Pages → Custom domain
```
barstripelab.com
```

Check "Enforce HTTPS"

### 4. Wait for DNS

DNS propagation: 5-48 hours

Test:
```bash
nslookup barstripelab.com
# Or visit: https://barstripelab.com
```

---

## Troubleshooting

### 404 Page

**Check:**
1. Workflow passed? (Actions tab)
2. Visit correct URL? (check USERNAME)
3. Wait 2+ minutes?
4. Browser cache? (Ctrl+Shift+Delete)

### Build Failed

**Check Actions tab for errors:**

```bash
# Debug locally
pnpm build  # Should work
```

### Styles Missing

**Fix:**
- Clear browser cache
- Hard refresh: Ctrl+F5
- Wait 1 minute for CDN

### Asset Not Loading

Check URL:
- Should be: `https://USERNAME.github.io/barstripelab/...`
- Not: `https://USERNAME.github.io/...`

### HTTPS Not Enforcing

**Fix:**
1. Settings → Pages
2. Check "Enforce HTTPS"
3. Wait 1 minute

---

## Environment Variables

None needed for MVP (client-side only).

If adding analytics later:

1. Create `.env.local`
2. Add: `NEXT_PUBLIC_GA_ID=G_...`
3. Rebuild and push

---

## Monitoring Deployments

### View Build Logs

Repo → **Actions** tab → Click workflow run

Shows:
- ✅/❌ Status
- Build time
- Error messages
- Deployment logs

### View Site Traffic

GitHub repo → **Insights** tab

---

## Update Your Site

Edit code → Push:

```bash
git add .
git commit -m "Update feature"
git push
```

GitHub Actions automatically:
1. Builds new version
2. Deploys to Pages
3. **Live in 1-2 minutes**

---

## Limits & Considerations

### Limits
- Max repo size: 100 GB
- Max push: 100 MB
- Bandwidth: Unlimited
- **Cost: FREE**

### What Works
- ✅ Static HTML/CSS/JS
- ✅ Client-side JS
- ✅ SVG rendering
- ✅ PNG export

### What Doesn't
- ❌ Backend/APIs
- ❌ Database
- ❌ Server-side rendering
- ❌ Node functions

*BarStripeLab is 100% client-side, so all features work!*

---

## Next Steps

After deployment:

1. **Share your link** with friends
2. **Collect feedback** via GitHub Issues
3. **Plan Phase 2** features
4. **Monitor analytics** (optional)

---

## Quick Commands

```bash
# View live site
open https://YOUR-USERNAME.github.io/barstripelab

# View Actions
open https://github.com/YOUR-USERNAME/barstripelab/actions

# View repo settings
open https://github.com/YOUR-USERNAME/barstripelab/settings/pages

# Force rebuild
git commit --allow-empty -m "Trigger rebuild"
git push
```

---

## Having Issues?

1. Check [DEPLOY.md](./DEPLOY.md) for detailed options
2. Read [Project Summary](./PROJECT_SUMMARY.md) for architecture
3. Check GitHub Pages [Documentation](https://pages.github.com/)
4. Open GitHub Issue in your repo

---

**You're live! 🚀 Share your barcode art tool!**

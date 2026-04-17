# ⚡ Quick Start Guide

## 1️⃣ Setup (2 minutes)

```bash
cd barstripelab
pnpm install
pnpm dev
```

Open: **http://localhost:3000**

## 2️⃣ Test Locally (5 minutes)

1. **Enter barcode**: `5901234123457`
2. **Try styles**: wave, mountain, city
3. **Change color**: Use color picker
4. **Download SVG**: Works immediately
5. **Download PNG**: 1-3 second wait

## 3️⃣ Verify It Works

- ✅ Barcode generates
- ✅ Styles apply
- ✅ Export downloads file
- ✅ No console errors

## 4️⃣ Build for Production

```bash
pnpm build
pnpm start
```

Test: http://localhost:3000

## 5️⃣ Deploy to Vercel (5 minutes)

```bash
pnpm add -g vercel
vercel
```

Follow prompts → Done! 🚀

## 6️⃣ Share Your Link

Your app is now live at:
`https://barstripelab-xxxxx.vercel.app`

---

## Common Commands

| Command | What it does |
|---------|------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm lint` | Check for errors |

## Troubleshooting

### pnpm install fails
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port 3000 in use
```bash
pnpm dev -- -p 3001
```

### Styles not loading
```bash
# Clear cache
rm -rf .next
pnpm dev
```

### Still stuck?
Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) or [DEPLOY.md](./DEPLOY.md)

---

**You're ready! Start building 🎉**

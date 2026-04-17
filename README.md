# BarStripeLab

Turn barcodes into brand assets. A web app that generates artistic, scannable barcodes with custom styles, colors, and export options.

## Features

✨ **Artistic Barcode Design**
- Apply creative styles (wave, mountain, city, and more)
- Customize colors for art overlays
- Stay scannable with preserved safe zones

📥 **Multiple Export Options**
- SVG export for infinite scaling
- High-quality PNG export (4x pixel ratio)
- Production-ready output

🤖 **AI Style Generator** (Beta)
- Generate styles from keywords
- Quick templates for instant branding
- Organized visual presets

🔒 **Scan Safety**
- Bottom 35% of barcode untouched
- Maintains EAN-13 validity
- Works with real barcode scanners

📱 **Responsive Design**
- Works on desktop and mobile
- Fast, lightweight interface
- Real-time preview

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm 9+

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/sudarshanchaudhari/barstripelab.git
   cd barstripelab
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

### Basic Workflow

1. **Enter Barcode**
   - Paste 12 or 13 digits
   - We auto-generate EAN-13 checksum for 12-digit input

2. **Choose Style**
   - Select from built-in styles (wave, mountain, city, etc.)
   - Or use AI to generate styles from keywords

3. **Customize Color**
   - Pick any color for art overlay
   - Barcode base stays black for scannability

4. **Export**
   - Download as SVG (scalable)
   - Download as PNG (high-res, 300 DPI equivalent)

### AI Style Generator (Beta)

Try these keywords:
- `coffee` - cafe aesthetic
- `ocean` - flowing waves
- `mountain` - peaks & heights
- `city` - urban concrete feel
- `tech` - minimal rectangles
- `organic` - nature-inspired curves
- `minimal` - simple lines

## Project Structure

```
barstripelab/
├── app/
│   ├── page.tsx           # Main app logic
│   ├── layout.tsx         # Page wrapper
│   ├── globals.css        # Global styles
│   └── components/
│       ├── BarcodeCanvas.tsx     # Preview renderer
│       ├── Controls.tsx          # Input controls
│       ├── DownloadButton.tsx    # Export buttons
│       ├── TemplateSelector.tsx  # Quick templates
│       └── AIInput.tsx           # AI generator
│
├── lib/
│   ├── barcode.ts         # bwip-js integration
│   ├── columnMapper.ts    # SVG → column extraction
│   ├── artEngine.ts       # Art rendering logic
│   ├── shapeRenderer.tsx  # SVG shape elements
│   ├── styles.ts          # Style presets
│   ├── templates.ts       # Template presets
│   ├── aiStyleGenerator.ts # AI style generation
│   └── ean13checksum.ts   # EAN-13 validation
│
├── types/
│   └── index.ts           # TypeScript types
│
└── public/                # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Barcode Engine**: bwip-js
- **Export**: html-to-image
- **UI**: React 18

## API Reference

### Core Functions

#### `generateBarcodeSVG(text: string)`
Generates an EAN-13 barcode SVG.

```typescript
import { generateBarcodeSVG } from "@/lib/barcode";

const svg = await generateBarcodeSVG("5901234123457");
```

#### `extractColumns(svg: string)`
Parses SVG and extracts column data.

```typescript
import { extractColumns } from "@/lib/columnMapper";

const columns = extractColumns(svg);
```

#### `generateArt(columns, style)`
Applies artistic shapes to barcode.

```typescript
import { generateArt } from "@/lib/artEngine";

const art = generateArt(columns, styles.wave);
```

#### `normalizeEAN13(value: string)`
Validates and normalizes EAN-13 input.

```typescript
import { normalizeEAN13 } from "@/lib/ean13checksum";

const validCode = normalizeEAN13("590123412345"); // auto-generates 13th digit
```

## Styles Reference

### Wave
Flowing curves, organic feel

### Mountain
Sharp triangles, peaks

### City
Rectangular blocks, urban

### Minimal
Simple geometry

### Flowing
Mixed curves and lines

## Templates

Pre-configured color + style combinations:
- Spotify Style (green curves)
- Coffee Brand (brown)
- Tech Minimal (black)
- Ocean Wave (blue)
- Forest (green)
- Sunset (orange)

## Build & Deploy

### Build for production
```bash
pnpm build
pnpm start
```

### Deploy on Vercel

1. Push to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Deploy with one click

### Deploy on Netlify

1. Push to GitHub
2. Go to [Netlify](https://netlify.com)
3. Connect repository
4. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Testing

Always test generated barcodes with real barcode scanner apps:
- iOS: "Barcode Scanner" app
- Android: "Barcode Scanner" or "Quick Scan"

Verify that bottom portion scans correctly every time before production use.

## Roadmap

### Phase 2
- [ ] PNG/JPG export improvements
- [ ] More style templates
- [ ] Better alignment engine

### Phase 3
- [ ] Brand pack system (save color + style combos)
- [ ] Design history/favorites
- [ ] Batch barcode generator

### Phase 4
- [ ] AI-generated style patterns (OpenAI integration)
- [ ] API for developers
- [ ] Shopify app integration
- [ ] User accounts + cloud storage

## Known Limitations

- EAN-13 only (no other barcode formats yet)
- AI style generator uses keyword matching (simple version)
- Max 100 barcodes per session

## Performance

- Barcode generates in <300ms
- PNG export takes 1-3 seconds depending on system
- Optimized SVG size (typically 2-5KB)

## Troubleshooting

### Barcode not generating
- Ensure input is 12-13 digits only
- Check browser console for errors
- Try another barcode number

### PNG export fails
- Ensure browser allows clipboard access
- Try refreshing page
- Use Chrome/Edge for best results

### Barcode doesn't scan
- Bottom portion might be modified
- Try different scanner app
- Ensure generated barcode has sufficient contrast

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! To add features:

1. Create feature branch: `git checkout -b feature/xyz`
2. Commit changes: `git commit -m "Add xyz"`
3. Push to branch: `git push origin feature/xyz`
4. Open Pull Request

## Support

- 📧 Email: sudarshantechlabs@gmail.com
- 🐦 Twitter: [@SudarshanTechLabs](https://twitter.com/SudarshanTechLabs)
- 🐙 GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)

---

**Made with ❤️ by SudarshanTechLabs**

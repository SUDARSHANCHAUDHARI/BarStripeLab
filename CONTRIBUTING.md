# Contributing to BarStripeLab

Thanks for your interest in contributing! 🎉

## How to Contribute

### Report Bugs
- Go to [Issues](../../issues)
- Click "New Issue"
- Select "Bug Report"
- Provide details: steps to reproduce, expected behavior, environment

### Suggest Features
- Go to [Issues](../../issues)
- Click "New Issue"
- Select "Feature Request"
- Describe the use case and proposed solution

### Submit Code

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/xyz`
3. **Make changes** following code style
4. **Test locally**: `pnpm dev`
5. **Commit**: `git commit -m "Add feature xyz"`
6. **Push**: `git push origin feature/xyz`
7. **Create PR** with description

## Code Style

- **Language**: TypeScript (no `any`)
- **Format**: match the code around it. `.editorconfig` sets the basics (2 spaces, LF). There is no Prettier config; `pnpm lint` runs ESLint.
- **Components**: Functional + React Hooks
- **State**: React Hooks only
- **Styling**: Tailwind CSS
- **Comments**: a short `//` comment where the reason is not obvious. The code does not use JSDoc.

## Development Setup

```bash
# Clone
git clone https://github.com/SUDARSHANCHAUDHARI/barstripelab.git
cd barstripelab

# Install
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## File Organization

- `/app` → React components & pages
- `/lib` → Core business logic
- `/types` → TypeScript definitions
- `/public` → Static assets

## Making Changes

### Adding a shape

Shapes are the `SHAPES` array in `lib/shapes.ts`. Each entry is a `ShapeDef` (see `types/index.ts`):

```typescript
{
  id: "star",
  label: "Star",
  category: "symbols",
  viewBox: [16, 16, 224, 216],
  paths: ["M128,16 L158,96 L240,96 L174,146 L198,232 L128,184 L58,232 L82,146 L16,96 L98,96 Z"],
  source: "phosphor",
  description: "A five-point star for ratings, reviews and awards.",
}
```

The star is an example. Use the source your artwork really comes from.

- `id`: kebab-case and unique. The page `/shape/<id>` is generated from the array.
- `label`: the name shown in the picker.
- `category`: one of `food`, `animals`, `people`, `objects`, `nature`, `symbols`.
- `viewBox`: the tight bounding box of the paths, as `[minX, minY, width, height]`.
- `paths`: SVG path data. Add `fillRule: "evenodd"` only if the paths have holes. The default is `nonzero`.
- `source`: `phosphor` or `game-icons`.
- `description`: one or two sentences for the shape's page.

If `source` is `game-icons`, add a credit line to the game-icons list in `THIRD_PARTY_NOTICES.md`, in the same form as the others. It names the artist and the icon, and says what you changed.

Check the shape: `pnpm test` runs `lib/shapes.test.ts`, which checks every shape's id, viewBox, paths, label and description, and that every category has a shape. Then run `pnpm dev`, pick the shape in step 3 of the flow, and check the result in step 4.

### Adding a template

Templates are the `templates` array in `lib/templates.ts`. A template is a name, a shape id and a colour:

```typescript
{ name: "My Template", shape: "coffee", color: "#6F4E37" },
```

- The shape must be an id from `SHAPES`.
- The colour must be dark. `lib/shapes.test.ts` fails any template under 4.5:1 contrast on white.
- The colour must pass the red-laser check: `failsRedLight` in `lib/colorEngine.ts` rejects colours where red, orange and pink light reflects too much. No test covers this, so check it by hand. ColorPanel shows the warning.

`#6F4E37` is 7.44:1 on white and passes the red-laser check. `#FF5733`, the colour in older docs, is 3.15:1 and fails both.

### Modifying the core engine

- `lib/svgComposer.ts`: builds the SVG: bars, quiet zones, digits, the shape and the protected band.
- `lib/gs1.ts`: GS1 minimum bar heights and quiet zones.
- `lib/scanScore.ts`: the 0 to 100 scan-safety estimate.
- `lib/decode.ts`: the in-browser decode check.
- `lib/export/*`: PDF, PNG, ZIP and spec sheet output.
- `lib/printSize.ts`: the print size range for each format.
- `lib/colorEngine.ts`: colour presets and the red-laser check.

## Testing

Run the checks first. All three must pass:
1. `pnpm test`
2. `pnpm typecheck`
3. `pnpm lint`

Then test your changes:
1. `pnpm dev` → http://localhost:3000
2. Test with valid/invalid inputs
3. Test on mobile
4. Verify export works
5. Check console for errors

## PR Guidelines

- **Title**: Clear and concise
- **Description**: Why this change?
- **Type**: bug fix, feature, docs, etc.
- **Testing**: What did you test?
- **Checklist**: All boxes checked?

## Code Review

- Keep PRs focused (one feature)
- Respond to feedback
- Update based on suggestions
- Be patient with review process

## Questions?

- 📧 Email: sudarshantechlabs@gmail.com
- 💬 Open an issue
- 🔗 Check [README.md](./README.md)

---

**Thanks for making BarStripeLab better! ❤️**

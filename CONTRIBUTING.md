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
- **Format**: Prettier (auto-formatted)
- **Components**: Functional + React Hooks
- **State**: React Hooks only
- **Styling**: Tailwind CSS
- **Comments**: JSDoc for functions

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

### Adding a New Style
Edit `lib/styles.ts`:
```typescript
export const styles: Record<string, Style> = {
  myStyle: [
    { type: "rect", height: 50 },
    { type: "curve", height: 30 }
  ],
};
```

### Adding a Template
Edit `lib/templates.ts`:
```typescript
{
  name: "My Template",
  color: "#FF5733",
  style: [{ type: "triangle", height: 45 }]
}
```

### Modifying Core Engine
- `lib/barcode.ts` → Barcode generation
- `lib/columnMapper.ts` → SVG parsing
- `lib/artEngine.ts` → Style application

## Testing

Test your changes:
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
- 🔗 Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

**Thanks for making BarStripeLab better! ❤️**

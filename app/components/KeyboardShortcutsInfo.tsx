const SHORTCUTS = [
  ["/", "Open all settings"],
  ["Alt + S", "Next shape"],
  ["Alt + C", "Next colour"],
  ["Alt + D", "Download SVG"],
  ["Alt + P", "Download PNG"],
  ["Alt + H", "Share"],
];

export default function KeyboardShortcutsInfo() {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
      {SHORTCUTS.map(([keys, action]) => (
        <div key={keys} className="flex items-center gap-3">
          <dt>
            <kbd className="rounded-md border border-b-2 border-rule bg-card px-2 py-1 font-mono text-sm text-ink">{keys}</kbd>
          </dt>
          <dd className="text-ink-2">{action}</dd>
        </div>
      ))}
    </dl>
  );
}

const MONO = [
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "Monaco",
  "Consolas",
  '"Liberation Mono"',
  "monospace",
];

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Redesign tokens (spec section 6).
        board: "#EDF0EA",
        card: "#FFFFFF",
        ink: "#16211C",
        "ink-2": "#4A5650",
        rule: "#C9D0C8",
        pass: "#1F7A4D",
        "pass-bg": "#E2F0E7",
        warn: "#B3192E",
        "warn-bg": "#FBE9EB",
        laser: "#D7263D",
        focus: "#1D4ED8",
        mat: "#24493F",
        "mat-grid": "#3B675B",
        proof: "#FBFAF6",
        kraft: "#C89F70",
        cut: "#C0186A",
        fold: "#00739E",
      },
      fontFamily: {
        // The --font-* variables come from next/font/local in app/layout.tsx.
        mono: ["var(--font-mono)", ...MONO],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

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
        // Redesign tokens (spec section 6). Old tokens below stay until the old UI is removed.
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
        ink2: "#1d1d1f",
        muted: "#4b4b4f",
        paper: "#f5f5f7",
        field: "#e6e6ea",
        danger: "#b3001b",
      },
      fontFamily: {
        sans: MONO,
        mono: ['"IBM Plex Mono"', ...MONO],
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Atkinson Hyperlegible"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

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
        ink: "#0a0a0a",
        ink2: "#1d1d1f",
        muted: "#4b4b4f",
        paper: "#f5f5f7",
        field: "#e6e6ea",
        danger: "#b3001b",
      },
      fontFamily: { sans: MONO, mono: MONO },
    },
  },
  plugins: [],
};

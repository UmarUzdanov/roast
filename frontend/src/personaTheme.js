export const PERSONAS = {
  claude: {
    id: "claude",
    name: "Claude",
    title: "The Blunt Hammer",
    accent: "#fb7209",
    accentSoft: "rgba(251, 114, 9, 0.15)",
    accentStrong: "rgba(251, 114, 9, 0.35)",
    accentBorder: "rgba(251, 114, 9, 0.7)",
    badge: "🔥",
    loaderLabel: "Forging the next smash...",
  },
  gpt: {
    id: "gpt",
    name: "GPT",
    title: "The Surgical Sniper",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.18)",
    accentStrong: "rgba(56, 189, 248, 0.35)",
    accentBorder: "rgba(56, 189, 248, 0.7)",
    badge: "🎯",
    loaderLabel: "Calibrating the scope...",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    title: "The Polite Troll",
    accent: "#c084fc",
    accentSoft: "rgba(192, 132, 252, 0.16)",
    accentStrong: "rgba(192, 132, 252, 0.34)",
    accentBorder: "rgba(192, 132, 252, 0.65)",
    badge: "✨",
    loaderLabel: "Plotting a friendly jab...",
  },
};

export const PHASE_META = {
  opening: { label: "🔥 Opening", description: "First volley" },
  rebuttal: { label: "↩️ Rebuttal", description: "Counter fire" },
  closer: { label: "🎤 Closer", description: "Final mic drop" },
};

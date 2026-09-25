export const DEFAULT_THEME = {
  preset: "default",
  radius: "default",
  scale: "none",
  contentLayout: "full"
} as const;

export type ThemeType = typeof DEFAULT_THEME;

export const THEMES = [
  {
    name: "Default",
    value: "default",
    colors: ["oklch(0.33 0 0)"]
  },
  {
    name: "Underground",
    value: "underground",
    colors: ["oklch(0.5315 0.0694 156.19)"]
  },
  {
    name: "Rose Garden",
    value: "rose-garden",
    colors: ["oklch(0.5827 0.2418 12.23)"]
  },
  {
    name: "Lake View",
    value: "lake-view",
    colors: ["oklch(0.765 0.177 163.22)"]
  },
  {
    name: "Sunset Glow",
    value: "sunset-glow",
    colors: ["oklch(0.5827 0.2187 36.98)"]
  },
  {
    name: "Forest Whisper",
    value: "forest-whisper",
    colors: ["oklch(0.5276 0.1072 182.22)"]
  },
  {
    name: "Ocean Breeze",
    value: "ocean-breeze",
    colors: ["oklch(0.59 0.20 277.12)"]
  },
  {
    name: "Neo Brutalism",
    value: "neo-brutalism",
    colors: ["oklch(0.6489 0.237 26.9728)", "oklch(0.968 0.211 109.7692)", "oklch(0.5635 0.2408 260.8178)"]
  },
  {
    name: "Lavender Dream",
    value: "lavender-dream",
    colors: ["oklch(0.71 0.16 293.54)"]
  }
];

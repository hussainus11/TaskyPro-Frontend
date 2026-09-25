export const DEFAULT_THEME = {
  preset: "default",
  radius: "default",
  scale: "none",
  contentLayout: "full",
  background: "none"
} as const;

export type ThemeType = {
  preset: string;
  radius: string;
  scale: string;
  contentLayout: string;
  background: string;
};

export type WorkspaceBackground = {
  name: string;
  value: string;
  /** Whether the artwork is dark or light, so the sidebar can pick a legible text colour. */
  tone: "light" | "dark";
  /** Full CSS `background` value (gradients / patterns only, no image assets to load). */
  css: string | null;
};

export const WORKSPACE_BACKGROUNDS: WorkspaceBackground[] = [
  { name: "None", value: "none", tone: "light", css: null },
  {
    name: "Aurora",
    value: "aurora",
    tone: "dark",
    css: "radial-gradient(at 18% 12%, oklch(0.62 0.2 265) 0, transparent 55%), radial-gradient(at 88% 8%, oklch(0.65 0.22 315) 0, transparent 50%), radial-gradient(at 72% 92%, oklch(0.6 0.15 200) 0, transparent 55%), oklch(0.32 0.1 270)"
  },
  {
    name: "Ocean",
    value: "ocean",
    tone: "dark",
    css: "linear-gradient(135deg, oklch(0.42 0.13 245), oklch(0.62 0.13 215))"
  },
  {
    name: "Sunset",
    value: "sunset",
    tone: "dark",
    css: "linear-gradient(135deg, oklch(0.6 0.2 35), oklch(0.58 0.22 5) 55%, oklch(0.45 0.18 320))"
  },
  {
    name: "Forest",
    value: "forest",
    tone: "dark",
    css: "linear-gradient(135deg, oklch(0.38 0.08 170), oklch(0.55 0.12 150))"
  },
  {
    name: "Midnight",
    value: "midnight",
    tone: "dark",
    css: "radial-gradient(at 30% 0%, oklch(0.38 0.1 265), transparent 60%), oklch(0.2 0.04 265)"
  },
  {
    name: "Lavender",
    value: "lavender",
    tone: "light",
    css: "linear-gradient(135deg, oklch(0.91 0.05 300), oklch(0.84 0.09 270))"
  },
  {
    name: "Sky",
    value: "sky",
    tone: "light",
    css: "linear-gradient(135deg, oklch(0.94 0.04 230), oklch(0.85 0.09 225))"
  },
  {
    name: "Sand",
    value: "sand",
    tone: "light",
    css: "linear-gradient(135deg, oklch(0.95 0.025 85), oklch(0.89 0.055 60))"
  },
  {
    name: "Mist",
    value: "mist",
    tone: "light",
    css: "linear-gradient(160deg, oklch(0.95 0.01 250), oklch(0.87 0.03 250))"
  },
  {
    name: "Dots",
    value: "dots",
    tone: "light",
    css: "radial-gradient(oklch(0.72 0.012 250) 1px, transparent 1px) 0 0 / 18px 18px, oklch(0.96 0.005 250)"
  },
  {
    name: "Grid",
    value: "grid",
    tone: "light",
    css: "linear-gradient(oklch(0.86 0.01 250) 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(90deg, oklch(0.86 0.01 250) 1px, transparent 1px) 0 0 / 28px 28px, oklch(0.97 0.004 250)"
  }
];

export function getWorkspaceBackground(value: string | undefined | null) {
  return WORKSPACE_BACKGROUNDS.find((bg) => bg.value === value) ?? WORKSPACE_BACKGROUNDS[0];
}

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
    name: "Lavender Dream",
    value: "lavender-dream",
    colors: ["oklch(0.71 0.16 293.54)"]
  }
];

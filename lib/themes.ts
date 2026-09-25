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
  // Every artwork is built from the active theme preset's --primary, so switching the
  // theme preset recolours the workspace. "dark" ones are mixed into a deep base so the
  // sidebar text stays legible whatever the preset colour is; "light" ones into white.
  {
    name: "Gradient",
    value: "gradient",
    tone: "dark",
    css: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 45%, oklch(0.16 0.03 265)), color-mix(in oklab, var(--primary) 85%, oklch(0.25 0.03 265)))"
  },
  {
    name: "Aurora",
    value: "aurora",
    tone: "dark",
    css: "radial-gradient(at 18% 12%, color-mix(in oklab, var(--primary) 90%, white 10%) 0, transparent 55%), radial-gradient(at 88% 8%, color-mix(in oklab, var(--primary) 60%, oklch(0.65 0.22 315)) 0, transparent 50%), radial-gradient(at 72% 92%, color-mix(in oklab, var(--primary) 60%, oklch(0.6 0.15 200)) 0, transparent 55%), color-mix(in oklab, var(--primary) 35%, oklch(0.16 0.03 265))"
  },
  {
    name: "Midnight",
    value: "midnight",
    tone: "dark",
    css: "radial-gradient(at 30% 0%, color-mix(in oklab, var(--primary) 60%, transparent) 0, transparent 60%), color-mix(in oklab, var(--primary) 12%, oklch(0.16 0.03 265))"
  },
  {
    name: "Glow",
    value: "glow",
    tone: "dark",
    css: "radial-gradient(circle at 85% 15%, color-mix(in oklab, var(--primary) 90%, white 15%) 0, transparent 45%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--primary) 70%, oklch(0.16 0.03 265)) 0, transparent 55%), color-mix(in oklab, var(--primary) 25%, oklch(0.16 0.03 265))"
  },
  {
    name: "Soft",
    value: "soft",
    tone: "light",
    css: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 12%, white), color-mix(in oklab, var(--primary) 32%, white))"
  },
  {
    name: "Tint",
    value: "tint",
    tone: "light",
    css: "radial-gradient(at 15% 10%, color-mix(in oklab, var(--primary) 30%, white) 0, transparent 55%), radial-gradient(at 90% 85%, color-mix(in oklab, var(--primary) 22%, white) 0, transparent 55%), color-mix(in oklab, var(--primary) 6%, white)"
  },
  {
    name: "Dots",
    value: "dots",
    tone: "light",
    css: "radial-gradient(color-mix(in oklab, var(--primary) 40%, transparent) 1px, transparent 1px) 0 0 / 18px 18px, color-mix(in oklab, var(--primary) 7%, white)"
  },
  {
    name: "Grid",
    value: "grid",
    tone: "light",
    css: "linear-gradient(color-mix(in oklab, var(--primary) 18%, transparent) 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(90deg, color-mix(in oklab, var(--primary) 18%, transparent) 1px, transparent 1px) 0 0 / 28px 28px, color-mix(in oklab, var(--primary) 6%, white)"
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

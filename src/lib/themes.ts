// 10 luxury themes for BRG businesses. Each overrides core CSS variables
// at :root level. Default (signature) preserves the original palette.

export type ThemeId =
  | "signature-sage"
  | "rose-bridal"
  | "noir-gold"
  | "ocean-spa"
  | "saffron-bloom"
  | "lavender-mist"
  | "terracotta-clay"
  | "emerald-forest"
  | "champagne-pearl"
  | "midnight-plum";

export type Theme = {
  id: ThemeId;
  name: string;
  tagline: string;
  swatches: [string, string, string, string]; // for preview chips
  vars: Record<string, string>;
};

// Helper: every theme can override these tokens (oklch strings).
// Anything not overridden falls back to :root in styles.css.
export const themes: Theme[] = [
  {
    id: "signature-sage",
    name: "Signature Sage",
    tagline: "Calm wellness — the BRG classic",
    swatches: ["#6B8068", "#E9DCC0", "#C99A8F", "#C8B27A"],
    vars: {
      "--sage": "oklch(0.55 0.06 155)",
      "--olive": "oklch(0.42 0.055 150)",
      "--ivory": "oklch(0.96 0.022 85)",
      "--sand": "oklch(0.88 0.05 75)",
      "--cloud": "oklch(0.84 0.018 70)",
      "--rose": "oklch(0.7 0.095 20)",
      "--mist": "oklch(0.86 0.035 220)",
      "--gold": "oklch(0.72 0.155 75)",
      "--deep-olive": "oklch(0.38 0.045 150)",
      "--background": "oklch(0.96 0.022 85)",
      "--foreground": "oklch(0.24 0.018 50)",
      "--card": "oklch(0.99 0.012 85)",
      "--primary": "oklch(0.42 0.055 150)",
      "--primary-foreground": "oklch(0.97 0.02 85)",
      "--secondary": "oklch(0.88 0.05 75)",
      "--muted": "oklch(0.92 0.025 80)",
      "--accent": "oklch(0.72 0.155 75)",
      "--accent-foreground": "oklch(0.24 0.018 50)",
      "--border": "oklch(0.84 0.022 75)",
      "--ring": "oklch(0.55 0.06 155)",
    },
  },
  {
    id: "rose-bridal",
    name: "Rose Bridal",
    tagline: "Soft pinks for bridal & beauty",
    swatches: ["#C9596E", "#F5E1E5", "#E8B7B0", "#B89668"],
    vars: {
      "--sage": "oklch(0.66 0.09 15)",
      "--olive": "oklch(0.5 0.12 18)",
      "--ivory": "oklch(0.97 0.018 25)",
      "--sand": "oklch(0.9 0.055 20)",
      "--cloud": "oklch(0.86 0.022 20)",
      "--rose": "oklch(0.66 0.13 15)",
      "--mist": "oklch(0.88 0.035 320)",
      "--gold": "oklch(0.72 0.13 70)",
      "--deep-olive": "oklch(0.42 0.1 18)",
      "--background": "oklch(0.97 0.018 25)",
      "--foreground": "oklch(0.24 0.025 20)",
      "--card": "oklch(0.99 0.01 25)",
      "--primary": "oklch(0.5 0.12 18)",
      "--primary-foreground": "oklch(0.98 0.01 25)",
      "--secondary": "oklch(0.9 0.055 20)",
      "--muted": "oklch(0.93 0.03 20)",
      "--accent": "oklch(0.72 0.13 70)",
      "--accent-foreground": "oklch(0.24 0.025 20)",
      "--border": "oklch(0.85 0.03 20)",
      "--ring": "oklch(0.66 0.13 15)",
    },
  },
  {
    id: "noir-gold",
    name: "Noir & Gold",
    tagline: "Dark editorial luxury",
    swatches: ["#1A1A1A", "#C9A84C", "#2D2D2D", "#F0D78C"],
    vars: {
      "--sage": "oklch(0.72 0.13 75)",
      "--olive": "oklch(0.6 0.12 75)",
      "--ivory": "oklch(0.22 0.012 80)",
      "--sand": "oklch(0.32 0.018 80)",
      "--cloud": "oklch(0.36 0.014 75)",
      "--rose": "oklch(0.72 0.12 25)",
      "--mist": "oklch(0.4 0.02 240)",
      "--gold": "oklch(0.78 0.14 80)",
      "--deep-olive": "oklch(0.85 0.1 80)",
      "--background": "oklch(0.18 0.01 80)",
      "--foreground": "oklch(0.95 0.018 85)",
      "--card": "oklch(0.24 0.012 80)",
      "--card-foreground": "oklch(0.95 0.018 85)",
      "--popover": "oklch(0.24 0.012 80)",
      "--popover-foreground": "oklch(0.95 0.018 85)",
      "--primary": "oklch(0.78 0.14 80)",
      "--primary-foreground": "oklch(0.18 0.01 80)",
      "--secondary": "oklch(0.3 0.018 80)",
      "--secondary-foreground": "oklch(0.95 0.018 85)",
      "--muted": "oklch(0.28 0.012 80)",
      "--muted-foreground": "oklch(0.78 0.02 85)",
      "--accent": "oklch(0.78 0.14 80)",
      "--accent-foreground": "oklch(0.18 0.01 80)",
      "--border": "oklch(0.38 0.015 80)",
      "--input": "oklch(0.32 0.015 80)",
      "--ring": "oklch(0.78 0.14 80)",
      "--sidebar": "oklch(0.2 0.012 80)",
      "--sidebar-foreground": "oklch(0.92 0.018 85)",
      "--sidebar-accent": "oklch(0.3 0.018 80)",
      "--sidebar-accent-foreground": "oklch(0.95 0.018 85)",
      "--sidebar-border": "oklch(0.38 0.015 80)",
    },
  },
  {
    id: "ocean-spa",
    name: "Ocean Spa",
    tagline: "Cool teal — calm, clinical, spa-ready",
    swatches: ["#1F5E6E", "#E3F0F2", "#A7CDD3", "#C9A84C"],
    vars: {
      "--sage": "oklch(0.55 0.08 210)",
      "--olive": "oklch(0.42 0.07 215)",
      "--ivory": "oklch(0.97 0.015 200)",
      "--sand": "oklch(0.88 0.04 200)",
      "--cloud": "oklch(0.84 0.025 210)",
      "--rose": "oklch(0.7 0.09 25)",
      "--mist": "oklch(0.88 0.04 210)",
      "--gold": "oklch(0.74 0.13 80)",
      "--deep-olive": "oklch(0.36 0.06 215)",
      "--background": "oklch(0.97 0.015 200)",
      "--foreground": "oklch(0.22 0.025 215)",
      "--card": "oklch(0.99 0.008 200)",
      "--primary": "oklch(0.42 0.07 215)",
      "--primary-foreground": "oklch(0.98 0.012 200)",
      "--secondary": "oklch(0.88 0.04 200)",
      "--muted": "oklch(0.92 0.022 205)",
      "--accent": "oklch(0.74 0.13 80)",
      "--accent-foreground": "oklch(0.22 0.025 215)",
      "--border": "oklch(0.84 0.025 205)",
      "--ring": "oklch(0.55 0.08 210)",
    },
  },
  {
    id: "saffron-bloom",
    name: "Saffron Bloom",
    tagline: "Warm Nepali saffron & marigold",
    swatches: ["#C2410C", "#FFEDD5", "#F4A261", "#7A1F1F"],
    vars: {
      "--sage": "oklch(0.62 0.15 50)",
      "--olive": "oklch(0.48 0.16 45)",
      "--ivory": "oklch(0.97 0.025 75)",
      "--sand": "oklch(0.9 0.06 65)",
      "--cloud": "oklch(0.86 0.03 60)",
      "--rose": "oklch(0.55 0.18 30)",
      "--mist": "oklch(0.88 0.035 40)",
      "--gold": "oklch(0.74 0.16 70)",
      "--deep-olive": "oklch(0.4 0.14 40)",
      "--background": "oklch(0.97 0.025 75)",
      "--foreground": "oklch(0.24 0.04 40)",
      "--card": "oklch(0.99 0.012 75)",
      "--primary": "oklch(0.48 0.16 45)",
      "--primary-foreground": "oklch(0.98 0.018 75)",
      "--secondary": "oklch(0.9 0.06 65)",
      "--muted": "oklch(0.93 0.035 70)",
      "--accent": "oklch(0.74 0.16 70)",
      "--accent-foreground": "oklch(0.24 0.04 40)",
      "--border": "oklch(0.85 0.035 65)",
      "--ring": "oklch(0.55 0.18 30)",
    },
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    tagline: "Soft purples for wellness & yoga",
    swatches: ["#7C6BA8", "#EFEAF8", "#C9BEDC", "#D9A7B6"],
    vars: {
      "--sage": "oklch(0.6 0.08 295)",
      "--olive": "oklch(0.46 0.1 295)",
      "--ivory": "oklch(0.97 0.012 300)",
      "--sand": "oklch(0.89 0.04 305)",
      "--cloud": "oklch(0.86 0.025 295)",
      "--rose": "oklch(0.72 0.085 15)",
      "--mist": "oklch(0.88 0.04 290)",
      "--gold": "oklch(0.74 0.12 75)",
      "--deep-olive": "oklch(0.4 0.09 295)",
      "--background": "oklch(0.97 0.012 300)",
      "--foreground": "oklch(0.24 0.03 295)",
      "--card": "oklch(0.99 0.008 300)",
      "--primary": "oklch(0.46 0.1 295)",
      "--primary-foreground": "oklch(0.98 0.012 300)",
      "--secondary": "oklch(0.89 0.04 305)",
      "--muted": "oklch(0.93 0.025 300)",
      "--accent": "oklch(0.72 0.085 15)",
      "--accent-foreground": "oklch(0.24 0.03 295)",
      "--border": "oklch(0.85 0.03 300)",
      "--ring": "oklch(0.6 0.08 295)",
    },
  },
  {
    id: "terracotta-clay",
    name: "Terracotta Clay",
    tagline: "Artisan earth — barber & studio",
    swatches: ["#A0522D", "#F2E4D3", "#C9856B", "#5C2018"],
    vars: {
      "--sage": "oklch(0.58 0.12 40)",
      "--olive": "oklch(0.44 0.13 35)",
      "--ivory": "oklch(0.96 0.025 70)",
      "--sand": "oklch(0.88 0.055 60)",
      "--cloud": "oklch(0.84 0.03 55)",
      "--rose": "oklch(0.55 0.14 30)",
      "--mist": "oklch(0.85 0.04 50)",
      "--gold": "oklch(0.72 0.14 70)",
      "--deep-olive": "oklch(0.34 0.1 30)",
      "--background": "oklch(0.96 0.025 70)",
      "--foreground": "oklch(0.22 0.035 35)",
      "--card": "oklch(0.99 0.012 70)",
      "--primary": "oklch(0.44 0.13 35)",
      "--primary-foreground": "oklch(0.97 0.018 70)",
      "--secondary": "oklch(0.88 0.055 60)",
      "--muted": "oklch(0.92 0.035 65)",
      "--accent": "oklch(0.72 0.14 70)",
      "--accent-foreground": "oklch(0.22 0.035 35)",
      "--border": "oklch(0.84 0.035 60)",
      "--ring": "oklch(0.58 0.12 40)",
    },
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    tagline: "Deep jewel green — premium spa",
    swatches: ["#0F5132", "#E8F0E9", "#7DA590", "#C9A84C"],
    vars: {
      "--sage": "oklch(0.5 0.1 155)",
      "--olive": "oklch(0.36 0.1 155)",
      "--ivory": "oklch(0.96 0.018 140)",
      "--sand": "oklch(0.88 0.045 135)",
      "--cloud": "oklch(0.84 0.025 145)",
      "--rose": "oklch(0.7 0.095 20)",
      "--mist": "oklch(0.86 0.03 200)",
      "--gold": "oklch(0.74 0.15 80)",
      "--deep-olive": "oklch(0.3 0.09 150)",
      "--background": "oklch(0.96 0.018 140)",
      "--foreground": "oklch(0.2 0.035 150)",
      "--card": "oklch(0.99 0.01 140)",
      "--primary": "oklch(0.36 0.1 155)",
      "--primary-foreground": "oklch(0.97 0.015 140)",
      "--secondary": "oklch(0.88 0.045 135)",
      "--muted": "oklch(0.92 0.028 140)",
      "--accent": "oklch(0.74 0.15 80)",
      "--accent-foreground": "oklch(0.2 0.035 150)",
      "--border": "oklch(0.84 0.03 140)",
      "--ring": "oklch(0.5 0.1 155)",
    },
  },
  {
    id: "champagne-pearl",
    name: "Champagne Pearl",
    tagline: "Soft neutrals — minimal & airy",
    swatches: ["#B89968", "#F8F4EC", "#E5D9C3", "#A89A85"],
    vars: {
      "--sage": "oklch(0.62 0.05 80)",
      "--olive": "oklch(0.5 0.05 80)",
      "--ivory": "oklch(0.97 0.015 85)",
      "--sand": "oklch(0.9 0.035 80)",
      "--cloud": "oklch(0.86 0.015 80)",
      "--rose": "oklch(0.74 0.07 25)",
      "--mist": "oklch(0.88 0.025 220)",
      "--gold": "oklch(0.7 0.1 75)",
      "--deep-olive": "oklch(0.42 0.04 80)",
      "--background": "oklch(0.97 0.015 85)",
      "--foreground": "oklch(0.26 0.02 70)",
      "--card": "oklch(0.99 0.008 85)",
      "--primary": "oklch(0.5 0.05 80)",
      "--primary-foreground": "oklch(0.98 0.012 85)",
      "--secondary": "oklch(0.9 0.035 80)",
      "--muted": "oklch(0.93 0.02 80)",
      "--accent": "oklch(0.7 0.1 75)",
      "--accent-foreground": "oklch(0.26 0.02 70)",
      "--border": "oklch(0.85 0.018 80)",
      "--ring": "oklch(0.62 0.05 80)",
    },
  },
  {
    id: "midnight-plum",
    name: "Midnight Plum",
    tagline: "Dark mode — moody, modern, bold",
    swatches: ["#3B1F4A", "#E9C9DC", "#1E1326", "#C9A84C"],
    vars: {
      "--sage": "oklch(0.65 0.12 330)",
      "--olive": "oklch(0.52 0.13 325)",
      "--ivory": "oklch(0.24 0.025 320)",
      "--sand": "oklch(0.34 0.04 325)",
      "--cloud": "oklch(0.36 0.025 320)",
      "--rose": "oklch(0.74 0.12 350)",
      "--mist": "oklch(0.4 0.04 280)",
      "--gold": "oklch(0.78 0.14 80)",
      "--deep-olive": "oklch(0.86 0.08 330)",
      "--background": "oklch(0.18 0.02 320)",
      "--foreground": "oklch(0.95 0.018 320)",
      "--card": "oklch(0.24 0.025 320)",
      "--card-foreground": "oklch(0.95 0.018 320)",
      "--popover": "oklch(0.24 0.025 320)",
      "--popover-foreground": "oklch(0.95 0.018 320)",
      "--primary": "oklch(0.74 0.12 350)",
      "--primary-foreground": "oklch(0.18 0.02 320)",
      "--secondary": "oklch(0.3 0.03 325)",
      "--secondary-foreground": "oklch(0.95 0.018 320)",
      "--muted": "oklch(0.28 0.025 320)",
      "--muted-foreground": "oklch(0.78 0.025 325)",
      "--accent": "oklch(0.78 0.14 80)",
      "--accent-foreground": "oklch(0.18 0.02 320)",
      "--border": "oklch(0.38 0.03 325)",
      "--input": "oklch(0.32 0.03 325)",
      "--ring": "oklch(0.74 0.12 350)",
      "--sidebar": "oklch(0.2 0.025 320)",
      "--sidebar-foreground": "oklch(0.92 0.018 320)",
      "--sidebar-accent": "oklch(0.3 0.03 325)",
      "--sidebar-accent-foreground": "oklch(0.95 0.018 320)",
      "--sidebar-border": "oklch(0.38 0.03 325)",
    },
  },
];

export const DEFAULT_THEME: ThemeId = "signature-sage";
export const THEME_STORAGE_KEY = "brg.theme";

export function getTheme(id: string | null | undefined): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  const theme = getTheme(id);
  const root = document.documentElement;
  // Clear previously applied theme variables to avoid bleed between themes
  const PREV_KEY = "__brgThemeVars";
  // @ts-expect-error - cache on element
  const prev: string[] | undefined = root[PREV_KEY];
  if (prev) prev.forEach((k) => root.style.removeProperty(k));
  const applied: string[] = [];
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
    applied.push(k);
  });
  // @ts-expect-error - cache on element
  root[PREV_KEY] = applied;
  root.setAttribute("data-theme", theme.id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch {}
}

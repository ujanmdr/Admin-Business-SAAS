import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { applyTheme, DEFAULT_THEME, themes, type ThemeId } from "@/lib/themes";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses } from "@/lib/tenant-data";

type Ctx = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  themes: typeof themes;
};

const ThemeContext = createContext<Ctx | null>(null);

const keyFor = (business: string) => `brg.theme:${business}`;

function readStoredTheme(business: string): ThemeId {
  try {
    const v = localStorage.getItem(keyFor(business)) as ThemeId | null;
    if (v && themes.some((t) => t.id === v)) return v;
  } catch {}
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeBusinessId } = useTenantStore();
  const activeBiz = mockBusinesses.find(b => b.id === activeBusinessId) || mockBusinesses[0];
  const businessName = activeBiz.name;

  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  // When business changes (or on first mount), load that business's theme.
  useEffect(() => {
    const next = readStoredTheme(businessName);
    setThemeIdState(next);
    applyTheme(next);
  }, [businessName]);

  const setThemeId = useCallback(
    (id: ThemeId) => {
      setThemeIdState(id);
      applyTheme(id);
      try {
        localStorage.setItem(keyFor(businessName), id);
      } catch {}
    },
    [businessName]
  );

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

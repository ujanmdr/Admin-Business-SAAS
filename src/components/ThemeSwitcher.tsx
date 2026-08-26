import { Palette, Check, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses } from "@/lib/tenant-data";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { themeId, setThemeId, themes } = useTheme();
  const { activeBusinessId } = useTenantStore();
  
  const activeBiz = mockBusinesses.find(b => b.id === activeBusinessId) || mockBusinesses[0];

  function applyToAllBusinesses() {
    try {
      mockBusinesses.forEach((b) => {
        localStorage.setItem(`brg.theme:${b.name}`, themeId);
      });
    } catch {}
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className="h-10 w-10 grid place-items-center rounded-xl border border-border bg-card hover:bg-muted transition"
      >
        <Palette className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-2">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">Interface theme</div>
            <div className="text-[11px] text-muted-foreground truncate">
              For <span className="text-foreground/80 font-medium">{activeBiz?.name}</span>
            </div>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted/40">
            Per business
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-1 gap-1 max-h-[420px] overflow-auto pr-1">
          {themes.map((t) => {
            const active = t.id === themeId;
            return (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 flex items-center gap-3 transition",
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent hover:bg-muted/60 hover:border-border"
                )}
              >
                <div className="flex -space-x-1.5 shrink-0">
                  {t.swatches.map((c, i) => (
                    <span
                      key={i}
                      className="h-6 w-6 rounded-full border border-white/70 shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {t.tagline}
                  </div>
                </div>
                {active && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <button
          onClick={applyToAllBusinesses}
          className="w-full text-left rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition flex items-center gap-2"
        >
          <Copy className="h-3.5 w-3.5" />
          Apply this theme to all my businesses
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

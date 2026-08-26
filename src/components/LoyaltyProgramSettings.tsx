import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Pause, Play, Heart, Award, Repeat2 } from "lucide-react";
import { SERVICES } from "@/lib/service-data";
import {
  useLoyaltyRules,
  toggleRule,
  type LoyaltyRule,
} from "@/lib/loyalty-program-data";
import { LoyaltyRuleModal } from "./LoyaltyRuleModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function serviceName(id: string) {
  return SERVICES.find((s) => s.id === id)?.name || "—";
}

export function LoyaltyProgramSettings() {
  const rules = useLoyaltyRules();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LoyaltyRule | null>(null);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(r: LoyaltyRule) {
    setEditing(r);
    setOpen(true);
  }
  function onToggle(r: LoyaltyRule) {
    toggleRule(r.id);
    toast.success(`${r.name} is now ${r.active ? "paused" : "active"}`);
  }

  const activeCount = rules.filter((r) => r.active).length;
  const totalRedemptions = rules.reduce((s, r) => s + r.redemptionsCount, 0);

  const sortedRules = [...rules].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-gradient-to-br from-card to-sand-soft/40 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl">Loyalty Program</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Design loyalty rules that turn repeat services into free rewards. Each rule tracks its
            own progress per customer.
          </p>
        </div>
        <Button onClick={openNew} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
          <Plus className="h-4 w-4" />Create new rule
        </Button>
      </header>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-background/40">
        {[
          { l: "Active rules", v: activeCount, i: Heart },
          { l: "Total rules", v: rules.length, i: Award },
          { l: "Lifetime redemptions", v: totalRedemptions, i: Repeat2 },
        ].map((k) => {
          const Icon = k.i;
          return (
            <div key={k.l} className="p-5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-gold" />{k.l}
              </div>
              <div className="font-serif text-2xl mt-1">{k.v}</div>
            </div>
          );
        })}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.length === 0 && (
          <div className="md:col-span-2 text-center py-10 text-sm text-muted-foreground italic">
            No loyalty rules yet. Create your first to start rewarding regulars.
          </div>
        )}
        {sortedRules.map((r) => (
          <article
            key={r.id}
            className={cn(
              "rounded-2xl border bg-background p-4 flex flex-col gap-3 transition",
              r.active ? "border-border" : "border-dashed border-border opacity-75",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-serif text-lg leading-tight truncate">{r.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  Milestone: every {r.milestone} qualifying visits
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[10px] px-2 py-1 rounded-full border",
                  r.active
                    ? "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive"
                    : "bg-muted text-muted-foreground border-border",
                )}
              >
                {r.active ? "Active" : "Paused"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-muted-foreground">Triggers — </span>
                <span className="font-medium">
                  {r.triggerServiceIds.map(serviceName).join(" + ")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Reward (free) — </span>
                <span className="font-medium text-gold">{serviceName(r.rewardServiceId)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Redeemed — </span>
                <span className="font-medium">{r.redemptionsCount} times</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 mt-auto">
              <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                <Pencil className="h-3.5 w-3.5" />Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onToggle(r)}>
                {r.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {r.active ? "Pause" : "Activate"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      <LoyaltyRuleModal open={open} onOpenChange={setOpen} editing={editing} />
    </section>
  );
}

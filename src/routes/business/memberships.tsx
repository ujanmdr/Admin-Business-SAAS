import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { MEMBERSHIPS, fmt } from "@/lib/programs-data";
import { Plus, Crown, Users, TrendingUp, RefreshCw, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/memberships")({
  head: () => ({ meta: [{ title: "Memberships · BRG Suite" }] }),
  component: MembershipsPage,
});

function MembershipsPage() {
  const totalMembers = MEMBERSHIPS.reduce((s, m) => s + m.members, 0);
  const monthlyRevenue = MEMBERSHIPS.reduce((s, m) => s + m.monthlyRevenue, 0);
  const avgRenewal = Math.round(MEMBERSHIPS.reduce((s, m) => s + m.renewalRate, 0) / MEMBERSHIPS.length);

  const kpis = [
    { label: "Active Memberships", value: String(MEMBERSHIPS.length), icon: Crown, tone: "bg-[color-mix(in_oklab,var(--gold)_22%,white)]" },
    { label: "Total Members", value: String(totalMembers), icon: Users, tone: "bg-sand-soft" },
    { label: "Monthly Recurring", value: fmt(monthlyRevenue), icon: TrendingUp, tone: "bg-[color-mix(in_oklab,var(--sage)_22%,white)]" },
    { label: "Avg Renewal Rate", value: avgRenewal + "%", icon: RefreshCw, tone: "bg-mist-soft" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Memberships"
        description="Recurring revenue programs that keep your most loyal customers coming back."
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" />New membership</Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-2xl mt-1">{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEMBERSHIPS.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-luxe transition">
            <div className={cn("bg-gradient-to-br p-6 border-b border-border", m.tone)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Membership</div>
                  <div className="font-serif text-2xl mt-1">{m.name}</div>
                  <div className="text-xs text-foreground/75 mt-1">{m.tagline}</div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-card border border-border grid place-items-center text-gold">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-serif text-3xl text-foreground">{fmt(m.monthly)}<span className="text-sm text-muted-foreground font-sans"> /month</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">or {fmt(m.annual)} / year</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-soft border border-rose font-medium">
                  {m.discountPct}% off services
                </span>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />Perks included
                </div>
                <ul className="space-y-1.5">
                  {m.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-deep-olive mt-0.5 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Members</div>
                  <div className="font-serif text-lg">{m.members}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly</div>
                  <div className="font-serif text-lg">{fmt(m.monthlyRevenue)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Renewal</div>
                  <div className="font-serif text-lg">{m.renewalRate}%</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Edit</Button>
                <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">View members</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

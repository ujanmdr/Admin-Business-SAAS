import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LOYALTY_CUSTOMERS } from "@/lib/programs-data";
import { Heart, Sparkles, Award, Bell, Settings as SettingsIcon, Search, Stamp, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LoyaltyProgramSettings } from "@/components/LoyaltyProgramSettings";
import { CustomerLoyaltySimulator } from "@/components/CustomerLoyaltySimulator";

export const Route = createFileRoute("/business/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty · BRG Suite" }] }),
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<"progress" | "rules" | "simulator">("progress");
  const [q, setQ] = useState("");
  const eligible = LOYALTY_CUSTOMERS.filter((c) => c.stamps >= c.required).length;
  const halfway = LOYALTY_CUSTOMERS.filter((c) => c.stamps >= 5 && c.stamps < 9).length;
  const oneAway = LOYALTY_CUSTOMERS.filter((c) => c.stamps === 9).length;
  const totalRedeemed = LOYALTY_CUSTOMERS.reduce((s, c) => s + c.freeVisitsRedeemed, 0);

  const kpis = [
    { label: "Active Stamp Cards", value: String(LOYALTY_CUSTOMERS.length), icon: Stamp, tone: "bg-sand-soft" },
    { label: "Free Visits Earned", value: String(eligible), icon: Award, tone: "bg-[color-mix(in_oklab,var(--gold)_22%,white)]" },
    { label: "Halfway (5+ stamps)", value: String(halfway), icon: Sparkles, tone: "bg-mist-soft" },
    { label: "Free Visits Redeemed", value: String(totalRedeemed), icon: Heart, tone: "bg-rose-soft" },
  ];

  const milestones = [
    { stamp: 5, title: "Halfway notification", desc: "You're halfway to a free visit ✨ Keep glowing.", tone: "bg-mist-soft border-mist" },
    { stamp: 9, title: "One more visit", desc: "One more visit and your next one is on us 🌿", tone: "bg-sand-soft border-border" },
    { stamp: 10, title: "Free visit earned", desc: "You earned a free visit! Book anytime within 60 days.", tone: "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)]" },
  ];

  const filtered = LOYALTY_CUSTOMERS.filter((c) =>
    q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Loyalty"
        description="Digital stamp cards that turn first-timers into regulars."
        actions={
          activeTab !== "rules" ? (
            <Button
              onClick={() => setActiveTab("rules")}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
            >
              <SettingsIcon className="h-4 w-4" />Program Rules
            </Button>
          ) : null
        }
      />

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-6">
        {[
          { id: "progress", label: "Stamp Cards", icon: Stamp },
          { id: "rules", label: "Program Rules", icon: SettingsIcon },
          { id: "simulator", label: "Customer App Simulator", icon: Smartphone },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all",
                activeTab === t.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border hover:bg-sand-soft text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "progress" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Brand stamp card */}
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[color-mix(in_oklab,var(--rose)_45%,white)] to-[color-mix(in_oklab,var(--sand)_70%,white)] border border-border p-6 shadow-luxe">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-foreground/70">Aura Stamp Card</div>
                  <div className="font-serif text-2xl mt-1">9 visits, 10th is on us.</div>
                  <p className="text-sm text-foreground/75 mt-1">Earn one stamp per qualifying service. Auto-tracked in customer profiles.</p>
                </div>
                <div className="text-right">
                  {oneAway > 0 && (
                    <div className="text-xs px-2 py-1 rounded-full bg-card border border-border">
                      {oneAway} customer{oneAway > 1 ? "s" : ""} one visit away
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }).map((_, i) => {
                  const filled = i < 7;
                  const isReward = i === 9;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-full border grid place-items-center font-serif text-sm transition",
                        isReward
                          ? "border-2 border-foreground bg-card text-gold"
                          : filled
                          ? "bg-foreground text-background border-foreground shadow-luxe"
                          : "bg-card border-border text-muted-foreground",
                      )}
                    >
                      {isReward ? "★" : filled ? "✓" : i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-foreground/70 mt-3 italic">Sample preview · 7 of 10 stamps</div>
            </div>

            {/* Quick settings summary */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <div className="font-serif text-xl">Quick Settings</div>
                <div className="text-xs text-muted-foreground mt-0.5">Summary of loyalty configuration.</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Default Visits Required</label>
                  <Input readOnly value="10" className="mt-1 bg-sand-soft/30 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Eligible Service Categories</label>
                  <Input readOnly value="Hair, Skin, Nails, Barber" className="mt-1 bg-sand-soft/30 cursor-not-allowed" />
                </div>
                <div className="rounded-xl bg-sand-soft p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-gold" />Milestone WhatsApp Alerts</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase tracking-wider font-bold">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-gold" />Auto-Pausing Expired Triggers</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase tracking-wider font-bold">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h3 className="font-serif text-xl mb-3">Milestone notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {milestones.map((m) => (
                <div key={m.stamp} className={cn("rounded-2xl border p-4", m.tone)}>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                    <Stamp className="h-3.5 w-3.5" />Stamp {m.stamp}
                  </div>
                  <div className="font-serif text-lg mt-1">{m.title}</div>
                  <p className="text-sm text-foreground/75 mt-1.5 italic">"{m.desc}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl">Customer stamp progress</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search customer…"
                  className="h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((c) => {
                const ready = c.stamps >= c.required;
                return (
                  <div key={c.phone} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.phone} · {c.category}</div>
                      </div>
                      {ready ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-[color-mix(in_oklab,var(--sage)_25%,white)] border border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive font-medium">Free visit ready</span>
                      ) : (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-sand-soft border border-border">{c.stamps}/{c.required}</span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-10 gap-1.5">
                      {Array.from({ length: c.required }).map((_, i) => {
                        const filled = i < c.stamps;
                        const reward = i === c.required - 1;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "aspect-square rounded-full border text-[10px] grid place-items-center transition",
                              reward
                                ? "border-2 border-foreground text-gold font-bold"
                                : filled
                                ? "bg-foreground text-background border-foreground shadow-sm"
                                : "bg-card border-border text-muted-foreground",
                            )}
                          >
                            {reward ? "★" : filled ? "✓" : ""}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-medium">Free visits redeemed: {c.freeVisitsRedeemed}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "rules" && <LoyaltyProgramSettings />}

      {activeTab === "simulator" && <CustomerLoyaltySimulator />}
    </div>
  );
}

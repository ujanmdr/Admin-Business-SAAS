import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { PACKAGES, Package, fmt } from "@/lib/programs-data";
import {
  Plus, Search, Package as PkgIcon, Sparkles, Calendar, TrendingUp, Wallet,
  Eye, MoreHorizontal, Edit, Copy, Image as ImageIcon, Gift, Globe2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/packages")({
  head: () => ({ meta: [{ title: "Packages · BRG Suite" }] }),
  component: PackagesPage,
});

const CATS = ["All", "Bridal", "Birthday", "Hair", "Facial", "Massage", "Dental", "Multi-session", "Academy"];

const CAT_TONES: Record<string, string> = {
  Bridal: "from-[color-mix(in_oklab,var(--rose)_55%,white)] to-card",
  Birthday: "from-[color-mix(in_oklab,var(--gold)_30%,white)] to-card",
  Hair: "from-[color-mix(in_oklab,var(--rose)_35%,white)] to-card",
  Facial: "from-[color-mix(in_oklab,var(--sand)_70%,white)] to-card",
  Massage: "from-[color-mix(in_oklab,var(--sage)_30%,white)] to-card",
  Dental: "from-[color-mix(in_oklab,var(--mist)_70%,white)] to-card",
  "Multi-session": "from-[color-mix(in_oklab,var(--cloud)_70%,white)] to-card",
  Academy: "from-[color-mix(in_oklab,var(--gold)_25%,white)] to-card",
};

function PackagesPage() {
  const [open, setOpen] = useState<Package | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const rows = useMemo(
    () =>
      PACKAGES.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (q === "" || p.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, cat],
  );

  const totals = {
    sales: PACKAGES.reduce((s, p) => s + p.salesCount, 0),
    revenue: PACKAGES.reduce((s, p) => s + p.revenue, 0),
    redeemed: PACKAGES.reduce((s, p) => s + p.redeemed, 0),
    active: PACKAGES.filter((p) => p.active).length,
  };

  const kpis = [
    { label: "Active Packages", value: String(totals.active), icon: PkgIcon, tone: "bg-sand-soft" },
    { label: "Packages Sold", value: String(totals.sales), icon: Sparkles, tone: "bg-rose-soft" },
    { label: "Sessions Redeemed", value: String(totals.redeemed), icon: Calendar, tone: "bg-mist-soft" },
    { label: "Revenue (All)", value: fmt(totals.revenue), icon: Wallet, tone: "bg-[color-mix(in_oklab,var(--gold)_22%,white)]" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Packages"
        description="Bundles, multi-session plans and bridal experiences customers love to buy."
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />Create package
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 hover:shadow-luxe transition-shadow">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-2xl mt-1">{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search packages…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "text-xs px-3 py-2 rounded-full border transition",
                cat === c ? "bg-primary text-primary-foreground border-primary shadow-luxe" : "bg-card border-border hover:bg-sand-soft",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((p) => {
          const savings = p.totalValue - p.price;
          const tone = CAT_TONES[p.category] || "from-sand-soft to-card";
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-luxe transition cursor-pointer" onClick={() => setOpen(p)}>
              <div className={cn("bg-gradient-to-br p-5 border-b border-border", tone)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.category}</div>
                    <div className="font-serif text-xl mt-1 leading-tight">{p.name}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-card/60 transition" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => setOpen(p)}><Eye className="h-4 w-4" />View</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-4 w-4" />Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose">Disable</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-foreground/75 mt-2 line-clamp-2">{p.description}</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
                    <div className="font-serif text-2xl">{fmt(p.price)}</div>
                    <div className="text-xs text-muted-foreground line-through">{fmt(p.totalValue)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-[color-mix(in_oklab,var(--sage)_25%,white)] border border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive font-medium">
                      Save {fmt(savings)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Includes</div>
                  <div className="flex flex-wrap gap-1">
                    {p.services.slice(0, 3).map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-sand-soft border border-border">{s}</span>
                    ))}
                    {p.services.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">+{p.services.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessions</div>
                    <div className="font-medium mt-0.5">{p.sessions}</div>
                  </div>
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Validity</div>
                    <div className="font-medium mt-0.5">{p.validityMonths} mo</div>
                  </div>
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sold</div>
                    <div className="font-medium mt-0.5">{p.salesCount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />{fmt(p.revenue)} revenue</span>
                  <div className="flex items-center gap-1.5">
                    {p.giftable && <Gift className="h-3.5 w-3.5 text-rose" aria-label="Giftable" />}
                    {p.marketplace && <Globe2 className="h-3.5 w-3.5 text-deep-olive" aria-label="On marketplace" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background">
          <SheetHeader><SheetTitle className="font-serif text-2xl">{open?.name}</SheetTitle></SheetHeader>
          {open && (
            <div className="mt-5 space-y-5">
              <p className="text-sm text-foreground/80">{open.description}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-sand-soft p-3"><div className="text-[10px] uppercase text-muted-foreground">Price</div><div className="font-serif text-lg">{fmt(open.price)}</div></div>
                <div className="rounded-xl bg-sand-soft p-3"><div className="text-[10px] uppercase text-muted-foreground">Value</div><div className="font-serif text-lg">{fmt(open.totalValue)}</div></div>
                <div className="rounded-xl bg-sand-soft p-3"><div className="text-[10px] uppercase text-muted-foreground">Save</div><div className="font-serif text-lg text-deep-olive">{fmt(open.totalValue - open.price)}</div></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Services</div>
                <div className="space-y-1.5">
                  {open.services.map((s) => (
                    <div key={s} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                      <span>{s}</span>
                      <span className="text-xs text-muted-foreground">included</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-card p-3"><div className="text-[10px] uppercase text-muted-foreground">Sessions</div><div className="font-medium">{open.sessions} total · {open.redeemed} redeemed across customers</div></div>
                <div className="rounded-xl border border-border bg-card p-3"><div className="text-[10px] uppercase text-muted-foreground">Validity</div><div className="font-medium">{open.validityMonths} months from purchase</div></div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between"><div className="text-sm">Available for gifting</div><Switch defaultChecked={open.giftable} /></div>
                <div className="flex items-center justify-between"><div className="text-sm">Visible on BRG marketplace</div><Switch defaultChecked={open.marketplace} /></div>
                <div className="flex items-center justify-between"><div className="text-sm">Active</div><Switch defaultChecked={open.active} /></div>
              </div>
              <div className="text-xs text-muted-foreground">Terms: Non-transferable. Sessions cannot be exchanged for cash. Subject to staff availability.</div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create modal */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Create package</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid md:grid-cols-[140px_1fr] gap-4">
              <div className="aspect-square rounded-xl border border-dashed border-border bg-sand-soft/40 grid place-items-center text-muted-foreground">
                <div className="text-center"><ImageIcon className="h-5 w-5 mx-auto mb-1" /><div className="text-[11px]">Cover image</div></div>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-medium">Package name</label><Input className="mt-1" placeholder="e.g. Bridal Premium" /></div>
                <div><label className="text-xs font-medium">Description</label><Textarea className="mt-1" rows={2} /></div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div><label className="text-xs font-medium">Sessions</label><Input className="mt-1" defaultValue="6" /></div>
              <div><label className="text-xs font-medium">Price (NPR)</label><Input className="mt-1" defaultValue="15000" /></div>
              <div><label className="text-xs font-medium">Validity (months)</label><Input className="mt-1" defaultValue="6" /></div>
            </div>
            <div><label className="text-xs font-medium">Services included</label><Input className="mt-1" placeholder="Hair Spa, HydraFacial, …" /></div>
            <div><label className="text-xs font-medium">Terms</label><Textarea className="mt-1" rows={2} defaultValue="Non-transferable. Subject to availability." /></div>
            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
              <div className="flex items-center justify-between"><div className="text-sm">Available for gifting</div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div className="text-sm">Visible on BRG marketplace</div><Switch defaultChecked /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={() => setAdding(false)}>Create package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

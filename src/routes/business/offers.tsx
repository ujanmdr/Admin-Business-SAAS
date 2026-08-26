import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OFFERS, Offer, OfferType, fmt } from "@/lib/growth-data";
import {
  Plus, Search, Tag, Sparkles, Calendar, TrendingUp, Globe2, Eye,
  Percent, Flame, Gift, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/offers")({
  head: () => ({ meta: [{ title: "Offers · BRG Suite" }] }),
  component: OffersPage,
});

const TYPES: OfferType[] = ["Discount", "Limited-time", "Festival", "Bridal", "Birthday", "Package", "First-time", "Off-peak"];

const TYPE_TONE: Record<OfferType, string> = {
  Discount: "from-[color-mix(in_oklab,var(--sage)_25%,white)] to-card",
  "Limited-time": "from-[color-mix(in_oklab,var(--gold)_30%,white)] to-card",
  Festival: "from-[color-mix(in_oklab,var(--rose)_45%,white)] to-card",
  Bridal: "from-[color-mix(in_oklab,var(--rose)_55%,white)] to-card",
  Birthday: "from-[color-mix(in_oklab,var(--gold)_25%,white)] to-card",
  Package: "from-[color-mix(in_oklab,var(--mist)_70%,white)] to-card",
  "First-time": "from-[color-mix(in_oklab,var(--sand)_70%,white)] to-card",
  "Off-peak": "from-[color-mix(in_oklab,var(--cloud)_70%,white)] to-card",
};

function OffersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | OfferType>("All");
  const [open, setOpen] = useState(false);

  const offers = useMemo(() => OFFERS.filter(o =>
    (filter === "All" || o.type === filter) &&
    (q === "" || o.title.toLowerCase().includes(q.toLowerCase()))
  ), [q, filter]);

  const totals = useMemo(() => ({
    active: OFFERS.filter(o => o.active).length,
    redemptions: OFFERS.reduce((a, o) => a + o.uses, 0),
    revenue: OFFERS.reduce((a, o) => a + o.revenue, 0),
    avgDiscount: Math.round(OFFERS.reduce((a, o) => a + (1 - o.discountedPrice / o.originalPrice) * 100, 0) / OFFERS.length),
  }), []);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <PageHeader
        eyebrow="Growth"
        title="Offers"
        description="Festival promos, flash deals and bridal bundles — built to convert."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> New offer</Button>
            </DialogTrigger>
            <NewOfferDialog onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<Tag className="size-4" />} label="Active offers" value={String(totals.active)} tone="var(--sage)" />
        <Kpi icon={<TrendingUp className="size-4" />} label="Redemptions" value={totals.redemptions.toLocaleString()} tone="var(--rose)" />
        <Kpi icon={<Sparkles className="size-4" />} label="Revenue generated" value={fmt(totals.revenue)} tone="var(--gold)" />
        <Kpi icon={<Percent className="size-4" />} label="Avg. discount" value={`${totals.avgDiscount}%`} tone="var(--mist)" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search offers" className="pl-9 bg-card" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...TYPES] as const).map(t => (
            <button key={t} onClick={() => setFilter(t as any)}
              className={cn("px-3 py-1.5 rounded-full text-xs border transition",
                filter === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {offers.map(o => <OfferCard key={o.id} o={o} />)}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="size-8 rounded-full grid place-items-center" style={{ background: `color-mix(in oklab, ${tone} 25%, white)`, color: `color-mix(in oklab, ${tone} 70%, black)` }}>
          {icon}
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
    </div>
  );
}

function OfferCard({ o }: { o: Offer }) {
  const pct = Math.round((1 - o.discountedPrice / o.originalPrice) * 100);
  return (
    <div className={cn("rounded-2xl border border-border p-5 shadow-sm bg-gradient-to-br", TYPE_TONE[o.type])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{o.type}</div>
          <h3 className="font-serif text-xl mt-1">{o.title}</h3>
        </div>
        <Badge variant="outline" className="bg-white/70 border-border">−{pct}%</Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{o.description}</p>

      <div className="mt-4 flex items-end gap-2">
        <div className="font-serif text-2xl text-foreground">{fmt(o.discountedPrice)}</div>
        <div className="text-sm text-muted-foreground line-through mb-1">{fmt(o.originalPrice)}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Uses" value={String(o.uses)} />
        <Stat label="Revenue" value={fmt(o.revenue)} />
        <Stat label="Validity" value={o.validTo.slice(5)} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full",
            o.active ? "bg-[color-mix(in_oklab,var(--sage)_25%,white)] text-foreground" : "bg-muted text-muted-foreground")}>
            <span className={cn("size-1.5 rounded-full", o.active ? "bg-[color:var(--sage)]" : "bg-muted-foreground")} />
            {o.active ? "Active" : "Paused"}
          </span>
          {o.marketplace && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/70 text-muted-foreground border border-border">
              <Globe2 className="size-3" /> Marketplace
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="gap-1"><Eye className="size-3.5" /> View</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 border border-border/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-medium text-foreground mt-0.5 truncate">{value}</div>
    </div>
  );
}

export function NewOfferDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle className="font-serif text-2xl">Create new offer</DialogTitle></DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <label className="text-xs text-muted-foreground">Offer title</label>
          <Input placeholder="e.g. Tihar Glow Festival" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs text-muted-foreground">Type</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
              <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-muted-foreground">Discount %</label>
            <Input type="number" placeholder="25" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-muted-foreground">Description</label>
          <Textarea rows={3} placeholder="What's included…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs text-muted-foreground">Valid from</label>
            <Input type="date" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs text-muted-foreground">Valid to</label>
            <Input type="date" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
          <div className="text-sm flex items-center gap-2"><Globe2 className="size-4 text-muted-foreground" /> Show on BRG marketplace</div>
          <Switch defaultChecked />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Publish offer</Button>
      </DialogFooter>
    </DialogContent>
  );
}

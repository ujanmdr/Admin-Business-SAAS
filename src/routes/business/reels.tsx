import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { REELS, Reel } from "@/lib/growth-data";
import {
  Plus, Search, Eye, Bookmark, Calendar, Sparkles, Film, Link2, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/reels")({
  head: () => ({ meta: [{ title: "Reels & Content · BRG Suite" }] }),
  component: ReelsPage,
});

const CATS = ["All", "Transformation", "Bridal", "Hair Color", "Facial Glow", "Makeup", "Spa"] as const;

function ReelsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");

  const reels = useMemo(() => REELS.filter(r =>
    (cat === "All" || r.category === cat) &&
    (q === "" || r.caption.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat]);

  const totals = useMemo(() => ({
    published: REELS.filter(r => r.status === "Published").length,
    views: REELS.reduce((a, r) => a + r.views, 0),
    saves: REELS.reduce((a, r) => a + r.saves, 0),
    bookings: REELS.reduce((a, r) => a + r.bookings, 0),
  }), []);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <PageHeader
        eyebrow="Growth"
        title="Reels & Content"
        description="Plan, publish and turn beauty content into bookings."
        actions={<Button className="gap-2"><Plus className="size-4" /> Upload reel</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<Film className="size-4" />} label="Published reels" value={String(totals.published)} tone="var(--sage)" />
        <Kpi icon={<Eye className="size-4" />} label="Total views" value={totals.views.toLocaleString()} tone="var(--mist)" />
        <Kpi icon={<Bookmark className="size-4" />} label="Saves" value={totals.saves.toLocaleString()} tone="var(--rose)" />
        <Kpi icon={<Sparkles className="size-4" />} label="Bookings generated" value={String(totals.bookings)} tone="var(--gold)" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search captions" className="pl-9 bg-card" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map(t => (
            <button key={t} onClick={() => setCat(t)}
              className={cn("px-3 py-1.5 rounded-full text-xs border transition",
                cat === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {reels.map(r => <ReelCard key={r.id} r={r} />)}
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

function ReelCard({ r }: { r: Reel }) {
  const statusTone = r.status === "Published" ? "var(--sage)" : r.status === "Scheduled" ? "var(--mist)" : "var(--cloud)";
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
      <div
        className="aspect-[9/14] relative grid place-items-center"
        style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${r.thumbColor} 60%, white), color-mix(in oklab, ${r.thumbColor} 25%, white))` }}
      >
        <div className="text-7xl drop-shadow-sm">{r.emoji}</div>
        <Badge className="absolute top-3 left-3 border-0" style={{ background: `color-mix(in oklab, ${statusTone} 80%, white)`, color: "var(--foreground)" }}>
          {r.status}
        </Badge>
        <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.2em] text-foreground/70 bg-white/70 px-2 py-1 rounded-full backdrop-blur-sm">
          {r.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm line-clamp-2 min-h-[2.5rem]">{r.caption}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.taggedServices.slice(0, 2).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--sage)_20%,white)] text-foreground/80">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {r.views.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1"><Bookmark className="size-3.5" /> {r.saves}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {r.bookings}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="size-3.5" /> {r.taggedStaff.join(", ")}
        </div>

        <Button variant="outline" size="sm" className="mt-4 w-full gap-2">
          <Link2 className="size-3.5" /> Book This Look
        </Button>
      </div>
    </div>
  );
}

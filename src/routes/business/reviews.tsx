import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { REVIEWS, Review } from "@/lib/growth-data";
import {
  Star, Search, MessageCircle, Flag, Sparkles, TrendingUp, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/reviews")({
  head: () => ({ meta: [{ title: "Reviews · BRG Suite" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | "5" | "4" | "Low" | "Reported">("All");

  const reviews = useMemo(() => REVIEWS.filter(r => {
    if (q && !r.text.toLowerCase().includes(q.toLowerCase()) && !r.customer.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "5") return r.rating === 5;
    if (filter === "4") return r.rating === 4;
    if (filter === "Low") return r.rating <= 3;
    if (filter === "Reported") return !!r.reported;
    return true;
  }), [q, filter]);

  const avg = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);
  const reported = REVIEWS.filter(r => r.reported).length;

  const byService = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    REVIEWS.forEach(r => {
      map[r.service] ||= { sum: 0, count: 0 };
      map[r.service].sum += r.rating;
      map[r.service].count += 1;
    });
    return Object.entries(map).map(([s, v]) => ({ service: s, avg: v.sum / v.count, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const byStaff = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    REVIEWS.forEach(r => {
      map[r.staff] ||= { sum: 0, count: 0 };
      map[r.staff].sum += r.rating;
      map[r.staff].count += 1;
    });
    return Object.entries(map).map(([s, v]) => ({ staff: s, avg: v.sum / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg);
  }, []);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <PageHeader eyebrow="Growth" title="Reviews" description="Listen, reply and grow your reputation." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<Star className="size-4" />} label="Average rating" value={avg} sub="out of 5" tone="var(--gold)" />
        <Kpi icon={<MessageCircle className="size-4" />} label="Total reviews" value={String(REVIEWS.length)} tone="var(--sage)" />
        <Kpi icon={<TrendingUp className="size-4" />} label="5-star share" value={`${Math.round(REVIEWS.filter(r => r.rating === 5).length / REVIEWS.length * 100)}%`} tone="var(--rose)" />
        <Kpi icon={<Flag className="size-4" />} label="Reported" value={String(reported)} tone="var(--mist)" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <Panel title="Reviews by service">
          <ul className="divide-y divide-border">
            {byService.map(s => (
              <li key={s.service} className="py-2.5 flex items-center justify-between">
                <span className="text-sm">{s.service}</span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Star className="size-3 fill-[color:var(--gold)] text-[color:var(--gold)]" />
                  {s.avg.toFixed(1)} · {s.count}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top-rated staff">
          <ul className="divide-y divide-border">
            {byStaff.map(s => (
              <li key={s.staff} className="py-2.5 flex items-center justify-between">
                <span className="text-sm inline-flex items-center gap-2">
                  <span className="size-7 rounded-full bg-[color-mix(in_oklab,var(--sage)_30%,white)] grid place-items-center text-[11px] font-medium">
                    {s.staff.split(" ").map(p => p[0]).slice(0, 2).join("")}
                  </span>
                  {s.staff}
                </span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Star className="size-3 fill-[color:var(--gold)] text-[color:var(--gold)]" />
                  {s.avg.toFixed(1)} · {s.count}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Rating breakdown">
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(n => {
              const count = REVIEWS.filter(r => r.rating === n).length;
              const pct = (count / REVIEWS.length) * 100;
              return (
                <div key={n} className="flex items-center gap-3">
                  <div className="w-8 text-xs text-muted-foreground inline-flex items-center gap-0.5">
                    {n} <Star className="size-3 fill-[color:var(--gold)] text-[color:var(--gold)]" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-[color:var(--sage)]" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-xs text-muted-foreground text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search reviews" className="pl-9 bg-card" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "5", "4", "Low", "Reported"] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn("px-3 py-1.5 rounded-full text-xs border transition",
                filter === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}>
              {t === "5" || t === "4" ? `${t} stars` : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="size-8 rounded-full grid place-items-center" style={{ background: `color-mix(in oklab, ${tone} 25%, white)`, color: `color-mix(in oklab, ${tone} 70%, black)` }}>
          {icon}
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl">{value} {sub && <span className="text-sm text-muted-foreground font-sans">{sub}</span>}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <h3 className="font-serif text-lg mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const [reply, setReply] = useState(r.reply ?? "");
  const [editing, setEditing] = useState(false);
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[color-mix(in_oklab,var(--rose)_30%,white)] grid place-items-center text-sm font-medium">
            {r.customer.split(" ").map(p => p[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="text-sm font-medium">{r.customer}</div>
            <div className="text-xs text-muted-foreground">{r.service} · {r.staff}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-[color:var(--gold)] text-[color:var(--gold)]" : "text-muted-foreground/40")} />
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{r.date}</div>
        </div>
      </div>

      <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{r.text}</p>

      {(reply || editing) && (
        <div className="mt-4 rounded-xl bg-[color-mix(in_oklab,var(--sage)_15%,white)] border border-border p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Business reply</div>
          {editing ? (
            <Textarea value={reply} onChange={e => setReply(e.target.value)} rows={2} className="bg-card" />
          ) : (
            <p className="text-sm">{reply}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <div>
          {r.reported && (
            <Badge variant="outline" className="bg-[color-mix(in_oklab,var(--rose)_20%,white)] border-border text-foreground gap-1">
              <Flag className="size-3" /> Reported
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1"><Flag className="size-3.5" /> Report</Button>
          {editing ? (
            <Button size="sm" onClick={() => setEditing(false)}>Save reply</Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
              <MessageCircle className="size-3.5" /> {reply ? "Edit reply" : "Reply"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

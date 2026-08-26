import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, KpiCard, StatusBadge } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Eye, Bookmark, CalendarCheck, Play } from "lucide-react";
import { reels } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reels")({
  head: () => ({ meta: [{ title: "Reels · BRG Admin" }] }),
  component: Reels,
});

function Reels() {
  const [q, setQ] = useState("");
  const rows = reels.filter(r => r.caption.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Reels & Content" description="Moderate visual content uploaded by businesses." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total reels" value={reels.length} icon={Film} />
        <KpiCard label="Total views" value={reels.reduce((a,r)=>a+r.views,0).toLocaleString()} icon={Eye} />
        <KpiCard label="Total saves" value={reels.reduce((a,r)=>a+r.saves,0).toLocaleString()} icon={Bookmark} />
        <KpiCard label="Bookings driven" value={reels.reduce((a,r)=>a+r.bookingsGen,0).toLocaleString()} icon={CalendarCheck} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search captions…" filters={[
        { label: "Status", options: ["Approved","Pending","Featured","Removed"] },
      ]} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {rows.map((r) => (
          <Card key={r.id} className="brg-card-shadow overflow-hidden border-border bg-card">
            <div className="relative aspect-[9/14] bg-gradient-to-br from-secondary via-accent to-rose">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/85 text-foreground brg-card-shadow">
                  <Play className="h-5 w-5 fill-current" />
                </div>
              </div>
              <div className="absolute left-2 top-2"><StatusBadge status={r.status} /></div>
            </div>
            <CardContent className="space-y-2 p-3">
              <p className="text-sm font-medium leading-snug line-clamp-2">{r.caption}</p>
              <p className="text-xs text-muted-foreground">{r.business}</p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span><Eye className="mr-0.5 inline h-3 w-3" />{(r.views/1000).toFixed(1)}k</span>
                <span><Bookmark className="mr-0.5 inline h-3 w-3" />{r.saves}</span>
                <span><CalendarCheck className="mr-0.5 inline h-3 w-3" />{r.bookingsGen}</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" variant="outline" className="h-7 flex-1 border-border text-xs">Feature</Button>
                <Button size="sm" className="h-7 flex-1 bg-primary text-xs hover:bg-primary/90">Approve</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Star, Flag, EyeOff, MessageSquare } from "lucide-react";
import { reviews } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews · BRG Admin" }] }),
  component: Reviews,
});

function Reviews() {
  const [q, setQ] = useState("");
  const rows = reviews.filter(r => r.text.toLowerCase().includes(q.toLowerCase()) || r.business.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Moderate customer reviews and handle reports." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total reviews" value="6,210" icon={MessageSquare} />
        <KpiCard label="Avg rating" value="4.6" icon={Star} />
        <KpiCard label="Reported" value={reviews.filter(r=>r.reportStatus==="Reported").length} deltaTone="bad" icon={Flag} />
        <KpiCard label="Hidden" value={reviews.filter(r=>r.reportStatus==="Hidden").length} icon={EyeOff} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search reviews…" filters={[
        { label: "Rating", options: ["5","4","3","2","1"] },
        { label: "Report", options: ["Clean","Reported","Hidden","Flagged"] },
      ]} />
      <DataTable getKey={(r)=>r.id} rows={rows} columns={[
        { key: "c", header: "Customer", render: (r) => r.customer },
        { key: "b", header: "Business", render: (r) => <div><div className="font-medium">{r.business}</div><div className="text-xs text-muted-foreground">{r.service}</div></div> },
        { key: "r", header: "Rating", render: (r) => (
          <span className="inline-flex items-center gap-0.5">
            {Array.from({length:5}).map((_,i)=>(
              <Star key={i} className={`h-3 w-3 ${i<r.rating?"fill-[oklch(0.7_0.13_70)] text-[oklch(0.7_0.13_70)]":"text-border"}`} />
            ))}
          </span>
        )},
        { key: "t", header: "Review", render: (r) => <p className="max-w-md text-sm text-muted-foreground line-clamp-2">{r.text}</p> },
        { key: "d", header: "Date", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
        { key: "rs", header: "Report", render: (r) => <StatusBadge status={r.reportStatus} /> },
        { key: "rep", header: "Reply", render: (r) => <span className="text-xs text-muted-foreground">{r.reply}</span> },
        { key: "act", header: "", align:"right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">Hide</Button>
            <Button size="sm" variant="outline" className="h-7 border-border">Mark reviewed</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

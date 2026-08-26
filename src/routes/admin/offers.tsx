import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Tag, BadgeDollarSign } from "lucide-react";
import { offers, businessTypes, npr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({ meta: [{ title: "Deals & Offers · BRG Admin" }] }),
  component: Offers,
});

function Offers() {
  const [q, setQ] = useState("");
  const rows = offers.filter(o => o.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Offers" description="Moderate discount offers from businesses." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active offers" value={offers.filter(o=>o.status==="Active").length} icon={Tag} />
        <KpiCard label="Pending review" value={offers.filter(o=>o.status==="Pending").length} icon={Tag} />
        <KpiCard label="Total redemptions" value={offers.reduce((a,o)=>a+o.used,0).toLocaleString()} icon={Tag} />
        <KpiCard label="Revenue generated" value={npr(offers.reduce((a,o)=>a+o.revenue,0))} icon={BadgeDollarSign} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search offers…" filters={[
        { label: "Category", options: [...businessTypes] },
        { label: "Status", options: ["Active","Pending","Expired","Hidden"] },
      ]} />
      <DataTable getKey={(r)=>r.id} rows={rows} columns={[
        { key: "t", header: "Offer", render: (r) => (
          <div><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.business}</div></div>
        )},
        { key: "c", header: "Category", render: (r) => r.category },
        { key: "o", header: "Original", align:"right", render: (r) => <span className="text-muted-foreground line-through">{npr(r.original)}</span> },
        { key: "d", header: "Discounted", align:"right", render: (r) => <span className="font-medium">{npr(r.discounted)}</span> },
        { key: "v", header: "Validity", render: (r) => <span className="text-muted-foreground">{r.validity}</span> },
        { key: "u", header: "Used", align:"right", render: (r) => r.used },
        { key: "rev", header: "Revenue", align:"right", render: (r) => npr(r.revenue) },
        { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "act", header: "", align:"right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">Feature</Button>
            <Button size="sm" className="h-7 bg-primary hover:bg-primary/90">Approve</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

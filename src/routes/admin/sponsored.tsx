import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Megaphone, Eye, MousePointerClick, CalendarCheck } from "lucide-react";
import { sponsoredCampaigns, npr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/sponsored")({
  head: () => ({ meta: [{ title: "Sponsored · BRG Admin" }] }),
  component: Sponsored,
});

function Sponsored() {
  const [q, setQ] = useState("");
  const rows = sponsoredCampaigns.filter(c => c.business.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Sponsored Listings" description="Manage featured businesses, campaigns, and paid placements."
        actions={<Button size="sm" className="bg-primary hover:bg-primary/90">+ Create campaign</Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active campaigns" value={sponsoredCampaigns.filter(c=>c.status==="Active").length} icon={Megaphone} />
        <KpiCard label="Total impressions" value={sponsoredCampaigns.reduce((a,c)=>a+c.views,0).toLocaleString()} icon={Eye} />
        <KpiCard label="Total clicks" value={sponsoredCampaigns.reduce((a,c)=>a+c.clicks,0).toLocaleString()} icon={MousePointerClick} />
        <KpiCard label="Bookings driven" value={sponsoredCampaigns.reduce((a,c)=>a+c.bookingsGen,0).toLocaleString()} icon={CalendarCheck} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search business…" filters={[
        { label: "Type", options: ["Featured","Search Sponsored","Homepage Hero","Category Top","Package Promo"] },
        { label: "Status", options: ["Active","Pending","Paused","Completed"] },
      ]} />
      <DataTable getKey={(r)=>r.id} rows={rows} columns={[
        { key: "b", header: "Business", render: (r) => <span className="font-medium">{r.business}</span> },
        { key: "t", header: "Campaign type", render: (r) => r.type },
        { key: "p", header: "Placement", render: (r) => <span className="text-muted-foreground">{r.placement}</span> },
        { key: "s", header: "Start", render: (r) => <span className="text-muted-foreground">{r.start}</span> },
        { key: "e", header: "End", render: (r) => <span className="text-muted-foreground">{r.end}</span> },
        { key: "pr", header: "Price", align:"right", render: (r) => npr(r.price) },
        { key: "v", header: "Views", align:"right", render: (r) => r.views.toLocaleString() },
        { key: "cl", header: "Clicks", align:"right", render: (r) => r.clicks.toLocaleString() },
        { key: "bk", header: "Bookings", align:"right", render: (r) => r.bookingsGen },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "act", header: "", align:"right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">Pause</Button>
            <Button size="sm" className="h-7 bg-primary hover:bg-primary/90">Manage</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

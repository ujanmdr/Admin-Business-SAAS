import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { packages, businessTypes, npr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/packages")({
  head: () => ({ meta: [{ title: "Packages · BRG Admin" }] }),
  component: Packages,
});

function Packages() {
  const [q, setQ] = useState("");
  const rows = packages.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Packages" description="All packages created by businesses on BRG marketplace." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total packages" value={packages.length} icon={Package} />
        <KpiCard label="Active" value={packages.filter(p=>p.status==="Active").length} icon={Package} />
        <KpiCard label="Total sales" value={packages.reduce((a,p)=>a+p.sales,0).toLocaleString()} icon={ShoppingBag} />
        <KpiCard label="Hidden" value={packages.filter(p=>!p.visible).length} icon={EyeOff} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search package…" filters={[
        { label: "Category", options: [...businessTypes] },
        { label: "Status", options: ["Active","Pending","Hidden"] },
      ]} />
      <DataTable getKey={(r)=>r.id} rows={rows} columns={[
        { key: "n", header: "Package", render: (r) => (
          <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.business}</div></div>
        )},
        { key: "cat", header: "Category", render: (r) => r.category },
        { key: "p", header: "Price", align:"right", render: (r) => npr(r.price) },
        { key: "v", header: "Value", align:"right", render: (r) => <span className="text-muted-foreground">{npr(r.value)}</span> },
        { key: "sv", header: "Savings", align:"right", render: (r) => <span className="text-[oklch(0.45_0.13_70)]">{npr(r.savings)}</span> },
        { key: "val", header: "Validity", render: (r) => r.validity },
        { key: "s", header: "Sales", align:"right", render: (r) => r.sales },
        { key: "rev", header: "Revenue", align:"right", render: (r) => npr(r.revenue) },
        { key: "vis", header: "Visible", render: (r) => r.visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" /> },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "act", header: "", align: "right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">Feature</Button>
            <Button size="sm" className="h-7 bg-primary hover:bg-primary/90">Approve</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

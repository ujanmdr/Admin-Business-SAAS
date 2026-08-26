import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-header";
import { DataTable, KpiCard, SectionCard, StatusBadge } from "@/components/admin-ui";
import { Stamp, Sparkles, Gift } from "lucide-react";
import { loyalty } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/loyalty")({
  head: () => ({ meta: [{ title: "Loyalty · BRG Admin" }] }),
  component: Loyalty,
});

function Loyalty() {
  return (
    <div className="space-y-6">
      <PageHeader title="Loyalty" description="Stamp cards across all businesses and platform-level loyalty rules." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active cards" value={loyalty.length} icon={Stamp} />
        <KpiCard label="Free visits ready" value={loyalty.filter(l=>l.eligible).length} icon={Gift} />
        <KpiCard label="Redeemed (mo)" value="184" icon={Sparkles} />
        <KpiCard label="Avg stamps / card" value="5.4" icon={Stamp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Platform loyalty rules" description="Default rules applied to all businesses" className="lg:col-span-1">
          <div className="space-y-3">
            {[
              ["Paid visits required", "9"],
              ["Free visit on", "10th visit"],
              ["Milestone reward", "Stamp 5 — 10% off"],
              ["Big milestone", "Stamp 9 — Free upgrade"],
              ["Validity", "12 months from last visit"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <div className="lg:col-span-2">
          <DataTable getKey={(r,i)=>String(i)} rows={loyalty} columns={[
            { key: "c", header: "Customer", render: (r) => r.customer },
            { key: "b", header: "Business", render: (r) => r.business },
            { key: "s", header: "Service", render: (r) => <span className="text-muted-foreground">{r.service}</span> },
            { key: "st", header: "Stamps", render: (r) => (
              <div className="flex gap-0.5">
                {Array.from({length:9}).map((_,i)=>(
                  <span key={i} className={`h-2 w-2 rounded-full ${i<r.stamps?"bg-primary":"bg-border"}`} />
                ))}
              </div>
            )},
            { key: "rd", header: "Redeemed", align:"right", render: (r) => r.redeemed },
            { key: "lv", header: "Last visit", render: (r) => <span className="text-muted-foreground">{r.lastVisit}</span> },
            { key: "stat", header: "Status", render: (r) => <StatusBadge status={r.status === "Free Visit Ready" ? "Free Visit Ready" : "In Progress"} /> },
          ]} />
        </div>
      </div>
    </div>
  );
}

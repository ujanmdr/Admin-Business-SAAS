import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge } from "@/components/admin-ui";
import { activityLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({ meta: [{ title: "Activity Logs · BRG Admin" }] }),
  component: Activity,
});

function Activity() {
  const [q, setQ] = useState("");
  const rows = activityLogs.filter(a => a.target.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Activity Logs" description="Audit trail of every admin action across BRG." />
      <FilterBar onSearch={setQ} searchPlaceholder="Search action or target…" filters={[
        { label: "Module", options: ["Businesses","Settlements","Reviews","Offers","Support","Sponsored","Refunds"] },
        { label: "Status", options: ["Success","Failed"] },
      ]} />
      <DataTable getKey={(r,i)=>String(i)} rows={rows} columns={[
        { key: "a", header: "Admin", render: (r) => <span className="font-medium">{r.admin}</span> },
        { key: "act", header: "Action", render: (r) => r.action },
        { key: "m", header: "Module", render: (r) => <span className="text-muted-foreground">{r.module}</span> },
        { key: "t", header: "Target", render: (r) => r.target },
        { key: "dt", header: "Date / Time", render: (r) => <span className="text-muted-foreground">{r.datetime}</span> },
        { key: "ip", header: "IP", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ip}</span> },
        { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]} />
    </div>
  );
}

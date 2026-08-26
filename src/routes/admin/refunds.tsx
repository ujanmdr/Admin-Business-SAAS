import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Undo2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { refunds, npr, paymentMethods } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/refunds")({
  head: () => ({ meta: [{ title: "Refunds · BRG Admin" }] }),
  component: Refunds,
});

function Refunds() {
  const [q, setQ] = useState("");
  const rows = refunds.filter(r => r.id.toLowerCase().includes(q.toLowerCase()) || r.customer.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" description="Refund requests across the platform." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Pending" value={refunds.filter(r=>r.status==="Pending").length} deltaTone="bad" icon={Clock} />
        <KpiCard label="Approved" value={refunds.filter(r=>r.status==="Approved").length} icon={CheckCircle2} />
        <KpiCard label="Processed" value={refunds.filter(r=>r.status==="Processed").length} icon={Undo2} />
        <KpiCard label="Rejected" value={refunds.filter(r=>r.status==="Rejected").length} icon={XCircle} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search refunds…" filters={[
        { label: "Method", options: [...paymentMethods] },
        { label: "Status", options: ["Pending","Approved","Rejected","Processed"] },
      ]} />
      <DataTable getKey={(r)=>r.id} rows={rows} columns={[
        { key: "id", header: "Refund", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
        { key: "c", header: "Customer", render: (r) => r.customer },
        { key: "b", header: "Business", render: (r) => r.business },
        { key: "bk", header: "Booking", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.booking}</span> },
        { key: "amt", header: "Amount", align:"right", render: (r) => npr(r.amount) },
        { key: "rs", header: "Reason", render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
        { key: "m", header: "Method", render: (r) => r.method },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "rq", header: "Requested", render: (r) => <span className="text-muted-foreground">{r.requested}</span> },
        { key: "act", header: "", align:"right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-destructive/40 text-destructive">Reject</Button>
            <Button size="sm" className="h-7 bg-primary hover:bg-primary/90">Approve</Button>
          </div>
        )},
      ]} />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { CalendarCheck, CalendarX, CheckCircle2, AlertCircle } from "lucide-react";
import { bookings, cities, businessTypes, npr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings · BRG Admin" }] }),
  component: Bookings,
});

function Bookings() {
  const [q, setQ] = useState("");
  const rows = bookings.filter(b => b.id.toLowerCase().includes(q.toLowerCase()) || b.customer.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Every booking flowing through BRG — across marketplace, dashboards, and walk-ins." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total bookings" value="42,180" icon={CalendarCheck} />
        <KpiCard label="Today" value="412" delta="+6%" deltaTone="good" icon={CheckCircle2} />
        <KpiCard label="Cancelled" value="248" delta="0.59%" deltaTone="neutral" icon={CalendarX} />
        <KpiCard label="No-shows" value="92" delta="0.21%" deltaTone="bad" icon={AlertCircle} />
      </div>
      <FilterBar
        onSearch={setQ}
        searchPlaceholder="Search booking ID or customer…"
        filters={[
          { label: "City", options: [...cities] },
          { label: "Category", options: [...businessTypes] },
          { label: "Status", options: ["Pending","Confirmed","Checked-in","Completed","Cancelled","No-show","Refunded"] },
          { label: "Source", options: ["BRG Marketplace","Business Dashboard","Walk-in","WhatsApp","Phone"] },
        ]}
      />
      <DataTable
        getKey={(r) => r.id}
        rows={rows}
        columns={[
          { key: "id", header: "Booking", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
          { key: "customer", header: "Customer", render: (r) => (
            <div><div className="font-medium">{r.customer}</div><div className="text-xs text-muted-foreground">{r.business}</div></div>
          )},
          { key: "service", header: "Service", render: (r) => <div><div>{r.service}</div><div className="text-xs text-muted-foreground">w/ {r.staff}</div></div> },
          { key: "dt", header: "Date / Time", render: (r) => <span className="text-muted-foreground">{r.datetime}</span> },
          { key: "city", header: "City", render: (r) => r.city },
          { key: "amt", header: "Amount", align: "right", render: (r) => npr(r.amount) },
          { key: "method", header: "Method", render: (r) => <span className="text-muted-foreground">{r.method}</span> },
          { key: "ps", header: "Payment", render: (r) => <StatusBadge status={r.paymentStatus} /> },
          { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "src", header: "Source", render: (r) => <span className="text-xs text-muted-foreground">{r.source}</span> },
        ]}
      />
    </div>
  );
}

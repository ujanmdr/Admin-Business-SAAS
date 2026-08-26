import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard, DataTable } from "@/components/admin-ui";
import { mockBlacklist } from "@/lib/blacklist-data";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Smart Blacklist" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 lg:p-8 pt-6">
      <PageHeader 
        title="Smart Blacklist" 
        description="Global platform intelligence. Protect businesses from serial no-shows."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="brg-card-shadow rounded-xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="h-5 w-5" />
            <p className="text-sm font-bold">Total Flagged Numbers</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-serif text-rose-900">{mockBlacklist.length}</h2>
          </div>
        </div>
      </div>

      <SectionCard 
        title="High-Risk Phone Numbers" 
        description="These numbers have been flagged across multiple businesses for no-shows or abusive behavior."
      >
        <DataTable
          getKey={(b) => b.id}
          rows={mockBlacklist}
          columns={[
            { key: "phone", header: "Phone Number", render: (b) => <span className="font-mono font-medium text-foreground">{b.phoneNumber}</span> },
            { key: "strikes", header: "Strike Count", render: (b) => (
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-600">{b.strikes} No-shows</span>
                {b.strikes >= 3 && <AlertTriangle className="h-4 w-4 text-rose-500" />}
              </div>
            )},
            { key: "lastDate", header: "Last Offense", render: (b) => <span className="text-muted-foreground">{b.lastNoShowDate}</span> },
            { key: "businesses", header: "Flagged By", render: (b) => <span className="text-muted-foreground">{b.flaggedByBusinesses.length} distinct businesses</span> },
          ]}
        />
      </SectionCard>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard, DataTable } from "@/components/admin-ui";
import { mockBusinesses, BusinessStatus, Business } from "@/lib/tenant-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Check, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/businesses")({
  head: () => ({ meta: [{ title: "Manage Businesses" }] }),
  component: BusinessesPage,
});

function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [search, setSearch] = useState("");

  const handleUpdateStatus = (id: string, newStatus: BusinessStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    // Ideally sync to mockBusinesses array or backend
    const biz = mockBusinesses.find(b => b.id === id);
    if (biz) biz.status = newStatus;
  };

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const active = filtered.filter(b => b.status === "active");
  const pending = filtered.filter(b => b.status === "pending");
  const suspended = filtered.filter(b => b.status === "suspended");

  const commonCols = [
    { key: "name", header: "Business", render: (b: Business) => <span className="font-medium text-foreground">{b.name}</span> },
    { key: "category", header: "Category", render: (b: Business) => <span className="text-muted-foreground">{b.category}</span> },
    { key: "plan", header: "Plan", render: (b: Business) => <span className="px-2 py-1 bg-muted rounded-full text-xs">{b.subscriptionPlan}</span> },
    { key: "listed", header: "Public Directory", render: (b: Business) => <span className="text-xs">{b.isPublicListed ? "Yes" : "No"}</span> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-8 pt-6">
      <PageHeader 
        title="Business Control Center" 
        description="Approve new tenants, enforce read-only lockouts, and manage subscriptions."
      />

      <div className="flex items-center gap-2 mb-4 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search businesses..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals ({pending.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspended.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <SectionCard title="Active Businesses">
            <DataTable
              getKey={(b) => b.id}
              rows={active}
              columns={[
                ...commonCols,
                { key: "actions", header: "Actions", align: "right", render: (b: Business) => (
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(b.id, 'suspended')} className="text-destructive hover:bg-destructive/10">
                    <XCircle className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                )}
              ]}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="pending">
          <SectionCard title="Pending Approvals">
            <DataTable
              getKey={(b) => b.id}
              rows={pending}
              columns={[
                ...commonCols,
                { key: "actions", header: "Actions", align: "right", render: (b: Business) => (
                  <Button variant="default" size="sm" onClick={() => handleUpdateStatus(b.id, 'active')} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
              ]}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="suspended">
          <SectionCard title="Suspended Businesses (Read-Only Mode)">
            <DataTable
              getKey={(b) => b.id}
              rows={suspended}
              columns={[
                ...commonCols,
                { key: "actions", header: "Actions", align: "right", render: (b: Business) => (
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(b.id, 'active')} className="text-emerald-600 hover:bg-emerald-50">
                    <Shield className="h-4 w-4 mr-1" /> Restore Access
                  </Button>
                )}
              ]}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/admin-ui";
import { mockBusinesses } from "@/lib/tenant-data";
import { Trophy, TrendingUp, DollarSign, Activity, Gift, Heart } from "lucide-react";
import { DataTable } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Super Admin Dashboard" }] }),
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const activeBiz = mockBusinesses.filter(b => b.status === 'active');
  const totalMRR = activeBiz.reduce((sum, b) => sum + (b.metrics?.mrr || 0), 0);
  const totalGiftCards = mockBusinesses.reduce((sum, b) => sum + (b.metrics?.giftCardsIssued || 0), 0);
  const totalLoyalty = mockBusinesses.reduce((sum, b) => sum + (b.metrics?.loyaltyClaimed || 0), 0);
  
  // Sort for leaderboard
  const topBusinesses = [...activeBiz].sort((a, b) => (b.metrics?.totalAppointments || 0) - (a.metrics?.totalAppointments || 0));

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-8 pt-6">
      <PageHeader 
        title="Super Admin Overview" 
        description="Monitor platform health, MRR, and feature adoption."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="brg-card-shadow rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-serif text-foreground">Rs. {totalMRR.toLocaleString()}</h2>
          </div>
        </div>
        
        <div className="brg-card-shadow rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-medium text-muted-foreground">Active Businesses</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-serif text-foreground">{activeBiz.length}</h2>
          </div>
        </div>

        <div className="brg-card-shadow rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-500" />
            <p className="text-sm font-medium text-muted-foreground">Gift Cards Issued (Platform)</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-serif text-foreground">{totalGiftCards}</h2>
          </div>
        </div>

        <div className="brg-card-shadow rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <p className="text-sm font-medium text-muted-foreground">Loyalty Points Claimed</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-serif text-foreground">{totalLoyalty}</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Top Performing Businesses" description="Leaderboard by appointment volume">
          <DataTable
            getKey={(b) => b.id}
            rows={topBusinesses}
            columns={[
              { key: "rank", header: "Rank", render: (b, i) => (
                <div className="flex items-center gap-2">
                  {i === 0 && <Trophy className="h-4 w-4 text-gold" />}
                  <span className="font-bold text-muted-foreground">#{i + 1}</span>
                </div>
              )},
              { key: "name", header: "Business", render: (b) => <span className="font-medium text-foreground">{b.name}</span> },
              { key: "plan", header: "Tier", render: (b) => <span className="text-xs px-2 py-1 bg-muted rounded-full">{b.subscriptionPlan}</span> },
              { key: "appointments", header: "Volume", align: "right", render: (b) => <span className="font-medium">{b.metrics?.totalAppointments}</span> },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}

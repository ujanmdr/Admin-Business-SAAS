import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Heart, Repeat2, Award, Sparkles, Download } from "lucide-react";
import { fmt } from "@/lib/finance-data";
import {
  useLoyaltyRedemptions,
  useLoyaltyRules,
  useCustomerProgress,
} from "@/lib/loyalty-program-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/loyalty-report")({
  head: () => ({ meta: [{ title: "Loyalty Report · BRG Suite" }] }),
  component: LoyaltyReportPage,
});

const C = {
  sage: "#8A9478",
  gold: "#B07D2C",
  ink: "#3D3A36",
  muted: "#9A958D",
  rose: "#D8B0A8",
};

type RangeKey = "week" | "month" | "all";

function inRange(dateStr: string | undefined, range: RangeKey) {
  if (!dateStr) return false;
  if (range === "all") return true;
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  const days = range === "week" ? 7 : 31;
  return now - d <= days * 24 * 60 * 60 * 1000;
}

function LoyaltyReportPage() {
  const rules = useLoyaltyRules();
  const allRedemptions = useLoyaltyRedemptions();
  const progressList = useCustomerProgress();

  const nearMilestoneCustomers = useMemo(() => {
    return progressList
      .map((p) => {
        const rule = rules.find((r) => r.id === p.ruleId);
        if (!rule || !rule.active) return null;
        const left = rule.milestone - p.stampsCount;
        if (left > 0 && left <= 2) {
          return {
            ...p,
            ruleName: rule.name,
            milestone: rule.milestone,
            left,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<typeof progressList[0] & { ruleName: string; milestone: number; left: number }>;
  }, [progressList, rules]);

  const [range, setRange] = useState<RangeKey>("month");
  const [ruleFilter, setRuleFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");

  const used = allRedemptions.filter((r) => r.status === "used");

  const monthUsed = used.filter((r) => inRange(r.usedAt, range));

  const filtered = monthUsed.filter(
    (r) =>
      (ruleFilter === "all" || r.ruleId === ruleFilter) &&
      (customerFilter === "all" || r.customerId === customerFilter),
  );

  const totalDiscount = monthUsed.reduce((s, r) => s + r.valueNpr, 0);
  const activeRules = rules.filter((r) => r.active).length;

  const mostRedeemed = useMemo(() => {
    const counts = new Map<string, number>();
    used.forEach((r) => counts.set(r.ruleName, (counts.get(r.ruleName) || 0) + 1));
    let top = "—";
    let max = 0;
    counts.forEach((v, k) => {
      if (v > max) { max = v; top = k; }
    });
    return top;
  }, [used]);

  const perRule = useMemo(
    () =>
      rules.map((r) => ({
        name: r.name,
        redemptions: used.filter((x) => x.ruleId === r.id).length,
      })),
    [rules, used],
  );

  const last6Months = useMemo(() => {
    const buckets: Record<string, number> = {};
    const labels: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en", { month: "short" });
      labels.push(label);
      buckets[key] = 0;
    }
    used.forEach((r) => {
      if (!r.usedAt) return;
      const key = r.usedAt.slice(0, 7);
      if (buckets[key] !== undefined) buckets[key] += r.valueNpr;
    });
    return Object.entries(buckets).map(([k, v], i) => ({ month: labels[i], value: v }));
  }, [used]);

  const customers = useMemo(() => {
    const set = new Map<string, string>();
    used.forEach((r) => set.set(r.customerId, r.customerName));
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [used]);

  const kpis = [
    { label: `Redemptions ${range === "week" ? "this week" : range === "month" ? "this month" : "all-time"}`, value: monthUsed.length.toString(), icon: Heart },
    { label: "Discount value given", value: fmt(totalDiscount), icon: Repeat2 },
    { label: "Active loyalty rules", value: activeRules.toString(), icon: Award },
    { label: "Most redeemed rule", value: mostRedeemed, icon: Sparkles, small: true },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Loyalty Program Report"
        description="Track loyalty redemptions, discount value given, and rule-level performance."
        actions={
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4" />Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="all">All-time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ruleFilter} onValueChange={setRuleFilter}>
          <SelectTrigger className="w-56 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rules</SelectItem>
            {rules.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-56 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="h-9 w-9 rounded-xl bg-sand-soft grid place-items-center mb-3">
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className={cn("font-serif mt-1", k.small ? "text-base" : "text-2xl")}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-serif text-lg mb-1">Redemptions per rule</h3>
          <p className="text-xs text-muted-foreground mb-3">Lifetime redemption count by loyalty rule.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perRule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DDCC" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} interval={0} angle={-12} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="redemptions" fill={C.sage} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-serif text-lg mb-1">Discount value given per month</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 6 months of free-service value (NPR).</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9DDCC" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Line type="monotone" dataKey="value" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2.2fr] gap-5">
        {/* Left Column: Customers Near Milestone */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col min-w-0">
          <h3 className="font-serif text-lg mb-1">Near Milestone</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Customers within 2 visits of earning their next reward.
          </p>
          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 flex-1">
            {nearMilestoneCustomers.length === 0 ? (
              <div className="text-xs text-muted-foreground italic text-center py-12">
                No customers are currently within 2 stamps of a milestone.
              </div>
            ) : (
              nearMilestoneCustomers.map((c) => {
                const pct = Math.round((c.stampsCount / c.milestone) * 100);
                return (
                  <div
                    key={`${c.customerId}-${c.ruleId}`}
                    className="p-3 rounded-xl border border-border bg-sand-soft/30 hover:bg-sand-soft/60 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-xs text-foreground">{c.customerName}</div>
                        <div className="text-[9px] text-muted-foreground">{c.customerPhone}</div>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold/10 text-gold border border-gold/20">
                        {c.left === 1 ? "1 stamp left" : "2 stamps left"}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-foreground mb-2 bg-card px-2 py-0.5 rounded border border-border/40 inline-block truncate max-w-full">
                      {c.ruleName}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground shrink-0">
                        {c.stampsCount}/{c.milestone}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Redemptions Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-w-0">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card">
            <h3 className="font-serif text-lg">Redemptions ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-sand-soft text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Rule</th>
                  <th className="text-left px-4 py-3">Service</th>
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Date redeemed</th>
                  <th className="text-left px-4 py-3">Processed by</th>
                  <th className="text-right px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground italic">
                      No redemptions match these filters.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.code} className="border-t border-border hover:bg-sand-soft/40 text-xs">
                    <td className="px-4 py-3 font-medium text-foreground">{r.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.ruleName}</td>
                    <td className="px-4 py-3 text-foreground">{r.serviceName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.usedAt}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.processedByStaffName || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gold">−{fmt(r.valueNpr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  CUSTOMERS, Customer, STATUSES, SEGMENTS, customerStatusTone,
} from "@/lib/customer-data";
import { CustomerDrawer } from "@/components/CustomerDrawer";
import { NewCustomerModal } from "@/components/NewCustomerModal";
import {
  Plus, Search, Users, UserPlus, Star, Package, Gift, Heart, Cake, Filter,
  MoreHorizontal, Eye, BookOpen, MessageCircle, FileText, Tag, CreditCard, Download,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/customers")({
  head: () => ({ meta: [{ title: "Customers · BRG Suite" }] }),
  component: CustomersPage,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "returning", label: "Returning" },
  { key: "vip", label: "VIP" },
  { key: "package", label: "Has Package" },
  { key: "gift", label: "Has Gift Card" },
  { key: "loyalty", label: "Near Loyalty Reward" },
  { key: "birthday", label: "Birthday This Month" },
  { key: "inactive", label: "Inactive" },
] as const;

const monthNow = new Date().getMonth() + 1;

function applyFilter(c: Customer, key: string) {
  switch (key) {
    case "new": return c.status === "New";
    case "returning": return c.totalVisits >= 2 && c.status !== "Inactive";
    case "vip": return c.status === "VIP";
    case "package": return c.activePackages > 0;
    case "gift": return c.giftCardBalance > 0;
    case "loyalty": return c.loyaltyStamps >= 8 && c.loyaltyStamps < 10;
    case "birthday": return Number(c.birthday.split("-")[0]) === monthNow;
    case "inactive": return c.status === "Inactive" || c.status === "At Risk";
    default: return true;
  }
}

function CustomersPage() {
  const [open, setOpen] = useState<Customer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => CUSTOMERS.filter((c) =>
    applyFilter(c, filter) &&
    (status === "All" || c.status === status) &&
    (q === "" ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q.toLowerCase()))
  ), [filter, status, q]);

  const kpis = {
    total: CUSTOMERS.length,
    newMonth: CUSTOMERS.filter((c) => c.status === "New").length,
    returning: CUSTOMERS.filter((c) => c.totalVisits >= 2 && c.status !== "Inactive").length,
    vip: CUSTOMERS.filter((c) => c.status === "VIP").length,
    pkg: CUSTOMERS.filter((c) => c.activePackages > 0).length,
    gift: CUSTOMERS.filter((c) => c.giftCardBalance > 0).length,
    nearLoyalty: CUSTOMERS.filter((c) => c.loyaltyStamps >= 8 && c.loyaltyStamps < 10).length,
    birthday: CUSTOMERS.filter((c) => Number(c.birthday.split("-")[0]) === monthNow).length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Your guest book — preferences, history, lifetime value and the relationships that grow Aura."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2.5 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" />Export
            </button>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-medium shadow-luxe">
              <Plus className="h-4 w-4" />Add Customer
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-8">
        <Kpi label="Total Customers" value={kpis.total} icon={Users} tone="sage" />
        <Kpi label="New This Month" value={kpis.newMonth} icon={UserPlus} tone="mist" />
        <Kpi label="Returning" value={kpis.returning} icon={Heart} tone="rose" />
        <Kpi label="VIP" value={kpis.vip} icon={Star} tone="gold" />
        <Kpi label="With Packages" value={kpis.pkg} icon={Package} tone="sage" />
        <Kpi label="Gift Card Balance" value={kpis.gift} icon={Gift} tone="rose" />
        <Kpi label="Near Loyalty Reward" value={kpis.nearLoyalty} icon={Heart} tone="gold" />
        <Kpi label="Birthdays This Month" value={kpis.birthday} icon={Cake} tone="mist" />
      </div>

      {/* Smart segments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-2xl">Smart Segments</h2>
          <span className="text-xs text-muted-foreground">Tap to filter the table</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {SEGMENTS.map((s) => {
            const count = CUSTOMERS.filter((c) => {
              switch (s.key) {
                case "vip": return c.status === "VIP";
                case "inactive60": return c.status === "Inactive" || c.status === "At Risk";
                case "bridal": return c.tags.includes("Bridal");
                case "packages": return c.activePackages > 0;
                case "giftcards": return c.giftCardBalance > 0;
                case "highspend": return c.totalSpend >= 100000;
                case "cancel": return c.status === "At Risk";
              }
            }).length;
            const map = { vip: "vip", inactive60: "inactive", bridal: "all", packages: "package", giftcards: "gift", highspend: "vip", cancel: "inactive" } as Record<string, string>;
            const tone = {
              gold: "from-[color-mix(in_oklab,var(--gold)_18%,white)] to-card",
              rose: "from-[color-mix(in_oklab,var(--rose)_22%,white)] to-card",
              sage: "from-[color-mix(in_oklab,var(--sage)_18%,white)] to-card",
              mist: "from-[color-mix(in_oklab,var(--mist)_50%,white)] to-card",
            }[s.tone];
            return (
              <button key={s.key} onClick={() => setFilter(map[s.key])}
                className={`text-left rounded-3xl border border-border shadow-luxe p-5 bg-gradient-to-br ${tone} hover:-translate-y-0.5 transition`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gold font-medium">Segment</span>
                  <span className="font-serif text-2xl">{count}</span>
                </div>
                <div className="font-serif text-lg mt-3 leading-tight">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              filter === f.key ? "bg-primary text-primary-foreground border-primary shadow-luxe"
                              : "bg-card border-border text-foreground hover:bg-muted")}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone, email…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-transparent text-sm outline-none">
            {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <span className="text-xs text-muted-foreground ml-auto">{rows.length} customers</span>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-sand-soft/40 text-muted-foreground">
              <tr className="text-left">
                <Th>Customer</Th>
                <Th>Contact</Th>
                <Th>Last Visit</Th>
                <Th className="text-right">Visits</Th>
                <Th className="text-right">Total Spend</Th>
                <Th>Loyalty</Th>
                <Th className="text-right">Packages</Th>
                <Th className="text-right">Gift NPR</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <button onClick={() => setOpen(c)} className="flex items-center gap-3 group text-left">
                      <div className="h-9 w-9 rounded-full bg-rose-soft text-deep-olive grid place-items-center font-serif">
                        {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium group-hover:text-primary transition truncate">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full bg-mist-soft border border-border px-1.5">{t}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{c.phone}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{new Date(c.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                    <div className="text-[11px] text-muted-foreground">{c.preferredStaff}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{c.totalVisits}</td>
                  <td className="px-4 py-3 text-right font-medium">NPR {c.totalSpend.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(c.loyaltyStamps / 10) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{c.loyaltyStamps}/10</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{c.activePackages}</td>
                  <td className="px-4 py-3 text-right">{c.giftCardBalance ? c.giftCardBalance.toLocaleString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${customerStatusTone(c.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />{c.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => setOpen(c)}><Eye className="h-4 w-4 mr-2" />View profile</DropdownMenuItem>
                        <DropdownMenuItem><BookOpen className="h-4 w-4 mr-2" />Create booking</DropdownMenuItem>
                        <DropdownMenuItem><Package className="h-4 w-4 mr-2" />Sell package</DropdownMenuItem>
                        <DropdownMenuItem><Gift className="h-4 w-4 mr-2" />Sell gift card</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><MessageCircle className="h-4 w-4 mr-2" />WhatsApp</DropdownMenuItem>
                        <DropdownMenuItem><CreditCard className="h-4 w-4 mr-2" />Take payment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Add note</DropdownMenuItem>
                        <DropdownMenuItem><Tag className="h-4 w-4 mr-2" />Add tag</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-muted-foreground">No customers match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Showing {rows.length} of {CUSTOMERS.length}</span>
          <span>Lifetime value · NPR {rows.reduce((a, b) => a + b.totalSpend, 0).toLocaleString()}</span>
        </div>
      </div>

      <CustomerDrawer customer={open} onClose={() => setOpen(null)} />
      <NewCustomerModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: "sage"|"rose"|"mist"|"gold" }) {
  const toneBg = {
    sage: "bg-primary/10 text-primary",
    rose: "bg-rose-soft text-deep-olive",
    mist: "bg-mist-soft text-deep-olive",
    gold: "bg-sand-soft text-gold",
  }[tone];
  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe p-4 hover:-translate-y-0.5 transition">
      <div className={`h-9 w-9 rounded-xl grid place-items-center ${toneBg}`}><Icon className="h-4 w-4" /></div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3">{label}</div>
      <div className="font-serif text-2xl mt-0.5">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium text-[11px] uppercase tracking-wider ${className}`}>{children}</th>;
}

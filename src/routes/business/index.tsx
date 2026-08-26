import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { NewBookingModal } from "@/components/NewBookingModal";
import { NewCustomerModal } from "@/components/NewCustomerModal";
import { NewOfferDialog } from "@/routes/business/offers";
import { Dialog } from "@/components/ui/dialog";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
  CartesianGrid, BarChart, Bar
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Calendar, Users, Wallet, Sparkles, Clock, MapPin,
  Plus, UserPlus, Tag, CalendarDays, Package, Gift, Repeat, AlertTriangle,
  Star, TrendingUp, CreditCard, Activity, CheckCircle2, MessageSquare, Bell,
  PackageX, Boxes, ChevronRight, Circle
} from "lucide-react";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses, mockBranches } from "@/lib/tenant-data";

export const Route = createFileRoute("/business/")({
  head: () => ({ meta: [{ title: "Overview - BRG Suite" }] }),
  component: Overview,
});

const revenue = [
  { d: "Mon", v: 42000 }, { d: "Tue", v: 51000 }, { d: "Wed", v: 47500 },
  { d: "Thu", v: 62000 }, { d: "Fri", v: 78500 }, { d: "Sat", v: 91200 }, { d: "Sun", v: 68800 },
];

const services = [
  { name: "Hair & Color", v: 38, color: "var(--sage)" },
  { name: "Skin & Facial", v: 24, color: "var(--rose)" },
  { name: "Bridal", v: 14, color: "var(--gold)" },
  { name: "Spa & Massage", v: 13, color: "var(--mist)" },
  { name: "Dental", v: 6, color: "var(--deep-olive)" },
  { name: "Academy", v: 5, color: "var(--sand)" },
];

const upcoming = [
  { time: "10:30", name: "Aastha Karki", service: "Bridal Trial", staff: "Sneha", branch: "Jhamsikhel", status: "Confirmed", pay: "Paid", amt: 12500 },
  { time: "11:15", name: "Riya Maharjan", service: "Hydra Facial", staff: "Anjali", branch: "Lazimpat", status: "Checked-in", pay: "Pending", amt: 4800 },
  { time: "12:00", name: "Pratik Rana", service: "Beard & Cut", staff: "Bibek", branch: "Patan", status: "Confirmed", pay: "eSewa", amt: 1200 },
  { time: "13:30", name: "Sneha Joshi", service: "Keratin Treatment", staff: "Pooja", branch: "Thamel", status: "Confirmed", pay: "Khalti", amt: 9500 },
  { time: "15:00", name: "Manisha Gurung", service: "Dental Cleaning", staff: "Dr. Rai", branch: "Baneshwor", status: "Pending", pay: "Cash", amt: 3500 },
  { time: "16:30", name: "Bipasha Thapa", service: "Bridal Mehendi", staff: "Sneha", branch: "Pokhara", status: "Confirmed", pay: "Paid", amt: 7800 },
];

const team = [
  { name: "Sneha Tamang", role: "Sr. Bridal Stylist", bookings: 7, rating: 4.9, rev: 38500, initials: "ST", tone: "rose" },
  { name: "Anjali Shrestha", role: "Skin Therapist", bookings: 6, rating: 4.8, rev: 24800, initials: "AS", tone: "sage" },
  { name: "Bibek Karki", role: "Master Barber", bookings: 9, rating: 4.7, rev: 18200, initials: "BK", tone: "olive" },
  { name: "Pooja Maharjan", role: "Sr. Hair Stylist", bookings: 5, rating: 4.9, rev: 29000, initials: "PM", tone: "gold" },
];

const alerts = [
  { icon: CheckCircle2, label: "5 bookings awaiting confirmation", tone: "sage", time: "Today" },
  { icon: PackageX, label: "Olaplex No.3 stock low at Lazimpat", tone: "rose", time: "2 left" },
  { icon: Gift, label: "12 packages expiring in 7 days", tone: "gold", time: "This week" },
  { icon: MessageSquare, label: "3 unread reviews on Google", tone: "mist", time: "1h ago" },
  { icon: Users, label: "Pooja Rai requested leave on Friday", tone: "sage", time: "Pending" },
  { icon: CreditCard, label: "NPR 24,800 pending settlements", tone: "gold", time: "Khalti" },
];

const brandGrowth = [
  { month: "Jan", rev: 410 }, { month: "Feb", rev: 430 }, { month: "Mar", rev: 480 },
  { month: "Apr", rev: 420 }, { month: "May", rev: 550 }, { month: "Jun", rev: 853 },
];

const categorySplit = [
  { name: "Services", value: 65, color: "var(--sage)" },
  { name: "Retail", value: 20, color: "var(--gold)" },
  { name: "Packages", value: 15, color: "var(--rose)" },
];

const branchPerformance = [
  { name: "Kathmandu", revenue: 412000, appointments: 85, booked: 90 },
  { name: "Patan", revenue: 285000, appointments: 42, booked: 40 },
  { name: "Pokhara", revenue: 156000, appointments: 25, booked: 20 },
];

function QuickAction({ to, icon: Icon, label, primary }: { to: string; icon: any; label: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition shadow-luxe ${
        primary
          ? "bg-primary text-primary-foreground hover:opacity-95"
          : "bg-card border border-border hover:bg-muted text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />{label}
    </Link>
  );
}

function QuickActionButton({ onClick, icon: Icon, label }: { onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition shadow-luxe bg-card border border-border hover:bg-muted text-foreground"
    >
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Confirmed: "bg-primary/12 text-primary border-primary/20",
    "Checked-in": "bg-mist-soft text-deep-olive border-border",
    Pending: "bg-sand-soft text-gold border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

function Kpi({
  label, value, trend, desc, icon: Icon, tone,
}: { label: string; value: string; trend: number; desc: string; icon: any; tone: "sage" | "rose" | "mist" | "gold" }) {
  const toneBg = {
    sage: "bg-primary/10 text-primary",
    rose: "bg-rose-soft text-deep-olive",
    mist: "bg-mist-soft text-deep-olive",
    gold: "bg-sand-soft text-gold",
  }[tone];
  const up = trend >= 0;
  return (
    <div className="group rounded-3xl border border-border bg-card shadow-luxe p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(95,107,87,0.28)]">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${toneBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center text-xs font-medium ${up ? "text-primary" : "text-destructive"}`}>
          {up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
          {up ? "+" : ""}{trend}%
        </span>
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-serif text-2xl mt-1 leading-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}

function Overview() {
  const { activeBusinessId, activeBranchId } = useTenantStore();
  const activeBiz = mockBusinesses.find(b => b.id === activeBusinessId) || mockBusinesses[0];
  const activeBr = activeBranchId === 'OVERALL' ? null : mockBranches.find(b => b.id === activeBranchId);
  const isOverall = activeBranchId === 'OVERALL';

  const [bookingOpen, setBookingOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  if (isOverall) {
    return (
      <div>
        <PageHeader
          eyebrow={`${activeBiz.name} - Executive Dashboard`}
          title={`Good morning, ${activeBiz.name} Team`}
          description="Here's a macro view of your brand's growth and health."
        />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 pt-0">
          <Kpi label="Net Revenue (MoM)" value="NPR 8,53,000" trend={+12.4} desc="across 3 branches" icon={Wallet} tone="sage" />
          <Kpi label="Average Ticket" value="NPR 4,200" trend={+3.1} desc="+NPR 120 from last month" icon={CreditCard} tone="gold" />
          <Kpi label="Client Retention" value="68%" trend={+2.1} desc="platform wide" icon={Repeat} tone="rose" />
          <Kpi label="Total Appointments" value="152" trend={+5.2} desc="booked for today" icon={Calendar} tone="mist" />
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6 p-4 pt-0">
          <div className="md:col-span-2 brg-card-shadow rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Brand Growth (Last 6 Months)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={brandGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => (v) + 'k'} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Area type="monotone" dataKey="rev" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="brg-card-shadow rounded-xl border border-border bg-card p-5 flex flex-col">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue by Category</h3>
            <div className="flex-1 relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySplit}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categorySplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(val) => val + '%'} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-serif">100%</span>
                <span className="text-[10px] uppercase text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {categorySplit.map(c => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6 p-4 pt-0">
          <div className="brg-card-shadow rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Platform Alerts</h3>
            <ul className="space-y-3">
              {alerts.slice(0, 3).map((a, i) => {
                const Icon = a.icon;
                const toneBg = {
                  sage: 'bg-primary/10 text-primary',
                  rose: 'bg-rose-soft text-deep-olive',
                  mist: 'bg-mist-soft text-deep-olive',
                  gold: 'bg-sand-soft text-gold',
                }[a.tone as "sage" | "rose" | "mist" | "gold"];
                return (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition">
                    <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${toneBg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-snug">{a.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{a.time}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="brg-card-shadow rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Branch Busyness</h3>
            <div className="space-y-4 mt-2">
              {branchPerformance.map(b => (
                <div key={b.name} className="flex items-center justify-between">
                  <span className="font-medium">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{b.booked}% booked</span>
                    <Circle className={`h-3 w-3 fill-current ${b.booked >= 80 ? 'text-rose-500' : b.booked >= 50 ? 'text-amber-500' : 'text-emerald-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="brg-card-shadow rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Branch Leaderboard</h3>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPerformance} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{fill: 'var(--muted)'}} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`${activeBiz.name} - ${activeBr?.name || 'Branch'}`}
        title={`Good morning, ${activeBr?.name || 'Branch'} Team`}
        description="Here's how your business is performing today."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBookingOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition shadow-luxe bg-primary text-primary-foreground hover:opacity-95"
            >
              <Plus className="h-4 w-4" />New Booking
            </button>
            <QuickActionButton onClick={() => setCustomerOpen(true)} icon={UserPlus} label="Add Customer" />
            <QuickActionButton onClick={() => setOfferOpen(true)} icon={Tag} label="Create Offer" />
            <QuickAction to="/business/calendar" icon={CalendarDays} label="View Calendar" />
          </div>
        }
      />
      
      {/* Insight banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[color-mix(in_oklab,var(--sage)_22%,white)] via-card to-[color-mix(in_oklab,var(--rose)_18%,white)] border border-border shadow-luxe p-6 mb-8 flex flex-col md:flex-row md:items-center gap-5 mx-4">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-luxe shrink-0">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.24em] text-gold font-medium mb-1">Smart Insight</div>
          <h3 className="font-serif text-2xl md:text-3xl leading-tight">
            Your business is performing <span className="text-primary">18% better</span> than last week.
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Bridal and Hydra Facial bookings are driving the lift. Consider promoting Bridal packages this weekend.
          </p>
        </div>
        <Link to="/business/reports" className="self-start md:self-center inline-flex items-center gap-1 rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90">
          View Insights <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 pt-0">
        <Kpi label="Total Revenue" value="NPR 42,500" trend={+12.4} desc="today" icon={Wallet} tone="sage" />
        <Kpi label="Total Appointments" value="34" trend={+5.2} desc="today" icon={Calendar} tone="gold" />
        <Kpi label="New Customers" value="8" trend={+2.1} desc="this week" icon={Users} tone="rose" />
        <Kpi label="Active Offers" value="3" trend={0} desc="running campaigns" icon={Tag} tone="mist" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6 p-4 pt-0">
        <div className="md:col-span-2 brg-card-shadow rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Revenue</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => (v/1000) + 'k'} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brg-card-shadow rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Appointments</h3>
          <ul className="space-y-3">
            {upcoming.slice(0, 4).map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition">
                <div className="text-sm font-medium">{a.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-snug truncate">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{a.service}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

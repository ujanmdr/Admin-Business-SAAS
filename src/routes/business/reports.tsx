import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useFinanceStore } from "@/lib/finance-store";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Calendar as CalendarIcon, Download, FileSpreadsheet, Printer, TrendingUp,
  Users, Repeat, XCircle, UserMinus, Activity, Package, Gift, ShoppingBag,
  Wallet, Star, Sparkles, Clock, Award, Lightbulb, Percent, Receipt
} from "lucide-react";
import { fmt } from "@/lib/finance-data";
import { DailySalesReportView } from "@/components/reports/DailySalesReportView";
import { DailyVatReportView } from "@/components/reports/DailyVatReportView";

export const Route = createFileRoute("/business/reports")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "daily-sales",
  }),
  head: () => ({ meta: [{ title: "Reports · BRG Suite" }] }),
  component: ReportsPage,
});

// ── Palette ─────────────────────────────────────────────
const C = {
  sage: "#8A9478",
  sageDeep: "#7A846A",
  rose: "#D8B0A8",
  mist: "#D9E4EA",
  sand: "#E9DDCC",
  gold: "#B07D2C",
  cloud: "#D9D4CF",
  ink: "#3D3A36",
  muted: "#9A958D",
};

const PIE_COLORS = [C.sage, C.rose, C.mist, C.gold, C.sand, C.sageDeep];

// ── Mock data ───────────────────────────────────────────
const revenueOverTime = [
  { m: "Nov", revenue: 1180000, bookings: 412 },
  { m: "Dec", revenue: 1420000, bookings: 498 },
  { m: "Jan", revenue: 1320000, bookings: 462 },
  { m: "Feb", revenue: 1580000, bookings: 524 },
  { m: "Mar", revenue: 1820000, bookings: 612 },
  { m: "Apr", revenue: 2140000, bookings: 698 },
  { m: "May", revenue: 2380000, bookings: 742 },
];

const revenueByCategory = [
  { name: "Hair", value: 824000 },
  { name: "Bridal", value: 712000 },
  { name: "Skin", value: 486000 },
  { name: "Spa", value: 312000 },
  { name: "Nails", value: 168000 },
  { name: "Dental", value: 142000 },
];

const revenueByMethod = [
  { name: "eSewa", value: 968000 },
  { name: "Khalti", value: 612000 },
  { name: "Cash", value: 482000 },
  { name: "Card", value: 318000 },
];

const revenueByBranch = [
  { name: "Thamel Flagship", value: 1380000 },
  { name: "Lazimpat", value: 642000 },
  { name: "Patan", value: 358000 },
];

const staffLeader = [
  { name: "Aanchal", revenue: 412000, bookings: 96, rating: 4.9, util: 88 },
  { name: "Rohan", revenue: 368000, bookings: 102, rating: 4.8, util: 84 },
  { name: "Priya", revenue: 312000, bookings: 78, rating: 4.9, util: 82 },
  { name: "Sneha", revenue: 286000, bookings: 88, rating: 4.7, util: 78 },
  { name: "Mira", revenue: 198000, bookings: 64, rating: 4.8, util: 72 },
  { name: "Nisha", revenue: 142000, bookings: 84, rating: 4.6, util: 76 },
];

const bookingSources = [
  { name: "BRG Marketplace", value: 312 },
  { name: "Walk-in", value: 184 },
  { name: "WhatsApp", value: 142 },
  { name: "Phone", value: 68 },
  { name: "Dashboard", value: 36 },
];

const bookingStatus = [
  { name: "Completed", value: 612 },
  { name: "Upcoming", value: 88 },
  { name: "Cancelled", value: 28 },
  { name: "No-show", value: 14 },
];

const peakHours = [
  ["", "10", "12", "14", "16", "18", "20"],
  ["Mon", 4, 8, 12, 14, 18, 10],
  ["Tue", 6, 10, 14, 16, 20, 12],
  ["Wed", 5, 9, 13, 15, 19, 11],
  ["Thu", 7, 12, 16, 18, 22, 14],
  ["Fri", 9, 14, 20, 24, 28, 18],
  ["Sat", 12, 18, 28, 32, 30, 22],
  ["Sun", 10, 16, 22, 26, 24, 16],
];

const topServices = [
  { name: "Bridal HD Makeup", revenue: 412000, bookings: 28, avg: 14714 },
  { name: "Hydra Facial", revenue: 286000, bookings: 142, avg: 2014 },
  { name: "Balayage", revenue: 248000, bookings: 38, avg: 6526 },
  { name: "Aromatherapy Massage", revenue: 168000, bookings: 84, avg: 2000 },
  { name: "Hair Cut & Style", revenue: 132000, bookings: 168, avg: 786 },
  { name: "Manicure", revenue: 84000, bookings: 96, avg: 875 },
];

const topCustomers = [
  { name: "Sushmita Karki", visits: 18, spend: 142000, type: "VIP" },
  { name: "Reema Tamang", visits: 24, spend: 128000, type: "VIP" },
  { name: "Anjali Pradhan", visits: 16, spend: 98000, type: "Regular" },
  { name: "Karuna Limbu", visits: 14, spend: 86000, type: "Regular" },
  { name: "Manisha Basnet", visits: 12, spend: 72000, type: "Bridal" },
];

const newVsReturning = [
  { m: "Nov", new: 84, returning: 312 },
  { m: "Dec", new: 96, returning: 384 },
  { m: "Jan", new: 78, returning: 342 },
  { m: "Feb", new: 102, returning: 412 },
  { m: "Mar", new: 118, returning: 482 },
  { m: "Apr", new: 132, returning: 548 },
  { m: "May", new: 142, returning: 612 },
];

const insights = [
  { icon: <Clock className="size-4" />, text: "Saturday between 2 PM and 6 PM is your highest revenue window.", tone: C.gold },
  { icon: <TrendingUp className="size-4" />, text: "Bridal packages increased by 22% this month.", tone: C.rose },
  { icon: <Award className="size-4" />, text: "12 customers are one visit away from a free loyalty reward.", tone: C.sage },
  { icon: <Sparkles className="size-4" />, text: "Hair color services have the highest average booking value.", tone: C.mist },
  { icon: <Package className="size-4" />, text: "You may need to restock Keratin Treatment Kit soon.", tone: C.sand },
];

function SmartExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState({
    finance: true,
    revenue: false,
    customers: false,
    staff: false,
  });

  const handleExport = () => {
    setIsOpen(false);
    toast.success("Export started! Your selected reports will download shortly.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Download className="size-4" /> Smart Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smart Export</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">Select exactly which data you want to include in your exported report to keep it clean and relevant.</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="exp-finance" checked={sections.finance} onCheckedChange={(c) => setSections({ ...sections, finance: !!c })} />
              <Label htmlFor="exp-finance" className="font-medium cursor-pointer">Finance & Money (Cash, Bank, Expenses, Dues)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="exp-revenue" checked={sections.revenue} onCheckedChange={(c) => setSections({ ...sections, revenue: !!c })} />
              <Label htmlFor="exp-revenue" className="font-medium cursor-pointer">Revenue & Bookings Analytics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="exp-customers" checked={sections.customers} onCheckedChange={(c) => setSections({ ...sections, customers: !!c })} />
              <Label htmlFor="exp-customers" className="font-medium cursor-pointer">Customer List & Loyalty Progress</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="exp-staff" checked={sections.staff} onCheckedChange={(c) => setSections({ ...sections, staff: !!c })} />
              <Label htmlFor="exp-staff" className="font-medium cursor-pointer">Staff Performance & Utilization</Label>
            </div>
          </div>
          
          <Button className="w-full mt-4" onClick={handleExport}>Download Selected Reports</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ────────────────────────────────────────────────
function ReportsPage() {
  const search = Route.useSearch();
  const [activeMainTab, setActiveMainTab] = useState(search?.tab || "daily-sales");

  useEffect(() => {
    if (search?.tab) {
      setActiveMainTab(search.tab);
    }
  }, [search?.tab]);

  return (
    <div className="px-4 sm:px-6 md:px-10 py-8 max-w-[1500px] mx-auto space-y-6">
      <PageHeader
        eyebrow="Financial Governance"
        title="Reports & Analytics"
        description="Daily sales statements, official VAT registers, and multi-period financial insights."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <SmartExportDialog />
          </div>
        }
      />

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="bg-sand-soft/60 p-1.5 mb-6 flex-wrap h-auto gap-1.5 border border-border print:hidden">
          <TabsTrigger
            value="daily-sales"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl font-medium"
          >
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Daily Sales Report
          </TabsTrigger>
          <TabsTrigger
            value="daily-vat"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl font-medium"
          >
            <Percent className="h-4 w-4 text-primary" /> Daily VAT Report
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl font-medium"
          >
            <Activity className="h-4 w-4 text-muted-foreground" /> Periodic Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-sales" className="mt-0">
          <DailySalesReportView />
        </TabsContent>

        <TabsContent value="daily-vat" className="mt-0">
          <DailyVatReportView />
        </TabsContent>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <FilterBar />
          <ExecutiveSummary />

          <Tabs defaultValue="finance" className="mt-2">
            <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto">
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="programs">Packages & Memberships</TabsTrigger>
              <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="finance"><FinanceTab /></TabsContent>
            <TabsContent value="revenue"><RevenueTab /></TabsContent>
            <TabsContent value="bookings"><BookingsTab /></TabsContent>
            <TabsContent value="customers"><CustomersTab /></TabsContent>
            <TabsContent value="staff"><StaffTab /></TabsContent>
            <TabsContent value="services"><ServicesTab /></TabsContent>
            <TabsContent value="programs"><ProgramsTab /></TabsContent>
            <TabsContent value="giftcards"><GiftCardsTab /></TabsContent>
            <TabsContent value="loyalty"><LoyaltyTab /></TabsContent>
            <TabsContent value="inventory"><InventoryTab /></TabsContent>
          </Tabs>

          <SmartInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Filter bar ──────────────────────────────────────────
function FilterBar() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-sm mb-6 flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" className="gap-1.5">
        <CalendarIcon className="size-4" /> Last 30 days
      </Button>
      <FilterSelect placeholder="All branches" options={["All branches", "Thamel Flagship", "Lazimpat", "Patan"]} />
      <FilterSelect placeholder="All staff" options={["All staff", "Aanchal", "Rohan", "Priya", "Sneha", "Mira"]} />
      <FilterSelect placeholder="All categories" options={["All categories", "Hair", "Skin", "Bridal", "Spa", "Nails", "Dental"]} />
      <div className="ml-auto text-xs text-muted-foreground">Compared to previous period</div>
    </div>
  );
}

function FilterSelect({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <Select>
      <SelectTrigger className="w-[170px] h-9 bg-card text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}

// ── Executive summary ───────────────────────────────────
function ExecutiveSummary() {
  const cards = [
    { label: "Total revenue", value: fmt(2380000), trend: "+18.4%", icon: <TrendingUp className="size-4" />, tone: C.sage },
    { label: "Total bookings", value: "742", trend: "+12.1%", icon: <Activity className="size-4" />, tone: C.mist },
    { label: "Avg. booking value", value: fmt(3208), trend: "+5.6%", icon: <Wallet className="size-4" />, tone: C.gold },
    { label: "Customer retention", value: "78%", trend: "+3.2%", icon: <Repeat className="size-4" />, tone: C.rose },
    { label: "Repeat customers", value: "612", trend: "+9.4%", icon: <Users className="size-4" />, tone: C.sage },
    { label: "Cancellation rate", value: "3.8%", trend: "−0.6%", icon: <XCircle className="size-4" />, tone: C.rose },
    { label: "No-show rate", value: "1.9%", trend: "−0.4%", icon: <UserMinus className="size-4" />, tone: C.sand },
    { label: "Staff utilization", value: "82%", trend: "+4.0%", icon: <Activity className="size-4" />, tone: C.sage },
    { label: "Package sales", value: fmt(648000), trend: "+22%", icon: <Package className="size-4" />, tone: C.mist },
    { label: "Gift card sales", value: fmt(186000), trend: "+14%", icon: <Gift className="size-4" />, tone: C.rose },
    { label: "Product sales", value: fmt(124000), trend: "+8%", icon: <ShoppingBag className="size-4" />, tone: C.gold },
    { label: "Commission earned", value: fmt(412000), trend: "+11%", icon: <Award className="size-4" />, tone: C.sage },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(c => (
        <div key={c.label} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</div>
            <div className="size-8 rounded-full grid place-items-center" style={{ background: `color-mix(in oklab, ${c.tone} 25%, white)`, color: c.tone }}>
              {c.icon}
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl">{c.value}</div>
          <div className={`mt-1 text-[11px] ${c.trend.startsWith("−") ? "text-[color:var(--rose)]" : "text-[color:var(--sage)]"}`}>{c.trend} vs last period</div>
        </div>
      ))}
    </div>
  );
}

// ── Chart shell ─────────────────────────────────────────
function ChartCard({ title, subtitle, children, height = 280 }: { title: string; subtitle?: string; children: React.ReactNode; height?: number }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-serif text-lg">{title}</h3>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "#FAF8F2",
  border: `1px solid ${C.cloud}`,
  borderRadius: 12,
  fontSize: 12,
  color: C.ink,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};
const axisProps = { stroke: C.muted, fontSize: 11, tickLine: false, axisLine: false };

// ── Revenue tab ─────────────────────────────────────────
function RevenueTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <ChartCard title="Revenue over time" subtitle="Last 7 months" height={300}>
          <AreaChart data={revenueOverTime}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.sage} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.sage} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
            <Area type="monotone" dataKey="revenue" stroke={C.sageDeep} strokeWidth={2.5} fill="url(#revGrad)" />
          </AreaChart>
        </ChartCard>
      </div>

      <ChartCard title="Revenue by payment method" height={300}>
        <PieChart>
          <Pie data={revenueByMethod} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
            {revenueByMethod.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: C.ink }} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Revenue by service category">
        <BarChart data={revenueByCategory}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={C.sage} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Revenue by branch">
        <BarChart data={revenueByBranch} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} horizontal={false} />
          <XAxis type="number" {...axisProps} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" {...axisProps} width={120} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} fill={C.rose} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Revenue by staff">
        <BarChart data={staffLeader}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill={C.gold} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

// ── Bookings tab ────────────────────────────────────────
function BookingsTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <ChartCard title="Bookings over time" height={280}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="bookings" stroke={C.sageDeep} strokeWidth={2.5} dot={{ r: 4, fill: C.sage }} />
          </LineChart>
        </ChartCard>
      </div>

      <ChartCard title="Booking status">
        <PieChart>
          <Pie data={bookingStatus} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
            {bookingStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Bookings by source" subtitle="Where customers find you">
        <BarChart data={bookingSources}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={C.sage} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Bookings by category">
        <BarChart data={revenueByCategory}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={C.rose} />
        </BarChart>
      </ChartCard>

      <div className="lg:col-span-3">
        <PeakHoursHeatmap />
      </div>
    </div>
  );
}

function PeakHoursHeatmap() {
  const max = 32;
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg">Peak booking hours</h3>
          <div className="text-xs text-muted-foreground mt-0.5">Heatmap of bookings by day & hour</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          Less
          {[0.15, 0.3, 0.5, 0.75, 1].map(o => (
            <span key={o} className="size-3 rounded" style={{ background: `color-mix(in oklab, ${C.sage} ${o * 100}%, white)` }} />
          ))}
          More
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `48px repeat(6, 1fr)` }}>
        {peakHours.map((row, ri) => (
          row.map((cell, ci) => {
            if (ri === 0) return (
              <div key={`h${ci}`} className="text-[10px] text-muted-foreground text-center">{cell}</div>
            );
            if (ci === 0) return (
              <div key={`d${ri}`} className="text-[10px] text-muted-foreground flex items-center">{cell}</div>
            );
            const v = Number(cell);
            const opacity = v / max;
            return (
              <div key={`${ri}-${ci}`}
                className="aspect-[2/1] rounded-md grid place-items-center text-[10px]"
                style={{
                  background: `color-mix(in oklab, ${C.sage} ${Math.max(15, opacity * 100)}%, white)`,
                  color: opacity > 0.6 ? "white" : C.ink,
                }}>
                {v}
              </div>
            );
          })
        ))}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">Most popular: <span className="text-foreground font-medium">Saturday 4 PM – 6 PM</span></div>
    </div>
  );
}

// ── Customers tab ───────────────────────────────────────
function CustomersTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <ChartCard title="New vs returning customers" height={300}>
          <BarChart data={newVsReturning}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="new" stackId="a" fill={C.rose} radius={[0, 0, 0, 0]} name="New" />
            <Bar dataKey="returning" stackId="a" fill={C.sage} radius={[8, 8, 0, 0]} name="Returning" />
          </BarChart>
        </ChartCard>
      </div>

      <Panel title="Customer mix">
        <Stat row="VIP customers" value="48" tone={C.gold} />
        <Stat row="Bridal leads" value="36" tone={C.rose} />
        <Stat row="Inactive 60+ days" value="124" tone={C.cloud} />
        <Stat row="Birthday this month" value="86" tone={C.mist} />
        <Stat row="New from BRG marketplace" value="142" tone={C.sage} />
      </Panel>

      <div className="lg:col-span-2">
        <Panel title="Top customers by spend">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="text-left py-2">Customer</th><th className="text-left py-2">Type</th><th className="text-right py-2">Visits</th><th className="text-right py-2">Lifetime spend</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topCustomers.map(c => (
                <tr key={c.name}>
                  <td className="py-2.5 font-medium">{c.name}</td>
                  <td className="py-2.5"><Badge variant="outline" className="border-border">{c.type}</Badge></td>
                  <td className="py-2.5 text-right">{c.visits}</td>
                  <td className="py-2.5 text-right">{fmt(c.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <ChartCard title="Acquisition source" height={260}>
        <PieChart>
          <Pie data={bookingSources} dataKey="value" innerRadius={45} outerRadius={85} paddingAngle={3}>
            {bookingSources.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ChartCard>
    </div>
  );
}

// ── Staff tab ───────────────────────────────────────────
function StaffTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Panel title="Staff revenue leaderboard">
          <div className="space-y-3">
            {staffLeader.map((s, i) => {
              const max = Math.max(...staffLeader.map(x => x.revenue));
              const pct = (s.revenue / max) * 100;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-[color-mix(in_oklab,var(--sage)_25%,white)] grid place-items-center text-[10px] font-medium">{i + 1}</span>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">· {s.bookings} bookings</span>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5"><Star className="size-3 fill-[color:var(--gold)] text-[color:var(--gold)]" />{s.rating}</span>
                    </div>
                    <div className="text-sm font-medium">{fmt(s.revenue)}</div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.sage}, ${C.sageDeep})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <ChartCard title="Staff utilization">
        <BarChart data={staffLeader}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
          <Bar dataKey="util" radius={[8, 8, 0, 0]} fill={C.mist} />
        </BarChart>
      </ChartCard>

      <Panel title="Commission this month">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <tr><th className="text-left py-2">Staff</th><th className="text-right py-2">Service</th><th className="text-right py-2">Tips</th><th className="text-right py-2">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffLeader.map(s => {
              const comm = Math.round(s.revenue * 0.15);
              const tips = Math.round(s.revenue * 0.04);
              return (
                <tr key={s.name}>
                  <td className="py-2.5 font-medium">{s.name}</td>
                  <td className="py-2.5 text-right">{fmt(comm)}</td>
                  <td className="py-2.5 text-right">{fmt(tips)}</td>
                  <td className="py-2.5 text-right font-medium">{fmt(comm + tips)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <ChartCard title="Cancellation & no-show by staff">
        <BarChart data={staffLeader.map(s => ({ name: s.name, cancellations: Math.floor(Math.random() * 5) + 1, noshow: Math.floor(Math.random() * 3) }))}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="cancellations" stackId="a" fill={C.rose} radius={[0, 0, 0, 0]} />
          <Bar dataKey="noshow" stackId="a" fill={C.gold} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

// ── Services tab ────────────────────────────────────────
function ServicesTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Panel title="Top services by revenue">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="text-left py-2">Service</th><th className="text-right py-2">Bookings</th><th className="text-right py-2">Avg. price</th><th className="text-right py-2">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topServices.map(s => (
                <tr key={s.name}>
                  <td className="py-2.5 font-medium">{s.name}</td>
                  <td className="py-2.5 text-right">{s.bookings}</td>
                  <td className="py-2.5 text-right">{fmt(s.avg)}</td>
                  <td className="py-2.5 text-right font-medium">{fmt(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="Service KPIs">
        <Stat row="Avg. service price" value={fmt(3208)} tone={C.gold} />
        <Stat row="Avg. duration" value="62 min" tone={C.sage} />
        <Stat row="Most profitable" value="Bridal HD" tone={C.rose} />
        <Stat row="Lowest performing" value="Eyebrow tint" tone={C.cloud} />
      </Panel>

      <div className="lg:col-span-3">
        <ChartCard title="Top services by bookings" height={260}>
          <BarChart data={topServices} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} horizontal={false} />
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey="name" {...axisProps} width={150} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="bookings" radius={[0, 8, 8, 0]} fill={C.sage} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Programs / Gift / Loyalty / Inventory ───────────────
function ProgramsTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Panel title="Packages performance">
        <Stat row="Packages sold" value="84" tone={C.sage} />
        <Stat row="Package revenue" value={fmt(648000)} tone={C.gold} />
        <Stat row="Redemption rate" value="72%" tone={C.mist} />
        <Stat row="Unused sessions" value="312" tone={C.cloud} />
        <Stat row="Expiring next 30 days" value="18" tone={C.rose} />
      </Panel>
      <Panel title="Membership renewals">
        <Stat row="Active memberships" value="186" tone={C.sage} />
        <Stat row="Auto-renewal rate" value="84%" tone={C.gold} />
        <Stat row="MRR" value={fmt(412000)} tone={C.mist} />
        <Stat row="Churn (30d)" value="6" tone={C.rose} />
      </Panel>
      <Panel title="Top package buyers">
        {topCustomers.slice(0, 5).map(c => (
          <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="text-sm">{c.name}</div>
            <div className="text-xs text-muted-foreground">{fmt(c.spend)}</div>
          </div>
        ))}
      </Panel>
      <div className="lg:col-span-3">
        <ChartCard title="Package sales over time" height={240}>
          <AreaChart data={revenueOverTime}>
            <defs>
              <linearGradient id="pkgG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.rose} stopOpacity={0.5} />
                <stop offset="100%" stopColor={C.rose} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="bookings" stroke={C.rose} strokeWidth={2.5} fill="url(#pkgG)" />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}

function GiftCardsTab() {
  return (
    <div className="grid lg:grid-cols-4 gap-5">
      <Panel title="Sold"><div className="font-serif text-3xl">142</div><div className="text-xs text-muted-foreground mt-1">{fmt(186000)} total value</div></Panel>
      <Panel title="Redeemed"><div className="font-serif text-3xl">98</div><div className="text-xs text-muted-foreground mt-1">{fmt(124000)} value</div></Panel>
      <Panel title="Outstanding balance"><div className="font-serif text-3xl">{fmt(62000)}</div><div className="text-xs text-muted-foreground mt-1">across 44 cards</div></Panel>
      <Panel title="Expiring < 30 days"><div className="font-serif text-3xl">8</div><div className="text-xs text-muted-foreground mt-1">{fmt(14800)} value</div></Panel>
      <div className="lg:col-span-4">
        <ChartCard title="Gift card sales vs redemptions" height={240}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="m" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="bookings" name="Sold" stroke={C.rose} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="bookings" name="Redeemed" stroke={C.sage} strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>
      </div>
      <div className="lg:col-span-4">
        <Panel title="Gift card receivers who became customers">
          <div className="flex items-end gap-2">
            <div className="font-serif text-4xl">38%</div>
            <div className="text-xs text-muted-foreground mb-2">conversion to repeat customer within 90 days</div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function LoyaltyTab() {
  return (
    <div className="grid lg:grid-cols-4 gap-5">
      <Panel title="Active stamp cards"><div className="font-serif text-3xl">624</div><div className="text-xs text-muted-foreground mt-1">+48 this month</div></Panel>
      <Panel title="Near reward (stamp 9)"><div className="font-serif text-3xl">12</div><div className="text-xs text-muted-foreground mt-1">one visit away</div></Panel>
      <Panel title="Free visits redeemed"><div className="font-serif text-3xl">86</div><div className="text-xs text-muted-foreground mt-1">YTD</div></Panel>
      <Panel title="Loyalty-driven revenue"><div className="font-serif text-3xl">{fmt(412000)}</div><div className="text-xs text-muted-foreground mt-1">repeat bookings from loyalty</div></Panel>
      <div className="lg:col-span-4">
        <ChartCard title="Loyalty stamp progress distribution" height={260}>
          <BarChart data={[1,2,3,4,5,6,7,8,9,10].map(n => ({ stamp: `${n}`, customers: Math.floor(80 + Math.random() * 120 - n * 6) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="stamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="customers" radius={[8, 8, 0, 0]} fill={C.sage} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

function InventoryTab() {
  const products = [
    { name: "Olaplex No. 3", sold: 42, used: 86, stockValue: 24800 },
    { name: "Keratin Treatment Kit", sold: 18, used: 52, stockValue: 18600 },
    { name: "Hydra Facial Serum", sold: 24, used: 124, stockValue: 32400 },
    { name: "Aroma Oil Blend", sold: 36, used: 64, stockValue: 14200 },
    { name: "Gel Polish (set)", sold: 28, used: 96, stockValue: 9800 },
  ];
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Panel title="Inventory KPIs">
        <Stat row="Product sales (30d)" value={fmt(124000)} tone={C.gold} />
        <Stat row="Low stock items" value="6" tone={C.rose} />
        <Stat row="Expiring < 60 days" value="4" tone={C.rose} />
        <Stat row="Total stock value" value={fmt(486000)} tone={C.sage} />
      </Panel>
      <div className="lg:col-span-2">
        <Panel title="Best-selling & most-used products">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="text-left py-2">Product</th><th className="text-right py-2">Retail sold</th><th className="text-right py-2">Used in services</th><th className="text-right py-2">Stock value</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => (
                <tr key={p.name}>
                  <td className="py-2.5 font-medium">{p.name}</td>
                  <td className="py-2.5 text-right">{p.sold}</td>
                  <td className="py-2.5 text-right">{p.used}</td>
                  <td className="py-2.5 text-right">{fmt(p.stockValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
      <div className="lg:col-span-3">
        <ChartCard title="Stock movement" height={240}>
          <BarChart data={products}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cloud} vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="sold" name="Retail" fill={C.rose} radius={[6, 6, 0, 0]} />
            <Bar dataKey="used" name="In services" fill={C.sage} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Smart insights ──────────────────────────────────────
function SmartInsights() {
  return (
    <div className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-gold">Intelligence</div>
          <h2 className="font-serif text-2xl mt-1">Smart insights</h2>
        </div>
        <Badge variant="outline" className="border-border bg-card gap-1.5"><Lightbulb className="size-3" /> Auto-generated</Badge>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((i, idx) => (
          <div key={idx}
            className="rounded-2xl border border-border p-5 shadow-sm bg-gradient-to-br to-card"
            style={{ backgroundImage: `linear-gradient(160deg, color-mix(in oklab, ${i.tone} 25%, white), var(--card))` }}
          >
            <div className="size-9 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${i.tone} 35%, white)`, color: i.tone }}>
              {i.icon}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 font-serif">{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <h3 className="font-serif text-lg mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Stat({ row, value, tone }: { row: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="size-2 rounded-full" style={{ background: tone }} />
        {row}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// ── Finance Tab (Basic Accounting) ──────────────────────
function FinanceTab() {
  const store = useFinanceStore();
  const [expAmount, setExpAmount] = useState("");
  const [expSource, setExpSource] = useState<"cash" | "bank">("cash");

  const [moveAmount, setMoveAmount] = useState("");
  const [moveFrom, setMoveFrom] = useState<"cash" | "bank">("cash");
  const [moveTo, setMoveTo] = useState<"cash" | "bank">("bank");

  const [closeAmount, setCloseAmount] = useState("");
  const [closeDiff, setCloseDiff] = useState<number | null>(null);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    store.addExpense(Number(expAmount), expSource);
    toast.success("Expense added successfully!");
    setExpAmount("");
  };

  const handleMoveMoney = (e: React.FormEvent) => {
    e.preventDefault();
    store.moveMoney(Number(moveAmount), moveFrom, moveTo);
    toast.success("Money moved successfully!");
    setMoveAmount("");
  };

  const handleCloseDay = (e: React.FormEvent) => {
    e.preventDefault();
    const result = store.closeDay(Number(closeAmount));
    setCloseDiff(result.difference);
    if (result.difference === 0) {
      toast.success("Register closed perfectly! No difference.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Dialog>
          <DialogTrigger asChild><Button>Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record an Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (NPR)</label>
                <Input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Paid From</label>
                <Select value={expSource} onValueChange={(v: any) => setExpSource(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash in Hand</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Expense</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild><Button variant="secondary">Move Money</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Transfer Money Between Accounts</DialogTitle></DialogHeader>
            <form onSubmit={handleMoveMoney} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (NPR)</label>
                <Input type="number" value={moveAmount} onChange={e => setMoveAmount(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Select value={moveFrom} onValueChange={(v: any) => setMoveFrom(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash in Hand</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Select value={moveTo} onValueChange={(v: any) => setMoveTo(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash in Hand</SelectItem>
                      <SelectItem value="bank">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Move Money</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild><Button variant="outline">Close Day</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Daily Cash Closing</DialogTitle></DialogHeader>
            <form onSubmit={handleCloseDay} className="space-y-4">
              <div className="p-3 bg-muted rounded-md text-sm">
                System Expects: <span className="font-bold">{fmt(store.cashInHand)}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Cash in Drawer</label>
                <Input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} required />
              </div>
              {closeDiff !== null && (
                <div className={`p-3 rounded-md text-sm font-medium ${closeDiff === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Difference: {fmt(closeDiff)}
                  {closeDiff !== 0 && (
                    <div className="mt-2">
                      <Input placeholder="Reason for difference?" />
                      <Button className="mt-2" size="sm" onClick={() => toast.success("Difference recorded!")}>Submit Reason</Button>
                    </div>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full">Verify Cash</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Panel title="Today's Sales"><div className="font-serif text-3xl">{fmt(store.todaysSales)}</div></Panel>
        <Panel title="Today's Expenses"><div className="font-serif text-3xl text-[color:var(--rose)]">{fmt(store.todaysExpenses)}</div></Panel>
        <Panel title="Estimated Profit (Today)"><div className="font-serif text-3xl text-[color:var(--sage)]">{fmt(store.todaysSales - store.todaysExpenses)}</div></Panel>
        
        <Panel title="Cash in Hand"><div className="font-serif text-3xl">{fmt(store.cashInHand)}</div></Panel>
        <Panel title="Bank Balance"><div className="font-serif text-3xl">{fmt(store.bankBalance)}</div></Panel>
        <Panel title="Net Worth (Cash + Bank)"><div className="font-serif text-3xl text-[color:var(--gold)]">{fmt(store.cashInHand + store.bankBalance)}</div></Panel>
        
        <Panel title="Customer Dues (Money Owed to You)"><div className="font-serif text-3xl text-[color:var(--sage)]">{fmt(store.customerDues)}</div></Panel>
        <Panel title="Supplier Dues (Money You Owe)"><div className="font-serif text-3xl text-[color:var(--rose)]">{fmt(store.supplierDues)}</div></Panel>
      </div>
    </div>
  );
}

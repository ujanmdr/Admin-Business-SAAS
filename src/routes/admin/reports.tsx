import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader } from "@/components/app-header";
import { SectionCard, FilterBar, KpiCard } from "@/components/admin-ui";
import {
  monthlyRevenue, bookingsByCategory, revenueByCity, businessGrowth,
  paymentBreakdown, npr, cities, businessTypes, paymentMethods,
} from "@/lib/mock-data";
import { TrendingUp, Building2, Users, BadgeDollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · BRG Admin" }] }),
  component: Reports,
});

const palette = ["var(--sage)", "var(--gold)", "var(--rose)", "var(--olive)", "oklch(0.65 0.06 230)", "oklch(0.6 0.12 30)"];

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Deep platform analytics across revenue, businesses, and customers." />
      <FilterBar searchPlaceholder="Search reports…" filters={[
        { label: "City", options: [...cities] },
        { label: "Business type", options: [...businessTypes] },
        { label: "Method", options: [...paymentMethods] },
      ]} />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Platform revenue" value={npr(35800000)} delta="+14.7%" deltaTone="good" icon={BadgeDollarSign} />
        <KpiCard label="Commission earned" value={npr(4296000)} delta="+12% MoM" deltaTone="good" icon={TrendingUp} />
        <KpiCard label="Business growth" value="+27 mo" deltaTone="good" icon={Building2} />
        <KpiCard label="Customer growth" value="+842 mo" deltaTone="good" icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Platform revenue" description="Last 7 months">
          <div className="h-72">
            <ResponsiveContainer><AreaChart data={monthlyRevenue}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" tickFormatter={(v)=>(v/1000000).toFixed(1)+"M"} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--sage)" fill="var(--sage)" fillOpacity={0.18} strokeWidth={2.4} />
            </AreaChart></ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Commission earned">
          <div className="h-72">
            <ResponsiveContainer><BarChart data={monthlyRevenue}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" tickFormatter={(v)=>(v/1000)+"k"} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="commission" fill="var(--gold)" radius={[8,8,0,0]} />
            </BarChart></ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Business & customer growth">
          <div className="h-72">
            <ResponsiveContainer><LineChart data={businessGrowth}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Line type="monotone" dataKey="count" stroke="var(--olive)" strokeWidth={2.4} />
            </LineChart></ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Payment method usage">
          <div className="h-72">
            <ResponsiveContainer><PieChart>
              <Pie data={paymentBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {paymentBreakdown.map((_,i)=><Cell key={i} fill={palette[i]} stroke="var(--card)" strokeWidth={2}/>)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart></ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue by city">
          <div className="h-72">
            <ResponsiveContainer><BarChart data={revenueByCity} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" horizontal={false} />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" tickFormatter={(v)=>(v/1000)+"k"} />
              <YAxis dataKey="city" type="category" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={70} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="revenue" fill="var(--sage)" radius={[0,8,8,0]} />
            </BarChart></ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Bookings by category">
          <div className="h-72">
            <ResponsiveContainer><BarChart data={bookingsByCategory}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="value" fill="var(--rose)" radius={[8,8,0,0]} />
            </BarChart></ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Top businesses">
          <ol className="space-y-2">
            {["Glow Avenue Salon","Himalayan Bliss Spa","Bridal House Kathmandu","Sage & Saffron Spa","Aurora Skin Clinic"].map((n,i)=>(
              <li key={n} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                <span><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{i+1}</span>{n}</span>
                <span className="font-medium">{npr(420000 - i*48000)}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="Top services">
          <ol className="space-y-2">
            {["Bridal Makeup","Hair Spa","HydraFacial","Deep Tissue Massage","Beard Trim"].map((n,i)=>(
              <li key={n} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                <span><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.78_0.12_70)] text-[11px] font-semibold text-foreground">{i+1}</span>{n}</span>
                <span className="font-medium">{(2400 - i*320).toLocaleString()} bookings</span>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="Top cities">
          <ol className="space-y-2">
            {revenueByCity.map((c,i)=>(
              <li key={c.city} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                <span><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.785_0.045_25)] text-[11px] font-semibold text-foreground">{i+1}</span>{c.city}</span>
                <span className="font-medium">{npr(c.revenue)}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Refund rate"><p className="font-serif text-4xl font-semibold">2.4%</p><p className="mt-1 text-xs text-muted-foreground">Down 0.3pp vs last month — within healthy range</p></SectionCard>
        <SectionCard title="Complaint rate"><p className="font-serif text-4xl font-semibold">1.1%</p><p className="mt-1 text-xs text-muted-foreground">Up 0.2pp vs last month — monitor spa category</p></SectionCard>
      </div>
    </div>
  );
}

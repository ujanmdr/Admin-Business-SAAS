import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  BOOKINGS, Booking, BRANCHES, STAFF, CATEGORIES, STATUSES, PAY_STATUSES, SOURCES,
  statusTone, payTone,
} from "@/lib/booking-data";
import { BookingDrawer } from "@/components/BookingDrawer";
import { NewBookingModal } from "@/components/NewBookingModal";
import {
  Plus, Search, Filter, Eye, CheckCircle2, RotateCcw, XCircle, Bell, CreditCard, Receipt, MoreHorizontal,
  Download, ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/business/bookings")({
  head: () => ({ meta: [{ title: "Bookings Â· BRG Suite" }] }),
  component: BookingsPage,
});

export function BookingsPage() {
  const [open, setOpen] = useState<Booking | null>(null);
  const [modal, setModal] = useState(false);
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("All");
  const [staff, setStaff] = useState("All");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [pay, setPay] = useState("All");
  const [source, setSource] = useState("All");
  const [range, setRange] = useState("Last 30 days");

  const rows = useMemo(() => BOOKINGS.filter((b) =>
    (q === "" || b.customer.toLowerCase().includes(q.toLowerCase()) || b.id.toLowerCase().includes(q.toLowerCase()) || b.service.toLowerCase().includes(q.toLowerCase())) &&
    (branch === "All" || b.branch === branch) &&
    (staff === "All" || b.staff === staff) &&
    (cat === "All" || b.category === cat) &&
    (status === "All" || b.status === status) &&
    (pay === "All" || b.payment.status === pay) &&
    (source === "All" || b.source === source)
  ).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), [q, branch, staff, cat, status, pay, source]);

  const total = rows.reduce((a, b) => a + b.amount, 0);
  const counts = {
    confirmed: rows.filter((r) => r.status === "Confirmed").length,
    pending: rows.filter((r) => r.status === "Pending").length,
    completed: rows.filter((r) => r.status === "Completed").length,
    cancelled: rows.filter((r) => r.status === "Cancelled" || r.status === "No-show").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Manage every appointment, walk-in and pre-paid reservation."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2.5 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" />Export
            </button>
            <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-medium shadow-luxe">
              <Plus className="h-4 w-4" />New Booking
            </button>
          </div>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Bookings" value={rows.length.toString()} sub={range} />
        <Stat label="Confirmed" value={counts.confirmed.toString()} sub="Active" tone="sage" />
        <Stat label="Pending" value={counts.pending.toString()} sub="Awaiting confirmation" tone="gold" />
        <Stat label="Revenue" value={`NPR ${total.toLocaleString()}`} sub="Filtered total" tone="rose" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by booking ID, customer, serviceâ€¦"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40" />
        </div>
        <FilterSelect label="Range" value={range} onChange={setRange} options={["Today","Last 7 days","Last 30 days","This month","All time"]} />
        <FilterSelect label="Branch" value={branch} onChange={setBranch} options={["All", ...BRANCHES]} />
        <FilterSelect label="Staff" value={staff} onChange={setStaff} options={["All", ...STAFF]} />
        <FilterSelect label="Service" value={cat} onChange={setCat} options={["All", ...CATEGORIES]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["All", ...STATUSES]} />
        <FilterSelect label="Payment" value={pay} onChange={setPay} options={["All", ...PAY_STATUSES]} />
        <FilterSelect label="Source" value={source} onChange={setSource} options={["All", ...SOURCES]} />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-sand-soft/40 text-muted-foreground">
              <tr className="text-left">
                <Th>Booking</Th>
                <Th>Customer</Th>
                <Th>Service</Th>
                <Th>Staff</Th>
                <Th><span className="inline-flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span></Th>
                <Th>Branch</Th>
                <Th>Source</Th>
                <Th className="text-right">Amount</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">{b.id}</div>
                    <div className="text-[11px] text-muted-foreground">{b.duration} min</div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setOpen(b)} className="flex items-center gap-2 group">
                      <div className="h-8 w-8 rounded-full bg-rose-soft text-deep-olive grid place-items-center font-serif text-sm">{b.customer.charAt(0)}</div>
                      <div className="min-w-0 text-left">
                        <div className="font-medium group-hover:text-primary transition truncate">{b.customer}</div>
                        <div className="text-[11px] text-muted-foreground">{b.phone}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.service}</div>
                    <div className="text-[11px] text-muted-foreground">{b.category}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.staff}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <div className="text-[11px] text-muted-foreground">{b.start}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{b.branch}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-full bg-mist-soft border border-border px-2.5 py-0.5 text-[11px] text-deep-olive">{b.source}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">NPR {b.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] rounded-full border px-2.5 py-1 ${payTone(b.payment.status)}`}>
                      {b.payment.method} Â· {b.payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${statusTone(b.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />{b.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setOpen(b)}><Eye className="h-4 w-4 mr-2" />View details</DropdownMenuItem>
                        <DropdownMenuItem><CheckCircle2 className="h-4 w-4 mr-2" />Confirm</DropdownMenuItem>
                        <DropdownMenuItem><RotateCcw className="h-4 w-4 mr-2" />Reschedule</DropdownMenuItem>
                        <DropdownMenuItem><CheckCircle2 className="h-4 w-4 mr-2" />Mark Completed</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Bell className="h-4 w-4 mr-2" />Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem><CreditCard className="h-4 w-4 mr-2" />Collect Payment</DropdownMenuItem>
                        <DropdownMenuItem><Receipt className="h-4 w-4 mr-2" />Print Receipt</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive"><XCircle className="h-4 w-4 mr-2" />Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-muted-foreground">No bookings match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Showing {rows.length} of {BOOKINGS.length}</span>
          <div className="inline-flex items-center gap-1">
            <Filter className="h-3 w-3" />Filtered total Â· NPR {total.toLocaleString()}
          </div>
        </div>
      </div>

      <BookingDrawer booking={open} onClose={() => setOpen(null)} />
      <NewBookingModal open={modal} onOpenChange={setModal} />
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium text-[11px] uppercase tracking-wider ${className}`}>{children}</th>;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "sage" | "rose" | "gold" }) {
  const accent = tone === "sage" ? "text-primary" : tone === "rose" ? "text-deep-olive" : tone === "gold" ? "text-gold" : "text-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe p-5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-serif text-3xl mt-1 ${accent}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs">
      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-sm outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  BOOKINGS, Booking, BRANCHES, STAFF, ROOMS, CATEGORIES, STATUSES, PAY_STATUSES,
  TODAY_ISO, addDaysIso, statusTone, payTone, categoryTone,
} from "@/lib/booking-data";
import { BookingDrawer } from "@/components/BookingDrawer";
import { NewBookingModal } from "@/components/NewBookingModal";
import {
  ChevronLeft, ChevronRight, Plus, UserPlus, Ban, Clock, Filter, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/calendar")({
  head: () => ({ meta: [{ title: "Calendar · BRG Suite" }] }),
  component: CalendarPage,
});

type View = "Day" | "Week" | "Month" | "Staff" | "Rooms";
const VIEWS: View[] = ["Day", "Week", "Month", "Staff", "Rooms"];

const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i); // 9..19

function CalendarPage() {
  const [view, setView] = useState<View>("Day");
  const [dayOffset, setDayOffset] = useState(0);
  const [open, setOpen] = useState<Booking | null>(null);
  const [modal, setModal] = useState(false);
  const [branch, setBranch] = useState("All");
  const [staff, setStaff] = useState("All");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [pay, setPay] = useState("All");

  const dateIso = addDaysIso(dayOffset);
  const dateLabel = new Date(dateIso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const filtered = useMemo(() => BOOKINGS.filter((b) =>
    (branch === "All" || b.branch === branch) &&
    (staff === "All" || b.staff === staff) &&
    (cat === "All" || b.category === cat) &&
    (status === "All" || b.status === status) &&
    (pay === "All" || b.payment.status === pay)
  ), [branch, staff, cat, status, pay]);

  const dayBookings = filtered.filter((b) => b.date === dateIso);

  return (
    <div>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Plan, reschedule and confirm appointments across all six branches."
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-medium shadow-luxe">
              <Plus className="h-4 w-4" />Add Booking
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2.5 text-sm font-medium hover:bg-muted">
              <UserPlus className="h-4 w-4" />Walk-in
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2.5 text-sm font-medium hover:bg-muted">
              <Ban className="h-4 w-4" />Block Time
            </button>
          </div>
        }
      />

      {/* View switcher + nav */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-5">
        <div className="inline-flex rounded-xl bg-card border border-border p-1 self-start">
          {VIEWS.map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3.5 py-1.5 text-sm rounded-lg transition",
                view === v ? "bg-primary text-primary-foreground shadow-luxe" : "text-muted-foreground hover:text-foreground")}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDayOffset((d) => d - 1)} className="h-9 w-9 grid place-items-center rounded-xl border border-border bg-card hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setDayOffset(0)} className="h-9 px-3 rounded-xl border border-border bg-card text-sm hover:bg-muted">Today</button>
          <button onClick={() => setDayOffset((d) => d + 1)} className="h-9 w-9 grid place-items-center rounded-xl border border-border bg-card hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="ml-2 font-serif text-xl">{dateLabel}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-card border border-border p-4 mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mr-1"><Filter className="h-3.5 w-3.5" />Filters</div>
        <FilterSelect label="Branch" value={branch} onChange={setBranch} options={["All", ...BRANCHES]} />
        <FilterSelect label="Staff" value={staff} onChange={setStaff} options={["All", ...STAFF]} />
        <FilterSelect label="Category" value={cat} onChange={setCat} options={["All", ...CATEGORIES]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={["All", ...STATUSES]} />
        <FilterSelect label="Payment" value={pay} onChange={setPay} options={["All", ...PAY_STATUSES]} />
        <span className="ml-auto text-xs text-muted-foreground">{dayBookings.length} appointments</span>
      </div>

      {/* Body by view */}
      {view === "Day" && <DayGrid bookings={dayBookings} onOpen={setOpen} />}
      {view === "Week" && <WeekGrid offset={dayOffset} filtered={filtered} onOpen={setOpen} />}
      {view === "Month" && <MonthGrid offset={dayOffset} filtered={filtered} onOpen={setOpen} />}
      {view === "Staff" && <ResourceGrid bookings={dayBookings} resources={STAFF} field="staff" onOpen={setOpen} />}
      {view === "Rooms" && <ResourceGrid bookings={dayBookings} resources={ROOMS} field="room" onOpen={setOpen} />}

      <BookingDrawer booking={open} onClose={() => setOpen(null)} />
      <NewBookingModal open={modal} onOpenChange={setModal} />
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

function timeToTop(start: string, base = 9, hPx = 64) {
  const [h, m] = start.split(":").map(Number);
  return ((h - base) + m / 60) * hPx;
}

function AppointmentCard({ b, onOpen, compact }: { b: Booking; onOpen: (b: Booking) => void; compact?: boolean }) {
  const tone = categoryTone(b.category);
  return (
    <button
      onClick={() => onOpen(b)}
      className="w-full text-left rounded-xl border border-border shadow-luxe overflow-hidden hover:-translate-y-0.5 transition"
      style={{ background: tone.bg }}
    >
      <div className="flex">
        <div className="w-1.5 shrink-0" style={{ background: tone.bar }} />
        <div className={cn("flex-1 min-w-0 p-2.5", compact && "p-2")}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-deep-olive font-medium">{b.start} · {b.duration}m</div>
            <span className={`inline-flex items-center text-[10px] rounded-full border px-1.5 py-0.5 ${statusTone(b.status)}`}>{b.status}</span>
          </div>
          <div className="font-serif text-sm leading-tight mt-1 truncate">{b.customer}</div>
          <div className="text-[11px] text-deep-olive truncate">{b.service}</div>
          {!compact && (
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-deep-olive/80">
              <span className="truncate">{b.staff}</span>
              <span className={`rounded-full border px-1.5 py-0.5 ${payTone(b.payment.status)}`}>{b.payment.status}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function DayGrid({ bookings, onOpen }: { bookings: Booking[]; onOpen: (b: Booking) => void }) {
  const hPx = 72;
  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: "80px 1fr" }}>
        <div className="border-r border-border bg-sand-soft/40">
          {HOURS.map((h) => (
            <div key={h} className="text-[11px] text-muted-foreground p-2 text-right" style={{ height: hPx }}>
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        <div className="relative" style={{ height: HOURS.length * hPx }}>
          {HOURS.map((h, i) => (
            <div key={h} className="absolute left-0 right-0 border-t border-border" style={{ top: i * hPx }} />
          ))}
          {bookings.length === 0 && (
            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
              No appointments — enjoy the calm.
            </div>
          )}
          {bookings.map((b) => {
            const top = timeToTop(b.start, 9, hPx);
            const height = (b.duration / 60) * hPx - 6;
            return (
              <div key={b.id} className="absolute left-3 right-3" style={{ top, height }}>
                <AppointmentCard b={b} onOpen={onOpen} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekGrid({ offset, filtered, onOpen }: { offset: number; filtered: Booking[]; onOpen: (b: Booking) => void }) {
  // Build week starting Sunday containing today+offset
  const center = new Date(); center.setDate(center.getDate() + offset);
  const start = new Date(center); start.setDate(center.getDate() - center.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    return d;
  });
  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-sand-soft/40">
        {days.map((d) => (
          <div key={+d} className="p-3 text-center border-r last:border-r-0 border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.toLocaleDateString("en-US",{weekday:"short"})}</div>
            <div className="font-serif text-xl mt-0.5">{d.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[420px]">
        {days.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const items = filtered.filter((b) => b.date === iso);
          return (
            <div key={+d} className="border-r last:border-r-0 border-border p-2 space-y-2">
              {items.length === 0 && <div className="text-[11px] text-muted-foreground/60 p-2">—</div>}
              {items.map((b) => <AppointmentCard key={b.id} b={b} onOpen={onOpen} compact />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({ offset, filtered, onOpen }: { offset: number; filtered: Booking[]; onOpen: (b: Booking) => void }) {
  const center = new Date(); center.setDate(center.getDate() + offset);
  const first = new Date(center.getFullYear(), center.getMonth(), 1);
  const startDay = first.getDay();
  const totalDays = new Date(center.getFullYear(), center.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(center.getFullYear(), center.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-hidden">
      <div className="grid grid-cols-7 bg-sand-soft/40 border-b border-border">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="p-3 text-[10px] uppercase tracking-widest text-muted-foreground text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="min-h-[110px] border-t border-r border-border bg-muted/20" />;
          const iso = c.toISOString().slice(0, 10);
          const items = filtered.filter((b) => b.date === iso);
          const isToday = iso === TODAY_ISO;
          return (
            <div key={i} className={cn("min-h-[110px] border-t border-r last:border-r-0 border-border p-2 space-y-1", isToday && "bg-primary/5")}>
              <div className={cn("font-serif text-sm", isToday && "text-primary")}>{c.getDate()}</div>
              {items.slice(0, 2).map((b) => (
                <button key={b.id} onClick={() => onOpen(b)} className="block w-full text-left text-[10px] rounded-md px-1.5 py-1 truncate"
                  style={{ background: categoryTone(b.category).bg }}>
                  {b.start} {b.customer.split(" ")[0]}
                </button>
              ))}
              {items.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{items.length - 2} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceGrid({
  bookings, resources, field, onOpen,
}: { bookings: Booking[]; resources: string[]; field: "staff" | "room"; onOpen: (b: Booking) => void }) {
  const hPx = 56;
  return (
    <div className="rounded-3xl border border-border bg-card shadow-luxe overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid border-b border-border bg-sand-soft/40" style={{ gridTemplateColumns: `80px repeat(${resources.length}, minmax(160px,1fr))` }}>
          <div />
          {resources.map((r) => (
            <div key={r} className="p-3 text-center font-medium text-sm border-l border-border truncate">{r}</div>
          ))}
        </div>
        <div className="grid relative" style={{ gridTemplateColumns: `80px repeat(${resources.length}, minmax(160px,1fr))` }}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="text-[11px] text-muted-foreground p-2 text-right border-t border-border" style={{ height: hPx }}>
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {resources.map((r) => {
            const items = bookings.filter((b) => (b as any)[field] === r);
            return (
              <div key={r} className="relative border-l border-border" style={{ height: HOURS.length * hPx }}>
                {HOURS.map((h, i) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-border" style={{ top: i * hPx }} />
                ))}
                {items.map((b) => {
                  const top = timeToTop(b.start, 9, hPx);
                  const height = (b.duration / 60) * hPx - 4;
                  return (
                    <div key={b.id} className="absolute left-1 right-1" style={{ top, height }}>
                      <AppointmentCard b={b} onOpen={onOpen} compact />
                    </div>
                  );
                })}
                {items.length === 0 && <div className="absolute inset-x-0 top-3 text-center text-[11px] text-muted-foreground/60">—</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

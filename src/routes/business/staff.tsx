import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { STAFF, Staff, StaffRole, staffStatusTone } from "@/lib/staff-data";
import { StaffDrawer } from "@/components/StaffDrawer";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Star, Users, UserCheck, UserX, Trophy, Activity, Wallet,
  MoreHorizontal, Eye, Edit, CalendarDays, Sparkles, Shield,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NewStaffModal } from "@/components/NewStaffModal";

export const Route = createFileRoute("/business/staff")({
  head: () => ({ meta: [{ title: "Staff · BRG Suite" }] }),
  component: StaffPage,
});

const ROLES: ("All" | StaffRole)[] = [
  "All", "Senior Stylist", "Nail Artist", "Makeup Artist", "Bridal Specialist",
  "Skin Therapist", "Massage Therapist", "Dental Consultant", "Trainer", "Receptionist",
];

const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

function StaffPage() {
  const [open, setOpen] = useState<Staff | null>(null);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("All");
  const [staffList, setStaffList] = useState(STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rows = useMemo(
    () =>
      staffList.filter(
        (s) =>
          (role === "All" || s.role === role) &&
          (q === "" ||
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.role.toLowerCase().includes(q.toLowerCase()) ||
            s.branch.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, role, staffList],
  );

  const total = staffList.length;
  const available = staffList.filter((s) => s.status === "Available" || s.status === "Busy").length;
  const onLeave = staffList.filter((s) => s.status === "On Leave").length;
  const top = [...staffList].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)[0];
  const avgUtil = Math.round(staffList.reduce((s, x) => s + x.utilization, 0) / (staffList.length || 1));
  const monthRev = staffList.reduce((s, x) => s + x.monthlyRevenue, 0);

  const kpis = [
    { label: "Total Staff", value: String(total), icon: Users, tone: "bg-sand-soft" },
    { label: "Available Today", value: String(available), icon: UserCheck, tone: "bg-[color-mix(in_oklab,var(--sage)_22%,white)]" },
    { label: "On Leave", value: String(onLeave), icon: UserX, tone: "bg-rose-soft" },
    { label: "Top Performer", value: top?.name.split(" ")[0] || "-", sub: top ? fmt(top.monthlyRevenue) : "-", icon: Trophy, tone: "bg-[color-mix(in_oklab,var(--gold)_22%,white)]" },
    { label: "Avg Utilization", value: avgUtil + "%", icon: Activity, tone: "bg-mist-soft" },
    { label: "Revenue (Month)", value: fmt(monthRev), icon: Wallet, tone: "bg-sand-soft" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Staff"
        description="Stylists, therapists, dentists and trainers across Aura Beauty Lounge."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Shield className="h-4 w-4" />Permissions</Button>
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" />Add staff</Button>
          </>
        }
      />

      <NewStaffModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onAddStaff={(s) => setStaffList([s, ...staffList])} 
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 hover:shadow-luxe transition-shadow">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-2xl mt-1 leading-tight">{k.value}</div>
              {k.sub && <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>}
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, role, branch…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "text-xs px-3 py-2 rounded-full border transition",
                role === r
                  ? "bg-primary text-primary-foreground border-primary shadow-luxe"
                  : "bg-card border-border text-foreground/75 hover:bg-sand-soft",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((s) => {
          const initials = s.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
          return (
            <div
              key={s.id}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-luxe transition-all"
            >
              <div className="bg-gradient-to-br from-sand-soft to-mist-soft px-5 pt-5 pb-4 border-b border-border relative">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-card border border-border grid place-items-center font-serif text-2xl text-gold shadow-luxe">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-serif text-lg leading-tight truncate">{s.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{s.role} · {s.branch}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", staffStatusTone(s.status))}>
                        {s.status}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border flex items-center gap-1">
                        <Star className="h-3 w-3 fill-gold text-gold" />{s.rating}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-card/60 transition">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpen(s)}><Eye className="h-4 w-4" />View profile</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="h-4 w-4" />Edit staff</DropdownMenuItem>
                      <DropdownMenuItem><Sparkles className="h-4 w-4" />Assign services</DropdownMenuItem>
                      <DropdownMenuItem><CalendarDays className="h-4 w-4" />Set schedule</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose"><UserX className="h-4 w-4" />Mark on leave</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {s.specialisations.slice(0, 3).map((sp) => (
                    <span key={sp} className="text-[11px] px-2 py-0.5 rounded-full bg-sand-soft border border-border">{sp}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
                    <div className="font-medium mt-0.5">{s.todayAppointments} bookings</div>
                  </div>
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Experience</div>
                    <div className="font-medium mt-0.5">{s.experienceYears} years</div>
                  </div>
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Month revenue</div>
                    <div className="font-medium mt-0.5">{fmt(s.monthlyRevenue)}</div>
                  </div>
                  <div className="rounded-lg bg-background/60 border border-border px-2.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next slot</div>
                    <div className="font-medium mt-0.5">{s.nextSlot}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Utilization</span>
                    <span className="font-medium text-foreground/80">{s.utilization}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-sand-soft overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--sage)] to-[var(--olive)]"
                      style={{ width: s.utilization + "%" }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg" onClick={() => setOpen(s)}>
                    View profile
                  </Button>
                  <Button size="sm" className="flex-1 rounded-lg bg-foreground text-background hover:bg-foreground/90">
                    Book
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StaffDrawer staff={open} onClose={() => setOpen(null)} />
    </div>
  );
}

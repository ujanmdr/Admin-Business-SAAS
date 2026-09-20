import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BOOKINGS, TODAY_ISO, statusTone, type Booking, type BookingStatus } from "@/lib/booking-data";
import { STAFF, type Staff, staffStatusTone } from "@/lib/staff-data";
import { cn } from "@/lib/utils";
import { 
  Clock, CalendarCheck, TrendingUp, CheckCircle2, Play, Users, ShoppingBag, 
  Plus, Search, Phone, Scissors, Sparkles, Coffee, AlertCircle, CheckCircle, 
  MapPin, ChevronRight, UserCheck, ArrowRight, Receipt, Lock, Printer, LogOut, 
  Wallet, CreditCard, Smartphone
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { fmt } from "@/lib/finance-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/")({
  head: () => ({ meta: [{ title: "Staff Workspace · BRG Suite" }] }),
  component: StaffOverviewPage,
});

function StaffOverviewPage() {
  const { user, isReceptionist } = useAuth();

  return isReceptionist ? <ReceptionistView /> : <HairStylistView />;
}

/* =========================================================================
   1. HAIR STYLIST / SERVICE PROVIDER VIEW
   ========================================================================= */
function HairStylistView() {
  const { user } = useAuth();
  const staffName = user?.name || "Anisha";

  const [isOnBreak, setIsOnBreak] = useState(false);
  const [appointments, setAppointments] = useState<Booking[]>(() => {
    return BOOKINGS.filter(b => b.date === TODAY_ISO && (b.staff === staffName || b.staff.includes("Anisha")))
      .sort((a,b) => a.start.localeCompare(b.start));
  });

  // Listen for break toggle from mobile bottom nav
  useEffect(() => {
    const handleBreakToggle = () => {
      setIsOnBreak(prev => {
        const next = !prev;
        toast.info(next ? "You are now On Break" : "Welcome back! You are On Duty");
        return next;
      });
    };
    window.addEventListener("toggle-staff-break", handleBreakToggle);
    return () => window.removeEventListener("toggle-staff-break", handleBreakToggle);
  }, []);

  const completed = appointments.filter(b => b.status === "Completed").length;
  const total = appointments.length;
  
  // Calculate dynamic commission & tips
  const tips = useMemo(() => 1250 + (completed * 250), [completed]);
  const estCommission = useMemo(() => {
    const totalEarned = appointments
      .filter(b => b.status === "Completed" || b.status === "In progress")
      .reduce((acc, b) => acc + (b.amount * 0.15), 0);
    return Math.max(3400, Math.round(totalEarned));
  }, [appointments]);

  // Current active or next upcoming appointment
  const currentOrNext = useMemo(() => {
    const active = appointments.find(b => b.status === "In progress");
    if (active) return { booking: active, isCurrent: true };
    const next = appointments.find(b => b.status === "Confirmed" || b.status === "Checked-in");
    return { booking: next || null, isCurrent: false };
  }, [appointments]);

  const updateBookingStatus = (id: string, nextStatus: BookingStatus) => {
    setAppointments(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
    if (nextStatus === "In progress") {
      toast.success("Service started! Timer is running.");
    } else if (nextStatus === "Completed") {
      toast.success("Service completed! Client sent to Front Desk for payment settlement.", {
        duration: 4500,
        icon: "💳",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      
      {/* Top Banner with Duty status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-luxe shrink-0">
            <Scissors className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-foreground">Hello, {staffName}</h1>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border", 
                isOnBreak ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                {isOnBreak ? "On Break" : "Station 2 · On Duty"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jhamsikhel Flagship Branch · Senior Stylist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOnBreak(!isOnBreak);
              toast.info(!isOnBreak ? "Status set to: On Break" : "Status set to: On Duty");
            }}
            className={cn("text-xs font-medium rounded-xl gap-1.5 transition", 
              isOnBreak ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" : "border-border text-foreground hover:bg-muted")}
          >
            <Coffee className="h-4 w-4" />
            {isOnBreak ? "Resume Duty" : "Take Break"}
          </Button>

          <Button
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("open-new-booking"))}
            className="text-xs font-medium rounded-xl gap-1.5 bg-primary text-primary-foreground shadow-luxe"
          >
            <Plus className="h-4 w-4" />
            Add Walk-in
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-muted-foreground mb-2"><CalendarCheck className="h-5 w-5" /></div>
          <div>
            <div className="text-2xl font-serif font-semibold">{completed} / {total}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Completed Today</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="text-primary mb-2"><TrendingUp className="h-5 w-5" /></div>
          <div>
            <div className="text-2xl font-serif font-semibold">{fmt(estCommission)}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Est. Commission</div>
          </div>
        </div>

        <div className="bg-sand-soft/60 border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gold">Tips Collected</span>
            <CheckCircle2 className="h-5 w-5 text-gold" />
          </div>
          <div>
            <div className="text-2xl font-serif font-semibold text-foreground">{fmt(tips)}</div>
            <div className="text-xs text-muted-foreground mt-1">Earned across completed appointments today</div>
          </div>
        </div>
      </div>

      {/* Current / Next Client Hero Card (Fitts's Law Focus) */}
      {currentOrNext.booking && (
        <div className={cn("rounded-2xl border p-5 sm:p-6 transition-all shadow-sm", 
          currentOrNext.isCurrent 
            ? "bg-gradient-to-br from-primary/5 via-card to-card border-primary/40 ring-1 ring-primary/20" 
            : "bg-card border-border")}>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className={cn("text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full",
              currentOrNext.isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {currentOrNext.isCurrent ? "Currently in Chair" : "Next Up"}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{currentOrNext.booking.start} ({currentOrNext.booking.duration} mins)</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-serif text-xl font-semibold text-foreground">{currentOrNext.booking.customer}</div>
              <div className="text-sm font-medium text-primary">{currentOrNext.booking.service}</div>
              
              {/* 1-Tap Client Contact Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <a 
                  href={`tel:${currentOrNext.booking.phone}`} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand-soft text-foreground text-xs hover:bg-sand-soft/80 transition border border-border/60"
                  title="Call client directly"
                >
                  <Phone className="h-3 w-3 text-primary" /> {currentOrNext.booking.phone}
                </a>
                <a 
                  href={`https://wa.me/${currentOrNext.booking.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 transition border border-emerald-200"
                  title="Chat on WhatsApp"
                >
                  WhatsApp
                </a>
              </div>

              {currentOrNext.booking.notes && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 mt-2.5 border border-border/50 max-w-xl">
                  <strong>Client Formula/Note:</strong> {currentOrNext.booking.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentOrNext.booking.status === "In progress" ? (
                <Button 
                  onClick={() => updateBookingStatus(currentOrNext.booking!.id, "Completed")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-5 text-sm font-medium shadow-sm gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Completed
                </Button>
              ) : (
                <Button 
                  onClick={() => updateBookingStatus(currentOrNext.booking!.id, "In progress")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 px-5 text-sm font-medium shadow-luxe gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start Service
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-semibold tracking-tight">Today's Appointment Schedule</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{TODAY_ISO}</span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-card border border-dashed border-border rounded-2xl text-muted-foreground">
            No appointments scheduled for your station today.
          </div>
        ) : (
          <div className="space-y-2.5">
            {appointments.map((b) => {
              const isCompleted = b.status === "Completed";
              const isInProgress = b.status === "In progress";

              return (
                <div 
                  key={b.id} 
                  className={cn("bg-card border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40",
                    isInProgress ? "border-primary bg-primary/[0.02]" : "border-border",
                    isCompleted ? "opacity-75" : "")}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="h-10 w-16 rounded-xl bg-sand-soft flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-foreground">{b.start}</span>
                      <span className="text-[9px] text-muted-foreground">{b.duration}m</span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-base truncate">{b.customer}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold border", statusTone(b.status))}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>{b.service} · {b.room}</span>
                        {b.phone && (
                          <a 
                            href={`tel:${b.phone}`} 
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                            title="Call client"
                          >
                            <Phone className="h-2.5 w-2.5" /> {b.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isCompleted && !isInProgress && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateBookingStatus(b.id, "In progress")}
                        className="rounded-xl text-xs h-8 px-3 text-primary border-primary/30 hover:bg-primary/5"
                      >
                        Start
                      </Button>
                    )}

                    {isInProgress && (
                      <Button 
                        size="sm" 
                        onClick={() => updateBookingStatus(b.id, "Completed")}
                        className="rounded-xl text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Finish
                      </Button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

/* =========================================================================
   2. RECEPTIONIST / FRONT DESK VIEW
   ========================================================================= */
function ReceptionistView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [allBookings, setAllBookings] = useState<Booking[]>(() => {
    return BOOKINGS.filter(b => b.date === TODAY_ISO || b.branch === "Jhamsikhel")
      .sort((a,b) => a.start.localeCompare(b.start));
  });

  const [stylists, setStylists] = useState<Staff[]>(() => {
    return STAFF.filter(s => s.branch === "Jhamsikhel" || s.role.includes("Stylist") || s.role.includes("Specialist") || s.role.includes("Therapist"));
  });

  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      const matchSearch = b.customer.toLowerCase().includes(search.toLowerCase()) || 
                          b.service.toLowerCase().includes(search.toLowerCase()) ||
                          b.staff.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allBookings, search, statusFilter]);

  const stats = useMemo(() => {
    const total = allBookings.length;
    const completed = allBookings.filter(b => b.status === "Completed").length;
    const inProgress = allBookings.filter(b => b.status === "In progress").length;
    const waiting = allBookings.filter(b => b.status === "Checked-in" || b.status === "Confirmed").length;
    const registerTotal = allBookings
      .filter(b => b.payment.status === "Paid")
      .reduce((acc, b) => acc + b.amount, 0);

    return { total, completed, inProgress, waiting, registerTotal };
  }, [allBookings]);

  const handleCheckIn = (id: string) => {
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: "Checked-in" } : b));
    toast.success("Client checked in! Staff notified.");
  };

  const [walkInModalStaff, setWalkInModalStaff] = useState<Staff | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInService, setWalkInService] = useState("Haircut & Styling");
  const [walkInAmount, setWalkInAmount] = useState(1200);

  const QUICK_SERVICES = [
    { name: "Haircut & Styling", price: 1200, duration: 40 },
    { name: "Balayage Color & Toner", price: 6500, duration: 90 },
    { name: "Keratin Treatment", price: 8500, duration: 120 },
    { name: "Hydra Facial", price: 4800, duration: 60 },
    { name: "Express Blowout", price: 1500, duration: 30 },
    { name: "Aroma Body Massage", price: 4200, duration: 60 },
  ];

  const handleDispatchWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInModalStaff || !walkInName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    const newBookingId = `BK-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newBooking: Booking = {
      id: newBookingId,
      customer: walkInName.trim(),
      phone: walkInPhone.trim() || "Walk-in Guest",
      service: walkInService,
      category: "Hair",
      staff: walkInModalStaff.name,
      room: walkInModalStaff.specialisations?.[0] || "Station Chair",
      date: TODAY_ISO,
      start: timeStr,
      duration: QUICK_SERVICES.find(s => s.name === walkInService)?.duration || 45,
      amount: walkInAmount,
      branch: "Jhamsikhel",
      payment: { method: "Cash", status: "Pending" },
      status: "In progress",
      source: "Walk-in",
      notes: "Front-desk quick walk-in dispatch",
    };

    setAllBookings(prev => [newBooking, ...prev]);
    setStylists(prev => prev.map(s => s.id === walkInModalStaff.id ? { ...s, status: "Busy" } : s));

    toast.success(`${walkInName.trim()} dispatched to ${walkInModalStaff.name}'s chair! 🚀`);
    setWalkInModalStaff(null);
    setWalkInName("");
    setWalkInPhone("");
  };

  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleStaff, setRescheduleStaff] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const openReschedule = (b: Booking) => {
    setRescheduleBooking(b);
    setRescheduleStaff(b.staff);
    setRescheduleTime(b.start);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;

    setAllBookings(prev => prev.map(b => {
      if (b.id === rescheduleBooking.id) {
        return {
          ...b,
          staff: rescheduleStaff,
          start: rescheduleTime,
        };
      }
      return b;
    }));

    toast.success(`Appointment for ${rescheduleBooking.customer} moved to ${rescheduleStaff} at ${rescheduleTime}!`);
    setRescheduleBooking(null);
  };

  const { logout } = useAuth();
  const [closeShiftOpen, setCloseShiftOpen] = useState(false);
  const [countedCash, setCountedCash] = useState("");

  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let card = 0;
    let digital = 0;

    allBookings.filter(b => b.payment.status === "Paid").forEach(b => {
      if (b.payment.method === "Cash") cash += b.amount;
      else if (b.payment.method === "Card") card += b.amount;
      else digital += b.amount;
    });

    return { cash, card, digital, total: cash + card + digital };
  }, [allBookings]);

  const handleToggleStaffStatus = (staffId: string) => {
    setStylists(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextStatus = s.status === "Available" ? "Busy" : (s.status === "Busy" ? "On Break" : "Available");
        toast.info(`${s.name} status updated to: ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">

      {/* Front Desk Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold text-foreground">Front Desk Operations</h1>
            <span className="bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Jhamsikhel Flagship
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Live branch reception, walk-in dispatcher, and appointments controller
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent("open-new-booking"))}
            className="rounded-xl text-xs bg-primary text-primary-foreground shadow-luxe gap-1.5 h-9"
          >
            <Plus className="h-4 w-4" /> New Booking
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/staff/pos" })}
            className="rounded-xl text-xs border-border text-foreground hover:bg-muted gap-1.5 h-9"
          >
            <ShoppingBag className="h-4 w-4 text-primary" /> Open POS Register
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCloseShiftOpen(true)}
            className="rounded-xl text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5 h-9"
          >
            <Receipt className="h-4 w-4" /> Close Shift
          </Button>
        </div>
      </div>

      {/* Front Desk KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Today's Bookings</div>
          <div className="text-2xl font-serif font-semibold mt-1 text-foreground">{stats.total}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{stats.completed} Completed · {stats.inProgress} In Chair</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Waiting in Lounge</div>
          <div className="text-2xl font-serif font-semibold mt-1 text-gold">{stats.waiting}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Ready for service</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Active Stylists</div>
          <div className="text-2xl font-serif font-semibold mt-1 text-emerald-600">
            {stylists.filter(s => s.status === "Available" || s.status === "Busy").length} / {stylists.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">On floor today</div>
        </div>

        <div className="bg-sand-soft border border-border rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Settled Register</div>
          <div className="text-2xl font-serif font-semibold mt-1 text-foreground">{fmt(stats.registerTotal)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Cash / Card / eSewa</div>
        </div>
      </div>

      {/* Live Stylist Availability Floor Board */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Floor Staff Availability Board</h2>
            <p className="text-xs text-muted-foreground">Tap "+ Assign Walk-in" on any free staff to seat a walk-in client immediately</p>
          </div>
          <span className="text-xs text-muted-foreground">Branch: Jhamsikhel</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {stylists.map(staff => {
            const isAvailable = staff.status === "Available";

            return (
              <div 
                key={staff.id}
                className={cn("border rounded-xl p-3.5 transition flex flex-col justify-between gap-3 shadow-2xs",
                  isAvailable 
                    ? "bg-emerald-50/20 border-emerald-300 dark:border-emerald-900/50" 
                    : "bg-sand-soft/20 border-border/80")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {staff.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{staff.role}</div>
                  </div>

                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0", staffStatusTone(staff.status))}>
                    {staff.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    {staff.status === "Busy" ? "Currently occupied" : (staff.status === "On Break" ? "Back soon" : "Chair is ready")}
                  </span>

                  {isAvailable ? (
                    <Button
                      size="sm"
                      onClick={() => setWalkInModalStaff(staff)}
                      className="rounded-lg text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Assign Walk-in
                    </Button>
                  ) : (
                    <button
                      onClick={() => handleToggleStaffStatus(staff.id)}
                      className="text-[10px] text-muted-foreground hover:text-foreground font-medium"
                    >
                      Change Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Walk-in Dispatch Modal */}
      {walkInModalStaff && (
        <Dialog open={Boolean(walkInModalStaff)} onOpenChange={(v) => { if (!v) setWalkInModalStaff(null); }}>
          <DialogContent className="max-w-md bg-card border-border p-6 rounded-2xl">
            <DialogHeader>
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mb-1">
                Direct Chair Dispatch
              </div>
              <DialogTitle className="font-serif text-2xl">
                Assign Walk-in to {walkInModalStaff.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Seat client immediately with {walkInModalStaff.role} at Jhamsikhel Flagship.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleDispatchWalkIn} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Customer Name *</label>
                <Input
                  required
                  placeholder="e.g. Suman Thapa"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Customer Phone (Optional)</label>
                <Input
                  placeholder="e.g. 98412-34567"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Select Requested Service</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SERVICES.map((s) => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => {
                        setWalkInService(s.name);
                        setWalkInAmount(s.price);
                      }}
                      className={cn("p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between",
                        walkInService === s.name 
                          ? "border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary" 
                          : "border-border bg-background hover:bg-muted text-muted-foreground")}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-[10px] text-primary font-bold mt-1">{fmt(s.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setWalkInModalStaff(null)} 
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-luxe gap-1.5 px-5"
                >
                  Seat Client Now 🚀
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Front Desk Checkout Queue (Clients finished service or ready to pay) */}
      {allBookings.some(b => b.payment.status !== "Paid" && (b.status === "Completed" || b.status === "In progress")) && (
        <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-foreground">Waiting for Front Desk Settlement</h2>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allBookings
              .filter(b => b.payment.status !== "Paid" && (b.status === "Completed" || b.status === "In progress"))
              .slice(0, 4)
              .map(b => (
                <div key={b.id} className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{b.customer}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {b.service} · Stylist: <span className="font-medium text-foreground">{b.staff}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-primary mt-0.5">{fmt(b.amount)}</div>
                  </div>

                  <Button 
                    size="sm"
                    onClick={() => navigate({ to: "/staff/pos" })}
                    className="h-8 px-3 rounded-xl text-xs bg-primary text-primary-foreground shadow-sm shrink-0"
                  >
                    Collect Bill
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Today's Appointments & Walk-ins Queue */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Today's Appointment Queue</h2>
            <p className="text-xs text-muted-foreground">Manage client arrivals, assign staff, or proceed to POS</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by customer, staff..." 
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["All", "Confirmed", "Checked-in", "In progress", "Completed"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn("px-3 py-1 rounded-lg font-medium transition shrink-0",
                statusFilter === st 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80")}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bookings Table / List */}
        <div className="space-y-2.5">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
              No matching bookings found for this filter.
            </div>
          ) : (
            filteredBookings.map(b => (
              <div 
                key={b.id} 
                className="border border-border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-14 rounded-lg bg-sand-soft grid place-items-center shrink-0">
                    <span className="text-xs font-semibold text-foreground">{b.start}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{b.customer}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold border", statusTone(b.status))}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {b.service} · Assigned: <span className="font-medium text-foreground">{b.staff}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-foreground mr-2">{fmt(b.amount)}</span>

                  {b.status === "Confirmed" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleCheckIn(b.id)}
                      className="rounded-lg text-xs h-8 px-2.5 bg-sand-soft text-gold hover:bg-gold/10 border border-gold/30"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" /> Check In
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReschedule(b)}
                    className="rounded-lg text-xs h-8 px-2.5 border-border text-foreground hover:bg-muted"
                    title="Reschedule time or reassign stylist"
                  >
                    Reschedule
                  </Button>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate({ to: "/staff/pos" })}
                    className="rounded-lg text-xs h-8 px-2.5 border-border text-foreground hover:bg-muted"
                  >
                    POS
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Quick Reschedule & Reassign Modal */}
      {rescheduleBooking && (
        <Dialog open={Boolean(rescheduleBooking)} onOpenChange={(v) => { if (!v) setRescheduleBooking(null); }}>
          <DialogContent className="max-w-md bg-card border-border p-6 rounded-2xl">
            <DialogHeader>
              <div className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">
                Front Desk Reschedule
              </div>
              <DialogTitle className="font-serif text-2xl">
                Reschedule for {rescheduleBooking.customer}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Service: {rescheduleBooking.service} ({rescheduleBooking.duration} mins)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveReschedule} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Reassign Stylist / Staff</label>
                <select
                  value={rescheduleStaff}
                  onChange={(e) => setRescheduleStaff(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                >
                  {stylists.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role} - {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">New Appointment Time</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                >
                  {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRescheduleBooking(null)} 
                  className="rounded-xl text-xs h-10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-xl text-xs h-10 bg-primary text-primary-foreground shadow-luxe px-5"
                >
                  Save & Confirm 💾
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Daily Shift Closing & Cash Reconciliation Modal */}
      {closeShiftOpen && (
        <Dialog open={closeShiftOpen} onOpenChange={setCloseShiftOpen}>
          <DialogContent className="max-w-lg bg-card border-border p-6 rounded-3xl">
            <DialogHeader>
              <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> End of Day Register Balancing
              </div>
              <DialogTitle className="font-serif text-2xl">
                Close Shift & Register Summary
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Reconcile physical cash drawer and balance today's front desk transactions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Payment Methods Breakdown */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-sand-soft/50 border border-border rounded-2xl p-3 text-center">
                  <div className="text-muted-foreground flex items-center justify-center gap-1 text-[11px] mb-1">
                    <Wallet className="h-3.5 w-3.5 text-gold" /> Cash
                  </div>
                  <div className="font-serif text-lg font-semibold">{fmt(paymentBreakdown.cash)}</div>
                  <div className="text-[10px] text-muted-foreground">Expected in Drawer</div>
                </div>

                <div className="bg-sand-soft/50 border border-border rounded-2xl p-3 text-center">
                  <div className="text-muted-foreground flex items-center justify-center gap-1 text-[11px] mb-1">
                    <CreditCard className="h-3.5 w-3.5 text-blue-500" /> POS Card
                  </div>
                  <div className="font-serif text-lg font-semibold">{fmt(paymentBreakdown.card)}</div>
                  <div className="text-[10px] text-muted-foreground">Bank Terminals</div>
                </div>

                <div className="bg-sand-soft/50 border border-border rounded-2xl p-3 text-center">
                  <div className="text-muted-foreground flex items-center justify-center gap-1 text-[11px] mb-1">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-500" /> Fonepay / QR
                  </div>
                  <div className="font-serif text-lg font-semibold">{fmt(paymentBreakdown.digital)}</div>
                  <div className="text-[10px] text-muted-foreground">eSewa / Khalti</div>
                </div>
              </div>

              {/* Total Register KPI Banner */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">Total Revenue Collected Today</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stats.completed} clients serviced · {stats.total} total booked</div>
                </div>
                <div className="font-serif text-2xl font-bold text-primary">{fmt(paymentBreakdown.total)}</div>
              </div>

              {/* Physical Cash Count Reconciliation */}
              <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Physical Cash Counted in Drawer (NPR)</span>
                  {countedCash !== "" && (
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full",
                      Number(countedCash) === paymentBreakdown.cash 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300")}>
                      {Number(countedCash) === paymentBreakdown.cash ? "✓ Perfectly Balanced" : `Discrepancy: ${fmt(Number(countedCash) - paymentBreakdown.cash)}`}
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  placeholder={`Expected: ${paymentBreakdown.cash}`}
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="rounded-xl h-10 text-sm bg-background"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    toast.success("Daily Register Summary printed / saved as PDF!");
                  }}
                  className="w-full sm:w-auto rounded-xl text-xs h-10 gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Daily Slip
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCloseShiftOpen(false)}
                    className="rounded-xl text-xs h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast.success("Shift closed and register locked! Have a great evening.");
                      setCloseShiftOpen(false);
                      setTimeout(() => {
                        logout();
                      }, 1000);
                    }}
                    className="rounded-xl text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-luxe gap-1.5 px-4"
                  >
                    <LogOut className="h-4 w-4" /> Lock & Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

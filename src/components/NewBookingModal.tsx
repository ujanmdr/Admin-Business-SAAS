import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { BRANCHES, STAFF } from "@/lib/booking-data";
import { Check, ChevronLeft, ChevronRight, Search, Sparkles, User, CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Customer", "Service", "Staff", "Date & Time", "Review"];
const MOCK_CUSTOMERS = ["Aastha Karki", "Riya Maharjan", "Sneha Joshi", "Manisha Gurung", "Bipasha Thapa"];
const MOCK_SERVICES = [
  { name: "Hydra Facial", duration: 60, price: 4800, cat: "Skin" },
  { name: "Bridal Trial", duration: 90, price: 12500, cat: "Bridal" },
  { name: "Keratin Treatment", duration: 120, price: 9500, cat: "Hair" },
  { name: "Aroma Massage", duration: 60, price: 4200, cat: "Spa" },
  { name: "Dental Cleaning", duration: 45, price: 3500, cat: "Dental" },
];
const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

export function NewBookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState<typeof MOCK_SERVICES[number] | null>(null);
  const [staff, setStaff] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const reset = () => { setStep(0); setCustomer(""); setService(null); setStaff(""); setTime(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-border">
        <DialogTitle className="sr-only">New Booking</DialogTitle>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="text-[10px] uppercase tracking-[0.24em] text-gold font-medium">New Reservation</div>
          <h2 className="font-serif text-3xl mt-1">Create Booking</h2>

          <div className="flex items-center gap-2 mt-5 overflow-x-auto">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className={cn("h-7 w-7 rounded-full grid place-items-center text-xs font-medium border transition",
                  i < step ? "bg-primary text-primary-foreground border-primary" :
                  i === step ? "bg-card text-primary border-primary" :
                  "bg-muted text-muted-foreground border-border")}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {step === 0 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Search by name or phone…"
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="text-xs text-muted-foreground">Suggestions</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {MOCK_CUSTOMERS.map((c) => (
                  <button key={c} onClick={() => setCustomer(c)}
                    className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left hover:bg-muted transition",
                      customer === c ? "border-primary bg-primary/5" : "border-border bg-card")}>
                    <div className="h-9 w-9 rounded-full bg-rose-soft text-deep-olive grid place-items-center font-serif">{c.charAt(0)}</div>
                    <div className="text-sm font-medium">{c}</div>
                  </button>
                ))}
              </div>
              <button className="text-sm text-primary hover:underline">+ Create new customer</button>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {MOCK_SERVICES.map((s) => (
                <button key={s.name} onClick={() => setService(s)}
                  className={cn("rounded-2xl border p-4 text-left hover:bg-muted transition",
                    service?.name === s.name ? "border-primary bg-primary/5" : "border-border bg-card")}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.cat}</span>
                  </div>
                  <div className="font-serif text-lg mt-1">{s.name}</div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span><Clock className="h-3 w-3 inline mr-1" />{s.duration} min</span>
                    <span className="font-medium text-foreground">NPR {s.price.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                <Field label="Branch">
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm">
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {STAFF.map((p) => (
                  <button key={p} onClick={() => setStaff(p)}
                    className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left hover:bg-muted transition",
                      staff === p ? "border-primary bg-primary/5" : "border-border bg-card")}>
                    <div className="h-10 w-10 rounded-full bg-mist-soft text-deep-olive grid place-items-center font-serif">{p.split(" ").map(x => x[0]).join("").slice(0,2)}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p}</div>
                      <div className="text-[11px] text-muted-foreground">Available · 4.8 ★</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border bg-card p-2">
                <Calendar mode="single" selected={date} onSelect={setDate} className="p-2 pointer-events-auto" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Available slots</div>
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={cn("rounded-xl border py-2 text-sm transition",
                        time === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-gold mb-2">Review</div>
              <h3 className="font-serif text-2xl mb-4">Confirm reservation</h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <Term icon={User} k="Customer" v={customer || "—"} />
                <Term icon={Sparkles} k="Service" v={service ? `${service.name} (${service.duration}m)` : "—"} />
                <Term icon={User} k="Staff" v={staff || "—"} />
                <Term icon={CalendarIcon} k="Date" v={date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—"} />
                <Term icon={Clock} k="Time" v={time || "—"} />
                <Term icon={Sparkles} k="Branch" v={branch} />
              </dl>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-serif text-2xl">NPR {(service?.price ?? 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <button onClick={prev} disabled={step === 0}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-40 hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next}
              className="inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-luxe">
              Continue<ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-luxe">
              <Check className="h-4 w-4" />Confirm Booking
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Term({ icon: Icon, k, v }: { icon: any; k: string; v: string }) {
  return (
    <>
      <dt className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </>
  );
}

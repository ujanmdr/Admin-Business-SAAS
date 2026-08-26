import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Customer, customerStatusTone } from "@/lib/customer-data";
import {
  Phone, MessageCircle, Mail, MapPin, Cake, Tag, Calendar, Wallet, Star,
  Sparkles, Package, Gift, Heart, CreditCard, FileText, Plus, BookOpen,
} from "lucide-react";

const HISTORY = {
  bookings: [
    { date: "2026-05-02", svc: "Hydra Facial", staff: "Anjali", amt: 4800, status: "Completed" },
    { date: "2026-04-18", svc: "Bridal Trial", staff: "Sneha", amt: 12500, status: "Completed" },
    { date: "2026-03-30", svc: "Pedicure", staff: "Manisha", amt: 2800, status: "Completed" },
    { date: "2026-03-12", svc: "Hair Spa", staff: "Pooja", amt: 3500, status: "Cancelled" },
  ],
  packages: [
    { name: "Bridal Glow Pkg", remaining: "2 of 4 sessions", expires: "2026-08-12" },
    { name: "Skin Radiance 6", remaining: "5 of 6 sessions", expires: "2026-09-30" },
  ],
  giftCards: [
    { code: "GC-AURA-1042", amount: 2000, status: "Active" },
  ],
  loyalty: [
    { date: "2026-05-02", change: "+48 pts", reason: "Hydra Facial" },
    { date: "2026-04-18", change: "+125 pts", reason: "Bridal Trial" },
    { date: "2026-03-30", change: "−500 pts", reason: "Redeemed for Pedicure" },
  ],
  payments: [
    { date: "2026-05-02", method: "eSewa", amt: 4800, status: "Paid" },
    { date: "2026-04-18", method: "Khalti", amt: 12500, status: "Paid" },
    { date: "2026-03-30", method: "Cash", amt: 2800, status: "Paid" },
  ],
  reviews: [
    { rating: 5, text: "Sneha is magic with bridal makeup. Felt so calm.", date: "2026-04-19" },
    { rating: 5, text: "Loved the spa ambiance. Will return weekly.", date: "2026-03-31" },
  ],
  whatsapp: [
    { from: "you", text: "Hi Aastha! Reminder for tomorrow's bridal trial at 10:30 AM 🌸" },
    { from: "them", text: "Yes! Excited. Should I bring my dupatta?" },
    { from: "you", text: "Absolutely — and any inspiration photos help us prep." },
  ],
};

export function CustomerDrawer({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  return (
    <Sheet open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 bg-background overflow-y-auto">
        <SheetTitle className="sr-only">Customer profile</SheetTitle>
        {customer && <Body c={customer} />}
      </SheetContent>
    </Sheet>
  );
}

function Body({ c }: { c: Customer }) {
  return (
    <div>
      <div className="bg-gradient-to-br from-[color-mix(in_oklab,var(--sage)_22%,white)] via-card to-[color-mix(in_oklab,var(--rose)_18%,white)] px-6 pt-8 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium">{c.id}</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${customerStatusTone(c.status)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />{c.status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-card border border-border grid place-items-center font-serif text-2xl text-deep-olive shadow-luxe">
            {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-3xl leading-tight truncate">{c.name}</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5">
          <Mini icon={Calendar} label="Visits" value={c.totalVisits} />
          <Mini icon={Wallet} label="Spend" value={`${(c.totalSpend / 1000).toFixed(1)}k`} />
          <Mini icon={Heart} label="Loyalty" value={`${c.loyaltyStamps}/10`} />
          <Mini icon={Package} label="Packages" value={c.activePackages} />
          <Mini icon={Gift} label="Gift NPR" value={c.giftCardBalance} />
          <Mini icon={Star} label="Reviews" value={HISTORY.reviews.length} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Action icon={Phone} label="Call" />
          <Action icon={MessageCircle} label="WhatsApp" tone="primary" />
          <Action icon={Mail} label="Email" />
          <Action icon={BookOpen} label="Book" />
        </div>
      </div>

      {/* Profile facts */}
      <Section title="Profile">
        <div className="grid grid-cols-2 gap-3">
          <Fact icon={Cake} label="Birthday" value={c.birthday} />
          <Fact icon={Mail} label="Email" value={c.email} />
          <Fact icon={Sparkles} label="Preferred Staff" value={c.preferredStaff} />
          <Fact icon={Tag} label="Source" value={c.source} />
        </div>
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {c.tags.map((t) => (
              <span key={t} className="text-[11px] rounded-full bg-mist-soft border border-border px-2.5 py-0.5 text-deep-olive">{t}</span>
            ))}
            <button className="text-[11px] rounded-full border border-dashed border-border px-2.5 py-0.5 text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <Plus className="h-3 w-3" />Add tag
            </button>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Favorite Services</div>
          <div className="flex flex-wrap gap-1.5">
            {c.favoriteServices.map((s) => (
              <span key={s} className="text-[11px] rounded-full bg-sand-soft border border-border px-2.5 py-0.5 text-deep-olive">{s}</span>
            ))}
          </div>
        </div>
      </Section>

      {(c.notes || c.allergies) && (
        <Section title="Notes & Preferences">
          {c.notes && (
            <div className="rounded-2xl bg-sand-soft border border-border p-4 text-sm italic">"{c.notes}"</div>
          )}
          {c.allergies && (
            <div className="rounded-2xl bg-rose-soft border border-border p-3 text-sm mt-2 inline-flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-deep-olive">Allergy</span>
              <span className="text-deep-olive">{c.allergies}</span>
            </div>
          )}
        </Section>
      )}

      <Section title="Booking History">
        <Table head={["Date", "Service", "Staff", "Amount", "Status"]}>
          {HISTORY.bookings.map((b, i) => (
            <tr key={i} className="border-t border-border">
              <Td>{b.date}</Td><Td>{b.svc}</Td><Td>{b.staff}</Td><Td>NPR {b.amt.toLocaleString()}</Td>
              <Td>
                <span className={`inline-flex text-[10px] rounded-full border px-2 py-0.5 ${b.status === "Completed" ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-soft text-deep-olive border-border"}`}>
                  {b.status}
                </span>
              </Td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Packages">
        <ul className="space-y-2">
          {HISTORY.packages.map((p) => (
            <li key={p.name} className="rounded-2xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.remaining} · expires {p.expires}</div>
              </div>
              <Package className="h-5 w-5 text-primary" />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Gift Cards">
        {HISTORY.giftCards.map((g) => (
          <div key={g.code} className="rounded-2xl bg-mist-soft border border-border p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-deep-olive">{g.code}</div>
              <div className="font-serif text-2xl text-deep-olive mt-1">NPR {g.amount.toLocaleString()}</div>
            </div>
            <Gift className="h-6 w-6 text-deep-olive" />
          </div>
        ))}
      </Section>

      <Section title="Loyalty">
        <ul className="space-y-1.5">
          {HISTORY.loyalty.map((l, i) => (
            <li key={i} className="flex items-center justify-between text-sm border-b border-dashed border-border pb-1.5 last:border-0">
              <div>
                <div className="font-medium">{l.reason}</div>
                <div className="text-[11px] text-muted-foreground">{l.date}</div>
              </div>
              <span className={`text-sm font-medium ${l.change.startsWith("+") ? "text-primary" : "text-deep-olive"}`}>{l.change}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Payments">
        <Table head={["Date", "Method", "Amount", "Status"]}>
          {HISTORY.payments.map((p, i) => (
            <tr key={i} className="border-t border-border">
              <Td>{p.date}</Td><Td>{p.method}</Td><Td>NPR {p.amt.toLocaleString()}</Td>
              <Td><span className="inline-flex text-[10px] rounded-full border border-primary/20 bg-primary/10 text-primary px-2 py-0.5">{p.status}</span></Td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Reviews">
        {HISTORY.reviews.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 mb-2">
            <div className="flex items-center gap-1 text-gold">
              {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-gold" />)}
            </div>
            <p className="text-sm mt-2">{r.text}</p>
            <div className="text-[11px] text-muted-foreground mt-2">{r.date}</div>
          </div>
        ))}
      </Section>

      <Section title="WhatsApp Conversation">
        <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
          {HISTORY.whatsapp.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "you" ? "ml-auto bg-primary/10 text-foreground" : "bg-mist-soft text-deep-olive"}`}>
              {m.text}
            </div>
          ))}
        </div>
      </Section>

      <div className="px-6 pb-8 pt-2 sticky bottom-0 bg-background/90 backdrop-blur border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Action icon={BookOpen} label="Create Booking" tone="primary" />
          <Action icon={Package} label="Sell Package" />
          <Action icon={Gift} label="Sell Gift Card" />
          <Action icon={CreditCard} label="Take Payment" />
          <Action icon={FileText} label="Add Note" />
          <Action icon={Tag} label="Add Tag" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-border">
      <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium mb-3">{title}</div>
      {children}
    </div>
  );
}

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-2 text-center">
      <Icon className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
      <div className="font-serif text-base mt-0.5 leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" />{label}</div>
      <div className="text-sm font-medium mt-1 truncate">{value}</div>
    </div>
  );
}

function Action({ icon: Icon, label, tone }: { icon: any; label: string; tone?: "primary" }) {
  const cls = tone === "primary"
    ? "bg-primary text-primary-foreground hover:opacity-95"
    : "bg-card border border-border hover:bg-muted";
  return (
    <button className={`rounded-xl ${cls} py-2.5 text-sm font-medium transition flex items-center justify-center gap-2`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-sand-soft/40 text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2">{children}</td>;
}

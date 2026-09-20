import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Booking, statusTone, payTone } from "@/lib/booking-data";
import {
  Phone, MessageCircle, Mail, Clock, MapPin, User, Sparkles, Package, Gift, Heart,
  Calendar, CheckCircle2, XCircle, RotateCcw, CreditCard, Receipt, FileText,
} from "lucide-react";

export function BookingDrawer({
  booking,
  onClose,
  onPrintReceipt,
}: {
  booking: Booking | null;
  onClose: () => void;
  onPrintReceipt?: (b: Booking) => void;
}) {
  return (
    <Sheet open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-background overflow-y-auto">
        <SheetTitle className="sr-only">Booking details</SheetTitle>
        {booking && <DrawerBody b={booking} onPrintReceipt={onPrintReceipt} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ b, onPrintReceipt }: { b: Booking; onPrintReceipt?: (b: Booking) => void }) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[color-mix(in_oklab,var(--sage)_22%,white)] via-card to-[color-mix(in_oklab,var(--rose)_18%,white)] px-6 pt-8 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium">{b.id}</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${statusTone(b.status)}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />{b.status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-card border border-border grid place-items-center font-serif text-2xl text-deep-olive">
            {b.customer.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-2xl leading-tight truncate">{b.customer}</h2>
            <div className="text-sm text-muted-foreground">{b.phone}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5">
          <IconBtn icon={Phone} label="Call" />
          <IconBtn icon={MessageCircle} label="WhatsApp" />
          <IconBtn icon={Mail} label="Email" />
        </div>
      </div>

      {/* Service & schedule */}
      <Section title="Service">
        <Row icon={Sparkles} label="Service" value={`${b.service}`} />
        <Row icon={User} label="Staff" value={b.staff} />
        <Row icon={Calendar} label="Date" value={new Date(b.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />
        <Row icon={Clock} label="Time" value={`${b.start} · ${b.duration} min`} />
        <Row icon={MapPin} label="Branch · Room" value={`${b.branch} · ${b.room}`} />
      </Section>

      {b.notes && (
        <Section title="Notes">
          <div className="rounded-2xl bg-sand-soft border border-border p-4 text-sm text-foreground/85 italic">
            "{b.notes}"
          </div>
        </Section>
      )}

      {(b.package || b.giftCard || b.loyalty) && (
        <Section title="Wallet & Perks">
          {b.package && <Row icon={Package} label="Package" value={b.package} />}
          {b.giftCard && <Row icon={Gift} label="Gift Card" value={b.giftCard} />}
          {b.loyalty !== undefined && <Row icon={Heart} label="Loyalty" value={`${b.loyalty} pts available`} />}
        </Section>
      )}

      <Section title="Payment">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div>
              <div className="font-serif text-2xl">NPR {b.amount.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full border px-2.5 py-1 ${payTone(b.payment.status)}`}>
                {b.payment.status}
              </span>
              <div className="text-xs text-muted-foreground mt-1">{b.payment.method}</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="px-6 pb-8 pt-2 sticky bottom-0 bg-background/90 backdrop-blur border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Action icon={CheckCircle2} label="Mark Completed" tone="primary" />
          <Action icon={CreditCard} label="Collect Payment" />
          <Action icon={RotateCcw} label="Reschedule" />
          <Action icon={Receipt} label="Print Receipt" onClick={() => onPrintReceipt?.(b)} />
          <Action icon={FileText} label="Add Note" />
          <Action icon={XCircle} label="Cancel" tone="rose" />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-border">
      <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-medium mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center text-deep-olive">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="rounded-xl bg-card border border-border py-2 text-xs font-medium hover:bg-muted transition flex items-center justify-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}

function Action({ icon: Icon, label, tone, onClick }: { icon: any; label: string; tone?: "primary" | "rose"; onClick?: () => void }) {
  const cls = tone === "primary"
    ? "bg-primary text-primary-foreground hover:opacity-95"
    : tone === "rose"
      ? "bg-rose-soft text-deep-olive border border-border hover:opacity-90"
      : "bg-card border border-border text-foreground hover:bg-muted";
  return (
    <button onClick={onClick} className={`rounded-xl ${cls} py-2.5 text-sm font-medium transition flex items-center justify-center gap-2`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  );
}

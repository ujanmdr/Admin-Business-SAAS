import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { GIFT_CARDS, GiftCard, fmt } from "@/lib/programs-data";
import { Plus, Gift, Wallet, CheckCircle2, Clock, Search, Send, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/gift-cards")({
  head: () => ({ meta: [{ title: "Gift Cards · BRG Suite" }] }),
  component: GiftCardsPage,
});

function statusTone(s: GiftCard["status"]) {
  switch (s) {
    case "Delivered": return "bg-mist-soft border-mist text-foreground/80";
    case "Scheduled": return "bg-sand-soft border-border text-foreground/80";
    case "Redeemed": return "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive";
    case "Expired": return "bg-rose-soft border-rose text-foreground/80";
  }
}

function GiftCardsPage() {
  const [q, setQ] = useState("");
  const [issuing, setIssuing] = useState(false);

  const rows = useMemo(
    () => GIFT_CARDS.filter((g) =>
      q === "" ||
      g.recipient.toLowerCase().includes(q.toLowerCase()) ||
      g.sender.toLowerCase().includes(q.toLowerCase()) ||
      g.code.toLowerCase().includes(q.toLowerCase()),
    ),
    [q],
  );

  const sold = GIFT_CARDS.reduce((s, g) => s + g.amount, 0);
  const remaining = GIFT_CARDS.reduce((s, g) => s + g.remaining, 0);
  const redeemed = sold - remaining;

  const kpis = [
    { label: "Cards Sold", value: String(GIFT_CARDS.length), sub: fmt(sold), icon: Gift, tone: "bg-rose-soft" },
    { label: "Total Redeemed", value: fmt(redeemed), icon: CheckCircle2, tone: "bg-[color-mix(in_oklab,var(--sage)_25%,white)]" },
    { label: "Outstanding Balance", value: fmt(remaining), icon: Wallet, tone: "bg-sand-soft" },
    { label: "Scheduled Deliveries", value: String(GIFT_CARDS.filter((g) => g.status === "Scheduled").length), icon: Clock, tone: "bg-mist-soft" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Gift Cards"
        description="Beautifully delivered gift experiences for every occasion."
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setIssuing(true)}>
            <Plus className="h-4 w-4" />Issue gift card
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-2xl mt-1">{k.value}</div>
              {k.sub && <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>}
            </div>
          );
        })}
      </div>

      {/* Hero gift card */}
      <div className="rounded-2xl bg-gradient-to-br from-[color-mix(in_oklab,var(--rose)_55%,white)] via-[color-mix(in_oklab,var(--sand)_70%,white)] to-[color-mix(in_oklab,var(--gold)_25%,white)] border border-border p-6 mb-8 shadow-luxe">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-foreground/70">Aura Gift Card</div>
            <div className="font-serif text-3xl mt-1">Give the gift of glow.</div>
            <p className="text-sm text-foreground/75 mt-2 max-w-md">Designed in three sizes. Personalised note. Scheduled WhatsApp delivery.</p>
          </div>
          <div className="flex gap-2">
            {[3000, 5000, 10000].map((v) => (
              <div key={v} className="rounded-xl bg-card border border-border px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Preset</div>
                <div className="font-serif text-lg">{fmt(v)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code, sender or recipient…"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Sender → Recipient</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Remaining</th>
                <th className="text-left px-4 py-3">Delivery</th>
                <th className="text-left px-4 py-3">Expiry</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-t border-border hover:bg-sand-soft/30">
                  <td className="px-4 py-3 font-mono text-xs">{g.code}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{g.sender} → <span className="font-medium">{g.recipient}</span></div>
                    <div className="text-xs text-muted-foreground">{g.recipientPhone}</div>
                    <div className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1 max-w-xs">"{g.message}"</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(g.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{fmt(g.remaining)}</div>
                    <div className="mt-1 h-1 rounded-full bg-sand-soft overflow-hidden w-20">
                      <div className="h-full bg-gradient-to-r from-[var(--sage)] to-[var(--olive)]" style={{ width: (g.remaining / g.amount) * 100 + "%" }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{g.deliveryDate}</td>
                  <td className="px-4 py-3 text-xs">{g.expiryDate}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", statusTone(g.status))}>{g.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue modal */}
      <Dialog open={issuing} onOpenChange={setIssuing}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Issue gift card</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-3 gap-2">
              {[3000, 5000, 10000, 15000, 20000, 25000].map((v) => (
                <button key={v} className="rounded-xl border border-border bg-card hover:bg-sand-soft px-3 py-3 font-serif text-base">{fmt(v)}</button>
              ))}
            </div>
            <div><label className="text-xs font-medium">Sender name</label><Input className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium">Recipient name</label><Input className="mt-1" /></div>
              <div><label className="text-xs font-medium">Recipient phone</label><Input className="mt-1" defaultValue="+977 98 " /></div>
            </div>
            <div><label className="text-xs font-medium">Personal message</label><Textarea rows={2} className="mt-1" placeholder="Happy birthday darling…" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Delivery date</label><Input type="date" className="mt-1" /></div>
              <div><label className="text-xs font-medium">Expiry</label><Input className="mt-1" defaultValue="12 months" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssuing(false)}>Cancel</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={() => setIssuing(false)}>
              <Send className="h-4 w-4" />Issue & schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

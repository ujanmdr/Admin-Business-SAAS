import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { GIFT_CARDS, GIFT_CARD_DESIGNS, GiftCard, fmt } from "@/lib/programs-data";
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

  // Gift Card Creator State
  const [selectedDesign, setSelectedDesign] = useState("gold");
  const [amount, setAmount] = useState(5000);
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("+977 98 ");
  const [message, setMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [expiry, setExpiry] = useState("12 months");

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
                  <td className="px-4 py-3 font-mono text-xs flex items-center gap-2">
                    {(() => {
                      const d = GIFT_CARD_DESIGNS.find((item) => item.id === g.designId);
                      return (
                        <span
                          className={cn("h-2.5 w-2.5 rounded-full inline-block shrink-0", d?.dot || "bg-border")}
                          title={d?.name || "Default Theme"}
                        />
                      );
                    })()}
                    {g.code}
                  </td>
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
        <DialogContent className="max-w-3xl bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Issue gift card</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Left Column: Configurator Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Amount</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[3000, 5000, 10000, 15000, 20000, 25000].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setAmount(v)}
                      className={cn(
                        "rounded-xl border px-3 py-2 font-serif text-sm transition-colors",
                        amount === v ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-sand-soft"
                      )}
                    >
                      {fmt(v)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Template Picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Card Design</label>
                <div className="flex gap-3 mt-2">
                  {GIFT_CARD_DESIGNS.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setSelectedDesign(d.id)}
                      title={d.name}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105",
                        selectedDesign === d.id ? "border-foreground scale-110 shadow-md" : "border-transparent"
                      )}
                    >
                      <span className={cn("h-7 w-7 rounded-full block border border-black/10", d.dot)} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Sender Name</label>
                  <Input className="mt-1" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="E.g. Pratima Joshi" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">Recipient Name</label>
                    <Input className="mt-1" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="E.g. Sneha Karki" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Recipient Phone</label>
                    <Input className="mt-1" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Personal Message</label>
                  <Textarea rows={2} className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a sweet message..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />Delivery Date</label>
                    <Input type="date" className="mt-1" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Expiry Validity</label>
                    <Input className="mt-1" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Card Preview & Actions */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Live Card Preview</label>
                
                {(() => {
                  const d = GIFT_CARD_DESIGNS.find((item) => item.id === selectedDesign) || GIFT_CARD_DESIGNS[0];
                  return (
                    <div className={cn(
                      "w-full aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-br shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300",
                      d.gradient,
                      d.text
                    )}>
                      {/* Decorative elements */}
                      <div className="absolute right-[-10%] top-[-20%] w-[50%] aspect-square rounded-full bg-white/10 blur-2xl pointer-events-none" />
                      <div className="absolute left-[-5%] bottom-[-10%] w-[30%] aspect-square rounded-full bg-black/5 blur-xl pointer-events-none" />

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.2em] opacity-80 font-mono">Platform Gift</div>
                          <div className="font-serif text-lg font-semibold mt-0.5">Aura Spa & Salon</div>
                        </div>
                        <Gift className="h-5 w-5 opacity-80" />
                      </div>

                      {message ? (
                        <p className="text-xs italic line-clamp-2 max-w-[85%] mt-2 opacity-95">"{message}"</p>
                      ) : (
                        <p className="text-xs italic mt-2 opacity-50">"Happy birthday! Enjoy your pampering session..."</p>
                      )}

                      <div className="flex justify-between items-end mt-4">
                        <div className="min-w-0">
                          <div className="text-[9px] uppercase tracking-wider opacity-70">For</div>
                          <div className="text-sm font-semibold truncate leading-tight">{recipient || "Recipient Name"}</div>
                          <div className="text-[9px] opacity-75 mt-0.5">From: {sender || "Sender Name"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[9px] uppercase tracking-wider opacity-70">Value</div>
                          <div className="font-serif text-xl font-bold">{fmt(amount)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="mt-4 p-3 bg-sand-soft/50 border border-border rounded-xl text-[11px] text-muted-foreground space-y-1">
                  <div>• Deliver to: <b>{recipientPhone}</b></div>
                  <div>• Scheduled for: <b>{deliveryDate || "Instant delivery"}</b></div>
                  <div>• Expiration: <b>{expiry}</b></div>
                </div>
              </div>

              <DialogFooter className="mt-6 md:mt-0 pt-4 border-t border-border flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setIssuing(false)}>Cancel</Button>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setIssuing(false)}>
                  <Send className="h-4 w-4" />Issue & schedule
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

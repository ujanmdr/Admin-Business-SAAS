import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Gift, BadgeDollarSign, ShieldAlert, Sparkles, Plus, Send, Calendar } from "lucide-react";
import { giftCards, npr, businesses } from "@/lib/mock-data";
import { GIFT_CARD_DESIGNS } from "@/lib/programs-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/gift-cards")({
  head: () => ({ meta: [{ title: "Gift Cards · BRG Admin" }] }),
  component: GiftCards,
});

function GiftCards() {
  const [q, setQ] = useState("");
  const [issuing, setIssuing] = useState(false);

  // Gift Card Configuration States
  const [selectedDesign, setSelectedDesign] = useState("gold");
  const [amount, setAmount] = useState(5000);
  const [sender, setSender] = useState("BRG Admin");
  const [recipient, setRecipient] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("+977 98 ");
  const [message, setMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [expiry, setExpiry] = useState("12 months");

  // Admin Specific states
  const [scope, setScope] = useState<"Platform" | "Business">("Platform");
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [fundingType, setFundingType] = useState<"Paid" | "Promotional">("Paid");

  const rows = giftCards.filter(g => g.code.toLowerCase().includes(q.toLowerCase()) || g.recipient.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gift Cards" 
        description="All BRG and business-issued gift cards on the platform." 
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 gap-1.5" onClick={() => setIssuing(true)}>
            <Plus className="h-4 w-4" />Issue Gift Card
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active gift cards" value={giftCards.filter(g=>g.status==="Active").length} icon={Gift} />
        <KpiCard label="Total face value" value={npr(giftCards.reduce((a,g)=>a+g.amount,0))} icon={BadgeDollarSign} />
        <KpiCard label="Outstanding balance" value={npr(giftCards.reduce((a,g)=>a+g.balance,0))} icon={Sparkles} />
        <KpiCard label="Suspicious flags" value="2" deltaTone="bad" icon={ShieldAlert} />
      </div>
      <FilterBar onSearch={setQ} searchPlaceholder="Search code or recipient…" filters={[
        { label: "Type", options: ["Platform","Business"] },
        { label: "Status", options: ["Active","Redeemed","Expired"] },
      ]} />
      <DataTable getKey={(r)=>r.code} rows={rows} columns={[
        { key: "code", header: "Code", render: (r) => (
          <span className="font-mono text-xs font-semibold text-foreground flex items-center gap-2">
            {(() => {
              const designId = r.type === "Platform" ? "gold" : "sage";
              const d = GIFT_CARD_DESIGNS.find((item) => item.id === designId);
              return (
                <span
                  className={cn("h-2.5 w-2.5 rounded-full inline-block shrink-0", d?.dot || "bg-border")}
                  title={d?.name || "Default Theme"}
                />
              );
            })()}
            {r.code}
          </span>
        )},
        { key: "from", header: "Sender", render: (r) => r.sender },
        { key: "to", header: "Recipient", render: (r) => <div><div>{r.recipient}</div><div className="text-xs text-muted-foreground">{r.recipientPhone}</div></div> },
        { key: "amt", header: "Amount", align:"right", render: (r) => npr(r.amount) },
        { key: "bal", header: "Balance", align:"right", render: (r) => <span className="font-medium">{npr(r.balance)}</span> },
        { key: "type", header: "Type", render: (r) => <StatusBadge status={r.type === "Platform" ? "Featured" : "Active"} /> },
        { key: "p", header: "Purchased", render: (r) => <span className="text-muted-foreground">{r.purchaseDate}</span> },
        { key: "e", header: "Expiry", render: (r) => <span className="text-muted-foreground">{r.expiry}</span> },
        { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "act", header: "", align: "right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">View</Button>
            <Button size="sm" variant="outline" className="h-7 border-destructive/40 text-destructive">Disable</Button>
          </div>
        )},
      ]} />

      {/* Super Admin Issue Modal */}
      <Dialog open={issuing} onOpenChange={setIssuing}>
        <DialogContent className="max-w-3xl bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Issue gift card</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Left Column: Form & Configuration */}
            <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
              
              {/* Scope & Funding Configuration */}
              <div className="grid grid-cols-2 gap-2 bg-sand-soft/40 p-2.5 rounded-xl border border-border">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as "Platform" | "Business")}
                    className="w-full mt-1 h-9 rounded-lg border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Platform">Platform-Wide</option>
                    <option value="Business">Business-Specific</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Funding Model</label>
                  <select
                    value={fundingType}
                    onChange={(e) => setFundingType(e.target.value as "Paid" | "Promotional")}
                    className="w-full mt-1 h-9 rounded-lg border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Paid">Paid (Cash/Bank)</option>
                    <option value="Promotional">Promotional (Comp/Free)</option>
                  </select>
                </div>
              </div>

              {/* If scope is Business, select which Business */}
              {scope === "Business" && (
                <div>
                  <label className="text-xs font-medium">Target Business Profile</label>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="w-full mt-1 h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    <option value="">-- Choose Business --</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                      रू {v.toLocaleString("en-IN")}
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
                  <Input className="mt-1" value={sender} onChange={(e) => setSender(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">Recipient Name</label>
                    <Input className="mt-1" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="E.g. Customer Name" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Recipient Phone</label>
                    <Input className="mt-1" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Personal Message</label>
                  <Textarea rows={2} className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday darling…" />
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

            {/* Right Column: Live Card Preview & Details */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Live Card Preview</label>
                
                {(() => {
                  const d = GIFT_CARD_DESIGNS.find((item) => item.id === selectedDesign) || GIFT_CARD_DESIGNS[0];
                  const targetBusinessName = scope === "Business" && selectedBusinessId 
                    ? businesses.find(b => b.id === selectedBusinessId)?.name 
                    : "Universal Platform";

                  return (
                    <div className={cn(
                      "w-full aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-br shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300",
                      d.gradient,
                      d.text
                    )}>
                      {/* Decor bubbles */}
                      <div className="absolute right-[-10%] top-[-20%] w-[50%] aspect-square rounded-full bg-white/10 blur-2xl pointer-events-none" />
                      <div className="absolute left-[-5%] bottom-[-10%] w-[30%] aspect-square rounded-full bg-black/5 blur-xl pointer-events-none" />

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.2em] opacity-80 font-mono">
                            {scope === "Platform" ? "BRG Universal Card" : "Single Brand Card"}
                          </div>
                          <div className="font-serif text-lg font-semibold mt-0.5 truncate max-w-[200px]">
                            {targetBusinessName}
                          </div>
                        </div>
                        <Gift className="h-5 w-5 opacity-80" />
                      </div>

                      {message ? (
                        <p className="text-xs italic line-clamp-2 max-w-[85%] mt-2 opacity-95">"{message}"</p>
                      ) : (
                        <p className="text-xs italic mt-2 opacity-50">"Add a personal message..."</p>
                      )}

                      <div className="flex justify-between items-end mt-4">
                        <div className="min-w-0">
                          <div className="text-[9px] uppercase tracking-wider opacity-70">For</div>
                          <div className="text-sm font-semibold truncate leading-tight">{recipient || "Recipient Name"}</div>
                          <div className="text-[9px] opacity-75 mt-0.5">From: {sender}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[9px] uppercase tracking-wider opacity-70">Value</div>
                          <div className="font-serif text-xl font-bold">रू {amount.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-4 p-3 bg-sand-soft/50 border border-border rounded-xl text-[11px] text-muted-foreground space-y-1.5">
                  <div>• Scope: <b>{scope === "Platform" ? "Universal (Platform-Wide)" : `Locked to ${businesses.find(b=>b.id===selectedBusinessId)?.name || "selected business"}`}</b></div>
                  <div>• Funding: <span className={cn("px-1.5 py-0.5 rounded font-semibold text-[10px]", fundingType === "Paid" ? "bg-emerald-soft text-emerald-800" : "bg-blue-soft text-blue-800")}>{fundingType}</span></div>
                  <div>• Deliver to: <b>{recipientPhone}</b></div>
                  <div>• Schedule: <b>{deliveryDate || "Instant delivery"}</b></div>
                  <div>• Expiration: <b>{expiry}</b></div>
                </div>
              </div>

              <DialogFooter className="mt-6 md:mt-0 pt-4 border-t border-border flex justify-end gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setIssuing(false)}>Cancel</Button>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setIssuing(false)}>
                  <Send className="h-4 w-4" />Issue & generate
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

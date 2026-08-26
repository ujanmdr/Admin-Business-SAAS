import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Gift, BadgeDollarSign, ShieldAlert, Sparkles } from "lucide-react";
import { giftCards, npr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/gift-cards")({
  head: () => ({ meta: [{ title: "Gift Cards · BRG Admin" }] }),
  component: GiftCards,
});

function GiftCards() {
  const [q, setQ] = useState("");
  const rows = giftCards.filter(g => g.code.toLowerCase().includes(q.toLowerCase()) || g.recipient.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader title="Gift Cards" description="All BRG and business-issued gift cards on the platform." />
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
        { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.code}</span> },
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
    </div>
  );
}

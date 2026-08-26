import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Wallet, BadgeDollarSign, Clock, Undo2, Receipt } from "lucide-react";
import { settlements, npr, paymentMethods } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments & Settlements · BRG Admin" }] }),
  component: Payments,
});

function Payments() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"settlements" | "transactions">("settlements");
  const [mockTransactions, setMockTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Poll the mock backend every 2 seconds to get the latest POS sales!
    const fetchTx = async () => {
      try {
        const res = await fetch('http://localhost:3001/transactions');
        const data = await res.json();
        setMockTransactions(data);
      } catch(e) {
        // Fallback static data if backend isn't running
        setMockTransactions([
          { id: "PAY-10421", business: "Aura Beauty Lounge", customer: "Pratima Joshi", reference: "POS · INV-20260707-1042", amount: 8500, method: "Split (eSewa+Cash)", status: "Paid", date: "2026-07-07 10:42" },
        ]);
      }
    };
    fetchTx();
    const interval = setInterval(fetchTx, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const filteredSettlements = settlements.filter(s => s.business.toLowerCase().includes(q.toLowerCase()));
  const filteredTransactions = mockTransactions.filter(t => t.business.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Payments & Finance" description="Finance operations across all payment methods and businesses."
        actions={<Button size="sm" className="bg-primary hover:bg-primary/90">Run settlement batch</Button>} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        <KpiCard label="Total payments" value={npr(35800000)} icon={Wallet} />
        <KpiCard label="eSewa" value={npr(15036000)} delta="42%" icon={Wallet} />
        <KpiCard label="Khalti" value={npr(10024000)} delta="28%" icon={Wallet} />
        <KpiCard label="Cash bookings" value={npr(6444000)} delta="18%" icon={Wallet} />
        <KpiCard label="Card" value={npr(4296000)} delta="12%" icon={Wallet} />
      </div>

      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setTab("settlements")} className={`pb-2 text-sm font-medium border-b-2 transition ${tab === 'settlements' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Settlements (Batch)</button>
        <button onClick={() => setTab("transactions")} className={`pb-2 text-sm font-medium border-b-2 transition ${tab === 'transactions' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Live Transactions</button>
      </div>

      <FilterBar
        onSearch={setQ}
        searchPlaceholder="Search business…"
        filters={[
          { label: "Method", options: [...paymentMethods, "Split"] },
          { label: "Status", options: ["Pending","Processing","Completed", "Paid"] },
        ]}
      />

      {tab === "settlements" ? (
        <DataTable
          getKey={(r) => r.id}
          rows={filteredSettlements}
          columns={[
            { key: "id", header: "Settlement", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
            { key: "biz", header: "Business", render: (r) => <span className="font-medium">{r.business}</span> },
            { key: "amount", header: "Booking amount", align: "right", render: (r) => npr(r.amount) },
            { key: "comm", header: "BRG commission", align: "right", render: (r) => <span className="text-[oklch(0.45_0.13_70)]">{npr(r.commission)}</span> },
            { key: "earn", header: "Business earning", align: "right", render: (r) => npr(r.earning) },
            { key: "method", header: "Method", render: (r) => r.method },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "due", header: "Due", render: (r) => <span className="text-muted-foreground">{r.dueDate}</span> },
            { key: "paid", header: "Paid", render: (r) => <span className="text-muted-foreground">{r.paidDate}</span> },
            { key: "act", header: "", align: "right", render: () => (
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="outline" className="h-7 border-border">View</Button>
                <Button size="sm" className="h-7 bg-primary hover:bg-primary/90">Settle</Button>
              </div>
            )},
          ]}
        />
      ) : (
        <DataTable
          getKey={(r) => r.id}
          rows={filteredTransactions}
          columns={[
            { key: "id", header: "Txn ID", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
            { key: "date", header: "Date", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
            { key: "biz", header: "Business", render: (r) => <span className="font-medium">{r.business}</span> },
            { key: "cust", header: "Customer", render: (r) => r.customer },
            { key: "ref", header: "Reference", render: (r) => <span className="text-muted-foreground text-xs">{r.reference}</span> },
            { key: "amount", header: "Amount", align: "right", render: (r) => npr(r.amount) },
            { key: "method", header: "Method", render: (r) => r.method },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "act", header: "", align: "right", render: () => (
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="outline" className="h-7 border-border text-xs"><Receipt className="w-3 h-3 mr-1"/> Invoice</Button>
              </div>
            )},
          ]}
        />
      )}
    </div>
  );
}

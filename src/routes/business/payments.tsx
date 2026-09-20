import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PAYMENTS, SETTLEMENTS, fmt, methodTone, payStatusTone, PayMethod } from "@/lib/finance-data";
import {
  Wallet, Clock, RefreshCcw, AlertCircle, Search, Download, MoreHorizontal,
  Eye, MessageCircle, CheckCircle2, Receipt, Filter,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import type { InvoiceData } from "@/components/invoice/InvoiceDocument";
import { getWhatsAppShareUrl } from "@/lib/invoice-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/business/payments")({
  head: () => ({ meta: [{ title: "Payments · BRG Suite" }] }),
  component: PaymentsPage,
});

function paymentToInvoiceData(p: (typeof PAYMENTS)[0]): InvoiceData {
  const subtotal = Math.round(p.amount / 1.13);
  const tax = p.amount - subtotal;
  const [datePart, timePart] = p.date.split(" ");

  return {
    invoiceNo: p.id,
    orderNo: p.reference.replace(/[^0-9]/g, "").slice(0, 4) || "512",
    date: datePart || "2026-05-06",
    time: timePart || "10:42 AM",
    orderType: p.refType || "Service Payment",
    deliveryStaff: p.staff,
    customer: {
      name: p.customer,
      phone: "+977 9841000000",
      pan: "601" + p.id.replace(/\D/g, ""),
      address: `${p.branch}, Nepal`,
    },
    items: [
      {
        sn: 1,
        hsCode: p.refType === "POS" ? "33.04" : "96.01",
        particular: p.reference,
        rate: subtotal,
        qty: 1,
        amount: subtotal,
      },
    ],
    itemTotal: subtotal,
    loyaltyDiscount: 0,
    offerDiscount: 0,
    subtotal,
    tax,
    total: p.amount,
    paymentMethod: p.method,
    status: p.status === "Paid" ? "Paid" : "Estimate",
    notes: `Settlement status: ${p.settlement}. Processed at ${p.branch} branch.`,
  };
}

export function PaymentsPage() {
  const [q, setQ] = useState("");
  const [method, setMethod] = useState<"All" | PayMethod>("All");
  const [invoiceModalData, setInvoiceModalData] = useState<InvoiceData | null>(null);

  const collected = PAYMENTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = PAYMENTS.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const byMethod = (m: PayMethod) =>
    PAYMENTS.filter((p) => p.method === m && p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const refunds = PAYMENTS.filter((p) => p.status === "Refunded").reduce((s, p) => s + p.amount, 0);
  const failed = PAYMENTS.filter((p) => p.status === "Failed").length;
  const settlementPending = SETTLEMENTS.filter((s) => s.status !== "Settled").reduce((s, x) => s + x.businessEarning, 0);

  const kpis = [
    { label: "Total Collected", value: fmt(collected), icon: Wallet, tone: "bg-[color-mix(in_oklab,var(--sage)_22%,white)]" },
    { label: "Pending Payments", value: fmt(pending), icon: Clock, tone: "bg-sand-soft" },
    { label: "eSewa", value: fmt(byMethod("eSewa")), icon: Wallet, tone: "bg-[color-mix(in_oklab,var(--sage)_18%,white)]" },
    { label: "Khalti", value: fmt(byMethod("Khalti")), icon: Wallet, tone: "bg-[color-mix(in_oklab,#7B53A8_18%,white)]" },
    { label: "Cash", value: fmt(byMethod("Cash")), icon: Wallet, tone: "bg-sand-soft" },
    { label: "Card", value: fmt(byMethod("Card")), icon: Wallet, tone: "bg-mist-soft" },
    { label: "Refunds", value: fmt(refunds), icon: RefreshCcw, tone: "bg-rose-soft" },
    { label: "Failed", value: String(failed), icon: AlertCircle, tone: "bg-rose-soft" },
    { label: "Settlement Pending", value: fmt(settlementPending), icon: Clock, tone: "bg-[color-mix(in_oklab,var(--gold)_18%,white)]" },
  ];

  const METHODS: ("All" | PayMethod)[] = ["All", "eSewa", "Khalti", "Cash", "Card", "Gift Card", "Package"];

  const rows = useMemo(
    () =>
      PAYMENTS.filter(
        (p) =>
          (method === "All" || p.method === method) &&
          (q === "" ||
            p.customer.toLowerCase().includes(q.toLowerCase()) ||
            p.id.toLowerCase().includes(q.toLowerCase()) ||
            p.reference.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, method],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Track every transaction across branches and payment methods."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4" />Filter</Button>
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90"><Download className="h-4 w-4" />Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-xl mt-1 leading-tight">{k.value}</div>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="payments">
        <TabsList className="bg-sand-soft mb-5">
          <TabsTrigger value="payments">All transactions</TabsTrigger>
          <TabsTrigger value="settlements">BRG Settlements</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by customer, reference, payment ID…"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "text-xs px-3 py-2 rounded-full border transition",
                    method === m ? "bg-primary text-primary-foreground border-primary shadow-luxe" : "bg-card border-border hover:bg-sand-soft",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Payment</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Reference</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Method</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Branch · Staff</th>
                    <th className="text-left px-4 py-3">Settlement</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-sand-soft/30">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{p.id}</div>
                        <div className="text-[11px] text-muted-foreground">{p.date}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.customer}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{p.reference}</div>
                        <div className="text-[11px] text-muted-foreground">{p.refType}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{fmt(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", methodTone(p.method))}>{p.method}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", payStatusTone(p.status))}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/80">{p.branch}<div className="text-[11px] text-muted-foreground">{p.staff}</div></td>
                      <td className="px-4 py-3 text-xs">{p.settlement}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-card transition">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setInvoiceModalData(paymentToInvoiceData(p))}><Eye className="h-4 w-4" />View receipt</DropdownMenuItem>
                            <DropdownMenuItem><CheckCircle2 className="h-4 w-4" />Mark cash paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setInvoiceModalData(paymentToInvoiceData(p))}><Download className="h-4 w-4" />Download invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const inv = paymentToInvoiceData(p);
                              const url = getWhatsAppShareUrl(inv, "Aura Beauty Lounge");
                              window.open(url, "_blank");
                              toast.success("WhatsApp opened for " + p.customer);
                            }}><MessageCircle className="h-4 w-4" />Send on WhatsApp</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose"><RefreshCcw className="h-4 w-4" />Refund</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[color-mix(in_oklab,var(--gold)_18%,white)] to-card border border-border p-6 shadow-luxe">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Pending settlement</div>
                <div className="font-serif text-4xl mt-1">{fmt(settlementPending)}</div>
                <p className="text-xs text-muted-foreground mt-2">Marketplace earnings pending payout from BRG. Settlements run weekly.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl"><Receipt className="h-4 w-4" />Statement</Button>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90"><Download className="h-4 w-4" />Download PDF</Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Settlement</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Marketplace bookings</th>
                  <th className="text-left px-4 py-3">Gross</th>
                  <th className="text-left px-4 py-3">BRG commission (5%)</th>
                  <th className="text-left px-4 py-3">Your earning</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {SETTLEMENTS.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-sand-soft/30">
                    <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3 text-xs">{s.date}</td>
                    <td className="px-4 py-3">{s.marketplaceBookings}</td>
                    <td className="px-4 py-3">{fmt(s.gross)}</td>
                    <td className="px-4 py-3 text-rose">−{fmt(s.brgCommission)}</td>
                    <td className="px-4 py-3 font-medium">{fmt(s.businessEarning)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full border",
                        s.status === "Settled"
                          ? "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive"
                          : s.status === "Processing"
                          ? "bg-mist-soft border-mist text-foreground/80"
                          : "bg-sand-soft border-border text-foreground/80",
                      )}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <InvoiceModal
        isOpen={Boolean(invoiceModalData)}
        bill={invoiceModalData}
        onClose={() => setInvoiceModalData(null)}
      />
    </div>
  );
}

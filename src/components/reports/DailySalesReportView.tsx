import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, Printer, Download, TrendingUp, DollarSign, Wallet, Users,
  ShoppingBag, AlertCircle, RotateCcw, Boxes, CheckCircle2, ArrowRight
} from "lucide-react";
import { getDailySalesReport, DailySalesReportData } from "@/lib/reports-data";
import { FinancialWaterfall } from "./FinancialWaterfall";
import { HourlySalesTraffic } from "./HourlySalesTraffic";
import { branches } from "@/lib/nav";
import { fmt } from "@/lib/finance-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DailySalesReportView({ initialDate = "2026-09-19" }: { initialDate?: string }) {
  const [date, setDate] = useState(initialDate);
  const [selectedBranch, setSelectedBranch] = useState("Jhamsikhel");

  const report = useMemo<DailySalesReportData>(() => {
    return getDailySalesReport(date, selectedBranch);
  }, [date, selectedBranch]);

  const { summary, payments, items, staff, expenses, refunds, stock_movements } = report;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = [
      ["Metric", "Amount (NPR)"],
      ["Date", report.date],
      ["Branch", report.branch_id],
      ["Gross Revenue", (summary.gross_revenue_minor / 100).toFixed(2)],
      ["Discounts", (summary.discounts_minor / 100).toFixed(2)],
      ["Refunds", (summary.refunds_minor / 100).toFixed(2)],
      ["Net Revenue", (summary.net_revenue_minor / 100).toFixed(2)],
      ["Cost of Goods Sold (COGS)", (summary.cogs_minor / 100).toFixed(2)],
      ["Gross Profit", (summary.gross_profit_minor / 100).toFixed(2)],
      ["Salary Accrued", (summary.salary_accrued_minor / 100).toFixed(2)],
      ["Commission Accrued", (summary.commission_accrued_minor / 100).toFixed(2)],
      ["Total Staff Cost", (summary.staff_cost_minor / 100).toFixed(2)],
      ["Operating Expenses", (summary.expenses_minor / 100).toFixed(2)],
      ["Net Profit", (summary.net_profit_minor / 100).toFixed(2)],
      ["VAT Collected", (summary.vat_collected_minor / 100).toFixed(2)],
      ["Total Sales Count", summary.sales_count],
      ["Refunds Count", summary.refunded_sales_count],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daily_Sales_${report.date}_${report.branch_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Daily Sales Report exported to CSV.");
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Date & Branch Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-subtle print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Date:
            </span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-40 text-xs bg-background rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Branch:</span>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-9 w-40 text-xs bg-background rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9 text-xs rounded-xl border-border">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handlePrint} className="h-9 text-xs rounded-xl bg-foreground text-background hover:bg-foreground/90">
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Header Info (Visible in Print as well) */}
      <div className="flex justify-between items-end border-b border-border pb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">End of Day Statement</div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Daily Sales Report · {report.branch_id}
          </h2>
          <div className="text-xs text-muted-foreground mt-0.5">
            Audit Date: <span className="font-semibold text-foreground">{report.date}</span> · Currency: {report.currency} · Total Transactions: {summary.sales_count}
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Reconciled
          </Badge>
        </div>
      </div>

      {/* Top Financial Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Net Revenue</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-foreground mt-1">
            {fmt(summary.net_revenue_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Gross: {fmt(summary.gross_revenue_minor / 100)}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Gross Profit</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-emerald-600 mt-1">
            {fmt(summary.gross_profit_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            After COGS ({fmt(summary.cogs_minor / 100)})
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Staff Cost</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-amber-600 mt-1">
            {fmt(summary.staff_cost_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Comm: {fmt(summary.commission_accrued_minor / 100)}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Operating Expenses</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-foreground mt-1">
            {fmt(summary.expenses_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            {expenses.length} expense items
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">Net Profit</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {fmt(summary.net_profit_minor / 100)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            Bottom line earnings
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">VAT Collected</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-primary mt-1">
            {fmt(summary.vat_collected_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            13% Gov tax liability
          </span>
        </div>
      </div>

      {/* Modern Financial Waterfall Component */}
      <FinancialWaterfall summary={summary} currency={report.currency} />

      {/* Hourly Client Footfall & Rush Pattern */}
      {report.hourly_sales && report.hourly_sales.length > 0 && (
        <HourlySalesTraffic hourlySales={report.hourly_sales} />
      )}

      {/* Two Column Section: Payments & Sold Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payment Methods Breakdown with Cash/Digital Reconciliation */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> Payment Collections & Cash Audit
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Total: {fmt(payments.reduce((acc, p) => acc + p.amount_minor, 0) / 100)}
            </span>
          </div>

          {/* Payment Proportional Allocation Bar */}
          {(() => {
            const totalCollected = payments.reduce((acc, p) => acc + p.amount_minor, 0);
            const cashItem = payments.find((p) => p.method.toLowerCase().includes("cash"));
            const cashAmount = cashItem ? cashItem.amount_minor : 0;
            const digitalAmount = totalCollected - cashAmount;
            const cashPct = totalCollected > 0 ? (cashAmount / totalCollected) * 100 : 0;
            const digitalPct = totalCollected > 0 ? (digitalAmount / totalCollected) * 100 : 0;

            const methodColors: Record<string, string> = {
              "esewa": "bg-emerald-500",
              "khalti": "bg-purple-500",
              "card (pos)": "bg-sky-500",
              "card": "bg-sky-500",
              "cash": "bg-amber-500",
            };

            return (
              <div className="space-y-3">
                {/* Proportional Segmented Progress Bar */}
                <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner p-0.5 gap-0.5">
                  {payments.map((p, idx) => {
                    const pct = totalCollected > 0 ? (p.amount_minor / totalCollected) * 100 : 0;
                    const colorClass = methodColors[p.method.toLowerCase()] || "bg-primary";
                    return (
                      <div
                        key={idx}
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        title={`${p.method}: ${fmt(p.amount_minor / 100)} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Cash Drawer vs Digital Quick Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] p-2.5 rounded-xl bg-sand-soft/40 border border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Physical Cash in Till: <strong className="text-foreground">{fmt(cashAmount / 100)}</strong> ({cashPct.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                    <span>Digital Bank Settlement: <strong className="text-foreground">{fmt(digitalAmount / 100)}</strong> ({digitalPct.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Itemized Payments List */}
                <div className="divide-y divide-border pt-1">
                  {payments.map((p, idx) => {
                    const pct = totalCollected > 0 ? (p.amount_minor / totalCollected) * 100 : 0;
                    const dotColor = methodColors[p.method.toLowerCase()] || "bg-primary";
                    return (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                          <Badge variant="outline" className="font-medium bg-background">{p.method}</Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="font-bold text-foreground font-serif">{fmt(p.amount_minor / 100)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Staff Commissions & Accrual */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Staff Daily Earnings & Commissions
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              Total: {fmt(summary.staff_cost_minor / 100)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-soft/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3 text-right">Daily Salary</th>
                  <th className="py-2 px-3 text-right">Commission</th>
                  <th className="py-2 px-3 text-right font-bold">Total Accrued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((st) => (
                  <tr key={st.staff_id}>
                    <td className="py-2.5 px-3 font-medium text-foreground">{st.display_name}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{fmt(st.salary_accrued_minor / 100)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-600 font-medium">+{fmt(st.commission_accrued_minor / 100)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">{fmt(st.total_minor / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Items Sold Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" /> Services & Products Sold Today
          </h3>
          <span className="text-xs text-muted-foreground">
            {items.reduce((acc, i) => acc + i.quantity_sold, 0)} units sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-soft/50 border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3 text-center">Qty Sold</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                <th className="py-2.5 px-3 text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2.5 px-3 font-medium text-foreground">{it.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant={it.type === "service" ? "default" : "outline"} className="text-[10px] uppercase">
                      {it.type}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">{it.quantity_sold}</td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">{fmt(it.gross_revenue_minor / 100)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-foreground">{fmt(it.net_revenue_minor / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses & Refunds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expenses */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Daily Operating Expenses
            </h3>
            <span className="text-xs font-semibold text-foreground">
              Total: {fmt(summary.expenses_minor / 100)}
            </span>
          </div>

          <div className="divide-y divide-border">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-foreground">{exp.description}</div>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{exp.category}</Badge>
                </div>
                <div className="font-bold text-foreground">{fmt(exp.amount_minor / 100)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Refunds & Returns */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-rose-500" /> Processed Refunds
            </h3>
            <span className="text-xs font-semibold text-rose-600">
              Total: {fmt(summary.refunds_minor / 100)}
            </span>
          </div>

          {refunds.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              No customer refunds processed today.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {refunds.map((rf, idx) => (
                <div key={idx} className="py-2.5 text-xs flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground font-mono">{rf.receipt_number}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">{rf.reason}</div>
                    <div className="text-[10px] text-muted-foreground">{rf.refunded_at.slice(11, 16)}</div>
                  </div>
                  <div className="font-bold text-rose-600">
                    −{fmt(rf.amount_minor / 100)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Movements Log */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" /> Inventory Stock Movements
          </h3>
          <span className="text-xs text-muted-foreground">{stock_movements.length} logged changes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stock_movements.map((sm, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-border bg-sand-soft/20 text-xs flex justify-between items-center">
              <div className="truncate pr-2">
                <div className="font-medium text-foreground truncate">{sm.product_name}</div>
                <Badge variant="outline" className="text-[10px] uppercase mt-0.5">{sm.movement_type}</Badge>
              </div>
              <div className={cn("font-bold text-sm", sm.quantity_delta > 0 ? "text-emerald-600" : "text-amber-600")}>
                {sm.quantity_delta > 0 ? `+${sm.quantity_delta}` : sm.quantity_delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

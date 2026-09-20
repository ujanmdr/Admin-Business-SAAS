import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar, Printer, Download, Receipt, CheckCircle2,
  FileSpreadsheet, ShieldCheck
} from "lucide-react";
import { getDailyVatReport, DailyVatReportData } from "@/lib/reports-data";
import { branches } from "@/lib/nav";
import { fmt } from "@/lib/finance-data";
import { toast } from "sonner";

export function DailyVatReportView({ initialDate = "2026-09-19" }: { initialDate?: string }) {
  const [date, setDate] = useState(initialDate);
  const [selectedBranch, setSelectedBranch] = useState("Jhamsikhel");

  const report = useMemo<DailyVatReportData>(() => {
    return getDailyVatReport(date, selectedBranch);
  }, [date, selectedBranch]);

  const { summary, breakdown_by_rate, sales } = report;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = [
      ["Receipt Number", "Paid At", "VAT Rate", "Taxable Base (NPR)", "VAT Amount (NPR)", "Total (NPR)"],
      ...sales.map((s) => [
        s.receipt_number,
        s.paid_at,
        s.vat_rate_bps ? `${(s.vat_rate_bps / 100).toFixed(0)}%` : "Exempt",
        (s.taxable_base_minor / 100).toFixed(2),
        (s.tax_minor / 100).toFixed(2),
        ((s.taxable_base_minor + s.tax_minor) / 100).toFixed(2),
      ]),
      [],
      ["Total Taxable Base", (summary.taxable_base_minor / 100).toFixed(2)],
      ["Total VAT Collected", (summary.vat_collected_minor / 100).toFixed(2)],
      ["Total VAT Refunded", (summary.vat_refunded_minor / 100).toFixed(2)],
      ["Net VAT Payable", (summary.net_vat_collected_minor / 100).toFixed(2)],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Daily_VAT_Sales_Book_${report.date}_${report.branch_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Daily VAT Register exported to CSV.");
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Date & Branch Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-subtle print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Tax Date:
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
            Print Tax Book
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-end border-b border-border pb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Nepal IRD Sales Register Format (बिक्री खाता)
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mt-0.5">
            Daily VAT Report · {report.branch_id}
          </h2>
          <div className="text-xs text-muted-foreground mt-0.5">
            Tax Period: <span className="font-semibold text-foreground">{report.date}</span> · VAT Status:{" "}
            <span className="text-emerald-700 font-semibold">{report.vat_enabled ? "Enabled (13% Standard)" : "Exempt"}</span>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            Tax Compliant
          </Badge>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Taxable Base</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-foreground mt-1">
            {fmt(summary.taxable_base_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Net taxable value</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">VAT Collected</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-primary mt-1">
            {fmt(summary.vat_collected_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">13% Output Tax</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">VAT Refunded</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-rose-600 mt-1">
            {fmt(summary.vat_refunded_minor / 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Tax on returned items</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-subtle">
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 block">Net VAT Payable</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {fmt(summary.net_vat_collected_minor / 100)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Payable to IRD</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="text-[11px] font-medium text-muted-foreground block">Tax-Exempt / Non-VAT</span>
          <div className="text-lg sm:text-xl font-serif font-bold text-foreground mt-1">
            {summary.non_vat_sales_count}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">Exempt sales transactions</span>
        </div>
      </div>

      {/* Breakdown by VAT Rate */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> Tax Breakdown by Rate Bracket
          </h3>
          <span className="text-xs text-muted-foreground">{breakdown_by_rate.length} tax rate applied</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-soft/50 border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">VAT Rate</th>
                <th className="py-2.5 px-4 text-center">Invoices Count</th>
                <th className="py-2.5 px-4 text-right">Taxable Base Amount</th>
                <th className="py-2.5 px-4 text-right">VAT Collected (Output)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {breakdown_by_rate.map((br, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-bold text-foreground">
                    {(br.vat_rate_bps / 100).toFixed(0)}% Standard Rate
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">{br.sales_count}</td>
                  <td className="py-3 px-4 text-right font-medium">{fmt(br.taxable_base_minor / 100)}</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">{fmt(br.vat_collected_minor / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Sales Tax Register (Sales Book) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Daily Sales Tax Register (Invoices Ledger)
          </h3>
          <span className="text-xs text-muted-foreground">{sales.length} issued receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-soft/50 border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Receipt / Invoice #</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-center">Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable Base</th>
                <th className="py-2.5 px-3 text-right">VAT (13%)</th>
                <th className="py-2.5 px-3 text-right">Invoice Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {sales.map((s) => {
                const totalNpr = (s.taxable_base_minor + s.tax_minor) / 100;
                return (
                  <tr key={s.sale_id} className="hover:bg-sand-soft/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground">{s.receipt_number}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{s.paid_at.slice(11, 16)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-sans text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {s.vat_rate_bps ? `${(s.vat_rate_bps / 100).toFixed(0)}%` : "Exempt"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{fmt(s.taxable_base_minor / 100)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-primary">{fmt(s.tax_minor / 100)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground font-sans">{fmt(totalNpr)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  TrendingUp, Minus, Equal, ArrowRight, CheckCircle2,
  Sparkles, Layers, ChevronDown, ChevronUp, DollarSign,
  Percent, ShieldCheck, HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/finance-data";
import { cn } from "@/lib/utils";

interface FinancialWaterfallProps {
  summary: {
    gross_revenue_minor: number;
    discounts_minor: number;
    refunds_minor: number;
    net_revenue_minor: number;
    cogs_minor: number;
    gross_profit_minor: number;
    salary_accrued_minor: number;
    commission_accrued_minor: number;
    staff_cost_minor: number;
    expenses_minor: number;
    net_profit_minor: number;
    vat_collected_minor: number;
    sales_count: number;
    refunded_sales_count: number;
  };
  currency?: string;
}

export function FinancialWaterfall({ summary, currency = "NPR" }: FinancialWaterfallProps) {
  const [showDetailedStages, setShowDetailedStages] = useState(false);

  const gross = summary.gross_revenue_minor / 100;
  const discounts = summary.discounts_minor / 100;
  const refunds = summary.refunds_minor / 100;
  const netRevenue = summary.net_revenue_minor / 100;
  const cogs = summary.cogs_minor / 100;
  const grossProfit = summary.gross_profit_minor / 100;
  const staffCost = summary.staff_cost_minor / 100;
  const expenses = summary.expenses_minor / 100;
  const netProfit = summary.net_profit_minor / 100;

  const grossBase = gross > 0 ? gross : 1;
  const netMargin = (netProfit / grossBase) * 100;
  const grossMargin = (grossProfit / grossBase) * 100;
  const retentionRate = (netRevenue / grossBase) * 100;

  // Percentage shares of Gross Revenue
  const netProfitPct = Math.max(0, (netProfit / grossBase) * 100);
  const staffPct = (staffCost / grossBase) * 100;
  const cogsPct = (cogs / grossBase) * 100;
  const expensesPct = (expenses / grossBase) * 100;
  const discountsPct = (discounts / grossBase) * 100;
  const refundsPct = (refunds / grossBase) * 100;
  const totalDeductionsPct = discountsPct + refundsPct;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-subtle space-y-5 transition-all">
      {/* Top Header & Key Margins */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Daily Financial Waterfall
              </h3>
              <Badge variant="outline" className="text-[10px] font-medium py-0 px-2 bg-sand-soft/50 border-border text-muted-foreground">
                P&L Flow
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visual mathematical bridge from Gross Inflow to Net Take-Home Earnings
            </p>
          </div>
        </div>

        {/* Quick Margin KPIs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Net Margin: {netMargin.toFixed(1)}%</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-soft/60 text-muted-foreground text-xs font-medium border border-border">
            <span>Gross Margin: {grossMargin.toFixed(1)}%</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedStages(!showDetailedStages)}
            className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground rounded-lg"
          >
            {showDetailedStages ? (
              <>Less <ChevronUp className="h-3.5 w-3.5 ml-1" /></>
            ) : (
              <>Stages <ChevronDown className="h-3.5 w-3.5 ml-1" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Modern Connected Equation Cards Pipeline */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-center min-w-max gap-2 sm:gap-2.5 py-1">
          {/* 1. Gross Revenue */}
          <div className="flex flex-col rounded-xl border border-border bg-sand-soft/30 p-2.5 min-w-[130px] hover:border-primary/40 transition-colors shadow-2xs">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Gross Inflow</span>
            <span className="text-sm font-serif font-bold text-foreground mt-0.5">{fmt(gross)}</span>
            <span className="text-[10px] text-muted-foreground font-medium">100% Topline</span>
          </div>

          {/* Minus Operator */}
          <div className="h-6 w-6 rounded-full bg-muted/80 border border-border flex items-center justify-center shrink-0 shadow-2xs">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* 2. Discounts */}
          <div className="flex flex-col rounded-xl border border-border/80 bg-background/60 p-2.5 min-w-[115px] shadow-2xs">
            <span className="text-[10px] font-medium text-muted-foreground">Discounts</span>
            <span className="text-sm font-semibold text-foreground mt-0.5">{fmt(discounts)}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">−{discountsPct.toFixed(1)}%</span>
          </div>

          {/* Minus Operator */}
          <div className="h-6 w-6 rounded-full bg-muted/80 border border-border flex items-center justify-center shrink-0 shadow-2xs">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* 3. Refunds */}
          <div className="flex flex-col rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-2.5 min-w-[115px] shadow-2xs">
            <span className="text-[10px] font-medium text-rose-700 dark:text-rose-400">Refunds</span>
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 mt-0.5">{fmt(refunds)}</span>
            <span className="text-[10px] text-rose-500 font-medium">−{refundsPct.toFixed(1)}%</span>
          </div>

          {/* Equal Operator */}
          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
            <Equal className="h-3.5 w-3.5 text-primary" />
          </div>

          {/* 4. Net Revenue (Milestone) */}
          <div className="flex flex-col rounded-xl border-2 border-primary/30 bg-primary/5 p-2.5 min-w-[135px] shadow-2xs">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Net Revenue</span>
            <span className="text-sm font-serif font-bold text-foreground mt-0.5">{fmt(netRevenue)}</span>
            <span className="text-[10px] text-primary/80 font-medium">{retentionRate.toFixed(1)}% Retained</span>
          </div>

          {/* Minus Operator */}
          <div className="h-6 w-6 rounded-full bg-muted/80 border border-border flex items-center justify-center shrink-0 shadow-2xs">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* 5. COGS */}
          <div className="flex flex-col rounded-xl border border-border/80 bg-background/60 p-2.5 min-w-[115px] shadow-2xs">
            <span className="text-[10px] font-medium text-muted-foreground">COGS</span>
            <span className="text-sm font-semibold text-foreground mt-0.5">{fmt(cogs)}</span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">−{cogsPct.toFixed(1)}%</span>
          </div>

          {/* Equal Operator */}
          <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-2xs">
            <Equal className="h-3.5 w-3.5 text-emerald-600" />
          </div>

          {/* 6. Gross Profit (Milestone) */}
          <div className="flex flex-col rounded-xl border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30 p-2.5 min-w-[135px] shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Gross Profit</span>
            <span className="text-sm font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{fmt(grossProfit)}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">{grossMargin.toFixed(1)}% Margin</span>
          </div>

          {/* Minus Operator */}
          <div className="h-6 w-6 rounded-full bg-muted/80 border border-border flex items-center justify-center shrink-0 shadow-2xs">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* 7. Staff Cost */}
          <div className="flex flex-col rounded-xl border border-border/80 bg-background/60 p-2.5 min-w-[115px] shadow-2xs">
            <span className="text-[10px] font-medium text-muted-foreground">Staff Cost</span>
            <span className="text-sm font-semibold text-foreground mt-0.5">{fmt(staffCost)}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">−{staffPct.toFixed(1)}%</span>
          </div>

          {/* Minus Operator */}
          <div className="h-6 w-6 rounded-full bg-muted/80 border border-border flex items-center justify-center shrink-0 shadow-2xs">
            <Minus className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* 8. Expenses */}
          <div className="flex flex-col rounded-xl border border-border/80 bg-background/60 p-2.5 min-w-[115px] shadow-2xs">
            <span className="text-[10px] font-medium text-muted-foreground">Expenses</span>
            <span className="text-sm font-semibold text-foreground mt-0.5">{fmt(expenses)}</span>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">−{expensesPct.toFixed(1)}%</span>
          </div>

          {/* Equal Operator */}
          <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Equal className="h-3.5 w-3.5" />
          </div>

          {/* 9. Final Net Profit (Grand Milestone Card) */}
          <div className="flex flex-col rounded-xl border border-emerald-600 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-2.5 min-w-[150px] shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Net Profit</span>
              <Sparkles className="h-3 w-3 text-emerald-200" />
            </div>
            <span className="text-sm sm:text-base font-serif font-bold text-white mt-0.5">{fmt(netProfit)}</span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-100 font-medium mt-0.5">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span>{netMargin.toFixed(1)}% Net Margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proportional Revenue Absorption Progress Bar */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Layers className="h-3.5 w-3.5 text-primary" /> Where Every Rupee of Gross Revenue Goes:
          </span>
          <span className="text-[11px] text-muted-foreground">
            Gross Base: <strong className="text-foreground">{fmt(gross)}</strong>
          </span>
        </div>

        {/* Multi-segment colored allocation bar */}
        <div className="h-3.5 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner p-0.5 gap-0.5">
          {/* Net Profit */}
          {netProfitPct > 0 && (
            <div
              style={{ width: `${netProfitPct}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              title={`Net Profit: ${fmt(netProfit)} (${netProfitPct.toFixed(1)}%)`}
            />
          )}
          {/* Staff Cost */}
          {staffPct > 0 && (
            <div
              style={{ width: `${staffPct}%` }}
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              title={`Staff Costs: ${fmt(staffCost)} (${staffPct.toFixed(1)}%)`}
            />
          )}
          {/* COGS */}
          {cogsPct > 0 && (
            <div
              style={{ width: `${cogsPct}%` }}
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              title={`COGS: ${fmt(cogs)} (${cogsPct.toFixed(1)}%)`}
            />
          )}
          {/* Expenses */}
          {expensesPct > 0 && (
            <div
              style={{ width: `${expensesPct}%` }}
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              title={`Operating Expenses: ${fmt(expenses)} (${expensesPct.toFixed(1)}%)`}
            />
          )}
          {/* Discounts & Refunds */}
          {totalDeductionsPct > 0 && (
            <div
              style={{ width: `${totalDeductionsPct}%` }}
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              title={`Discounts & Refunds: ${fmt(discounts + refunds)} (${totalDeductionsPct.toFixed(1)}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[11px] pt-1 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Net Profit: <strong className="text-foreground">{fmt(netProfit)}</strong> ({netProfitPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>Staff Costs: <strong className="text-foreground">{fmt(staffCost)}</strong> ({staffPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
            <span>COGS: <strong className="text-foreground">{fmt(cogs)}</strong> ({cogsPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shrink-0" />
            <span>OpEx: <strong className="text-foreground">{fmt(expenses)}</strong> ({expensesPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shrink-0" />
            <span>Deductions: <strong className="text-foreground">{fmt(discounts + refunds)}</strong> ({totalDeductionsPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Expandable 3-Stage Detailed Funnel */}
      {showDetailedStages && (
        <div className="pt-3 border-t border-border/60 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Stage 1: Revenue Stage */}
            <div className="rounded-xl border border-border bg-sand-soft/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Stage 1 · Revenue Flow
                </span>
                <Badge variant="outline" className="text-[10px] bg-background">Topline</Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Sales</span>
                  <span className="font-semibold text-foreground">{fmt(gross)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discounts Given</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">−{fmt(discounts)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Refunded Sales</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">−{fmt(refunds)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/80 flex justify-between items-center text-xs font-bold text-foreground">
                <span>= Net Revenue</span>
                <span className="text-primary text-sm font-serif">{fmt(netRevenue)}</span>
              </div>
            </div>

            {/* Stage 2: Direct Cost Stage */}
            <div className="rounded-xl border border-border bg-sand-soft/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Stage 2 · Direct Margins
                </span>
                <Badge variant="outline" className="text-[10px] bg-background">Direct Cost</Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Net Revenue Baseline</span>
                  <span className="font-semibold text-foreground">{fmt(netRevenue)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cost of Goods (COGS)</span>
                  <span className="text-sky-600 dark:text-sky-400 font-medium">−{fmt(cogs)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground italic">
                  Inventory, consumables & products
                </div>
              </div>
              <div className="pt-2 border-t border-border/80 flex justify-between items-center text-xs font-bold text-foreground">
                <span>= Gross Profit</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-serif">{fmt(grossProfit)}</span>
              </div>
            </div>

            {/* Stage 3: Operating Overheads Stage */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Stage 3 · Bottom Line
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-100/50 text-emerald-800 dark:text-emerald-300 border-emerald-300">
                  Overheads
                </Badge>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Staff Salaries & Comm</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">−{fmt(staffCost)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Operating Expenses</span>
                  <span className="text-violet-600 dark:text-violet-400 font-medium">−{fmt(expenses)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>13% VAT Collected (Trust)</span>
                  <span className="text-muted-foreground">{fmt(summary.vat_collected_minor / 100)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-300/80 flex justify-between items-center text-xs font-bold text-foreground">
                <span>= Net Profit</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-base font-serif font-extrabold">{fmt(netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

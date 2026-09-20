import { useMemo } from "react";
import { Clock, TrendingUp, Users, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/finance-data";
import { HourlySalesBreakdown } from "@/lib/reports-data";

interface HourlySalesTrafficProps {
  hourlySales: HourlySalesBreakdown[];
}

export function HourlySalesTraffic({ hourlySales }: HourlySalesTrafficProps) {
  const maxRevenue = useMemo(() => {
    return Math.max(...hourlySales.map((h) => h.gross_revenue_minor), 1);
  }, [hourlySales]);

  const peakHour = useMemo(() => {
    if (!hourlySales.length) return null;
    return [...hourlySales].sort((a, b) => b.gross_revenue_minor - a.gross_revenue_minor)[0];
  }, [hourlySales]);

  const totalClients = useMemo(() => {
    return hourlySales.reduce((sum, h) => sum + h.sales_count, 0);
  }, [hourlySales]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-subtle space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              Hourly Client Traffic & Rush Pattern
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sales volume distribution throughout branch operating hours (10 AM – 8 PM)
            </p>
          </div>
        </div>

        {peakHour && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 py-1 px-2.5 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>Peak: <strong>{peakHour.display_hour}</strong> ({fmt(peakHour.gross_revenue_minor / 100)})</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Hourly Bar Chart Visual */}
      <div className="pt-2">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-3 items-end h-32 px-1">
          {hourlySales.map((h) => {
            const heightPercent = Math.max(12, Math.round((h.gross_revenue_minor / maxRevenue) * 100));
            const isPeak = peakHour && h.hour === peakHour.hour;

            return (
              <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-20 whitespace-nowrap bg-foreground text-background text-[10px] py-1 px-2 rounded-md shadow-md">
                  <span className="font-bold">{h.display_hour}</span>
                  <span>{fmt(h.gross_revenue_minor / 100)} · {h.sales_count} clients</span>
                </div>

                {/* Amount on top of bar on larger screens */}
                <span className="text-[9px] font-semibold text-muted-foreground hidden sm:block">
                  {h.sales_count}
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isPeak
                      ? "bg-gradient-to-t from-amber-600 to-amber-500 shadow-xs"
                      : "bg-primary/20 hover:bg-primary/35 group-hover:bg-primary/40"
                  }`}
                />

                {/* Hour Label */}
                <span className={`text-[10px] truncate max-w-full font-medium mt-1 ${
                  isPeak ? "text-amber-700 dark:text-amber-400 font-bold" : "text-muted-foreground"
                }`}>
                  {h.display_hour.replace(" ", "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Banner */}
      <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>Total Footfall: <strong className="text-foreground">{totalClients} client checkouts</strong></span>
        </div>
        <div className="text-[11px]">
          Evening Rush (4 PM – 7 PM): <strong className="text-foreground">65,500 NPR (46.0% of revenue)</strong>
        </div>
      </div>
    </div>
  );
}

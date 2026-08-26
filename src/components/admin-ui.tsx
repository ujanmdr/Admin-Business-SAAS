import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Download, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function KpiCard({
  label, value, delta, deltaTone = "neutral", icon: Icon, hint,
}: {
  label: string; value: string | number; delta?: string;
  deltaTone?: "good" | "bad" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="brg-card-shadow border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <div className="mt-1 flex items-center justify-between">
          {delta && (
            <span className={cn(
              "text-xs font-medium",
              deltaTone === "good" && "text-[oklch(0.55_0.11_140)]",
              deltaTone === "bad" && "text-destructive",
              deltaTone === "neutral" && "text-muted-foreground",
            )}>{delta}</span>
          )}
          {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title, description, action, children, className,
}: { title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("brg-card-shadow border-border bg-card", className)}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const statusMap: Record<string, string> = {
  // generic
  Active: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Pending: "bg-[oklch(0.95_0.07_85)] text-[oklch(0.50_0.12_70)] border-[oklch(0.85_0.09_75)]",
  "Under Review": "bg-[oklch(0.94_0.04_230)] text-[oklch(0.45_0.08_230)] border-[oklch(0.82_0.04_230)]",
  Suspended: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Rejected: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Blocked: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Confirmed: "bg-[oklch(0.94_0.04_230)] text-[oklch(0.45_0.08_230)] border-[oklch(0.82_0.04_230)]",
  "Checked-in": "bg-secondary text-foreground border-border",
  Completed: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Cancelled: "bg-muted text-muted-foreground border-border",
  "No-show": "bg-muted text-muted-foreground border-border",
  Refunded: "bg-[oklch(0.94_0.04_230)] text-[oklch(0.45_0.08_230)] border-[oklch(0.82_0.04_230)]",
  Paid: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Failed: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Approved: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Featured: "bg-[oklch(0.92_0.10_70)] text-[oklch(0.45_0.13_70)] border-[oklch(0.78_0.12_70)]",
  Hidden: "bg-muted text-muted-foreground border-border",
  Removed: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Open: "bg-[oklch(0.95_0.07_85)] text-[oklch(0.50_0.12_70)] border-[oklch(0.85_0.09_75)]",
  "In Progress": "bg-[oklch(0.94_0.04_230)] text-[oklch(0.45_0.08_230)] border-[oklch(0.82_0.04_230)]",
  Waiting: "bg-secondary text-foreground border-border",
  Resolved: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Closed: "bg-muted text-muted-foreground border-border",
  Processed: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Processing: "bg-[oklch(0.94_0.04_230)] text-[oklch(0.45_0.08_230)] border-[oklch(0.82_0.04_230)]",
  Inactive: "bg-muted text-muted-foreground border-border",
  Expired: "bg-muted text-muted-foreground border-border",
  Paused: "bg-secondary text-foreground border-border",
  Success: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Reported: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Flagged: "bg-[oklch(0.95_0.07_85)] text-[oklch(0.50_0.12_70)] border-[oklch(0.85_0.09_75)]",
  Clean: "bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)] border-[oklch(0.80_0.08_140)]",
  Redeemed: "bg-secondary text-foreground border-border",
  High: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Urgent: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.50_0.15_25)] border-[oklch(0.82_0.07_25)]",
  Medium: "bg-[oklch(0.95_0.07_85)] text-[oklch(0.50_0.12_70)] border-[oklch(0.85_0.09_75)]",
  Low: "bg-secondary text-foreground border-border",
  "Free Visit Ready": "bg-[oklch(0.92_0.10_70)] text-[oklch(0.45_0.13_70)] border-[oklch(0.78_0.12_70)]",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusMap[status] ?? "bg-secondary text-foreground border-border";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
      cls,
    )}>
      {status}
    </span>
  );
}

export function FilterBar({
  filters = [], onSearch, searchPlaceholder = "Search…", actions,
}: {
  filters?: { label: string; options: string[] }[];
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 brg-card-shadow">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="h-9 border-border bg-background pl-9"
        />
      </div>
      {filters.map((f) => (
        <Select key={f.label}>
          <SelectTrigger className="h-9 w-[150px] border-border bg-background text-sm">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label}</SelectItem>
            {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ))}
      <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border">
        <SlidersHorizontal className="h-4 w-4" /> More filters
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border">
          <Download className="h-4 w-4" /> Export
        </Button>
        {actions}
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns, rows, getKey,
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode; align?: "left" | "right" }[];
  rows: T[]; getKey: (row: T, i: number) => string;
}) {
  return (
    <Card className="brg-card-shadow overflow-hidden border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/40 hover:bg-secondary/40">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn(
                  "h-11 text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground",
                  c.align === "right" && "text-right",
                )}>
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    <ChevronDown className="h-3 w-3 opacity-40" />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={getKey(r, i)} className="border-border transition-colors hover:bg-secondary/30">
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn(
                    "py-3 text-sm text-foreground",
                    c.align === "right" && "text-right",
                  )}>
                    {c.render(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
        <span>Showing 1–{rows.length} of {rows.length}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 border-border">Prev</Button>
          <Button variant="outline" size="sm" className="h-7 border-border">Next</Button>
        </div>
      </div>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { businesses, businessTypes, cities, pendingBusinesses } from "@/lib/mock-data";
import { Check, X, Eye, ClipboardCheck, Clock, ShieldAlert, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({ meta: [{ title: "Business Approvals · BRG Admin" }] }),
  component: Approvals,
});

function Approvals() {
  const [q, setQ] = useState("");
  const filtered = pendingBusinesses.filter(
    b => b.name.toLowerCase().includes(q.toLowerCase()) || b.owner.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Verification queue"
        title="Business approvals"
        description="Review and verify new business applications before they go live on BRG."
        actions={<>
          <Button variant="outline" size="sm" className="border-border">Export queue</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">Bulk approve</Button>
        </>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="In queue" value={pendingBusinesses.length} icon={ClipboardCheck} />
        <KpiCard label="Avg wait time" value="1.4 days" icon={Clock} />
        <KpiCard label="High risk" value="3" deltaTone="bad" delta="needs review" icon={ShieldAlert} />
        <KpiCard label="Docs missing" value="6" icon={FileText} />
      </div>

      <FilterBar
        onSearch={setQ}
        searchPlaceholder="Search business name or owner…"
        filters={[
          { label: "Type", options: [...businessTypes] },
          { label: "City", options: [...cities] },
          { label: "Risk", options: ["Low", "Medium", "High"] },
        ]}
      />

      <DataTable
        getKey={(r) => r.id}
        rows={filtered}
        columns={[
          { key: "name", header: "Business", render: (r) => (
            <div>
              <div className="font-medium text-foreground">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.type} · {r.city}</div>
            </div>
          )},
          { key: "owner", header: "Owner", render: (r) => (
            <div>
              <div>{r.owner}</div>
              <div className="text-xs text-muted-foreground">{r.phone}</div>
            </div>
          )},
          { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
          { key: "submitted", header: "Submitted", render: (r) => <span className="text-muted-foreground">{r.submittedAt}</span> },
          { key: "docs", header: "Docs", render: () => <StatusBadge status="Verified" /> },
          { key: "risk", header: "Risk", render: (r) => <StatusBadge status={r.riskFlag ?? "Low"} /> },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", header: "Actions", align: "right", render: (r) => (
            <div className="flex items-center justify-end gap-1.5">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 gap-1 border-border"><Eye className="h-3.5 w-3.5" /> View</Button>
                </SheetTrigger>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-2xl">{r.name}</SheetTitle>
                    <SheetDescription>{r.type} · {r.city} · Submitted {r.submittedAt}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-5 px-1">
                    <Section title="Owner details" rows={[["Name", r.owner], ["Phone", r.phone], ["Email", r.email]]} />
                    <Section title="Business details" rows={[["Type", r.type], ["Branches", String(r.branches)], ["Plan", r.plan]]} />
                    <Section title="Address" rows={[["City", r.city], ["Address", "Lazimpat Marg, Ward 5"], ["Pin", "44600"]]} />
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Documents</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["PAN Cert","Reg Doc","Owner ID"].map(d => (
                          <div key={d} className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 text-xs text-muted-foreground">
                            <FileText className="mb-1 h-5 w-5" />{d}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Section title="Submitted services" rows={[["Service 1","Hair Spa · रू 1,800"],["Service 2","Bridal Makeup · रू 18,000"],["Service 3","HydraFacial · रू 4,500"]]} />
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Business photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1,2,3].map(i => <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-secondary to-accent" />)}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Admin notes</p>
                      <textarea className="min-h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm" placeholder="Add internal note…" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90"><Check className="mr-1.5 h-4 w-4" />Approve</Button>
                      <Button variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/5"><X className="mr-1.5 h-4 w-4" />Reject</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Button size="sm" className="h-7 bg-primary hover:bg-primary/90"><Check className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" className="h-7 border-destructive/40 text-destructive hover:bg-destructive/5"><X className="h-3.5 w-3.5" /></Button>
            </div>
          )},
        ]}
      />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="space-y-1.5 rounded-lg border border-border bg-secondary/30 p-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-foreground">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

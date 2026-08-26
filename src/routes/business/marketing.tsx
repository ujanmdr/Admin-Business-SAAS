import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CAMPAIGNS, CAMPAIGN_TYPES, SEGMENTS, Campaign, CampaignType, fmt } from "@/lib/growth-data";
import {
  Plus, Send, Calendar, Users, MessageSquare, Sparkles, TrendingUp,
  Check, Eye, ChevronRight, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/marketing")({
  head: () => ({ meta: [{ title: "Marketing · BRG Suite" }] }),
  component: MarketingPage,
});

function MarketingPage() {
  const [open, setOpen] = useState(false);
  const totals = useMemo(() => ({
    sent: CAMPAIGNS.reduce((a, c) => a + c.sent, 0),
    bookings: CAMPAIGNS.reduce((a, c) => a + c.bookings, 0),
    revenue: CAMPAIGNS.reduce((a, c) => a + c.revenue, 0),
    open: Math.round(CAMPAIGNS.filter(c => c.sent > 0).reduce((a, c) => a + c.opened / c.sent, 0) / Math.max(1, CAMPAIGNS.filter(c => c.sent > 0).length) * 100),
  }), []);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <PageHeader
        eyebrow="Growth"
        title="Marketing"
        description="Reach the right customer at the right moment — over WhatsApp."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> New campaign</Button>
            </DialogTrigger>
            <CampaignWizard onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<Send className="size-4" />} label="Messages sent" value={totals.sent.toLocaleString()} tone="var(--sage)" />
        <Kpi icon={<Eye className="size-4" />} label="Avg. open rate" value={`${totals.open}%`} tone="var(--mist)" />
        <Kpi icon={<Sparkles className="size-4" />} label="Bookings driven" value={String(totals.bookings)} tone="var(--rose)" />
        <Kpi icon={<TrendingUp className="size-4" />} label="Revenue attributed" value={fmt(totals.revenue)} tone="var(--gold)" />
      </div>

      <Tabs defaultValue="types">
        <TabsList className="mb-6 bg-card border border-border">
          <TabsTrigger value="types">Campaign types</TabsTrigger>
          <TabsTrigger value="all">All campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAMPAIGN_TYPES.map(t => (
              <button key={t.type}
                onClick={() => setOpen(true)}
                className="text-left rounded-2xl border border-border p-5 shadow-sm bg-card hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div className="size-12 rounded-2xl grid place-items-center text-2xl mb-4"
                  style={{ background: `color-mix(in oklab, ${t.tone} 30%, white)` }}>
                  {t.emoji}
                </div>
                <div className="font-serif text-lg">{t.type}</div>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[color-mix(in_oklab,var(--sand)_50%,white)]">
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Segment</th>
                  <th className="px-5 py-3 text-right">Audience</th>
                  <th className="px-5 py-3 text-right">Open rate</th>
                  <th className="px-5 py-3 text-right">Bookings</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CAMPAIGNS.map(c => <CampaignRow key={c.id} c={c} />)}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="size-8 rounded-full grid place-items-center" style={{ background: `color-mix(in oklab, ${tone} 25%, white)`, color: `color-mix(in oklab, ${tone} 70%, black)` }}>
          {icon}
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
    </div>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const openPct = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0;
  const tone = c.status === "Sent" ? "var(--sage)" : c.status === "Scheduled" ? "var(--mist)" : "var(--cloud)";
  return (
    <tr className="hover:bg-[color-mix(in_oklab,var(--sand)_25%,white)] transition">
      <td className="px-5 py-3">
        <div className="font-medium">{c.name}</div>
        <div className="text-[11px] text-muted-foreground">{c.date}</div>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{c.type}</td>
      <td className="px-5 py-3 text-muted-foreground">{c.segment}</td>
      <td className="px-5 py-3 text-right">{c.audience.toLocaleString()}</td>
      <td className="px-5 py-3 text-right">{c.sent > 0 ? `${openPct}%` : "—"}</td>
      <td className="px-5 py-3 text-right">{c.bookings || "—"}</td>
      <td className="px-5 py-3 text-right">{c.revenue > 0 ? fmt(c.revenue) : "—"}</td>
      <td className="px-5 py-3">
        <Badge variant="outline" className="border-border" style={{ background: `color-mix(in oklab, ${tone} 30%, white)` }}>
          {c.status}
        </Badge>
      </td>
    </tr>
  );
}

function CampaignWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<CampaignType | "">("");
  const [segment, setSegment] = useState<string>("All active customers");
  const [message, setMessage] = useState("Hi {{name}} 👋 Here's something special for you at Aura Beauty Lounge — enjoy 20% off your next visit. Book here: brg.app/aura");
  const [schedule, setSchedule] = useState<"now" | "later">("now");

  const steps = ["Type", "Audience", "Message", "Preview", "Send"];
  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">Create campaign</DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("size-7 rounded-full grid place-items-center text-[11px] font-medium border",
              i + 1 === step ? "bg-primary text-primary-foreground border-primary" :
              i + 1 < step ? "bg-[color-mix(in_oklab,var(--sage)_30%,white)] border-border" :
              "bg-card border-border text-muted-foreground")}>
              {i + 1 < step ? <Check className="size-3.5" /> : i + 1}
            </div>
            <div className="text-xs text-muted-foreground hidden md:block">{s}</div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="py-4 min-h-[280px]">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {CAMPAIGN_TYPES.map(t => (
              <button key={t.type} onClick={() => setType(t.type)}
                className={cn("text-left rounded-xl border p-3 transition",
                  type === t.type ? "border-primary bg-[color-mix(in_oklab,var(--sage)_15%,white)]" : "border-border bg-card hover:border-primary/40")}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl grid place-items-center text-xl" style={{ background: `color-mix(in oklab, ${t.tone} 30%, white)` }}>{t.emoji}</div>
                  <div>
                    <div className="text-sm font-medium">{t.type}</div>
                    <div className="text-[11px] text-muted-foreground">{t.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><Users className="size-3.5" /> Customer segment</label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>{SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-[color-mix(in_oklab,var(--mist)_40%,white)] border border-border p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Estimated audience</div>
              <div className="font-serif text-3xl mt-1">~ 2,480 customers</div>
              <div className="text-xs text-muted-foreground mt-1">Will receive this WhatsApp message instantly.</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <label className="text-xs text-muted-foreground inline-flex items-center gap-1.5"><MessageSquare className="size-3.5" /> Message</label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="bg-card" />
            <div className="text-[11px] text-muted-foreground">Use {"{{name}}"} for personal touches. {message.length}/1024 chars.</div>
          </div>
        )}

        {step === 4 && (
          <div className="grid place-items-center py-2">
            <div className="w-full max-w-sm rounded-3xl bg-[color-mix(in_oklab,var(--sage)_15%,white)] border border-border p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">WhatsApp preview</div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-[11px] font-medium text-[color:var(--sage)] mb-1">Aura Beauty Lounge</div>
                <p className="text-sm whitespace-pre-wrap">{message.replace("{{name}}", "Reema")}</p>
                <div className="text-[10px] text-muted-foreground text-right mt-1.5">10:24 AM ✓✓</div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSchedule("now")}
                className={cn("rounded-xl border p-4 text-left transition",
                  schedule === "now" ? "border-primary bg-[color-mix(in_oklab,var(--sage)_15%,white)]" : "border-border bg-card")}>
                <Send className="size-5 text-[color:var(--sage)]" />
                <div className="font-medium mt-2">Send now</div>
                <div className="text-xs text-muted-foreground">Deliver instantly to all recipients.</div>
              </button>
              <button onClick={() => setSchedule("later")}
                className={cn("rounded-xl border p-4 text-left transition",
                  schedule === "later" ? "border-primary bg-[color-mix(in_oklab,var(--sage)_15%,white)]" : "border-border bg-card")}>
                <Calendar className="size-5 text-[color:var(--gold)]" />
                <div className="font-medium mt-2">Schedule</div>
                <div className="text-xs text-muted-foreground">Pick a date and time.</div>
              </button>
            </div>
            {schedule === "later" && (
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" />
                <Input type="time" />
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
        <Button variant="ghost" onClick={back} disabled={step === 1} className="gap-1"><ChevronLeft className="size-4" /> Back</Button>
        {step < 5 ? (
          <Button onClick={next} className="gap-1">Next <ChevronRight className="size-4" /></Button>
        ) : (
          <Button onClick={onClose} className="gap-2"><Send className="size-4" /> {schedule === "now" ? "Send campaign" : "Schedule campaign"}</Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}

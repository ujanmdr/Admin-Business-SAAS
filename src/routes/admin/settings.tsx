import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-header";
import { SectionCard } from "@/components/admin-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { businessTypes, cities } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Platform Settings · BRG Admin" }] }),
  component: Settings,
});

const tabs = [
  "Commission","Categories","Services","Cities","Payments","Gift cards","Loyalty",
  "Sponsored","Notifications","WhatsApp","Reviews","Refunds","Security",
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleRow({ title, desc, defaultChecked = true }: { title: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs">{children}</span>;
}

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Operational rules, templates, and policies that govern BRG."
        actions={<Button size="sm" className="bg-primary hover:bg-primary/90">Save changes</Button>} />

      <Tabs defaultValue="Commission" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-border bg-card p-1">
          {tabs.map(t => (
            <TabsTrigger key={t} value={t}
              className="rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Commission" className="mt-5">
          <SectionCard title="Commission settings" description="Default commission rates by category">
            <div className="grid gap-4 md:grid-cols-3">
              {businessTypes.map(t => (
                <Field key={t} label={t}><Input defaultValue="12" className="border-border" /></Field>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Categories" className="mt-5">
          <SectionCard title="Business categories" description="Top-level categories shown in the marketplace">
            <div className="flex flex-wrap gap-2">{businessTypes.map(t => <Pill key={t}>{t}</Pill>)}</div>
            <div className="mt-4 flex gap-2"><Input placeholder="Add new category…" className="border-border" /><Button>Add</Button></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Services" className="mt-5">
          <SectionCard title="Service categories" description="Standard services available across categories">
            <div className="flex flex-wrap gap-2">
              {["Hair","Skin","Nail","Body","Bridal","Dental","Wellness","Hair Removal","Massage"].map(s => <Pill key={s}>{s}</Pill>)}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Cities" className="mt-5">
          <SectionCard title="City / location settings" description="Cities supported on BRG">
            <div className="flex flex-wrap gap-2">{cities.map(c => <Pill key={c}>{c}</Pill>)}</div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Payments" className="mt-5">
          <SectionCard title="Payment settings" description="Enable/disable payment methods and configure fees">
            <div className="space-y-3">
              <ToggleRow title="eSewa" desc="Local digital wallet — most popular" />
              <ToggleRow title="Khalti" desc="Local digital wallet" />
              <ToggleRow title="Card" desc="Visa / Mastercard via gateway" />
              <ToggleRow title="Cash on visit" desc="Pay at the business" defaultChecked={false} />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Gift cards" className="mt-5">
          <SectionCard title="Gift card rules" description="Defaults applied to all gift cards">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Min amount"><Input defaultValue="500" /></Field>
              <Field label="Max amount"><Input defaultValue="50000" /></Field>
              <Field label="Default validity (months)"><Input defaultValue="12" /></Field>
              <Field label="Refundable?"><div className="flex items-center gap-3"><Switch /> <span className="text-sm text-muted-foreground">No</span></div></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Loyalty" className="mt-5">
          <SectionCard title="Loyalty rules" description="Stamp card defaults">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Paid visits required"><Input defaultValue="9" /></Field>
              <Field label="Free visit at"><Input defaultValue="10" /></Field>
              <Field label="Milestone (stamp 5)"><Input defaultValue="10% off" /></Field>
              <Field label="Milestone (stamp 9)"><Input defaultValue="Free upgrade" /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Sponsored" className="mt-5">
          <SectionCard title="Sponsored listing rules" description="Pricing and slots for paid placement">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Homepage hero / week"><Input defaultValue="रू 25,000" /></Field>
              <Field label="Search sponsored / week"><Input defaultValue="रू 12,000" /></Field>
              <Field label="Category top / week"><Input defaultValue="रू 8,000" /></Field>
              <Field label="Max active per business"><Input defaultValue="3" /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Notifications" className="mt-5">
          <SectionCard title="Notification templates" description="System push / email copy">
            <Field label="Booking confirmation"><Textarea defaultValue="Hi {{name}}, your booking at {{business}} on {{date}} is confirmed. Glow on ✨" /></Field>
            <div className="mt-4"><Field label="Settlement complete"><Textarea defaultValue="Your settlement of रू {{amount}} has been transferred." /></Field></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="WhatsApp" className="mt-5">
          <SectionCard title="WhatsApp message templates" description="Approved BSP templates">
            <Field label="Booking reminder"><Textarea defaultValue="Hi {{name}} 👋 Reminder: your appointment at {{business}} is at {{time}} tomorrow." /></Field>
            <div className="mt-4"><Field label="Review request"><Textarea defaultValue="Hi {{name}}, how was your visit to {{business}}? Tap to share a quick review." /></Field></div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Reviews" className="mt-5">
          <SectionCard title="Review moderation rules">
            <div className="space-y-3">
              <ToggleRow title="Auto-hide profanity" desc="Hide reviews with banned keywords automatically" />
              <ToggleRow title="Require booking to review" desc="Only paying customers can leave reviews" />
              <ToggleRow title="Allow business reply" desc="Businesses can publicly reply to reviews" />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Refunds" className="mt-5">
          <SectionCard title="Refund rules">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Free cancellation window (hrs)"><Input defaultValue="24" /></Field>
              <Field label="Late cancellation fee"><Input defaultValue="20%" /></Field>
              <Field label="Auto-approve refunds under"><Input defaultValue="रू 2,000" /></Field>
              <Field label="Max refund processing time"><Input defaultValue="5 days" /></Field>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Security" className="mt-5">
          <SectionCard title="Admin security settings">
            <div className="space-y-3">
              <ToggleRow title="Require 2FA for all admins" desc="TOTP via authenticator app" />
              <ToggleRow title="Force password reset every 90 days" desc="Recommended for finance admins" />
              <ToggleRow title="Audit log retention 24 months" desc="Comply with internal audit policy" />
              <ToggleRow title="IP allowlist" desc="Restrict admin login to office network" defaultChecked={false} />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

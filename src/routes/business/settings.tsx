import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { branches } from "@/lib/nav";
import {
  Building2, Clock, CalendarCheck, CreditCard, Bell, Shield, Globe2, Palette,
  Upload, MapPin, Plus, Star, Trophy, Sparkles, Image as ImageIcon, Save, Check, Heart, Receipt, ShoppingBag,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LoyaltyProgramSettings } from "@/components/LoyaltyProgramSettings";
import { SubscriptionSettings } from "@/components/SubscriptionSettings";
import { InvoiceSettingsView } from "@/components/invoice/InvoiceSettingsView";
import { useTheme } from "@/components/ThemeProvider";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses } from "@/lib/tenant-data";
import { usePosStore } from "@/lib/pos-store";

export const Route = createFileRoute("/business/settings")({
  head: () => ({ meta: [{ title: "Settings A BRG Suite" }] }),
  component: SettingsPage,
});

const TABS = [
  { v: "business", label: "Business", icon: Building2 },
  { v: "invoice", label: "Invoice Settings", icon: Receipt },
  { v: "hours", label: "Hours", icon: Clock },
  { v: "booking", label: "Booking", icon: CalendarCheck },
  { v: "payment", label: "Payments", icon: CreditCard },
  { v: "pos", label: "POS Settings", icon: ShoppingBag },
  { v: "subscription", label: "Subscription", icon: Star },
  { v: "loyalty", label: "Loyalty Program", icon: Heart },
  { v: "notifications", label: "Notifications", icon: Bell },
  { v: "permissions", label: "Permissions", icon: Shield },
  { v: "marketplace", label: "Marketplace", icon: Globe2 },
  { v: "branding", label: "Branding", icon: Palette },
];

function Section({
  title, description, children, footer,
}: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-gradient-to-br from-card to-sand-soft/40">
        <h3 className="font-serif text-xl">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </header>
      <div className="p-6 space-y-5">{children}</div>
      {footer && <div className="px-6 py-3 border-t border-border bg-background/50 flex justify-end">{footer}</div>}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  title, description, defaultChecked = false,
}: { title: string; description?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

const ROLES = ["Owner", "Manager", "Receptionist", "Staff", "Trainer", "Finance", "Marketing"];
const PERMS = [
  "View bookings", "Manage bookings", "Manage staff", "Manage customers",
  "Manage payments", "Manage reports", "Manage settings", "Manage academy", "Manage marketing",
];
const INITIAL_ROLE_MATRIX: Record<string, string[]> = {
  Owner: PERMS,
  Manager: ["View bookings", "Manage bookings", "Manage staff", "Manage customers", "Manage payments", "Manage reports", "Manage marketing"],
  Receptionist: ["View bookings", "Manage bookings", "Manage customers", "Manage payments"],
  Staff: ["View bookings"],
  Trainer: ["View bookings", "Manage academy"],
  Finance: ["View bookings", "Manage payments", "Manage reports"],
  Marketing: ["Manage marketing", "Manage customers"],
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const COLORS = ["#8A9478", "#D8B0A8", "#B07D2C", "#5F6B57", "#7A846A", "#D9E4EA"];

function SettingsPage() {
  const [color, setColor] = useState(COLORS[0]);
  const [roleMatrix, setRoleMatrix] = useState<Record<string, string[]>>(INITIAL_ROLE_MATRIX);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "business";
    }
    return "business";
  });

  const togglePermission = (role: string, perm: string) => {
    setRoleMatrix((prev) => {
      const currentPerms = prev[role] || [];
      if (currentPerms.includes(perm)) {
        return { ...prev, [role]: currentPerms.filter((p) => p !== perm) };
      } else {
        return { ...prev, [role]: [...currentPerms, perm] };
      }
    });
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure your business profile, payments, notifications and more."
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
            <Save className="h-4 w-4" />Save changes
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-sand-soft h-auto flex-wrap gap-1 p-1.5 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.v} value={t.v} className="data-[state=active]:bg-card data-[state=active]:shadow-luxe rounded-lg gap-2">
                <Icon className="h-3.5 w-3.5" />{t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* INVOICE */}
        <TabsContent value="invoice" className="space-y-6">
          <InvoiceSettingsView />
        </TabsContent>

        {/* BUSINESS */}
        <TabsContent value="business" className="space-y-6">
          <Section title="Business profile" description="How your brand appears to customers across BRG.">
            <div className="grid md:grid-cols-[160px_1fr] gap-6">
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-sand-soft to-mist-soft border border-border grid place-items-center font-serif text-4xl text-gold">A</div>
                <Button variant="outline" size="sm" className="w-full"><Upload className="h-3.5 w-3.5" />Upload logo</Button>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Business name"><Input defaultValue="Aura Beauty Lounge" /></Field>
                  <Field label="Business type"><Input defaultValue="Beauty · Wellness · Spa" /></Field>
                  <Field label="Phone"><Input defaultValue="+977 01 5520 118" /></Field>
                  <Field label="Email"><Input defaultValue="hello@aurabeauty.np" /></Field>
                  <Field label="Website"><Input defaultValue="https://aurabeauty.np" /></Field>
                  <Field label="Instagram"><Input defaultValue="@aurabeautylounge" /></Field>
                  <Field label="Facebook"><Input defaultValue="aurabeautylounge" /></Field>
                  <Field label="TikTok"><Input defaultValue="@aurabeauty" /></Field>
                </div>
                <Field label="Description">
                  <Textarea
                    rows={3}
                    defaultValue="A premium beauty, wellness and bridal destination based in Jhamsikhel, Lalitpur with six branches across Nepal."
                  />
                </Field>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80">Cover image</label>
              <div className="mt-1.5 h-40 rounded-2xl bg-gradient-to-br from-rose-soft via-sand-soft to-mist-soft border border-border grid place-items-center text-muted-foreground text-sm">
                <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Drop or upload cover (1920×600)</div>
              </div>
            </div>
          </Section>

          <Section title="Address & branches">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Headquarters address">
                <Input defaultValue="Jhamsikhel Road, Lalitpur 44600" />
              </Field>
              <Field label="City"><Input defaultValue="Lalitpur" /></Field>
            </div>
            <div className="rounded-2xl border border-border bg-mist-soft h-44 grid place-items-center text-sm text-foreground/70">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-deep-olive" />Google Maps location placeholder</div>
            </div>
            <div>
              <div className="text-xs font-medium text-foreground/80 mb-2">Branches</div>
              <div className="flex flex-wrap gap-2">
                {branches.map((b) => (
                  <span key={b} className="text-sm px-3 py-1.5 rounded-full bg-sand-soft border border-border flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-deep-olive" />{b}
                  </span>
                ))}
                <button className="text-sm px-3 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:bg-sand-soft flex items-center gap-1.5">
                  <Plus className="h-3 w-3" />Add branch
                </button>
              </div>
            </div>
          </Section>

          <Section title="Recognition" description="Certifications and awards displayed on your marketplace profile.">
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { i: Trophy, t: "Best Bridal Studio · Nepal Beauty Awards 2024" },
                { i: Star, t: "5-star Google rating across 4 branches" },
                { i: Sparkles, t: "L'Oréal Professional Certified Salon" },
                { i: Check, t: "Khalti Verified Merchant" },
              ].map((c, i) => {
                const Icon = c.i;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-sand-soft/50 p-3">
                    <div className="h-9 w-9 rounded-lg bg-card border border-border grid place-items-center text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm">{c.t}</div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5" />Add certification</Button>
          </Section>
        </TabsContent>

        {/* HOURS */}
        <TabsContent value="hours" className="space-y-6">
          <Section title="Weekly opening hours">
            <div className="space-y-2">
              {DAYS.map((d, i) => (
                <div key={d} className="grid grid-cols-[110px_auto_1fr_1fr_1fr] items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="text-sm font-medium">{d}</div>
                  <Switch defaultChecked={i !== 3} />
                  <Input defaultValue="10:00" className="h-9" />
                  <Input defaultValue="20:00" className="h-9" />
                  <Input defaultValue="13:00–13:45" className="h-9" placeholder="Break" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Holidays & closures">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Public holidays" hint="Auto-applied for Dashain, Tihar, New Year.">
                <Input defaultValue="Dashain · Tihar · Nepali New Year · Holi" />
              </Field>
              <Field label="Special opening days">
                <Input defaultValue="Valentine's Day · Mother's Day · Wedding season Sundays" />
              </Field>
            </div>
            <ToggleRow title="Temporary closure" description="Pause all online bookings during renovation." />
          </Section>
        </TabsContent>

        {/* BOOKING */}
        <TabsContent value="booking" className="space-y-6">
          <Section title="Booking rules">
            <ToggleRow title="Online booking enabled" description="Customers can book through the BRG marketplace and your link." defaultChecked />
            <ToggleRow title="Auto-confirm bookings" description="Bookings are confirmed instantly without staff approval." defaultChecked />
            <ToggleRow title="Allow customer to choose staff" defaultChecked />
            <div className="grid md:grid-cols-2 gap-4 pt-3">
              <Field label="Minimum advance booking" hint="How early customers must book."><Input defaultValue="2 hours" /></Field>
              <Field label="Maximum advance booking"><Input defaultValue="60 days" /></Field>
            </div>
          </Section>

          <Section title="Cancellation & policies">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Cancellation window"><Input defaultValue="6 hours before" /></Field>
              <Field label="Reschedule window"><Input defaultValue="3 hours before" /></Field>
              <Field label="No-show fee"><Input defaultValue="50% of service" /></Field>
            </div>
            <Field label="Deposit requirement" hint="Required for bridal and packages above NPR 5,000.">
              <Input defaultValue="20% upfront for high-value bookings" />
            </Field>
          </Section>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payment" className="space-y-6">
          <Section title="Payment methods">
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { t: "eSewa", d: "Nepal's leading digital wallet", on: true },
                { t: "Khalti", d: "Khalti merchant payments", on: true },
                { t: "Cash", d: "Counter cash payments", on: true },
                { t: "Card", d: "Visa, MasterCard via NIC Asia gateway", on: true },
              ].map((p) => (
                <div key={p.t} className="rounded-xl border border-border bg-sand-soft/50 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.d}</div>
                  </div>
                  <Switch defaultChecked={p.on} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Tax & invoicing">
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Deposit percentage"><Input defaultValue="20%" /></Field>
              <Field label="VAT (%)"><Input defaultValue="13" /></Field>
              <Field label="Invoice prefix"><Input defaultValue="AURA-" /></Field>
            </div>
            <Field label="Refund rules">
              <Textarea rows={3} defaultValue="Full refund if cancelled 24h before. 50% refund within 6h. No refund for no-shows." />
            </Field>
          </Section>
        </TabsContent>

        {/* POS SETTINGS */}
        <TabsContent value="pos" className="space-y-6">
          <PosSettings />
        </TabsContent>

        {/* LOYALTY PROGRAM */}
        <TabsContent value="loyalty" className="space-y-6">
          <LoyaltyProgramSettings />
        </TabsContent>

        {/* SUBSCRIPTION */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionSettings />
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Section title="WhatsApp & SMS messages" description="Pick which automated messages your customers receive.">
            <ToggleRow title="Booking confirmation (WhatsApp)" defaultChecked />
            <ToggleRow title="24-hour reminder" defaultChecked />
            <ToggleRow title="2-hour reminder" defaultChecked />
            <ToggleRow title="Review request after visit" defaultChecked />
            <ToggleRow title="Package expiry reminder" description="Sent 7 days before expiry." defaultChecked />
            <ToggleRow title="Gift card delivery" defaultChecked />
            <ToggleRow title="Loyalty milestone message" description="Triggered at 5, 10, 20 stamps." defaultChecked />
            <ToggleRow title="New booking alert (Staff)" defaultChecked />
          </Section>
        </TabsContent>

        {/* PERMISSIONS */}
        <TabsContent value="permissions" className="space-y-6">
          <Section title="Roles & permissions" description="Toggle what each role can access.">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-sand-soft text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 sticky left-0 bg-sand-soft">Permission</th>
                    {ROLES.map((r) => <th key={r} className="text-center px-3 py-3 whitespace-nowrap">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMS.map((p) => (
                    <tr key={p} className="border-t border-border">
                      <td className="px-4 py-3 font-medium sticky left-0 bg-card">{p}</td>
                      {ROLES.map((r) => (
                        <td key={r} className="text-center px-0 py-0">
                          <button
                            onClick={() => togglePermission(r, p)}
                            className="w-full h-full p-3 flex items-center justify-center hover:bg-sand-soft/50 transition-colors"
                          >
                            {roleMatrix[r]?.includes(p) ? (
                              <Check className="h-4 w-4 text-deep-olive" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </TabsContent>

        {/* MARKETPLACE */}
        <TabsContent value="marketplace" className="space-y-6">
          <Section title="BRG marketplace" description="Control how Aura appears to customers browsing BRG.">
            <ToggleRow title="Show business on BRG marketplace" defaultChecked />
            <ToggleRow title="Allow customer reviews" defaultChecked />
            <ToggleRow title="Show staff profiles" defaultChecked />
            <ToggleRow title="Show packages & memberships" defaultChecked />
            <ToggleRow title="Show gift cards" defaultChecked />
            <ToggleRow title="Accept online payments" defaultChecked />
            <ToggleRow title="Interested in sponsored listings" description="We'll reach out with featured placement options." />
          </Section>
        </TabsContent>

        {/* BRANDING */}
        <TabsContent value="branding" className="space-y-6">
          <ThemeGallerySection />

          <Section title="Accent color" description="Used for receipts, gift cards and printed materials.">
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-12 w-12 rounded-xl border-2 transition shadow-luxe",
                    color === c ? "border-foreground scale-105" : "border-border",
                  )}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Active: <span className="font-mono">{color}</span></div>
          </Section>


          <Section title="Receipts & invoices">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Receipt logo">
                <div className="rounded-xl border border-dashed border-border bg-sand-soft/40 p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-card grid place-items-center font-serif text-xl text-gold border border-border">A</div>
                  <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5" />Replace</Button>
                </div>
              </Field>
              <Field label="Invoice footer note">
                <Textarea rows={3} defaultValue="Thank you for choosing Aura Beauty Lounge. Tax included. Visit us again soon." />
              </Field>
            </div>
            <Field label="WhatsApp message signature">
              <Input defaultValue="— Team Aura · Jhamsikhel, Lalitpur · +977 01 5520 118" />
            </Field>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ThemeGallerySection() {
  const { themeId, setThemeId, themes } = useTheme();
  const { activeBusinessId } = useTenantStore();
  const business = mockBusinesses.find(b => b.id === activeBusinessId)?.name;
  const businesses = mockBusinesses.map(b => b.name);

  function applyToAll() {
    try {
      businesses.forEach((b) => localStorage.setItem(`brg.theme:${b}`, themeId));
    } catch {}
  }

  return (
    <Section
      title="Interface theme"
      description={`Choose a look for ${business}. Each of your businesses can have its own theme — Dental, Salon, Spa, Bridal and Academy can all feel different.`}
      footer={
        <button
          onClick={applyToAll}
          className="text-xs text-muted-foreground hover:text-foreground transition underline-offset-4 hover:underline"
        >
          Apply this theme to all my businesses
        </button>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themes.map((t) => {
          const active = t.id === themeId;
          return (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className={cn(
                "group text-left rounded-2xl border bg-card overflow-hidden transition lift-on-hover",
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/20",
              )}
            >
              <div className="h-20 relative" style={{ background: t.swatches[1] }}>
                <div className="absolute inset-0 grid grid-cols-4">
                  {t.swatches.map((c, i) => (
                    <div key={i} style={{ background: c }} />
                  ))}
                </div>
                {active && (
                  <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-luxe">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <div className="font-serif text-lg leading-tight">{t.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.tagline}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ── POS Settings ───────────────────────────────────────
function PosSettings() {
  const store = usePosStore();

  return (
    <div className="space-y-6">
      <Section title="Tax Configuration" description="Manage how taxes are applied to your services and products at checkout.">
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="min-w-0">
            <div className="text-sm font-medium">Include tax in prices</div>
            <div className="text-xs text-muted-foreground mt-0.5">Prices shown to customers already include tax.</div>
          </div>
          <Switch checked={store.includeTax} onCheckedChange={(v) => store.updateSetting("includeTax", v)} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Field label="Tax Type">
            <Select value={store.taxType} onValueChange={(v: any) => store.updateSetting("taxType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vat">VAT (Value Added Tax)</SelectItem>
                <SelectItem value="gst">GST (Goods & Services Tax)</SelectItem>
                <SelectItem value="sales_tax">Sales Tax</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tax Rate (basis points)" hint="e.g. 1300 for 13%, 500 for 5%">
            <Input type="number" value={store.taxRateBps} onChange={(e) => store.updateSetting("taxRateBps", Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section title="Default Discounts" description="Set default discounts to speed up checkout.">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Default Discount Type">
            <Select value={store.discountType} onValueChange={(v: any) => store.updateSetting("discountType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default discount</SelectItem>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          
          {store.discountType !== "none" && (
            <Field 
              label={store.discountType === "percentage" ? "Default Discount (basis points)" : "Default Discount (minor units)"} 
              hint={store.discountType === "percentage" ? "e.g. 1000 for 10%" : "e.g. 50000 for NPR 500"}
            >
              <Input 
                type="number" 
                value={store.discountType === "percentage" ? store.discountBps : store.discountMinor} 
                onChange={(e) => store.updateSetting(store.discountType === "percentage" ? "discountBps" : "discountMinor", Number(e.target.value))} 
              />
            </Field>
          )}
        </div>
      </Section>

      <Section title="Staff & Checkout Flow" description="Control what happens during the checkout process.">
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="min-w-0">
            <div className="text-sm font-medium">Require Staff Selection</div>
            <div className="text-xs text-muted-foreground mt-0.5">Force the cashier to select which staff member performed the service before collecting payment.</div>
          </div>
          <Switch checked={store.requireStaff} onCheckedChange={(v) => store.updateSetting("requireStaff", v)} />
        </div>
      </Section>

      <Section title="Tipping & Gratuity" description="Allow customers to add tips when paying by card or digital wallet.">
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="min-w-0">
            <div className="text-sm font-medium">Enable Tipping</div>
            <div className="text-xs text-muted-foreground mt-0.5">Prompt customers for a tip on the checkout screen.</div>
          </div>
          <Switch checked={store.enableTipping} onCheckedChange={(v) => store.updateSetting("enableTipping", v)} />
        </div>
        {store.enableTipping && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Field label="Tip Option 1 (%)">
              <Input type="number" value={store.tipOptions[0]} onChange={(e) => store.updateSetting("tipOptions", [Number(e.target.value), store.tipOptions[1], store.tipOptions[2]])} />
            </Field>
            <Field label="Tip Option 2 (%)">
              <Input type="number" value={store.tipOptions[1]} onChange={(e) => store.updateSetting("tipOptions", [store.tipOptions[0], Number(e.target.value), store.tipOptions[2]])} />
            </Field>
            <Field label="Tip Option 3 (%)">
              <Input type="number" value={store.tipOptions[2]} onChange={(e) => store.updateSetting("tipOptions", [store.tipOptions[0], store.tipOptions[1], Number(e.target.value)])} />
            </Field>
          </div>
        )}
      </Section>

      <Section title="Receipt Preferences" description="Choose how receipts are handled after a successful sale.">
        <Field label="Auto-receipt behavior">
          <Select value={store.receiptBehavior} onValueChange={(v: any) => store.updateSetting("receiptBehavior", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="print">Always print automatically</SelectItem>
              <SelectItem value="ask">Always ask customer (Print / SMS / None)</SelectItem>
              <SelectItem value="none">Never print (Go green)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  );
}

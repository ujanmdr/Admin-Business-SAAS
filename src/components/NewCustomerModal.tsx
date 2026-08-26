import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, User, Phone, Mail, Cake, MapPin, Tag, Sparkles, FileText } from "lucide-react";

const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"];
const SOURCES = ["BRG Marketplace", "Walk-in", "Referral", "WhatsApp", "Instagram"];
const TAG_OPTIONS = ["Bridal", "VIP", "Skincare", "Hair", "Spa", "Barber", "Dental", "Loyal"];

export function NewCustomerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", birthday: "", city: CITIES[0],
    source: SOURCES[0], preferredStaff: "", notes: "", allergies: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTag = (t: string) => setTags((a) => a.includes(t) ? a.filter((x) => x !== t) : [...a, t]);
  const reset = () => { setForm({ name: "", phone: "", email: "", birthday: "", city: CITIES[0], source: SOURCES[0], preferredStaff: "", notes: "", allergies: "" }); setTags([]); };

  const canSave = form.name.trim().length > 1 && form.phone.trim().length >= 7;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background border-border">
        <DialogTitle className="sr-only">Add Customer</DialogTitle>

        <div className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="text-[10px] uppercase tracking-[0.24em] text-gold font-medium">CRM</div>
          <h2 className="font-serif text-3xl mt-1">Add New Customer</h2>
          <p className="text-sm text-muted-foreground mt-1">A guest profile to track preferences, history, and lifetime value.</p>
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field icon={User} label="Full name *">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aastha Karki" className={input} />
            </Field>
            <Field icon={Phone} label="Phone *">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XX-XXXXXX" className={input} />
            </Field>
            <Field icon={Mail} label="Email">
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@email.com" className={input} />
            </Field>
            <Field icon={Cake} label="Birthday">
              <input value={form.birthday} onChange={(e) => set("birthday", e.target.value)} placeholder="MM-DD" className={input} />
            </Field>
            <Field icon={MapPin} label="City">
              <select value={form.city} onChange={(e) => set("city", e.target.value)} className={input}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field icon={Sparkles} label="Source">
              <select value={form.source} onChange={(e) => set("source", e.target.value)} className={input}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field icon={User} label="Preferred staff">
              <input value={form.preferredStaff} onChange={(e) => set("preferredStaff", e.target.value)} placeholder="Optional" className={input} />
            </Field>
            <Field icon={Tag} label="Allergies">
              <input value={form.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="Optional" className={input} />
            </Field>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1"><Tag className="h-3 w-3" />Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button key={t} type="button" onClick={() => toggleTag(t)}
                    className={`text-xs rounded-full border px-3 py-1 transition ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <Field icon={FileText} label="Notes">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Preferences, allergies, special occasions…" className={`${input} resize-none`} />
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={() => onOpenChange(false)} disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-luxe disabled:opacity-50">
            <Check className="h-4 w-4" />Save Customer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const input = "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1"><Icon className="h-3 w-3" />{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

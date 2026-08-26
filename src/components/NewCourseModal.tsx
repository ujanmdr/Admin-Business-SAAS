import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, BookOpen, Tag, Clock, Wallet, User, Users, Calendar } from "lucide-react";

const CATEGORIES = ["Makeup", "Hair", "Nail", "Skin", "Spa", "Bridal", "Dental"];
const EMOJIS = ["💄", "💇‍♀️", "💅", "✨", "🌿", "👰", "🦷", "🎓"];

export function NewCourseModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({
    name: "", category: CATEGORIES[0], duration: "", fee: "",
    instructor: "", batch: "", startDate: "", endDate: "",
    capacity: "20", emoji: EMOJIS[0],
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm({ name: "", category: CATEGORIES[0], duration: "", fee: "", instructor: "", batch: "", startDate: "", endDate: "", capacity: "20", emoji: EMOJIS[0] });
  const canSave = form.name.trim().length > 1 && form.instructor.trim().length > 1 && form.fee.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background border-border">
        <DialogTitle className="sr-only">New Course</DialogTitle>
        <div className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="text-[10px] uppercase tracking-[0.24em] text-gold font-medium">Academy</div>
          <h2 className="font-serif text-3xl mt-1">Create New Course</h2>
          <p className="text-sm text-muted-foreground mt-1">Set the curriculum, batch, and pricing for a new program.</p>
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field icon={BookOpen} label="Course name *">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Bridal Masterclass" className={input} />
            </Field>
            <Field icon={Tag} label="Category">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={input}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field icon={Clock} label="Duration">
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 8 weeks" className={input} />
            </Field>
            <Field icon={Wallet} label="Fee (NPR) *">
              <input value={form.fee} onChange={(e) => set("fee", e.target.value)} placeholder="45000" className={input} />
            </Field>
            <Field icon={User} label="Instructor *">
              <input value={form.instructor} onChange={(e) => set("instructor", e.target.value)} placeholder="e.g. Aanchal Shrestha" className={input} />
            </Field>
            <Field icon={Users} label="Batch / Capacity">
              <div className="flex gap-2">
                <input value={form.batch} onChange={(e) => set("batch", e.target.value)} placeholder="Batch 25" className={input} />
                <input value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="20" className={`${input} w-20`} />
              </div>
            </Field>
            <Field icon={Calendar} label="Start date">
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={input} />
            </Field>
            <Field icon={Calendar} label="End date">
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={input} />
            </Field>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Icon</div>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => set("emoji", e)}
                  className={`text-lg rounded-xl border size-10 transition ${form.emoji === e ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-muted"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={() => onOpenChange(false)} disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-luxe disabled:opacity-50">
            <Check className="h-4 w-4" />Create Course
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

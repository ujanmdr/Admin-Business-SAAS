import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, User, Phone, BookOpen, Wallet, Calendar } from "lucide-react";
import { COURSES } from "@/lib/academy-data";

export function EnrollStudentModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({
    name: "", phone: "", courseId: COURSES[0].id, enrolledOn: "",
    feePaid: "", plan: "Full payment",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => setForm({ name: "", phone: "", courseId: COURSES[0].id, enrolledOn: "", feePaid: "", plan: "Full payment" });
  const canSave = form.name.trim().length > 1 && form.phone.trim().length >= 7;
  const course = COURSES.find((c) => c.id === form.courseId);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-background border-border">
        <DialogTitle className="sr-only">Enroll Student</DialogTitle>
        <div className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="text-[10px] uppercase tracking-[0.24em] text-gold font-medium">Academy</div>
          <h2 className="font-serif text-3xl mt-1">Enroll Student</h2>
          <p className="text-sm text-muted-foreground mt-1">Admit a learner into a course batch.</p>
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field icon={User} label="Student name *">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Reema Tamang" className={input} />
            </Field>
            <Field icon={Phone} label="Phone *">
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XX-XXXXXX" className={input} />
            </Field>
            <Field icon={BookOpen} label="Course">
              <select value={form.courseId} onChange={(e) => set("courseId", e.target.value)} className={input}>
                {COURSES.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.batch}</option>)}
              </select>
            </Field>
            <Field icon={Calendar} label="Enrolled on">
              <input type="date" value={form.enrolledOn} onChange={(e) => set("enrolledOn", e.target.value)} className={input} />
            </Field>
            <Field icon={Wallet} label="Initial payment (NPR)">
              <input value={form.feePaid} onChange={(e) => set("feePaid", e.target.value)} placeholder={course ? String(course.fee) : "0"} className={input} />
            </Field>
            <Field icon={Wallet} label="Payment plan">
              <select value={form.plan} onChange={(e) => set("plan", e.target.value)} className={input}>
                <option>Full payment</option>
                <option>2 installments</option>
                <option>3 installments</option>
              </select>
            </Field>
          </div>

          {course && (
            <div className="rounded-xl bg-[color-mix(in_oklab,var(--sand)_30%,white)] border border-border p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Total course fee</span>
              <span className="font-medium">रु {course.fee.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={() => onOpenChange(false)} disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-luxe disabled:opacity-50">
            <Check className="h-4 w-4" />Enroll Student
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

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { COURSES, STUDENTS, CLASSES, Course, Student, fmt } from "@/lib/academy-data";
import {
  Plus, Search, GraduationCap, Users, Calendar, Wallet, Clock, TrendingUp,
  Video, Award, MapPin, CheckCircle2, FileText, MoreHorizontal, BookOpen, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewCourseModal } from "@/components/NewCourseModal";
import { EnrollStudentModal } from "@/components/EnrollStudentModal";
import { toast } from "sonner";

export const Route = createFileRoute("/business/academy")({
  head: () => ({ meta: [{ title: "Academy · BRG Suite" }] }),
  component: AcademyPage,
});

function AcademyPage() {
  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);

  const totals = useMemo(() => {
    const feesCollected = STUDENTS.reduce((a, s) => a + s.feePaid, 0);
    const feesPending = STUDENTS.reduce((a, s) => a + (s.feeTotal - s.feePaid), 0);
    const attendanceAvg = Math.round(STUDENTS.reduce((a, s) => a + s.attendance, 0) / STUDENTS.length);
    const certReady = STUDENTS.filter(s => s.certificate === "Eligible").length;
    const onlineThisWeek = CLASSES.filter(c => c.mode === "Online" || c.mode === "Hybrid").length;
    return {
      activeCourses: COURSES.filter(c => c.status === "Ongoing").length,
      enrolled: STUDENTS.length,
      upcoming: CLASSES.length,
      feesCollected, feesPending, attendanceAvg, onlineThisWeek, certReady,
    };
  }, []);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <PageHeader
        eyebrow="Growth"
        title="Academy"
        description="Courses, students, classes and certificates — all in one place."
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => setEnrollOpen(true)}>
              <UserPlus className="size-4" /> Enroll student
            </Button>
            <Button className="gap-2" onClick={() => setNewCourseOpen(true)}>
              <Plus className="size-4" /> New course
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<BookOpen className="size-4" />} label="Active courses" value={String(totals.activeCourses)} tone="var(--sage)" />
        <Kpi icon={<Users className="size-4" />} label="Enrolled students" value={String(totals.enrolled)} tone="var(--rose)" />
        <Kpi icon={<Calendar className="size-4" />} label="Upcoming classes" value={String(totals.upcoming)} tone="var(--mist)" />
        <Kpi icon={<Wallet className="size-4" />} label="Fees collected" value={fmt(totals.feesCollected)} tone="var(--gold)" />
        <Kpi icon={<Clock className="size-4" />} label="Pending fees" value={fmt(totals.feesPending)} tone="var(--rose)" />
        <Kpi icon={<TrendingUp className="size-4" />} label="Attendance rate" value={`${totals.attendanceAvg}%`} tone="var(--sage)" />
        <Kpi icon={<Video className="size-4" />} label="Online this week" value={String(totals.onlineThisWeek)} tone="var(--mist)" />
        <Kpi icon={<Award className="size-4" />} label="Certificate-ready" value={String(totals.certReady)} tone="var(--gold)" />
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-6 bg-card border border-border">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Class schedule</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses"><CoursesTab /></TabsContent>
        <TabsContent value="students"><StudentsTab /></TabsContent>
        <TabsContent value="schedule"><ScheduleTab /></TabsContent>
        <TabsContent value="fees"><FeesTab /></TabsContent>
        <TabsContent value="certificates"><CertificatesTab /></TabsContent>
      </Tabs>

      <NewCourseModal open={newCourseOpen} onOpenChange={setNewCourseOpen} />
      <EnrollStudentModal open={enrollOpen} onOpenChange={setEnrollOpen} />
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
      <div className="mt-3 font-serif text-2xl">{value}</div>
    </div>
  );
}

const STATUS_TONE: Record<Course["status"], string> = {
  Ongoing: "var(--sage)",
  Upcoming: "var(--mist)",
  Completed: "var(--cloud)",
};

function CoursesTab() {
  const [q, setQ] = useState("");
  const list = COURSES.filter(c => q === "" || c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="relative max-w-md mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses" className="pl-9 bg-card" />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map(c => <CourseCard key={c.id} c={c} />)}
      </div>
    </>
  );
}

function CourseCard({ c }: { c: Course }) {
  const fillPct = Math.round((c.enrolled / c.capacity) * 100);
  return (
    <div
      className="rounded-2xl border border-border p-5 shadow-sm bg-gradient-to-br to-card"
      style={{ backgroundImage: `linear-gradient(160deg, color-mix(in oklab, ${c.tone} 20%, white), var(--card))` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl grid place-items-center text-2xl" style={{ background: `color-mix(in oklab, ${c.tone} 30%, white)` }}>
            {c.emoji}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.category}</div>
            <h3 className="font-serif text-lg leading-tight">{c.name}</h3>
          </div>
        </div>
        <Badge variant="outline" className="border-border" style={{ background: `color-mix(in oklab, ${STATUS_TONE[c.status]} 30%, white)` }}>
          {c.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <Stat label="Duration" value={c.duration} />
        <Stat label="Fee" value={fmt(c.fee)} />
        <Stat label="Instructor" value={c.instructor} />
        <Stat label="Batch" value={c.batch} />
        <Stat label="Start" value={c.startDate.slice(5)} />
        <Stat label="End" value={c.endDate.slice(5)} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Enrollment</span>
          <span>{c.enrolled} / {c.capacity}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-[color:var(--sage)]" style={{ width: `${fillPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 border border-border/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-medium text-foreground mt-0.5 truncate">{value}</div>
    </div>
  );
}

function StudentsTab() {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[color-mix(in_oklab,var(--sand)_50%,white)]">
          <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <th className="px-5 py-3">Student</th>
            <th className="px-5 py-3">Course · Batch</th>
            <th className="px-5 py-3">Enrolled</th>
            <th className="px-5 py-3">Fees</th>
            <th className="px-5 py-3">Attendance</th>
            <th className="px-5 py-3">Progress</th>
            <th className="px-5 py-3">Certificate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {STUDENTS.map(s => <StudentRow key={s.id} s={s} />)}
        </tbody>
      </table>
    </div>
  );
}

function StudentRow({ s }: { s: Student }) {
  const feePct = Math.round((s.feePaid / s.feeTotal) * 100);
  const certTone = s.certificate === "Issued" ? "var(--sage)" :
    s.certificate === "Eligible" ? "var(--gold)" :
    s.certificate === "Pending payment" ? "var(--rose)" : "var(--mist)";
  return (
    <tr className="hover:bg-[color-mix(in_oklab,var(--sand)_25%,white)] transition">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-[color-mix(in_oklab,var(--rose)_30%,white)] grid place-items-center text-[11px] font-medium">
            {s.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-[11px] text-muted-foreground">{s.phone}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div>{s.course}</div>
        <div className="text-[11px] text-muted-foreground">{s.batch}</div>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{s.enrolledOn}</td>
      <td className="px-5 py-3 min-w-[140px]">
        <div className="text-xs">{fmt(s.feePaid)} <span className="text-muted-foreground">/ {fmt(s.feeTotal)}</span></div>
        <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
          <div className="h-full rounded-full bg-[color:var(--gold)]" style={{ width: `${feePct}%` }} />
        </div>
      </td>
      <td className="px-5 py-3">
        <span className={cn("text-sm font-medium", s.attendance >= 90 ? "text-foreground" : "text-muted-foreground")}>{s.attendance}%</span>
      </td>
      <td className="px-5 py-3 min-w-[120px]">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-[color:var(--sage)]" style={{ width: `${s.progress}%` }} />
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">{s.progress}%</div>
      </td>
      <td className="px-5 py-3">
        <Badge variant="outline" className="border-border" style={{ background: `color-mix(in oklab, ${certTone} 30%, white)` }}>
          {s.certificate}
        </Badge>
      </td>
    </tr>
  );
}

function ScheduleTab() {
  const grouped = CLASSES.reduce<Record<string, typeof CLASSES>>((acc, c) => {
    (acc[c.date] ||= []).push(c);
    return acc;
  }, {});
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, classes]) => (
        <div key={day}>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{day}</div>
          <div className="grid md:grid-cols-2 gap-4">
            {classes.map(c => (
              <div key={c.id} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg">{c.title}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.course} · {c.instructor}</div>
                  </div>
                  <Badge variant="outline" className="border-border" style={{
                    background: c.mode === "Online" ? "color-mix(in oklab, var(--mist) 40%, white)" :
                                c.mode === "Hybrid" ? "color-mix(in oklab, var(--gold) 25%, white)" :
                                "color-mix(in oklab, var(--sage) 25%, white)"
                  }}>
                    {c.mode === "Online" || c.mode === "Hybrid" ? <Video className="size-3 mr-1" /> : <MapPin className="size-3 mr-1" />}
                    {c.mode}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {c.time}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {c.room}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  {(c.mode === "Online" || c.mode === "Hybrid") && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Meet link copied", { description: "https://meet.google.com/abc-defg-hij" })}>
                      <Video className="size-3.5" /> Google Meet link
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5 ml-auto" onClick={() => toast.success(`Attendance opened for ${c.title}`)}>
                    <CheckCircle2 className="size-3.5" /> Mark attendance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeesTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color-mix(in_oklab,var(--sand)_50%,white)]">
            <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Paid</th>
              <th className="px-5 py-3 text-right">Remaining</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {STUDENTS.map(s => {
              const remaining = s.feeTotal - s.feePaid;
              return (
                <tr key={s.id} className="hover:bg-[color-mix(in_oklab,var(--sand)_25%,white)]">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.course}</td>
                  <td className="px-5 py-3 text-right">{fmt(s.feeTotal)}</td>
                  <td className="px-5 py-3 text-right">{fmt(s.feePaid)}</td>
                  <td className="px-5 py-3 text-right">{remaining > 0 ? fmt(remaining) : "—"}</td>
                  <td className="px-5 py-3">
                    {remaining > 0 ? (
                      <Badge variant="outline" className="border-border" style={{ background: "color-mix(in oklab, var(--rose) 25%, white)" }}>Due</Badge>
                    ) : (
                      <Badge variant="outline" className="border-border" style={{ background: "color-mix(in oklab, var(--sage) 25%, white)" }}>Paid in full</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <h3 className="font-serif text-lg">Installment plan</h3>
        <p className="text-xs text-muted-foreground mt-1">3-installment default. Customisable per student.</p>
        <ul className="mt-4 space-y-3">
          {[
            { n: "Installment 1", due: "On enrollment", pct: 40 },
            { n: "Installment 2", due: "Mid-course", pct: 30 },
            { n: "Installment 3", due: "Before certificate", pct: 30 },
          ].map(i => (
            <li key={i.n} className="rounded-xl bg-[color-mix(in_oklab,var(--sand)_30%,white)] border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{i.n}</div>
                <div className="text-xs text-muted-foreground">{i.pct}%</div>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{i.due}</div>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="w-full mt-4 gap-1.5" onClick={() => toast.success("Payment recorded", { description: "Receipt sent to student via SMS" })}>
          <Wallet className="size-3.5" /> Record payment
        </Button>
      </div>
    </div>
  );
}

function CertificatesTab() {
  const eligible = STUDENTS.filter(s => s.certificate === "Eligible" || s.certificate === "Issued");
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {eligible.map(s => (
        <div key={s.id} className="rounded-2xl bg-card border border-border p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 rounded-full opacity-30" style={{ background: "color-mix(in oklab, var(--gold) 40%, white)" }} />
          <div className="relative">
            <div className="size-12 rounded-2xl grid place-items-center" style={{ background: "color-mix(in oklab, var(--gold) 25%, white)" }}>
              <Award className="size-5 text-[color:var(--gold)]" />
            </div>
            <h3 className="font-serif text-lg mt-3">{s.name}</h3>
            <div className="text-xs text-muted-foreground">{s.course} · {s.batch}</div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Stat label="Attendance" value={`${s.attendance}%`} />
              <Stat label="Progress" value={`${s.progress}%`} />
            </div>

            <div className="mt-4">
              {s.certificate === "Issued" ? (
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => toast.success(`Opening certificate for ${s.name}`)}>
                  <FileText className="size-3.5" /> View certificate
                </Button>
              ) : (
                <Button size="sm" className="w-full gap-1.5" onClick={() => toast.success(`Certificate generated for ${s.name}`, { description: "Ready to download as PDF" })}>
                  <Award className="size-3.5" /> Generate certificate
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

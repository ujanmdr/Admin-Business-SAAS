import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Staff, DEFAULT_SCHEDULE, PERFORMANCE_6M, COMMISSION_BREAKDOWN, UPCOMING_BOOKINGS, RECENT_REVIEWS, PORTFOLIO, staffStatusTone } from "@/lib/staff-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Mail, Phone, MapPin, Calendar, Award, Shield, Edit, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export function StaffDrawer({ staff, onClose }: { staff: Staff | null; onClose: () => void }) {
  if (!staff) return null;
  const initials = staff.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const totalCommission = COMMISSION_BREAKDOWN.reduce((s, x) => s + x.value, 0);

  return (
    <Sheet open={!!staff} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background p-0">
        <div className="bg-gradient-to-br from-sand-soft to-mist-soft px-6 pt-8 pb-6 border-b border-border">
          <SheetHeader>
            <SheetTitle className="sr-only">{staff.name}</SheetTitle>
          </SheetHeader>
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-card border border-border grid place-items-center font-serif text-3xl text-gold shadow-luxe">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-3xl text-foreground leading-tight">{staff.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{staff.role} · {staff.branch}</div>
              <div className="flex items-center gap-2 mt-3">
                <span className={cn("text-[11px] px-2.5 py-1 rounded-full border", staffStatusTone(staff.status))}>
                  {staff.status}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-card flex items-center gap-1">
                  <Star className="h-3 w-3 fill-gold text-gold" /> {staff.rating}
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-card">
                  {staff.experienceYears} yrs experience
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Today", val: staff.todayAppointments + " bookings" },
              { label: "Utilization", val: staff.utilization + "%" },
              { label: "This month", val: fmt(staff.monthlyRevenue) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-serif text-lg mt-0.5">{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          <Tabs defaultValue="profile">
            <TabsList className="bg-sand-soft">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="commission">Commission</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-5 space-y-5">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Bio</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{staff.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-foreground/80"><Mail className="h-4 w-4 text-muted-foreground" />{staff.email}</div>
                <div className="flex items-center gap-2 text-foreground/80"><Phone className="h-4 w-4 text-muted-foreground" />{staff.phone}</div>
                <div className="flex items-center gap-2 text-foreground/80"><MapPin className="h-4 w-4 text-muted-foreground" />{staff.branch}</div>
                <div className="flex items-center gap-2 text-foreground/80"><Calendar className="h-4 w-4 text-muted-foreground" />Joined {staff.joinedYear}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Services performed</div>
                <div className="flex flex-wrap gap-1.5">
                  {staff.specialisations.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-sand-soft border border-border">{s}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-sand-soft/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <Shield className="h-3 w-3" /> System Access ({staff.role})
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {staff.permissions.length > 0 ? (
                    staff.permissions.map((p) => (
                      <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-mist-soft border border-mist text-foreground/80">{p}</span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No special permissions assigned.</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground border-t border-border pt-2">
                  Permissions are derived from their role. 
                  <a href="/business/settings" className="text-foreground underline underline-offset-2 ml-1">Edit role permissions in Settings →</a>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Recent reviews</div>
                <div className="space-y-2">
                  {RECENT_REVIEWS.map((r, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{r.customer}</div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3 w-3 fill-gold text-gold" />)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sand-soft text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2.5">Day</th>
                      <th className="text-left px-3 py-2.5">Hours</th>
                      <th className="text-left px-3 py-2.5">Break</th>
                      <th className="text-left px-3 py-2.5">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_SCHEDULE.map((d) => (
                      <tr key={d.day} className="border-t border-border">
                        <td className="px-3 py-2.5 font-medium">{d.day}</td>
                        <td className="px-3 py-2.5">{d.working ? `${d.start} – ${d.end}` : <span className="text-rose">Off</span>}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{d.break}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{d.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-rose bg-rose-soft p-4">
                <div className="text-[10px] uppercase tracking-wider text-foreground/70">Leave request</div>
                <div className="font-serif text-lg mt-0.5">14–16 May · Personal</div>
                <p className="text-xs text-foreground/70 mt-1">Pending approval from branch manager.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">Approve</Button>
                  <Button size="sm" variant="outline">Decline</Button>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Upcoming bookings</div>
                <div className="space-y-1.5">
                  {UPCOMING_BOOKINGS.map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono w-16 text-muted-foreground">{b.time}</div>
                        <div>
                          <div className="text-sm font-medium">{b.customer}</div>
                          <div className="text-xs text-muted-foreground">{b.service}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{fmt(b.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Revenue · last 6 months</div>
                    <div className="font-serif text-2xl mt-0.5">{fmt(PERFORMANCE_6M.reduce((s, p) => s + p.revenue, 0))}</div>
                  </div>
                  <div className="text-xs text-deep-olive bg-sand-soft px-2 py-1 rounded-full border border-border flex items-center gap-1">
                    <Award className="h-3 w-3" /> Top 10%
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_6M}>
                      <defs>
                        <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--sage)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--sage)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--sage)" strokeWidth={2} fill="url(#perfFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</div>
                  <div className="font-serif text-2xl mt-1">606</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg ticket</div>
                  <div className="font-serif text-2xl mt-1">रु 2,050</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rebooking</div>
                  <div className="font-serif text-2xl mt-1">71%</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="commission" className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-sand-soft to-card p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final Payout · this month</div>
                <div className="font-serif text-4xl mt-1 text-foreground">{fmt(staff.baseSalary + totalCommission - staff.advancesTaken)}</div>
                
                <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span>{fmt(staff.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission ({staff.commissionRate}%)</span>
                    <span>+ {fmt(totalCommission)}</span>
                  </div>
                  {staff.advancesTaken > 0 && (
                    <div className="flex justify-between text-sm text-rose">
                      <span>Less: Advances Taken</span>
                      <span>- {fmt(staff.advancesTaken)}</span>
                    </div>
                  )}
                </div>
              </div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Commission Breakdown</h4>
              {COMMISSION_BREAKDOWN.map((c) => (
                <div key={c.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                  <div className="text-sm">{c.label}</div>
                  <div className="font-medium">{fmt(c.value)}</div>
                </div>
              ))}
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90">Mark as paid</Button>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-5">
              <div className="grid grid-cols-3 gap-3">
                {PORTFOLIO.map((bg, i) => (
                  <div key={i} className="aspect-square rounded-2xl border border-border shadow-luxe" style={{ background: bg }} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 pt-5 border-t border-border">
            <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90"><Edit className="h-4 w-4" />Edit staff</Button>
            <Button variant="outline" className="flex-1"><CalendarDays className="h-4 w-4" />Set schedule</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

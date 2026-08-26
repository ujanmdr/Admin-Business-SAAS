import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SERVICES, Service, ServiceCategory, CATEGORY_META, ADDONS, RESOURCES } from "@/lib/service-data";
import { ServiceDrawer } from "@/components/ServiceDrawer";
import { NewServiceModal } from "@/components/NewServiceModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Sparkles, Clock, Users, MoreHorizontal, Eye, Edit, Copy, Tag,
  MapPin, Layers,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/services")({
  head: () => ({ meta: [{ title: "Services · BRG Suite" }] }),
  component: ServicesPage,
});

const ALL_CATS: ("All" | ServiceCategory)[] = [
  "All", "Hair", "Nails", "Skin", "Massage", "Bridal", "Makeup", "Dental", "Wellness", "Barber", "Academy",
];

const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

function ServicesPage() {
  const [open, setOpen] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof ALL_CATS)[number]>("All");

  const rows = useMemo(
    () =>
      SERVICES.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (q === "" ||
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.description.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, cat],
  );

  const catCounts: Record<string, number> = {};
  SERVICES.forEach((s) => (catCounts[s.category] = (catCounts[s.category] || 0) + 1));

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Services"
        description="Curate your service menu, add-ons and the resources behind each appointment."
        actions={
          <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />Add service
          </Button>
        }
      />

      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {(Object.keys(CATEGORY_META) as ServiceCategory[]).map((c) => {
          const meta = CATEGORY_META[c];
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "text-left rounded-2xl border bg-gradient-to-br p-4 transition hover:shadow-luxe",
                meta.tone,
                cat === c ? "border-foreground shadow-luxe" : "border-border",
              )}
            >
              <div className="text-2xl mb-2">{meta.emoji}</div>
              <div className="font-serif text-base">{c}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{catCounts[c] || 0} services</div>
            </button>
          );
        })}
      </div>

      <Tabs defaultValue="services">
        <TabsList className="bg-sand-soft mb-5">
          <TabsTrigger value="services" className="gap-2"><Sparkles className="h-3.5 w-3.5" />Services</TabsTrigger>
          <TabsTrigger value="addons" className="gap-2"><Layers className="h-3.5 w-3.5" />Add-ons</TabsTrigger>
          <TabsTrigger value="resources" className="gap-2"><MapPin className="h-3.5 w-3.5" />Resources</TabsTrigger>
        </TabsList>

        {/* SERVICES */}
        <TabsContent value="services" className="space-y-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services…"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "text-xs px-3 py-2 rounded-full border transition",
                    cat === c
                      ? "bg-primary text-primary-foreground border-primary shadow-luxe"
                      : "bg-card border-border text-foreground/75 hover:bg-sand-soft",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Service</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Duration</th>
                    <th className="text-left px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Staff</th>
                    <th className="text-left px-4 py-3">Resource</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const meta = CATEGORY_META[s.category];
                    return (
                      <tr key={s.id} className="border-t border-border hover:bg-sand-soft/30 cursor-pointer transition" onClick={() => setOpen(s)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-9 w-9 rounded-lg bg-gradient-to-br grid place-items-center text-base", meta.tone)}>
                              {meta.emoji}
                            </div>
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{s.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border">{s.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-foreground/80"><Clock className="h-3 w-3" />{s.duration}m</div>
                          <div className="text-[11px] text-muted-foreground">+{s.buffer}m buffer</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{fmt(s.price)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-foreground/80">
                            <Users className="h-3 w-3" />{s.staff[0]}{s.staff.length > 1 && ` +${s.staff.length - 1}`}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground/80">{s.resource}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-full border",
                            s.online
                              ? "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive"
                              : "bg-muted border-border text-muted-foreground")}>
                            {s.online ? "Online" : "In-store"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-card transition">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setOpen(s)}><Eye className="h-4 w-4" />View details</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem><Copy className="h-4 w-4" />Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose">Disable</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ADDONS */}
        <TabsContent value="addons" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl">Add-ons</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Boost ticket size with curated upgrades.</p>
            </div>
            <Button variant="outline" className="rounded-xl"><Plus className="h-4 w-4" />New add-on</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {ADDONS.map((a) => (
              <div key={a.name} className="rounded-2xl border border-border bg-card p-4 hover:shadow-luxe transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.category}</div>
                    <div className="font-serif text-lg mt-0.5">{a.name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-sand-soft border border-border flex items-center gap-1">
                    <Tag className="h-3 w-3" />{fmt(a.price)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.duration} mins</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* RESOURCES */}
        <TabsContent value="resources" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl">Rooms, chairs & resources</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Live availability and utilization across branches.</p>
            </div>
            <Button variant="outline" className="rounded-xl"><Plus className="h-4 w-4" />Add resource</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {RESOURCES.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-4 hover:shadow-luxe transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.type} · {r.branch}</div>
                    <div className="font-serif text-lg mt-0.5">{r.name}</div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-mist-soft border border-mist">Cap {r.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground">{r.bookingsToday} bookings today</span>
                  <span className="font-medium">{r.utilization}% used</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-sand-soft overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--sage)] to-[var(--olive)]"
                    style={{ width: r.utilization + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ServiceDrawer service={open} onClose={() => setOpen(null)} />
      <NewServiceModal open={adding} onOpenChange={setAdding} />
    </div>
  );
}

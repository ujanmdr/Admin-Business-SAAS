import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Service, CATEGORY_META } from "@/lib/service-data";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Users, MapPin, Tag, Sparkles, Edit, Globe2 } from "lucide-react";

const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export function ServiceDrawer({ service, onClose }: { service: Service | null; onClose: () => void }) {
  if (!service) return null;
  const meta = CATEGORY_META[service.category];

  return (
    <Sheet open={!!service} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background p-0">
        <div className={`bg-gradient-to-br ${meta.tone} px-6 pt-8 pb-6 border-b border-border`}>
          <SheetHeader>
            <SheetTitle className="sr-only">{service.name}</SheetTitle>
          </SheetHeader>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{service.category} · {meta.emoji}</div>
          <h2 className="font-serif text-3xl mt-1">{service.name}</h2>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{service.description}</p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl bg-card border border-border px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
              <div className="font-serif text-lg mt-0.5">{fmt(service.price)}</div>
            </div>
            <div className="rounded-xl bg-card border border-border px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</div>
              <div className="font-serif text-lg mt-0.5">{service.duration}m</div>
            </div>
            <div className="rounded-xl bg-card border border-border px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Buffer</div>
              <div className="font-serif text-lg mt-0.5">{service.buffer}m</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="h-3 w-3" />Staff who perform this</div>
            <div className="flex flex-wrap gap-1.5">
              {service.staff.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-sand-soft border border-border">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><MapPin className="h-3 w-3" />Required resource</div>
            <div className="text-sm">{service.resource}</div>
          </div>

          {service.addons && service.addons.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Add-ons</div>
              <div className="flex flex-wrap gap-1.5">
                {service.addons.map((a) => (
                  <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-rose-soft border border-rose">{a}</span>
                ))}
              </div>
            </div>
          )}

          {service.products && service.products.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Tag className="h-3 w-3" />Required products</div>
              <div className="flex flex-wrap gap-1.5">
                {service.products.map((p) => (
                  <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-mist-soft border border-mist">{p}</span>
                ))}
              </div>
            </div>
          )}

          {service.prep && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Preparation</div>
              <p className="text-sm text-foreground/80">{service.prep}</p>
            </div>
          )}

          {service.aftercare && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Aftercare</div>
              <p className="text-sm text-foreground/80">{service.aftercare}</p>
            </div>
          )}

          {service.cancellation && (
            <div className="rounded-xl border border-rose bg-rose-soft p-4">
              <div className="text-[10px] uppercase tracking-wider text-foreground/70 mb-1 flex items-center gap-1.5"><Clock className="h-3 w-3" />Cancellation policy</div>
              <p className="text-sm text-foreground/80">{service.cancellation}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                Visible on BRG marketplace
              </div>
              <Switch defaultChecked={service.marketplace} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Online booking enabled
              </div>
              <Switch defaultChecked={service.online} />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1"><Edit className="h-4 w-4" />Edit service</Button>
            <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">Book now</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

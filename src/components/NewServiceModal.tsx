import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ADDONS } from "@/lib/service-data";
import { ImageIcon, Upload } from "lucide-react";
import { useState } from "react";

const CATS = ["Hair", "Nails", "Skin", "Massage", "Bridal", "Makeup", "Dental", "Wellness", "Barber", "Academy"];

export function NewServiceModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [cat, setCat] = useState("Hair");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add a new service</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid md:grid-cols-[140px_1fr] gap-4">
            <div className="aspect-square rounded-xl border border-dashed border-border bg-sand-soft/40 grid place-items-center text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                <div className="text-[11px]">Service image</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">Service name</label>
                <Input className="mt-1" placeholder="e.g. Signature Balayage" />
              </div>
              <div>
                <label className="text-xs font-medium">Category</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {CATS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Description</label>
            <Textarea className="mt-1" rows={2} placeholder="Short description shown to customers" />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Duration (mins)</label>
              <Input className="mt-1" defaultValue="60" />
            </div>
            <div>
              <label className="text-xs font-medium">Price (NPR)</label>
              <Input className="mt-1" defaultValue="3500" />
            </div>
            <div>
              <label className="text-xs font-medium">Buffer (mins)</label>
              <Input className="mt-1" defaultValue="10" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Assigned staff</label>
              <Input className="mt-1" placeholder="Anisha, Pooja…" />
            </div>
            <div>
              <label className="text-xs font-medium">Room / resource</label>
              <Input className="mt-1" placeholder="Styling Chair 1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Add-ons</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-28 overflow-y-auto">
              {ADDONS.map((a) => (
                <span key={a.name} className="text-xs px-2.5 py-1 rounded-full bg-sand-soft border border-border">
                  {a.name} <span className="text-muted-foreground">· रु {a.price}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-muted-foreground">Customers can book this immediately.</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={() => onOpenChange(false)}>
            <Upload className="h-4 w-4" />Create service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

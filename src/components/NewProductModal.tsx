import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Package, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATS = ["Hair", "Skin", "Nail", "Makeup", "Spa", "Dental", "Consumables"];

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  threshold: number;
  supplier: string;
  costPrice: number;
  sellingPrice?: number;
  expiry: string;
  usedIn: string[];
  retail: boolean;
};

export function NewProductModal({ 
  open, 
  onOpenChange,
  onAddProduct
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  onAddProduct: (p: Product) => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "Hair",
    sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
    supplier: "",
    stock: "",
    threshold: "",
    expiry: "",
    costPrice: "",
    sellingPrice: "",
    retail: false,
    usedIn: "Signature Balayage, Haircut",
  });

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const newProduct: Product = {
      id: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name || "New Product",
      category: formData.category,
      sku: formData.sku,
      supplier: formData.supplier || "Internal Supplier",
      stock: Number(formData.stock) || 0,
      threshold: Number(formData.threshold) || 5,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: formData.retail ? Number(formData.sellingPrice) : undefined,
      expiry: formData.expiry || "—",
      usedIn: formData.usedIn.split(",").map(s => s.trim()).filter(Boolean),
      retail: formData.retail,
    };
    onAddProduct(newProduct);
    onOpenChange(false);
    
    // Reset state after a delay
    setTimeout(() => {
      setStep(1);
      setFormData({
        name: "", category: "Hair", sku: `SKU-${Math.floor(10000 + Math.random() * 90000)}`, 
        supplier: "", stock: "", threshold: "", expiry: "", costPrice: "", 
        sellingPrice: "", retail: false, usedIn: ""
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sand-soft grid place-items-center text-deep-olive">
              <Package className="h-4 w-4" />
            </div>
            Add Product
          </DialogTitle>
          <div className="flex items-center gap-2 mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            <span className={cn(step >= 1 ? "text-foreground" : "")}>1. Basics</span>
            <span className="opacity-50">/</span>
            <span className={cn(step >= 2 ? "text-foreground" : "")}>2. Tracking</span>
            <span className="opacity-50">/</span>
            <span className={cn(step >= 3 ? "text-foreground" : "")}>3. Pricing</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </DialogHeader>

        <div className="py-2 min-h-[280px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="text-xs font-medium">Product Name</label>
                <Input className="mt-1.5" placeholder="e.g. L'Oreal Professional Developer" value={formData.name} onChange={e => update("name", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium">Category</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {CATS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update("category", c)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition",
                        formData.category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-sand-soft"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">SKU (Auto-generated)</label>
                  <Input className="mt-1.5 font-mono text-xs text-muted-foreground" value={formData.sku} onChange={e => update("sku", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium">Supplier Name</label>
                  <Input className="mt-1.5" placeholder="e.g. Beauty Suppliers Inc." value={formData.supplier} onChange={e => update("supplier", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Initial Stock</label>
                  <Input type="number" className="mt-1.5" placeholder="0" value={formData.stock} onChange={e => update("stock", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium">Low Stock Threshold</label>
                  <Input type="number" className="mt-1.5" placeholder="5" value={formData.threshold} onChange={e => update("threshold", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Expiry Date (YYYY-MM)</label>
                <Input className="mt-1.5" placeholder="2025-12" value={formData.expiry} onChange={e => update("expiry", e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Leave blank if not applicable.</p>
              </div>
              <div>
                <label className="text-xs font-medium">Used in Services</label>
                <Input className="mt-1.5" placeholder="Comma separated, e.g. Balayage, Coloring" value={formData.usedIn} onChange={e => update("usedIn", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-xl border border-border bg-sand-soft/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Retail Product?</div>
                  <Switch checked={formData.retail} onCheckedChange={checked => update("retail", checked)} />
                </div>
                <p className="text-xs text-muted-foreground">Retail products can be sold directly to customers at POS.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Cost Price (NPR)</label>
                  <Input type="number" className="mt-1.5" placeholder="0.00" value={formData.costPrice} onChange={e => update("costPrice", e.target.value)} />
                </div>
                {formData.retail && (
                  <div className="animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-medium">Selling Price (NPR)</label>
                    <Input type="number" className="mt-1.5" placeholder="0.00" value={formData.sellingPrice} onChange={e => update("sellingPrice", e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t border-border pt-4 mt-2">
          {step > 1 ? (
            <Button variant="ghost" className="rounded-xl" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
          ) : (
            <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setStep(step + 1)}>
              Next Step<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button className="rounded-xl bg-primary text-primary-foreground shadow-luxe" onClick={handleSave}>
              <CheckCircle2 className="h-4 w-4 mr-2" />Complete & Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

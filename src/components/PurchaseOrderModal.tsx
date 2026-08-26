import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { ShoppingCart, ArrowRight, ArrowLeft, CheckCircle2, Download, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  supplier: string;
  costPrice: number;
};

export function PurchaseOrderModal({ 
  open, 
  onOpenChange,
  products
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  products: Product[];
}) {
  const [step, setStep] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const suppliers = useMemo(() => Array.from(new Set(products.map(p => p.supplier))), [products]);
  const supplierProducts = useMemo(() => products.filter(p => p.supplier === supplier), [products, supplier]);
  
  const totalCost = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const p = products.find(x => x.id === id);
      return total + (p ? p.costPrice * qty : 0);
    }, 0);
  }, [cart, products]);

  const updateCart = (id: string, qty: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  const autoFillLowStock = () => {
    const newCart = { ...cart };
    supplierProducts.forEach(p => {
      if (p.stock <= p.threshold) {
        // Recommend ordering enough to get back to threshold + a buffer (e.g. 10)
        newCart[p.id] = Math.max((p.threshold - p.stock) + 10, 10);
      }
    });
    setCart(newCart);
  };

  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

  const handleClose = () => {
    setStep(1);
    setSupplier("");
    setCart({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-hidden flex flex-col">
        {step < 3 && (
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sand-soft grid place-items-center text-deep-olive">
                <ShoppingCart className="h-4 w-4" />
              </div>
              Create Purchase Order
            </DialogTitle>
            <div className="flex items-center gap-2 mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              <span className={cn(step >= 1 ? "text-foreground" : "")}>1. Supplier</span>
              <span className="opacity-50">/</span>
              <span className={cn(step >= 2 ? "text-foreground" : "")}>2. Build Order</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
            </div>
          </DialogHeader>
        )}

        <div className="py-2 flex-1 min-h-0 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-xl bg-sand-soft/30 border border-border p-4 mb-4 text-sm text-foreground/80">
                Generate a new purchase order for a specific supplier. The PO number will be <strong>{poNumber}</strong>.
              </div>
              <div>
                <label className="text-xs font-medium">Select Supplier</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {suppliers.map(s => (
                    <button
                      key={s}
                      onClick={() => setSupplier(s)}
                      className={cn(
                        "text-sm p-4 rounded-xl border text-left transition",
                        supplier === s ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:bg-sand-soft/50"
                      )}
                    >
                      <div className="font-medium">{s}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {products.filter(p => p.supplier === s).length} products in catalog
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Ordering from {supplier}</div>
                  <div className="text-xs text-muted-foreground">{poNumber}</div>
                </div>
                <Button variant="outline" size="sm" onClick={autoFillLowStock} className="rounded-lg text-xs h-8">
                  <Sparkles className="h-3 w-3 mr-1.5 text-gold" />Auto-fill low stock
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto border border-border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-right px-4 py-3">Current Stock</th>
                      <th className="text-right px-4 py-3">Cost Price</th>
                      <th className="text-right px-4 py-3">Order Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierProducts.map((p) => {
                      const low = p.stock <= p.threshold;
                      return (
                        <tr key={p.id} className="border-t border-border hover:bg-sand-soft/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{p.sku}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn("font-medium", low ? "text-rose" : "")}>
                              {p.stock}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">(min {p.threshold})</span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{fmt(p.costPrice)}</td>
                          <td className="px-4 py-3 text-right">
                            <Input 
                              type="number" 
                              className="w-20 text-right h-8 ml-auto" 
                              placeholder="0"
                              value={cart[p.id] || ""}
                              onChange={(e) => updateCart(p.id, Number(e.target.value))}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-border bg-sand-soft p-4 flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
                <div className="font-serif text-2xl">{fmt(totalCost)}</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-full bg-[color-mix(in_oklab,var(--sage)_30%,white)] grid place-items-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-deep-olive" />
              </div>
              <div className="font-serif text-3xl mb-2 text-center">PO Generated Successfully</div>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
                Purchase Order <strong>{poNumber}</strong> has been logged in the system for <strong>{supplier}</strong>. Total value: {fmt(totalCost)}.
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl" onClick={handleClose}>
                  Close
                </Button>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>

        {step < 3 && (
          <DialogFooter className="border-t border-border pt-4 mt-2">
            {step === 2 && (
              <Button variant="ghost" className="rounded-xl mr-auto" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </Button>
            )}
            
            {step === 1 ? (
              <Button 
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90" 
                onClick={() => setStep(2)}
                disabled={!supplier}
              >
                Build Order<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                className="rounded-xl bg-primary text-primary-foreground shadow-luxe" 
                onClick={() => setStep(3)}
                disabled={Object.keys(cart).length === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />Generate PO
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

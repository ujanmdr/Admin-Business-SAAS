import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmt, Product } from "@/lib/finance-data";
import {
  getInventoryProducts, getInventoryMovements, adjustProductStock, addNewProduct, StockMovement
} from "@/lib/inventory-state";
import { getSuppliers, Supplier } from "@/lib/supplier-state";
import {
  Plus, Search, Boxes, AlertTriangle, Clock, TrendingUp, MoreHorizontal,
  Edit, Eye, ShoppingCart, Filter, ArrowUpDown, Truck, ArrowRight, CheckCircle2, ChevronRight,
  Layers, Sparkles, Trash2, PackagePlus
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/components/BusinessProvider";
import { BranchSelectorFallback } from "@/components/BranchSelectorFallback";
import { toast } from "sonner";

interface InventoryVariantRow {
  id: string;
  size: string;
  containerType: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  initialStock: number;
  threshold: number;
  retail: boolean;
}

export const Route = createFileRoute("/business/inventory")({
  head: () => ({ meta: [{ title: "Inventory · BRG Suite" }] }),
  component: InventoryPage,
});

const CATS = ["All", "Hair", "Skin", "Nail", "Makeup", "Spa", "Dental", "Consumables"];
const UNIT_OPTIONS = ["Bottle", "Tube", "Box", "Pack", "Piece", "Carton", "Can", "Packet"];

function isExpiringSoon(expiry: string) {
  if (!expiry || expiry === "—") return false;
  const [y, m] = expiry.split("-").map(Number);
  if (isNaN(y)) return false;
  const exp = new Date(y, (m || 1) - 1, 1);
  const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
  return diff <= 4 && diff > 0;
}

function InventoryPage() {
  const { branch } = useBusiness() as any;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  // Local state for products, movements, and suppliers
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [movementsList, setMovementsList] = useState<StockMovement[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  // Search/Filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  // "Add Product" Dialog Form State
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Product["category"]>("Hair");
  const [newSku, setNewSku] = useState("");
  const [newSupplierId, setNewSupplierId] = useState("");
  const [newUnitType, setNewUnitType] = useState("Bottle");
  const [newCost, setNewCost] = useState(0);
  const [newSelling, setNewSelling] = useState(0);
  const [newExpiry, setNewExpiry] = useState("—");
  const [newInitialStock, setNewInitialStock] = useState(0);
  const [newThreshold, setNewThreshold] = useState(5);
  const [newRetail, setNewRetail] = useState(true);

  // Variant generator state for Inventory page
  const [hasVariants, setHasVariants] = useState(false);
  const [variantRows, setVariantRows] = useState<InventoryVariantRow[]>([
    { id: "v-1", size: "250ml", containerType: "Bottle", sku: "", costPrice: 0, sellingPrice: 0, initialStock: 0, threshold: 5, retail: true },
    { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: "", costPrice: 0, sellingPrice: 0, initialStock: 0, threshold: 3, retail: false },
  ]);

  const resetAddProductForm = () => {
    const baseCode = `PRD-${Date.now().toString().slice(-4)}`;
    setNewName("");
    setNewCat("Hair");
    setNewSku(baseCode);
    setNewSupplierId(suppliersList[0]?.id || "");
    setNewUnitType("Bottle");
    setNewCost(0);
    setNewSelling(0);
    setNewExpiry("2027-12");
    setNewInitialStock(0);
    setNewThreshold(5);
    setNewRetail(true);
    setHasVariants(false);
    setVariantRows([
      { id: "v-1", size: "250ml", containerType: "Bottle", sku: `${baseCode}-250B`, costPrice: 0, sellingPrice: 0, initialStock: 0, threshold: 5, retail: true },
      { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: `${baseCode}-1000PB`, costPrice: 0, sellingPrice: 0, initialStock: 0, threshold: 3, retail: false },
    ]);
  };

  const addVariantRow = (size: string, containerType: string, defaultRetail: boolean = true) => {
    const cleanSize = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cleanCont = containerType.slice(0, 2).toUpperCase();
    const base = newSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
    const generatedSku = `${base}-${cleanSize || "VAR"}${cleanCont}`;
    setVariantRows((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        size,
        containerType,
        sku: generatedSku,
        costPrice: Number(newCost) || 0,
        sellingPrice: defaultRetail ? Number(newSelling) || 0 : 0,
        initialStock: Number(newInitialStock) || 0,
        threshold: 5,
        retail: defaultRetail,
      },
    ]);
  };

  const updateVariantRow = (id: string, field: keyof InventoryVariantRow, value: any) => {
    setVariantRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeVariantRow = (id: string) => {
    if (variantRows.length <= 1) {
      toast.error("At least one variant is required.");
      return;
    }
    setVariantRows((prev) => prev.filter((row) => row.id !== id));
  };

  // "Adjust Stock" Dialog Form State
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState("");
  const [adjType, setAdjType] = useState<StockMovement["movementType"]>("Adjustment (Increase)");
  const [adjQty, setAdjQty] = useState(1);
  const [adjNote, setAdjNote] = useState("");

  const refreshState = () => {
    setProductsList(getInventoryProducts());
    setMovementsList(getInventoryMovements());
    setSuppliersList(getSuppliers());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const rows = useMemo(() => {
    return productsList.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
    );
  }, [productsList, q, cat]);

  const filteredMovements = useMemo(() => {
    return movementsList.filter(
      (m) =>
        q === "" ||
        m.productName.toLowerCase().includes(q.toLowerCase()) ||
        m.sku.toLowerCase().includes(q.toLowerCase()) ||
        m.movementType.toLowerCase().includes(q.toLowerCase()),
    );
  }, [movementsList, q]);

  if (branch === "All Branches (HQ)") {
    return <BranchSelectorFallback pageName="Inventory" />;
  }

  // KPIs
  const lowStock = productsList.filter((p) => p.stock <= p.threshold && p.stock > 0);
  const outOfStock = productsList.filter((p) => p.stock === 0);
  const expiring = productsList.filter((p) => isExpiringSoon(p.expiry));
  const reorderNeeded = productsList.filter((p) => p.stock <= p.threshold);

  const kpis = [
    { label: "Total SKUs", value: String(productsList.length), icon: Boxes, tone: "bg-sand-soft" },
    { label: "Low / Out of Stock", value: String(reorderNeeded.length), icon: AlertTriangle, tone: reorderNeeded.length > 0 ? "bg-rose-soft text-rose" : "bg-sand-soft" },
    { label: "Expiring Soon", value: String(expiring.length), icon: Clock, tone: "bg-[color-mix(in_oklab,var(--gold)_22%,white)]" },
    { label: "Inventory Value", value: fmt(productsList.reduce((s, p) => s + p.stock * p.costPrice, 0)), icon: TrendingUp, tone: "bg-mist-soft" },
  ];

  // Submit Handler: Add Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please fill in Product Name.");
      return;
    }

    const matchedSup = suppliersList.find((s) => s.id === newSupplierId);
    const supplierDisplayName = matchedSup ? matchedSup.name : "Direct Import";

    if (hasVariants) {
      if (variantRows.length === 0) {
        toast.error("Please add at least one variant or disable variant mode.");
        return;
      }

      for (const v of variantRows) {
        if (!v.size.trim()) {
          toast.error("Each variant must have a specified size (e.g. 250ml, 1000ml).");
          return;
        }
      }

      const basePrefix = newSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
      for (let i = 0; i < variantRows.length; i++) {
        const v = variantRows[i];
        const vSku = v.sku.trim() || `${basePrefix}-${v.size.replace(/[^a-zA-Z0-9]/g, "")}-${i + 1}`;
        const compoundName = `${newName.trim()} · ${v.size.trim()} ${v.containerType}`;

        addNewProduct(
          {
            name: compoundName,
            category: newCat,
            sku: vSku,
            supplier: supplierDisplayName,
            supplierId: newSupplierId || undefined,
            unitType: v.containerType || "Bottle",
            size: v.size.trim(),
            containerType: v.containerType,
            costPrice: Number(v.costPrice) || 0,
            sellingPrice: v.retail ? Number(v.sellingPrice) || 0 : 0,
            expiry: newExpiry || "2027-12",
            threshold: Number(v.threshold) || 5,
            retail: Boolean(v.retail),
            usedIn: ["Salon services"],
          },
          Number(v.initialStock) || 0
        );
      }

      toast.success(`Registered ${variantRows.length} variants for "${newName.trim()}"!`);
      setAddOpen(false);
      refreshState();
      resetAddProductForm();
      return;
    }

    if (!newSku.trim()) {
      toast.error("Please provide an SKU code.");
      return;
    }

    addNewProduct(
      {
        name: newName.trim(),
        category: newCat,
        sku: newSku.trim(),
        supplier: supplierDisplayName,
        supplierId: newSupplierId || undefined,
        unitType: newUnitType,
        size: undefined,
        containerType: newUnitType,
        costPrice: Number(newCost),
        sellingPrice: Number(newSelling),
        expiry: newExpiry || "—",
        threshold: Number(newThreshold),
        retail: newRetail,
        usedIn: ["Salon services"],
      },
      Number(newInitialStock)
    );

    toast.success(`Product "${newName}" added successfully.`);
    setAddOpen(false);
    resetAddProductForm();
    refreshState();
  };

  // Submit Handler: Adjust Stock
  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProductId) {
      toast.error("Please select a product.");
      return;
    }
    if (adjQty <= 0) {
      toast.error("Please specify a valid quantity change.");
      return;
    }

    const res = adjustProductStock(adjProductId, adjType, adjQty, adjNote);
    if (!res.success) {
      toast.error(res.error || "Failed to adjust stock.");
      return;
    }

    toast.success("Stock level updated successfully.");
    setAdjustOpen(false);
    
    // Reset fields
    setAdjProductId("");
    setAdjQty(1);
    setAdjNote("");
    
    refreshState();
  };

  const handleQuickReorder = (p: Product) => {
    const matchedSup = suppliersList.find(
      (s) => s.id === p.supplierId || s.name.toLowerCase() === p.supplier.toLowerCase()
    );
    navigate({
      to: "/business/purchases",
      search: {
        reorderProductId: p.id,
        supplierId: matchedSup?.id || p.supplierId || "",
      } as any,
    });
  };

  const handleNavigateSupplier = (p: Product) => {
    const matchedSup = suppliersList.find(
      (s) => s.id === p.supplierId || s.name.toLowerCase() === p.supplier.toLowerCase()
    );
    if (matchedSup) {
      navigate({
        to: "/business/suppliers",
        search: { supplierId: matchedSup.id } as any,
      });
    } else {
      navigate({ to: "/business/suppliers" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Inventory Manager"
        description="Monitor product stock levels, packaging units, reorder thresholds, and incoming wholesale supplier restocks."
        actions={
          <div className="flex flex-wrap gap-2">
            {/* Direct Link to Purchases Log */}
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/business/purchases" })}
              className="rounded-xl border-border"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Purchases Log
            </Button>

            {/* Direct Link to Suppliers */}
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/business/suppliers" })}
              className="rounded-xl border-border"
            >
              <Truck className="h-4 w-4 mr-1.5" />
              Suppliers
            </Button>

            {/* Adjust Stock Button Dialog */}
            <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl border-border">
                  <ArrowUpDown className="h-4 w-4 mr-1.5" />Adjust Stock
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Adjust Stock Level</DialogTitle>
                  <DialogDescription>Modify stock counts and log the movement history.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdjustStockSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Select Product</label>
                    <Select value={adjProductId} onValueChange={setAdjProductId}>
                      <SelectTrigger className="border-border bg-background text-sm">
                        <SelectValue placeholder="Choose product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productsList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — Stock: {p.stock} {p.unitType ? `(${p.unitType})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Adjustment Type</label>
                      <Select value={adjType} onValueChange={(v: any) => setAdjType(v)}>
                        <SelectTrigger className="border-border bg-background text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Adjustment (Increase)">Adjustment (Increase)</SelectItem>
                          <SelectItem value="Adjustment (Decrease)">Adjustment (Decrease)</SelectItem>
                          <SelectItem value="Restock">Restock</SelectItem>
                          <SelectItem value="Damaged">Damaged / Write-off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Quantity Change</label>
                      <Input
                        type="number"
                        min={1}
                        value={adjQty}
                        onChange={(e) => setAdjQty(Number(e.target.value))}
                        className="border-border bg-background text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Reason / Note</label>
                    <Input
                      placeholder="e.g. Broken bottle, Monthly audit count"
                      value={adjNote}
                      onChange={(e) => setAdjNote(e.target.value)}
                      className="border-border bg-background text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg">
                    Confirm Adjustment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Product Button Dialog with Variant Generator */}
            <Dialog
              open={addOpen}
              onOpenChange={(open) => {
                setAddOpen(open);
                if (open) resetAddProductForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-1.5" />Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className={cn("max-h-[92vh] overflow-y-auto transition-all duration-200", hasVariants ? "max-w-3xl" : "max-w-lg")}>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="font-serif text-xl flex items-center gap-2">
                      <PackagePlus className="h-5 w-5 text-primary" />
                      Register New Product
                    </DialogTitle>
                    <div className="flex items-center gap-2 pr-6">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary" /> Multiple Sizes / Types
                      </span>
                      <Switch
                        checked={hasVariants}
                        onCheckedChange={(checked) => {
                          setHasVariants(checked);
                          if (checked && variantRows.length === 0) {
                            const baseCode = newSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
                            setVariantRows([
                              { id: "v-1", size: "250ml", containerType: "Bottle", sku: `${baseCode}-250B`, costPrice: newCost || 0, sellingPrice: newSelling || 0, initialStock: newInitialStock || 0, threshold: 5, retail: true },
                              { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: `${baseCode}-1000PB`, costPrice: (newCost ? newCost * 3 : 0), sellingPrice: 0, initialStock: 0, threshold: 3, retail: false },
                            ]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogDescription>
                    {hasVariants
                      ? "Define a base product line and generate all of its sizes, container types (bottles, tubes, jars), SKUs, and retail vs backbar pricing."
                      : "Add a new SKU definition to the inventory database."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddProductSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-5" : "sm:col-span-12")}>
                      <label className="text-xs font-semibold text-muted-foreground">
                        {hasVariants ? "Base Product Brand & Name *" : "Product Name *"}
                      </label>
                      <Input
                        placeholder={hasVariants ? "e.g. Olaplex No. 4 Shampoo" : "e.g. Olaplex No. 4"}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border-border bg-background text-sm"
                        required
                        autoFocus
                      />
                    </div>

                    <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-3" : "sm:col-span-6")}>
                      <label className="text-xs font-semibold text-muted-foreground">Category</label>
                      <Select value={newCat} onValueChange={(v: any) => setNewCat(v)}>
                        <SelectTrigger className="border-border bg-background text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATS.slice(1).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-4" : "sm:col-span-6")}>
                      <label className="text-xs font-semibold text-muted-foreground">Supplier</label>
                      <Select value={newSupplierId} onValueChange={setNewSupplierId}>
                        <SelectTrigger className="border-border bg-background text-sm h-9">
                          <SelectValue placeholder="Pick supplier..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliersList.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {!hasVariants && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">SKU Code *</label>
                          <Input
                            placeholder="e.g. OLP-N4-250"
                            value={newSku}
                            onChange={(e) => setNewSku(e.target.value)}
                            className="border-border bg-background text-sm font-mono"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Unit of Measure</label>
                          <Select value={newUnitType} onValueChange={setNewUnitType}>
                            <SelectTrigger className="border-border bg-background text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OPTIONS.map((u) => (
                                <SelectItem key={u} value={u}>{u}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Cost Price</label>
                          <Input
                            type="number"
                            min="0"
                            value={newCost || ""}
                            onChange={(e) => setNewCost(Number(e.target.value))}
                            className="border-border bg-background text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Selling Price</label>
                          <Input
                            type="number"
                            min="0"
                            value={newSelling || ""}
                            onChange={(e) => setNewSelling(Number(e.target.value))}
                            className="border-border bg-background text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Initial Stock</label>
                          <Input
                            type="number"
                            min="0"
                            value={newInitialStock || ""}
                            onChange={(e) => setNewInitialStock(Number(e.target.value))}
                            className="border-border bg-background text-sm font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Low Stock Alert</label>
                          <Input
                            type="number"
                            min="0"
                            value={newThreshold || ""}
                            onChange={(e) => setNewThreshold(Number(e.target.value))}
                            className="border-border bg-background text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Expiry (YYYY-MM)</label>
                          <Input
                            placeholder="2027-08"
                            value={newExpiry}
                            onChange={(e) => setNewExpiry(e.target.value)}
                            className="border-border bg-background text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                          <div className="text-sm font-medium">Retail item</div>
                          <div className="text-xs text-muted-foreground">Available for front desk checkout sales</div>
                        </div>
                        <Switch checked={newRetail} onCheckedChange={setNewRetail} />
                      </div>
                    </>
                  )}

                  {hasVariants && (
                    <div className="space-y-3 pt-1">
                      {/* Presets */}
                      <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                          <Sparkles className="h-3.5 w-3.5" /> Quick Presets:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => addVariantRow("250ml", "Bottle", true)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-primary/30 bg-background hover:bg-primary/10 text-foreground transition-colors font-medium cursor-pointer"
                          >
                            + 250ml Bottle (Retail)
                          </button>
                          <button
                            type="button"
                            onClick={() => addVariantRow("1000ml (1L)", "Pump Bottle", false)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-primary/30 bg-background hover:bg-primary/10 text-foreground transition-colors font-medium cursor-pointer"
                          >
                            + 1000ml Backbar (Pump)
                          </button>
                          <button
                            type="button"
                            onClick={() => addVariantRow("500ml", "Bottle", true)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-primary/30 bg-background hover:bg-primary/10 text-foreground transition-colors font-medium cursor-pointer"
                          >
                            + 500ml Bottle
                          </button>
                          <button
                            type="button"
                            onClick={() => addVariantRow("60ml", "Tube", true)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-primary/30 bg-background hover:bg-primary/10 text-foreground transition-colors font-medium cursor-pointer"
                          >
                            + 60ml Tube
                          </button>
                          <button
                            type="button"
                            onClick={() => addVariantRow("100ml", "Jar", true)}
                            className="text-[11px] px-2 py-0.5 rounded-lg border border-primary/30 bg-background hover:bg-primary/10 text-foreground transition-colors font-medium cursor-pointer"
                          >
                            + 100ml Jar
                          </button>
                          <button
                            type="button"
                            onClick={() => addVariantRow("Custom", "Bottle", true)}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Add Row
                          </button>
                        </div>
                      </div>

                      {/* Variant Matrix Table */}
                      <div className="border border-border rounded-xl overflow-hidden shadow-xs">
                        <div className="max-h-[280px] overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-xs z-10 border-b border-border">
                              <tr>
                                <th className="p-2 pl-3 font-semibold">Size / Volume</th>
                                <th className="p-2 font-semibold">Container Type</th>
                                <th className="p-2 font-semibold">SKU Code</th>
                                <th className="p-2 font-semibold w-20">Cost (रु)</th>
                                <th className="p-2 font-semibold w-20">Retail (रु)</th>
                                <th className="p-2 font-semibold w-16 text-center">Stock</th>
                                <th className="p-2 font-semibold text-center w-24">Type</th>
                                <th className="p-2 font-semibold w-14 text-center">Alert</th>
                                <th className="p-2 pr-3 w-8 text-center"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-background">
                              {variantRows.map((v) => (
                                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="p-2 pl-3">
                                    <Input
                                      value={v.size}
                                      onChange={(e) => updateVariantRow(v.id, "size", e.target.value)}
                                      placeholder="e.g. 250ml"
                                      className="h-8 text-xs font-medium"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Select
                                      value={v.containerType}
                                      onValueChange={(val) => updateVariantRow(v.id, "containerType", val)}
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-background">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Bottle">Bottle</SelectItem>
                                        <SelectItem value="Pump Bottle">Pump Bottle</SelectItem>
                                        <SelectItem value="Tube">Tube</SelectItem>
                                        <SelectItem value="Jar">Jar</SelectItem>
                                        <SelectItem value="Box">Box</SelectItem>
                                        <SelectItem value="Can">Can</SelectItem>
                                        <SelectItem value="Pack">Pack</SelectItem>
                                        <SelectItem value="Packet">Packet</SelectItem>
                                        <SelectItem value="Piece">Piece</SelectItem>
                                        <SelectItem value="Refill">Refill</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      value={v.sku}
                                      onChange={(e) => updateVariantRow(v.id, "sku", e.target.value)}
                                      placeholder="e.g. OLP-250B"
                                      className="h-8 text-xs font-mono"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={v.costPrice || ""}
                                      onChange={(e) => updateVariantRow(v.id, "costPrice", Number(e.target.value))}
                                      placeholder="Cost"
                                      className="h-8 text-xs"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      disabled={!v.retail}
                                      value={v.retail ? (v.sellingPrice || "") : 0}
                                      onChange={(e) => updateVariantRow(v.id, "sellingPrice", Number(e.target.value))}
                                      placeholder={v.retail ? "Price" : "Backbar"}
                                      className={cn("h-8 text-xs", !v.retail && "opacity-50 bg-muted/40 cursor-not-allowed")}
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={v.initialStock || ""}
                                      onChange={(e) => updateVariantRow(v.id, "initialStock", Number(e.target.value))}
                                      placeholder="0"
                                      className="h-8 text-xs text-center px-1 font-semibold"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => updateVariantRow(v.id, "retail", !v.retail)}
                                      className={cn(
                                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all inline-flex items-center gap-1 cursor-pointer",
                                        v.retail
                                          ? "bg-[color-mix(in_oklab,var(--sage)_20%,white)] border-sage text-deep-olive"
                                          : "bg-muted text-muted-foreground border-border"
                                      )}
                                    >
                                      {v.retail ? "Retail" : "Backbar"}
                                    </button>
                                  </td>
                                  <td className="p-2 text-center">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={v.threshold || 5}
                                      onChange={(e) => updateVariantRow(v.id, "threshold", Number(e.target.value))}
                                      className="h-8 text-xs text-center px-1"
                                    />
                                  </td>
                                  <td className="p-2 pr-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => removeVariantRow(v.id)}
                                      disabled={variantRows.length <= 1}
                                      className="text-muted-foreground hover:text-rose p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      title="Remove variant"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddOpen(false)}
                      className="rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
                    >
                      {hasVariants ? `Save ${variantRows.length} Variants to Catalog` : "Add to Catalog"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Overview stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", k.tone)}>
                <Icon className="h-4 w-4 text-deep-olive" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="font-serif text-2xl mt-1 text-foreground">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* SMART REORDER SUGGESTIONS BANNER (If items are low/out of stock) */}
      {reorderNeeded.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 brg-card-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3 border-b border-amber-200/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <h3 className="font-serif text-base font-bold text-amber-950">
                  Restock Recommendations ({reorderNeeded.length} items below minimum)
                </h3>
              </div>
              <p className="text-xs text-amber-800/80 mt-0.5">
                These products are below safe salon thresholds. Click Reorder to instantly generate a vendor purchase order.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-amber-900 text-amber-50 hover:bg-amber-950 rounded-xl text-xs h-8"
              onClick={() => {
                const first = reorderNeeded[0];
                handleQuickReorder(first);
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Start Bulk Reorder
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {reorderNeeded.map((p) => {
              const deficit = Math.max(p.threshold * 2 - p.stock, 5);
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-amber-200/80 bg-background/90 p-3 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-foreground truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="text-rose font-medium">Stock: {p.stock}</span>
                      <span>·</span>
                      <span>Min: {p.threshold}</span>
                      <span>·</span>
                      <span className="truncate">{p.supplier}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                      +{deficit} {p.unitType || "units"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 rounded-lg text-xs border-amber-300 hover:bg-amber-100/60 text-amber-950"
                      onClick={() => handleQuickReorder(p)}
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-sand-soft h-11 p-1 rounded-xl">
          <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-5">
            Products Catalog
          </TabsTrigger>
          <TabsTrigger value="movements" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-5">
            Stock Movements Log
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTS LIST TAB */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products by name or SKU…"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "text-xs px-3 py-2 rounded-full border transition",
                    cat === c ? "bg-primary text-primary-foreground border-primary shadow-luxe" : "bg-card border-border hover:bg-sand-soft",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden brg-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">SKU</th>
                    <th className="text-left px-4 py-3">Unit</th>
                    <th className="text-left px-4 py-3">Current Stock</th>
                    <th className="text-left px-4 py-3">Supplier</th>
                    <th className="text-left px-4 py-3">Cost</th>
                    <th className="text-left px-4 py-3">Selling</th>
                    <th className="text-left px-4 py-3">Expiry</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-muted-foreground text-sm">
                        No products found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    rows.map((p) => {
                      const low = p.stock <= p.threshold;
                      const out = p.stock === 0;
                      return (
                        <tr key={p.id} className="border-t border-border hover:bg-sand-soft/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.category}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                          <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                            {p.unitType || "Bottle"}
                          </td>
                          <td className="px-4 py-3">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 text-sm font-medium",
                              out ? "text-rose" : low ? "text-amber-600" : "text-foreground"
                            )}>
                              {p.stock}
                              {out && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-soft border border-rose">Out</span>}
                              {!out && low && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">Low</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground">min {p.threshold}</div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleNavigateSupplier(p)}
                              className="font-medium text-foreground hover:underline text-left inline-flex items-center gap-1 group"
                              title="Click to view supplier profile and purchase history"
                            >
                              <span>{p.supplier}</span>
                              <Truck className="h-3 w-3 text-muted-foreground group-hover:text-primary transition" />
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono">{fmt(p.costPrice)}</td>
                          <td className="px-4 py-3 font-mono">{p.sellingPrice ? fmt(p.sellingPrice) : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-mono", isExpiringSoon(p.expiry) && "text-gold font-medium")}>{p.expiry}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "text-[11px] px-2 py-0.5 rounded-full border",
                              p.retail
                                ? "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive"
                                : "bg-muted border-border text-muted-foreground",
                            )}>{p.retail ? "Retail" : "Internal"}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-card transition">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleQuickReorder(p)}>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Reorder / Purchase
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNavigateSupplier(p)}>
                                  <Truck className="h-4 w-4 mr-2" />
                                  View Supplier Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setAdjProductId(p.id);
                                  setAdjustOpen(true);
                                }}>
                                  <ArrowUpDown className="h-4 w-4 mr-2" />
                                  Manual Adjust Stock
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* STOCK MOVEMENTS AUDIT LOG TAB */}
        <TabsContent value="movements" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter movements by product, SKU, or type…"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden brg-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Movement Type</th>
                    <th className="text-left px-4 py-3">Quantity Change</th>
                    <th className="text-left px-4 py-3">Current Stock</th>
                    <th className="text-left px-4 py-3">Note / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        No stock movements logged.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => {
                      const isDecrease = m.quantityChange < 0;
                      return (
                        <tr key={m.id} className="border-t border-border hover:bg-sand-soft/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{m.date}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{m.productName}</div>
                            <div className="text-xs font-mono text-muted-foreground">{m.sku}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded border",
                              m.movementType === "Damaged" && "bg-red-50 text-red-600 border-red-100",
                              m.movementType === "Initial Stock" && "bg-slate-50 text-slate-600 border-slate-100",
                              m.movementType === "Restock" && "bg-green-50 text-green-600 border-green-100 font-semibold",
                              m.movementType.includes("Increase") && "bg-green-50 text-green-600 border-green-100",
                              m.movementType.includes("Decrease") && "bg-amber-50 text-amber-600 border-amber-100",
                            )}>
                              {m.movementType}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold font-mono text-sm">
                            <span className={isDecrease ? "text-rose" : "text-green-600"}>
                              {isDecrease ? "" : "+"}
                              {m.quantityChange}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-foreground">{m.currentStock}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{m.note}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart, Plus, Search, Filter, Truck, ArrowUpDown, Calendar,
  CreditCard, CheckCircle2, Clock, AlertCircle, FileText, Trash2, Eye, ChevronRight
} from "lucide-react";
import {
  getPurchases, addPurchase, markPurchasePaid, Purchase, PurchaseItem,
  PurchaseType, PurchasePaymentStatus, UnitType
} from "@/lib/purchase-state";
import { getSuppliers, Supplier } from "@/lib/supplier-state";
import { getInventoryProducts } from "@/lib/inventory-state";
import { fmt, Product } from "@/lib/finance-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/business/purchases")({
  head: () => ({ meta: [{ title: "Purchases · BRG Suite" }] }),
  component: PurchasesPage,
});

const PURCHASE_TYPES: PurchaseType[] = [
  "Regular Restock",
  "Emergency Buy",
  "New Product Trial",
  "Bulk Order",
];

const UNIT_TYPES: UnitType[] = [
  "Bottle",
  "Box",
  "Carton",
  "Piece",
  "Tube",
  "Can",
  "Packet",
  "Pack",
];

function PurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Filter
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [supplierFilter, setSupplierFilter] = useState<string>("All");

  // New Purchase Dialog state
  const [openNewPurchase, setOpenNewPurchase] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("Regular Restock");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<Purchase["paymentMethod"]>("Credit");
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>("Credit (Unpaid)");
  const [amountPaid, setAmountPaid] = useState(0);
  const [creditDueDate, setCreditDueDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [updateStock, setUpdateStock] = useState(true);

  // Line items state in modal
  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      category: string;
      qty: number;
      unitType: string;
      packSize: number;
      unitCost: number;
    }>
  >([
    {
      productId: "",
      productName: "",
      sku: "",
      category: "",
      qty: 1,
      unitType: "Bottle",
      packSize: 1,
      unitCost: 0,
    },
  ]);

  // View Invoice Detail Modal
  const [viewInvoice, setViewInvoice] = useState<Purchase | null>(null);

  const refreshData = () => {
    setPurchases(getPurchases());
    setSuppliers(getSuppliers());
    setProducts(getInventoryProducts());
  };

  useEffect(() => {
    refreshData();

    // Check query params for quick pre-fill from Inventory or Supplier page
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const prefillSupplier = params.get("supplierId");
      const prefillProduct = params.get("reorderProductId");

      if (prefillSupplier || prefillProduct) {
        setOpenNewPurchase(true);
        if (prefillSupplier) {
          setSelectedSupplierId(prefillSupplier);
          const sup = getSuppliers().find((s) => s.id === prefillSupplier);
          if (sup && sup.paymentMethod === "Credit") {
            setPaymentMethod("Credit");
            setPaymentStatus("Credit (Unpaid)");
            // Calculate due date
            const due = new Date();
            due.setDate(due.getDate() + (sup.creditDays || 30));
            setCreditDueDate(due.toISOString().split("T")[0]);
          }
        }
        if (prefillProduct) {
          const prod = getInventoryProducts().find((p) => p.id === prefillProduct);
          if (prod) {
            const defSupplier = getSuppliers().find(
              (s) => s.id === prod.supplierId || s.name.toLowerCase() === prod.supplier.toLowerCase()
            );
            if (defSupplier && !prefillSupplier) {
              setSelectedSupplierId(defSupplier.id);
            }
            const deficit = Math.max(prod.threshold * 2 - prod.stock, 5);
            setItems([
              {
                productId: prod.id,
                productName: prod.name,
                sku: prod.sku,
                category: prod.category,
                qty: deficit,
                unitType: prod.unitType || "Bottle",
                packSize: 1,
                unitCost: prod.costPrice,
              },
            ]);
          }
        }
      }
    }
  }, []);

  // Filtered Purchases list
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchQ =
        q === "" ||
        p.id.toLowerCase().includes(q.toLowerCase()) ||
        p.invoiceRef.toLowerCase().includes(q.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(q.toLowerCase()) ||
        p.items.some((i) => i.productName.toLowerCase().includes(q.toLowerCase()));

      const matchType = typeFilter === "All" || p.purchaseType === typeFilter;
      const matchStatus = statusFilter === "All" || p.paymentStatus === statusFilter;
      const matchSupplier = supplierFilter === "All" || p.supplierId === supplierFilter;

      return matchQ && matchType && matchStatus && matchSupplier;
    });
  }, [purchases, q, typeFilter, statusFilter, supplierFilter]);

  // Overall KPIs
  const totalSpend = useMemo(() => purchases.reduce((sum, p) => sum + p.totalAmount, 0), [purchases]);
  const unpaidCredit = useMemo(
    () =>
      purchases
        .filter((p) => p.paymentStatus !== "Paid")
        .reduce((sum, p) => sum + (p.totalAmount - (p.amountPaid || 0)), 0),
    [purchases]
  );
  const avgOrder = purchases.length ? Math.round(totalSpend / purchases.length) : 0;

  // Calculate Modal Totals
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.qty || 0) * (item.unitCost || 0), 0);
  }, [items]);

  const grandTotal = Math.max(0, subtotal - discount);

  // When supplier is selected in modal, auto-set default payment terms
  const handleSupplierChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup) {
      if (sup.paymentMethod === "Credit") {
        setPaymentMethod("Credit");
        setPaymentStatus("Credit (Unpaid)");
        const due = new Date();
        due.setDate(due.getDate() + (sup.creditDays || 30));
        setCreditDueDate(due.toISOString().split("T")[0]);
      } else {
        setPaymentMethod(sup.paymentMethod);
        setPaymentStatus("Paid");
        setAmountPaid(grandTotal);
        setCreditDueDate("");
      }
    }
  };

  // Line item handlers
  const handleItemProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitType: prod.unitType || "Bottle",
      unitCost: prod.costPrice,
    };
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        sku: "",
        category: "",
        qty: 1,
        unitType: "Bottle",
        packSize: 1,
        unitCost: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("A purchase order must contain at least one item.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Submit New Purchase
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error("Please choose a supplier.");
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const supplierName = sup ? sup.name : "Vendor";

    // Validate items
    const validItems: PurchaseItem[] = [];
    for (const it of items) {
      if (!it.productId) {
        toast.error("Please pick a product for all rows or delete empty rows.");
        return;
      }
      if (it.qty <= 0) {
        toast.error("Quantities must be at least 1.");
        return;
      }
      const packSize = Number(it.packSize) || 1;
      const totalUnits = it.qty * packSize;
      const lineTotal = it.qty * it.unitCost;
      validItems.push({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        category: it.category,
        qty: it.qty,
        unitType: it.unitType,
        packSize,
        totalUnits,
        unitCost: it.unitCost,
        lineTotal,
      });
    }

    const newPO = addPurchase(
      {
        date: purchaseDate,
        supplierId: selectedSupplierId,
        supplierName,
        purchaseType,
        items: validItems,
        subtotal,
        discount: Number(discount) || 0,
        totalAmount: grandTotal,
        paymentStatus,
        paymentMethod,
        amountPaid: paymentStatus === "Paid" ? grandTotal : Number(amountPaid) || 0,
        creditDueDate: paymentStatus !== "Paid" ? creditDueDate : "",
        invoiceRef: invoiceRef.trim(),
        notes: notes.trim(),
        branch: "Jhamsikhel",
        recordedBy: "Receptionist / Store",
      },
      updateStock
    );

    toast.success(
      `Purchase ${newPO.id} recorded successfully! ${
        updateStock ? "Inventory stock updated." : ""
      }`
    );
    setOpenNewPurchase(false);

    // Reset Form
    setSelectedSupplierId("");
    setInvoiceRef("");
    setDiscount(0);
    setAmountPaid(0);
    setNotes("");
    setItems([
      {
        productId: "",
        productName: "",
        sku: "",
        category: "",
        qty: 1,
        unitType: "Bottle",
        packSize: 1,
        unitCost: 0,
      },
    ]);

    refreshData();
  };

  const handleSettleCredit = (poId: string) => {
    markPurchasePaid(poId);
    toast.success("Bill marked as Paid in full.");
    refreshData();
    if (viewInvoice && viewInvoice.id === poId) {
      setViewInvoice({ ...viewInvoice, paymentStatus: "Paid", amountPaid: viewInvoice.totalAmount });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Purchases & Restock Orders"
        description="Log vendor procurement bills, monitor supplier credit payables, and automatically sync incoming stock into inventory."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/business/suppliers" })}
              className="rounded-xl border-border"
            >
              <Truck className="h-4 w-4 mr-2" />
              Suppliers Directory
            </Button>
            <Dialog open={openNewPurchase} onOpenChange={setOpenNewPurchase}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl font-bold">
                    Log Wholesale Purchase
                  </DialogTitle>
                  <DialogDescription>
                    Enter wholesale invoice items, payment terms, and automatically update warehouse stock counts.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitPurchase} className="space-y-5 pt-2">
                  {/* Top Bar: Supplier, Purchase Type, Date, Invoice Ref */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-sand-soft/50 p-3.5 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted-foreground">Supplier *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenNewPurchase(false);
                            navigate({ to: "/business/suppliers" });
                          }}
                          className="text-[10px] text-primary hover:underline font-medium"
                        >
                          + New Vendor
                        </button>
                      </div>
                      <Select value={selectedSupplierId} onValueChange={handleSupplierChange}>
                        <SelectTrigger className="bg-background text-sm">
                          <SelectValue placeholder="Select supplier..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.paymentMethod})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Purchase Category</label>
                      <Select
                        value={purchaseType}
                        onValueChange={(v: any) => setPurchaseType(v)}
                      >
                        <SelectTrigger className="bg-background text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PURCHASE_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Invoice Date</label>
                      <Input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="bg-background text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Vendor Bill / Ref #</label>
                      <Input
                        placeholder="e.g. INV-8821"
                        value={invoiceRef}
                        onChange={(e) => setInvoiceRef(e.target.value)}
                        className="bg-background text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Line Items Entry Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                        Purchased Items ({items.length})
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                        className="h-7 text-xs rounded-lg"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Line Item
                      </Button>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="text-left px-3 py-2">Product Item *</th>
                            <th className="text-left px-3 py-2 w-28">Packaging Unit</th>
                            <th className="text-left px-3 py-2 w-20">Units / Pack</th>
                            <th className="text-left px-3 py-2 w-20">Qty Bought</th>
                            <th className="text-left px-3 py-2 w-28">Pack Cost ({fmt(1).slice(0, 1)})</th>
                            <th className="text-right px-3 py-2 w-24">Total</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {items.map((item, index) => {
                            const totalStockUnits = (item.qty || 0) * (item.packSize || 1);
                            const lineTotal = (item.qty || 0) * (item.unitCost || 0);

                            return (
                              <tr key={index} className="bg-card">
                                <td className="p-2">
                                  <Select
                                    value={item.productId}
                                    onValueChange={(val) => handleItemProductSelect(index, val)}
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                      <SelectValue placeholder="Choose product..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                      {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.name} ({p.sku}) · Stock: {p.stock}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                <td className="p-2">
                                  <Select
                                    value={item.unitType}
                                    onValueChange={(v) => handleItemChange(index, "unitType", v)}
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-background">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {UNIT_TYPES.map((u) => (
                                        <SelectItem key={u} value={u}>
                                          {u}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>

                                <td className="p-2">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={item.packSize}
                                    onChange={(e) =>
                                      handleItemChange(index, "packSize", Number(e.target.value))
                                    }
                                    className="h-8 text-xs bg-background"
                                    title="Number of single bottles/pieces in 1 pack or carton"
                                  />
                                </td>

                                <td className="p-2">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={item.qty}
                                    onChange={(e) =>
                                      handleItemChange(index, "qty", Number(e.target.value))
                                    }
                                    className="h-8 text-xs bg-background font-semibold"
                                  />
                                </td>

                                <td className="p-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={item.unitCost || ""}
                                    onChange={(e) =>
                                      handleItemChange(index, "unitCost", Number(e.target.value))
                                    }
                                    className="h-8 text-xs bg-background"
                                  />
                                </td>

                                <td className="p-2 text-right font-mono font-semibold text-foreground">
                                  {fmt(lineTotal)}
                                  {item.packSize > 1 && (
                                    <div className="text-[10px] text-muted-foreground font-normal">
                                      +{totalStockUnits} into stock
                                    </div>
                                  )}
                                </td>

                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-muted-foreground hover:text-rose p-1 transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial & Payment Settlement Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
                    {/* Payment Settings */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Payment & Terms
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Payment Method</label>
                          <Select
                            value={paymentMethod}
                            onValueChange={(v: any) => setPaymentMethod(v)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Credit">Credit (Pay Later)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground font-medium">Payment Status</label>
                          <Select
                            value={paymentStatus}
                            onValueChange={(v: any) => setPaymentStatus(v)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid in Full</SelectItem>
                              <SelectItem value="Credit (Unpaid)">Credit (Unpaid)</SelectItem>
                              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {paymentStatus !== "Paid" && (
                        <div className="grid grid-cols-2 gap-2 bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl">
                          <div className="space-y-1">
                            <label className="text-xs text-amber-900 font-medium">Amount Paid Now</label>
                            <Input
                              type="number"
                              value={amountPaid || ""}
                              onChange={(e) => setAmountPaid(Number(e.target.value))}
                              placeholder="0"
                              className="h-8 text-xs bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-amber-900 font-medium">Credit Due Date</label>
                            <Input
                              type="date"
                              value={creditDueDate}
                              onChange={(e) => setCreditDueDate(e.target.value)}
                              className="h-8 text-xs bg-background"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium">Notes</label>
                        <Input
                          placeholder="Special discount note, delivery remark..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Cost Summary Box */}
                    <div className="bg-sand-soft/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal ({items.length} items):</span>
                          <span className="font-mono font-medium text-foreground">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>Wholesale Discount:</span>
                          <div className="flex items-center gap-1 w-28">
                            <span className="text-xs font-mono">{fmt(1).slice(0, 1)}</span>
                            <Input
                              type="number"
                              min={0}
                              value={discount || ""}
                              onChange={(e) => setDiscount(Number(e.target.value))}
                              className="h-7 text-xs bg-background"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between items-baseline font-serif text-lg font-bold text-foreground">
                          <span>Grand Total:</span>
                          <span className="font-mono text-xl text-primary">{fmt(grandTotal)}</span>
                        </div>
                      </div>

                      {/* Stock Auto Sync Toggle */}
                      <div className="flex items-center justify-between border-t border-border/80 pt-3">
                        <div>
                          <div className="text-xs font-semibold text-foreground">Auto-Increment Stock</div>
                          <div className="text-[10px] text-muted-foreground">
                            Instantly adds quantities into Inventory
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={updateStock}
                          onChange={(e) => setUpdateStock(e.target.checked)}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl h-11 text-sm font-semibold">
                    Complete Purchase Order & Sync Stock
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-sand-soft">
            <ShoppingCart className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Purchases</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{fmt(totalSpend)}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-rose-soft">
            <Clock className="h-4 w-4 text-rose" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Payable Credit</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{fmt(unpaidCredit)}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-mist-soft">
            <FileText className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Invoices</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{purchases.length}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-[color-mix(in_oklab,var(--sage)_25%,white)]">
            <CreditCard className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Order Size</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{fmt(avgOrder)}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by PO ID, Invoice #, Supplier, or Product name…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-11 w-36 rounded-xl text-xs">
              <SelectValue placeholder="Purchase Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {PURCHASE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-36 rounded-xl text-xs">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payments</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Credit (Unpaid)">Credit (Unpaid)</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="h-11 w-40 rounded-xl text-xs">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden brg-card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">PO & Invoice #</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">Purchase Category</th>
                <th className="text-left px-4 py-3">Items Summary</th>
                <th className="text-left px-4 py-3">Payment Status</th>
                <th className="text-right px-4 py-3">Total Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No purchases found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => {
                  const isPaid = po.paymentStatus === "Paid";
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setViewInvoice(po)}
                      className="border-t border-border hover:bg-sand-soft/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground font-mono">{po.id}</div>
                        {po.invoiceRef && (
                          <div className="text-xs font-mono text-muted-foreground">
                            {po.invoiceRef}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {po.date}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({
                              to: "/business/suppliers",
                              search: { supplierId: po.supplierId } as any,
                            });
                          }}
                          className="font-medium text-foreground hover:underline text-left inline-flex items-center gap-1 group"
                        >
                          {po.supplierName}
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition" />
                        </button>
                        <div className="text-[11px] text-muted-foreground">{po.paymentMethod}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-sand-soft border border-border text-foreground/80 font-medium">
                          {po.purchaseType}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        <span className="font-medium text-foreground">
                          {po.items.length} {po.items.length === 1 ? "item" : "items"}:
                        </span>{" "}
                        {po.items.map((i) => `${i.qty}x ${i.productName}`).join(", ")}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border font-medium",
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          )}
                        >
                          {po.paymentStatus}
                        </span>
                        {!isPaid && po.creditDueDate && (
                          <div className="text-[10px] text-rose mt-0.5 font-medium">
                            Due: {po.creditDueDate}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {fmt(po.totalAmount)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewInvoice(po);
                          }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="max-w-xl p-6">
          {viewInvoice && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={viewInvoice.paymentStatus === "Paid" ? "default" : "secondary"}>
                    {viewInvoice.paymentStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Recorded: {viewInvoice.date}
                  </span>
                </div>
                <DialogTitle className="font-serif text-2xl font-bold mt-1">
                  Purchase Order #{viewInvoice.id}
                </DialogTitle>
                <DialogDescription>
                  Supplier:{" "}
                  <button
                    onClick={() => {
                      setViewInvoice(null);
                      navigate({
                        to: "/business/suppliers",
                        search: { supplierId: viewInvoice.supplierId } as any,
                      });
                    }}
                    className="font-medium text-foreground underline hover:text-primary"
                  >
                    {viewInvoice.supplierName}
                  </button>{" "}
                  · Invoice: {viewInvoice.invoiceRef || "N/A"}
                </DialogDescription>
              </DialogHeader>

              {/* Items Breakdown */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-sand-soft text-muted-foreground uppercase text-[10px]">
                    <tr>
                      <th className="text-left p-2.5">Item</th>
                      <th className="text-center p-2.5">Packaging</th>
                      <th className="text-center p-2.5">Qty</th>
                      <th className="text-right p-2.5">Unit Cost</th>
                      <th className="text-right p-2.5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-foreground">
                          {it.productName}
                          <div className="text-[10px] text-muted-foreground font-mono">{it.sku}</div>
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground">
                          {it.unitType} {it.packSize > 1 ? `(${it.packSize}/pk)` : ""}
                        </td>
                        <td className="p-2.5 text-center font-bold">{it.qty}</td>
                        <td className="p-2.5 text-right font-mono">{fmt(it.unitCost)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          {fmt(it.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="bg-sand-soft/50 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">{fmt(viewInvoice.subtotal)}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-{fmt(viewInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground border-t border-border pt-1">
                  <span>Total Amount:</span>
                  <span className="font-mono text-primary">{fmt(viewInvoice.totalAmount)}</span>
                </div>
                {viewInvoice.paymentStatus !== "Paid" && (
                  <div className="flex justify-between text-rose font-medium pt-1">
                    <span>Due Date:</span>
                    <span>{viewInvoice.creditDueDate || "Per credit agreement"}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 justify-end pt-2">
                {viewInvoice.paymentStatus !== "Paid" && (
                  <Button
                    className="bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl text-xs"
                    onClick={() => handleSettleCredit(viewInvoice.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Mark as Paid / Settled
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() => setViewInvoice(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

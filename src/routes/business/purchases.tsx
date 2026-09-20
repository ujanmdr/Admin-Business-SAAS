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
  ShoppingCart, Plus, Search, Filter, Truck, Calendar,
  CreditCard, CheckCircle2, Clock, AlertCircle, FileText, Trash2, Eye, RotateCcw, Building2
} from "lucide-react";
import {
  getPurchases, addPurchase, updatePurchaseStatus, recordPurchasePayment, recordPurchaseReturn,
  getPurchasePayments, getPurchaseReturns, getPurchaseCategories,
  Purchase, PurchaseCategory, PurchaseStatus, PurchaseLineItem, PurchasePayment, PurchaseReturn
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

export function PurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categories, setCategories] = useState<PurchaseCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Filter
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // New Purchase Dialog state
  const [openNewPurchase, setOpenNewPurchase] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [customSupplierName, setCustomSupplierName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>("draft");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyVat, setApplyVat] = useState(true);
  const [notes, setNotes] = useState("");

  // Line items state
  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      qty: number;
      unitCost: number;
    }>
  >([
    { productId: "", productName: "", sku: "", qty: 1, unitCost: 0 },
  ]);

  // Selected Purchase for detail view
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [purchasePayments, setPurchasePayments] = useState<PurchasePayment[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);

  // Record Payment Dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payTargetPurchase, setPayTargetPurchase] = useState<Purchase | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("Bank Transfer");
  const [payNote, setPayNote] = useState("");

  // Purchase Return Dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnTargetPurchase, setReturnTargetPurchase] = useState<Purchase | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnLines, setReturnLines] = useState<{ productId: string; productName: string; qty: number; unitCost: number }[]>([]);

  const refreshData = () => {
    setPurchases(getPurchases());
    setCategories(getPurchaseCategories());
    setSuppliers(getSuppliers());
    setProducts(getInventoryProducts());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update payment/return logs when viewing a purchase
  useEffect(() => {
    if (viewPurchase) {
      setPurchasePayments(getPurchasePayments(viewPurchase.id));
      setPurchaseReturns(getPurchaseReturns(viewPurchase.id));
    }
  }, [viewPurchase]);

  // Handle supplier change in Add dialog
  const handleSupplierSelect = (supId: string) => {
    setSelectedSupplierId(supId);
    if (supId === "custom") {
      setCustomSupplierName("");
    } else {
      const sup = suppliers.find((s) => s.id === supId);
      if (sup) setCustomSupplierName(sup.name);
    }
  };

  // Line items calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.qty || 0) * (item.unitCost || 0), 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    if (!applyVat) return 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    return Math.round(taxable * 0.13);
  }, [subtotal, discountAmount, applyVat]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount) + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  // Line item helpers
  const handleProductSelect = (index: number, prodId: string) => {
    const found = products.find((p) => p.id === prodId);
    if (found) {
      const copy = [...items];
      copy[index] = {
        productId: found.id,
        productName: found.name,
        sku: found.sku || "",
        qty: copy[index].qty || 1,
        unitCost: found.costPrice || 0,
      };
      setItems(copy);
    }
  };

  const updateItemField = (index: number, field: string, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", sku: "", qty: 1, unitCost: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Create Purchase
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSupplierName = customSupplierName.trim();
    if (!finalSupplierName) {
      toast.error("Please select a supplier or enter a vendor name.");
      return;
    }

    const validItems = items.filter((i) => i.productName.trim() && i.qty > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid line item with quantity > 0.");
      return;
    }

    const categoryObj = categories.find((c) => c.id === selectedCategoryId);

    const subtotalMinor = subtotal * 100;
    const discountMinor = discountAmount * 100;
    const taxMinor = taxAmount * 100;
    const totalMinor = grandTotal * 100;

    const created = addPurchase({
      business_id: "biz-aura",
      branch_id: "Jhamsikhel",
      category_id: selectedCategoryId || undefined,
      category_name: categoryObj?.name || undefined,
      supplier_id: selectedSupplierId === "custom" ? undefined : selectedSupplierId,
      supplier_name: finalSupplierName,
      reference_number: referenceNumber.trim() || undefined,
      status: purchaseStatus,
      subtotal_minor: subtotalMinor,
      discount_minor: discountMinor,
      tax_minor: taxMinor,
      total_minor: totalMinor,
      amount_paid_minor: 0,
      currency: "NPR",
      notes: notes.trim() || undefined,
      received_at: purchaseStatus === "received" ? new Date().toISOString() : undefined,
      items: validItems.map((item) => ({
        productId: item.productId || `prod-${Date.now()}`,
        productName: item.productName,
        sku: item.sku,
        qty: item.qty,
        unit_cost_minor: item.unitCost * 100,
        line_total_minor: item.qty * item.unitCost * 100,
      })),
    });

    toast.success(`Purchase ${created.purchase_number} created successfully.`);
    setOpenNewPurchase(false);

    // Reset Form
    setSelectedSupplierId("");
    setCustomSupplierName("");
    setSelectedCategoryId("");
    setReferenceNumber("");
    setPurchaseStatus("draft");
    setDiscountAmount(0);
    setApplyVat(true);
    setNotes("");
    setItems([{ productId: "", productName: "", sku: "", qty: 1, unitCost: 0 }]);

    refreshData();
  };

  // Status badge styling helper
  const getStatusBadge = (st: PurchaseStatus) => {
    switch (st) {
      case "received":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Received</Badge>;
      case "ordered":
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">Ordered</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Cancelled</Badge>;
    }
  };

  // Payment status badge
  const getPaymentBadge = (totalMinor: number, paidMinor: number) => {
    if (paidMinor >= totalMinor && totalMinor > 0) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>;
    }
    if (paidMinor > 0) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Partially Paid</Badge>;
    }
    return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Unpaid</Badge>;
  };

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchQ =
        q === "" ||
        p.purchase_number.toLowerCase().includes(q.toLowerCase()) ||
        p.supplier_name.toLowerCase().includes(q.toLowerCase()) ||
        (p.reference_number && p.reference_number.toLowerCase().includes(q.toLowerCase()));

      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchCat = categoryFilter === "All" || p.category_id === categoryFilter;

      let matchPayment = true;
      if (paymentFilter === "Paid") matchPayment = (p.amount_paid_minor || 0) >= p.total_minor;
      else if (paymentFilter === "Partially Paid")
        matchPayment = (p.amount_paid_minor || 0) > 0 && (p.amount_paid_minor || 0) < p.total_minor;
      else if (paymentFilter === "Unpaid") matchPayment = (p.amount_paid_minor || 0) === 0;

      return matchQ && matchStatus && matchCat && matchPayment;
    });
  }, [purchases, q, statusFilter, paymentFilter, categoryFilter]);

  // Overall KPIs
  const totalSpend = useMemo(
    () => purchases.reduce((acc, p) => acc + (p.total_minor || 0) / 100, 0),
    [purchases]
  );
  const totalPaid = useMemo(
    () => purchases.reduce((acc, p) => acc + (p.amount_paid_minor || 0) / 100, 0),
    [purchases]
  );
  const totalOutstanding = Math.max(0, totalSpend - totalPaid);

  // Actions
  const handleMarkReceived = (p: Purchase) => {
    updatePurchaseStatus(p.id, "received");
    toast.success(`Purchase ${p.purchase_number} marked as Received & stock updated.`);
    refreshData();
    if (viewPurchase && viewPurchase.id === p.id) {
      setViewPurchase({ ...viewPurchase, status: "received", received_at: new Date().toISOString() });
    }
  };

  const handleOpenPaymentDialog = (p: Purchase) => {
    setPayTargetPurchase(p);
    const balance = Math.max(0, (p.total_minor - (p.amount_paid_minor || 0)) / 100);
    setPayAmount(balance);
    setPayMethod("Bank Transfer");
    setPayNote("");
    setPaymentDialogOpen(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetPurchase || payAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    recordPurchasePayment(
      payTargetPurchase.id,
      Math.round(payAmount * 100),
      payMethod,
      payNote.trim() || undefined
    );

    toast.success(`Payment of ${fmt(payAmount)} recorded for ${payTargetPurchase.purchase_number}.`);
    setPaymentDialogOpen(false);
    refreshData();

    if (viewPurchase && viewPurchase.id === payTargetPurchase.id) {
      setViewPurchase({
        ...viewPurchase,
        amount_paid_minor: (viewPurchase.amount_paid_minor || 0) + Math.round(payAmount * 100),
      });
      setPurchasePayments(getPurchasePayments(payTargetPurchase.id));
    }
  };

  const handleOpenReturnDialog = (p: Purchase) => {
    setReturnTargetPurchase(p);
    setReturnReason("");
    setReturnLines(
      p.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        qty: 0,
        unitCost: i.unit_cost_minor / 100,
      }))
    );
    setReturnDialogOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTargetPurchase) return;

    const validLines = returnLines.filter((l) => l.qty > 0);
    if (validLines.length === 0) {
      toast.error("Please specify at least one item quantity to return.");
      return;
    }

    const totalRefundMinor = validLines.reduce((acc, l) => acc + l.qty * l.unitCost * 100, 0);

    recordPurchaseReturn(
      returnTargetPurchase.id,
      returnReason.trim() || "Item Return / Damaged Stock",
      totalRefundMinor,
      validLines.map((l) => ({
        product_id: l.productId,
        product_name: l.productName,
        quantity: l.qty,
        refund_minor: l.qty * l.unitCost * 100,
      }))
    );

    toast.success(`Return processed. Refund of ${fmt(totalRefundMinor / 100)} recorded.`);
    setReturnDialogOpen(false);
    refreshData();

    if (viewPurchase && viewPurchase.id === returnTargetPurchase.id) {
      setPurchaseReturns(getPurchaseReturns(returnTargetPurchase.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Purchases"
        description="Record supplier purchase orders, track incoming stock deliveries, manage invoice payments and returns."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/business/suppliers" })}
              className="rounded-xl border-border"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Suppliers Directory
            </Button>
            <Dialog open={openNewPurchase} onOpenChange={setOpenNewPurchase}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Create Purchase Order</DialogTitle>
                  <DialogDescription>
                    Record a procurement order from a supplier with items, tax, and delivery status.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreatePurchase} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Supplier *</label>
                      <Select value={selectedSupplierId} onValueChange={handleSupplierSelect}>
                        <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                          <SelectItem value="custom">+ Other / Custom Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Supplier Invoice / Ref #</label>
                      <Input
                        placeholder="e.g. INV-LOR-8891"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {selectedSupplierId === "custom" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Vendor Display Name *</label>
                      <Input
                        placeholder="Enter vendor or merchant name"
                        value={customSupplierName}
                        onChange={(e) => setCustomSupplierName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Purchase Category</label>
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Order Status</label>
                      <Select value={purchaseStatus} onValueChange={(v: PurchaseStatus) => setPurchaseStatus(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft (Saved for review)</SelectItem>
                          <SelectItem value="ordered">Ordered (Sent to supplier)</SelectItem>
                          <SelectItem value="received">Received (Stock added to inventory)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground/80">Items Purchased</label>
                      <Button type="button" size="sm" variant="outline" onClick={addItem} className="h-7 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Add Item
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-border bg-sand-soft/20 flex gap-2 items-center text-xs">
                          <div className="flex-1">
                            <Select
                              value={item.productId}
                              onValueChange={(val) => handleProductSelect(idx, val)}
                            >
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue placeholder="Select product..." />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} {p.sku ? `(${p.sku})` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-20">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.qty}
                              onChange={(e) => updateItemField(idx, "qty", Number(e.target.value))}
                              className="h-8 text-xs text-center bg-background"
                            />
                          </div>

                          <div className="w-28">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Cost (NPR)"
                              value={item.unitCost}
                              onChange={(e) => updateItemField(idx, "unitCost", Number(e.target.value))}
                              className="h-8 text-xs text-right bg-background"
                            />
                          </div>

                          <div className="w-28 text-right font-medium text-foreground">
                            {fmt(item.qty * item.unitCost)}
                          </div>

                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(idx)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span className="font-medium text-foreground">{fmt(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Discount (NPR):</span>
                      <Input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        className="h-7 w-28 text-xs text-right"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyVat}
                          onChange={(e) => setApplyVat(e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        <span>Apply 13% VAT</span>
                      </label>
                      <span className="font-medium text-foreground">{fmt(taxAmount)}</span>
                    </div>

                    <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                      <span>Grand Total:</span>
                      <span>{fmt(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Notes</label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Terms, delivery instructions, or inspection notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenNewPurchase(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                      Save Purchase Order
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Purchases Value</span>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-foreground">{fmt(totalSpend)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{purchases.length} total orders recorded</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Payments Made</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-emerald-600">{fmt(totalPaid)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Cleared against supplier invoices</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Outstanding Supplier Payables</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-amber-600">{fmt(totalOutstanding)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Pending payment clearance</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-card p-3 rounded-2xl border border-border shadow-subtle">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PUR number, vendor, bill ref…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end text-xs">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Filter */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-9 w-36 text-xs bg-background">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Payments</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-44 text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-soft/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Purchase #</th>
                <th className="px-4 py-3">Supplier / Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Order Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No purchases match your criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const totalNpr = (p.total_minor || 0) / 100;
                  const paidNpr = (p.amount_paid_minor || 0) / 100;
                  const balance = Math.max(0, totalNpr - paidNpr);

                  return (
                    <tr key={p.id} className="hover:bg-sand-soft/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-semibold text-foreground text-xs">{p.purchase_number}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {p.created_at.slice(0, 10)}
                          {p.reference_number && ` · Bill: ${p.reference_number}`}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground text-xs">{p.supplier_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.items?.length || 0} items</div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {p.category_name || "General"}
                      </td>

                      <td className="px-4 py-3.5">
                        {getStatusBadge(p.status)}
                        {p.status === "received" && p.received_at && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Recv: {p.received_at.slice(0, 10)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {getPaymentBadge(p.total_minor, p.amount_paid_minor || 0)}
                        {balance > 0 && (
                          <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                            Due: {fmt(balance)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="font-bold text-foreground text-xs">{fmt(totalNpr)}</div>
                        {paidNpr > 0 && paidNpr < totalNpr && (
                          <div className="text-[10px] text-muted-foreground">Paid: {fmt(paidNpr)}</div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewPurchase(p)}
                            className="h-7 text-xs px-2"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>

                          {p.status !== "received" && p.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkReceived(p)}
                              className="h-7 text-xs px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Receive
                            </Button>
                          )}

                          {balance > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPaymentDialog(p)}
                              className="h-7 text-xs px-2 border-border"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Purchase Detail Dialog */}
      {viewPurchase && (
        <Dialog open={Boolean(viewPurchase)} onOpenChange={(open) => !open && setViewPurchase(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-mono text-lg">{viewPurchase.purchase_number}</DialogTitle>
                  <DialogDescription>
                    Vendor: {viewPurchase.supplier_name} {viewPurchase.reference_number ? `· Bill: ${viewPurchase.reference_number}` : ""}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(viewPurchase.status)}
                  {getPaymentBadge(viewPurchase.total_minor, viewPurchase.amount_paid_minor || 0)}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-2 text-xs">
              {/* Order Info */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-sand-soft/30 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Created Date</span>
                  <span className="font-medium text-foreground">{viewPurchase.created_at.slice(0, 10)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Received At</span>
                  <span className="font-medium text-foreground">
                    {viewPurchase.received_at ? viewPurchase.received_at.slice(0, 16).replace("T", " ") : "Pending Delivery"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Branch</span>
                  <span className="font-medium text-foreground">{viewPurchase.branch_id}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">Line Items</h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand-soft/50 border-b border-border text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Product Name</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Cost</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {viewPurchase.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium">{it.productName}</td>
                          <td className="p-2.5 text-center">{it.qty}</td>
                          <td className="p-2.5 text-right">{fmt(it.unit_cost_minor / 100)}</td>
                          <td className="p-2.5 text-right font-semibold">{fmt(it.line_total_minor / 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{fmt(viewPurchase.subtotal_minor / 100)}</span>
                </div>
                {viewPurchase.discount_minor > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount:</span>
                    <span>−{fmt(viewPurchase.discount_minor / 100)}</span>
                  </div>
                )}
                {viewPurchase.tax_minor > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (13%):</span>
                    <span>{fmt(viewPurchase.tax_minor / 100)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                  <span>Total Amount:</span>
                  <span>{fmt(viewPurchase.total_minor / 100)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold pt-1">
                  <span>Amount Paid:</span>
                  <span>{fmt((viewPurchase.amount_paid_minor || 0) / 100)}</span>
                </div>
                <div className="flex justify-between text-rose-500 font-semibold">
                  <span>Balance Due:</span>
                  <span>{fmt(Math.max(0, (viewPurchase.total_minor - (viewPurchase.amount_paid_minor || 0)) / 100))}</span>
                </div>
              </div>

              {/* Payment Records Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">Payment History</h4>
                  {(viewPurchase.total_minor - (viewPurchase.amount_paid_minor || 0)) > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPaymentDialog(viewPurchase)}
                      className="h-7 text-xs border-border"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Record Payment
                    </Button>
                  )}
                </div>

                {purchasePayments.length === 0 ? (
                  <div className="p-3 border border-dashed rounded-xl text-center text-muted-foreground">
                    No payment transactions recorded for this order yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {purchasePayments.map((pm) => (
                      <div key={pm.id} className="p-2.5 rounded-xl border border-border bg-card flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-foreground">{fmt(pm.amount_minor / 100)} via {pm.method || "Cash"}</div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">
                            {pm.paid_at.slice(0, 16).replace("T", " ")} · {pm.created_by}
                            {pm.note && ` · Note: ${pm.note}`}
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Paid</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Returns Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">Returns & Refunds</h4>
                  {viewPurchase.status === "received" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReturnDialog(viewPurchase)}
                      className="h-7 text-xs border-border text-rose-600 hover:bg-rose-50"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Return Items
                    </Button>
                  )}
                </div>

                {purchaseReturns.length === 0 ? (
                  <div className="p-3 border border-dashed rounded-xl text-center text-muted-foreground">
                    No items returned for this purchase.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {purchaseReturns.map((rt) => (
                      <div key={rt.id} className="p-2.5 rounded-xl border border-border bg-rose-50/40 dark:bg-rose-950/20 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-rose-700 dark:text-rose-400">
                            Refund: {fmt(rt.refund_minor / 100)} · Reason: {rt.reason || "Returned items"}
                          </div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">
                            {rt.created_at.slice(0, 16).replace("T", " ")} · {rt.lines.map((l) => `${l.quantity}x ${l.product_name}`).join(", ")}
                          </div>
                        </div>
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">Returned</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Payment Dialog */}
      {payTargetPurchase && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Record Purchase Payment</DialogTitle>
              <DialogDescription>
                Record a payment clearance for {payTargetPurchase.purchase_number} ({payTargetPurchase.supplier_name}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 pt-2">
              <div className="p-3 bg-sand-soft/30 rounded-xl border border-border text-xs flex justify-between">
                <span className="text-muted-foreground">Total Invoice:</span>
                <span className="font-bold text-foreground">{fmt(payTargetPurchase.total_minor / 100)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Amount to Pay (NPR) *</label>
                <Input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Payment Method</label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer / Wire</SelectItem>
                    <SelectItem value="eSewa">eSewa Merchant</SelectItem>
                    <SelectItem value="Khalti">Khalti</SelectItem>
                    <SelectItem value="Cash">Cash at Counter</SelectItem>
                    <SelectItem value="Cheque">Bank Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Payment Reference / Note</label>
                <Input
                  placeholder="e.g. NIC Asia Txn #991204"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                />
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                  Save Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Purchase Return Dialog */}
      {returnTargetPurchase && (
        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Process Purchase Return</DialogTitle>
              <DialogDescription>
                Return damaged or excess goods from {returnTargetPurchase.purchase_number}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Select Quantities to Return</label>
                <div className="space-y-2 border border-border p-2.5 rounded-xl bg-sand-soft/20 text-xs">
                  {returnLines.map((line, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="truncate flex-1 font-medium">{line.productName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[11px]">Qty:</span>
                        <Input
                          type="number"
                          min="0"
                          value={line.qty}
                          onChange={(e) => {
                            const copy = [...returnLines];
                            copy[idx].qty = Number(e.target.value);
                            setReturnLines(copy);
                          }}
                          className="h-7 w-16 text-center text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Reason for Return *</label>
                <Input
                  placeholder="e.g. Broken seal, damaged packaging, or wrong shade"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 text-xs flex justify-between">
                <span className="text-rose-700 dark:text-rose-300 font-medium">Estimated Refund:</span>
                <span className="font-bold text-rose-700 dark:text-rose-300">
                  {fmt(returnLines.reduce((acc, l) => acc + l.qty * l.unitCost, 0))}
                </span>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setReturnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 text-white hover:bg-rose-700">
                  Confirm Return
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

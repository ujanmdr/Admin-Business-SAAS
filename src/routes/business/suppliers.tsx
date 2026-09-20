import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Truck, Plus, Search, Phone, Mail, MapPin, CreditCard, ShoppingCart,
  Building2, ExternalLink, Package, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Eye
} from "lucide-react";
import {
  getSuppliers, addSupplier, updateSupplier, Supplier, INITIAL_SUPPLIERS
} from "@/lib/supplier-state";
import { getPurchases, markPurchasePaid, Purchase } from "@/lib/purchase-state";
import { getInventoryProducts } from "@/lib/inventory-state";
import { fmt, Product } from "@/lib/finance-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/business/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · BRG Suite" }] }),
  component: SuppliersPage,
});

const CATEGORIES = ["All", "Hair", "Skin", "Nail", "Makeup", "Spa", "Dental", "Consumables"];

function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Filter
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  // Add Supplier Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Supplier["paymentMethod"]>("Credit");
  const [creditDays, setCreditDays] = useState(30);
  const [selectedCats, setSelectedCats] = useState<string[]>(["Hair"]);
  const [notes, setNotes] = useState("");

  // Supplier Detail Drawer
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const refreshData = () => {
    setSuppliers(getSuppliers());
    setPurchases(getPurchases());
    setProducts(getInventoryProducts());
  };

  useEffect(() => {
    refreshData();
    // Check URL search param to auto-open a supplier
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const supId = params.get("supplierId");
      if (supId) {
        const found = getSuppliers().find((s) => s.id === supId);
        if (found) {
          setSelectedSupplier(found);
          setSheetOpen(true);
        }
      }
    }
  }, []);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchQ =
        q === "" ||
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(q.toLowerCase()) ||
        s.phone.includes(q);
      const matchCat =
        selectedCat === "All" ||
        s.productCategories.some((c) => c.toLowerCase() === selectedCat.toLowerCase());
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      return matchQ && matchCat && matchStatus;
    });
  }, [suppliers, q, selectedCat, statusFilter]);

  // Overall Stats
  const activeCount = suppliers.filter((s) => s.status === "Active").length;
  
  // Total credit balance across all suppliers
  const totalOutstandingCredit = useMemo(() => {
    return purchases
      .filter((p) => p.paymentStatus !== "Paid")
      .reduce((sum, p) => sum + (p.totalAmount - (p.amountPaid || 0)), 0);
  }, [purchases]);

  // Handle Add Supplier
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim() || !phone.trim()) {
      toast.error("Please fill in Supplier Name, Contact Person, and Phone.");
      return;
    }

    const created = addSupplier({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      paymentMethod,
      creditDays: paymentMethod === "Credit" ? Number(creditDays) : 0,
      productCategories: selectedCats.length ? selectedCats : ["Hair"],
      notes: notes.trim(),
      status: "Active",
    });

    toast.success(`Supplier "${created.name}" registered successfully.`);
    setAddOpen(false);
    
    // Reset form
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setPaymentMethod("Credit");
    setCreditDays(30);
    setSelectedCats(["Hair"]);
    setNotes("");

    refreshData();
  };

  // Helper to get stats for a supplier
  const getSupplierStats = (sup: Supplier) => {
    const supProducts = products.filter(
      (p) => p.supplierId === sup.id || p.supplier.toLowerCase() === sup.name.toLowerCase()
    );
    const supPurchases = purchases.filter((p) => p.supplierId === sup.id || p.supplierName.toLowerCase() === sup.name.toLowerCase());
    const totalSpent = supPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
    const outstanding = supPurchases
      .filter((p) => p.paymentStatus !== "Paid")
      .reduce((acc, p) => acc + (p.totalAmount - (p.amountPaid || 0)), 0);

    return {
      productCount: supProducts.length,
      purchaseCount: supPurchases.length,
      totalSpent,
      outstanding,
      products: supProducts,
      purchases: supPurchases,
    };
  };

  const handleToggleStatus = (sup: Supplier) => {
    const newStatus = sup.status === "Active" ? "Inactive" : "Active";
    updateSupplier(sup.id, { status: newStatus });
    toast.success(`${sup.name} marked as ${newStatus}.`);
    refreshData();
    if (selectedSupplier && selectedSupplier.id === sup.id) {
      setSelectedSupplier({ ...selectedSupplier, status: newStatus });
    }
  };

  const handleMarkPaid = (purchaseId: string) => {
    markPurchasePaid(purchaseId);
    toast.success("Purchase marked as Paid in full.");
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance & Procurement"
        title="Suppliers Directory"
        description="Manage product distributors, payment credit terms, and supplier catalogs interlinked with your inventory."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/business/purchases" })}
              className="rounded-xl border-border"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Purchases
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Register New Supplier</DialogTitle>
                  <DialogDescription>
                    Add a verified vendor or brand distributor to your procurement directory.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSupplier} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Company / Supplier Name *</label>
                      <Input
                        placeholder="e.g. L'Oréal Nepal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Contact Person *</label>
                      <Input
                        placeholder="e.g. Binod Shrestha"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Phone Number *</label>
                      <Input
                        placeholder="+977 980-0000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        placeholder="orders@supplier.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Office / Warehouse Address</label>
                    <Input
                      placeholder="e.g. Tripureshwor, Kathmandu"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Payment Terms</label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(val: any) => setPaymentMethod(val)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit">Credit (Pay Later)</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {paymentMethod === "Credit" && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Credit Period (Days)</label>
                        <Select
                          value={String(creditDays)}
                          onValueChange={(val) => setCreditDays(Number(val))}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 Days</SelectItem>
                            <SelectItem value="30">30 Days (Net 30)</SelectItem>
                            <SelectItem value="45">45 Days</SelectItem>
                            <SelectItem value="60">60 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Supplied Product Categories</label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {CATEGORIES.slice(1).map((cat) => {
                        const isSelected = selectedCats.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => {
                              setSelectedCats((prev) =>
                                isSelected ? prev.filter((c) => c !== cat) : [...prev, cat]
                              );
                            }}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg border transition",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary font-medium"
                                : "bg-card border-border hover:bg-muted"
                            )}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Internal Notes</label>
                    <Textarea
                      placeholder="Account manager details, authorized brands, discount agreements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg h-10">
                    Save Supplier Profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-sand-soft">
            <Truck className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Suppliers</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{suppliers.length}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-[color-mix(in_oklab,var(--sage)_25%,white)]">
            <CheckCircle2 className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Vendors</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{activeCount}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-rose-soft">
            <Clock className="h-4 w-4 text-rose" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending Credit Pay</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{fmt(totalOutstandingCredit)}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 brg-card-shadow">
          <div className="h-9 w-9 rounded-xl grid place-items-center mb-3 bg-mist-soft">
            <Package className="h-4 w-4 text-deep-olive" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Linked Inventory Items</div>
          <div className="font-serif text-2xl mt-1 text-foreground">{products.length}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suppliers by company name, contact person, or phone…"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <Select
            value={statusFilter}
            onValueChange={(v: any) => setStatusFilter(v)}
          >
            <SelectTrigger className="h-11 w-32 rounded-xl text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active only</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={cn(
                "text-xs px-3 py-2 rounded-full border transition",
                selectedCat === c
                  ? "bg-primary text-primary-foreground border-primary shadow-luxe"
                  : "bg-card border-border hover:bg-sand-soft"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-foreground">No suppliers found</p>
          <p className="text-xs mt-1">Try adjusting your search terms or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => {
            const stats = getSupplierStats(sup);
            const isCredit = sup.paymentMethod === "Credit";

            return (
              <div
                key={sup.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 brg-card-shadow flex flex-col justify-between transition-all hover:border-foreground/30",
                  sup.status === "Inactive" ? "opacity-70 border-dashed" : "border-border"
                )}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg text-foreground font-semibold">
                          {sup.name}
                        </h3>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                            sup.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {sup.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Contact: <span className="font-medium text-foreground">{sup.contactPerson}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={cn(
                          "text-[11px] font-medium px-2 py-0.5 rounded-md border inline-flex items-center gap-1",
                          isCredit
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-sand-soft text-foreground/80 border-border"
                        )}
                      >
                        <CreditCard className="h-3 w-3" />
                        {isCredit ? `Credit (${sup.creditDays}d)` : sup.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Categories Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {sup.productCategories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-sand-soft/80 text-foreground/70 font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info lines */}
                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-foreground/60 flex-shrink-0" />
                      <a href={`tel:${sup.phone}`} className="hover:underline text-foreground">
                        {sup.phone}
                      </a>
                    </div>
                    {sup.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-foreground/60 flex-shrink-0" />
                        <span className="truncate">{sup.email}</span>
                      </div>
                    )}
                    {sup.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-foreground/60 flex-shrink-0" />
                        <span className="truncate">{sup.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-sand-soft/50 rounded-xl p-2.5 text-center mb-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Items</div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">
                        {stats.productCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Orders</div>
                      <div className="text-sm font-semibold text-foreground mt-0.5">
                        {stats.purchaseCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Due Credit</div>
                      <div
                        className={cn(
                          "text-sm font-semibold mt-0.5",
                          stats.outstanding > 0 ? "text-rose font-mono" : "text-emerald-700"
                        )}
                      >
                        {stats.outstanding > 0 ? fmt(stats.outstanding) : "Nil"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-xs h-9 border-border"
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setSheetOpen(true);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Profile & History
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl text-xs h-9 bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => {
                      navigate({
                        to: "/business/purchases",
                        search: { supplierId: sup.id } as any,
                      });
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Order / Restock
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Profile Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto p-6">
          {selectedSupplier && (
            <div className="space-y-6">
              <SheetHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedSupplier.status === "Active" ? "default" : "secondary"}>
                    {selectedSupplier.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-8"
                    onClick={() => handleToggleStatus(selectedSupplier)}
                  >
                    Mark as {selectedSupplier.status === "Active" ? "Inactive" : "Active"}
                  </Button>
                </div>
                <SheetTitle className="font-serif text-2xl font-bold mt-2">
                  {selectedSupplier.name}
                </SheetTitle>
                <SheetDescription>
                  Managed vendor profile and full order history.
                </SheetDescription>
              </SheetHeader>

              {/* Quick Supplier Contact Block */}
              <div className="bg-sand-soft/60 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="font-medium text-foreground">{selectedSupplier.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <a href={`tel:${selectedSupplier.phone}`} className="font-medium text-primary hover:underline">
                    {selectedSupplier.phone}
                  </a>
                </div>
                {selectedSupplier.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{selectedSupplier.email}</span>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-foreground">{selectedSupplier.address}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">Payment Terms:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSupplier.paymentMethod}
                    {selectedSupplier.paymentMethod === "Credit" && ` (${selectedSupplier.creditDays} days)`}
                  </span>
                </div>
                {selectedSupplier.notes && (
                  <div className="text-xs text-muted-foreground pt-1 italic">
                    Note: {selectedSupplier.notes}
                  </div>
                )}
              </div>

              {/* Action Banner */}
              <div className="flex gap-2">
                <Button
                  className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 h-10"
                  onClick={() => {
                    setSheetOpen(false);
                    navigate({
                      to: "/business/purchases",
                      search: { supplierId: selectedSupplier.id } as any,
                    });
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create New Purchase for {selectedSupplier.name}
                </Button>
              </div>

              {/* Detail Tabs */}
              <Tabs defaultValue="products" className="space-y-4">
                <TabsList className="bg-sand-soft h-10 p-1 rounded-xl w-full grid grid-cols-2">
                  <TabsTrigger value="products" className="rounded-lg text-xs">
                    Supplied Products ({getSupplierStats(selectedSupplier).productCount})
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="rounded-lg text-xs">
                    Purchase History ({getSupplierStats(selectedSupplier).purchaseCount})
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: Products supplied by this vendor */}
                <TabsContent value="products" className="space-y-3">
                  {getSupplierStats(selectedSupplier).products.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border rounded-xl">
                      No inventory products currently mapped to this supplier.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getSupplierStats(selectedSupplier).products.map((p) => {
                        const low = p.stock <= p.threshold;
                        return (
                          <div
                            key={p.id}
                            className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-medium text-foreground">{p.name}</div>
                              <div className="text-muted-foreground font-mono text-[11px]">
                                {p.sku} · {p.category} {p.unitType ? `(${p.unitType})` : ""}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className={cn("font-medium", low ? "text-rose" : "text-foreground")}>
                                  Stock: {p.stock} {low && "(Low)"}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Cost: {fmt(p.costPrice)}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 rounded-lg text-[11px]"
                                onClick={() => {
                                  setSheetOpen(false);
                                  navigate({
                                    to: "/business/purchases",
                                    search: {
                                      supplierId: selectedSupplier.id,
                                      reorderProductId: p.id,
                                    } as any,
                                  });
                                }}
                              >
                                Reorder
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: Past Purchases */}
                <TabsContent value="purchases" className="space-y-3">
                  {getSupplierStats(selectedSupplier).purchases.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border rounded-xl">
                      No purchase orders recorded yet with this vendor.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSupplierStats(selectedSupplier).purchases.map((po) => {
                        const isUnpaid = po.paymentStatus !== "Paid";
                        return (
                          <div
                            key={po.id}
                            className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-foreground">{po.id}</span>
                                {po.invoiceRef && (
                                  <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">
                                    ({po.invoiceRef})
                                  </span>
                                )}
                              </div>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-md font-medium text-[10px] border",
                                  po.paymentStatus === "Paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                )}
                              >
                                {po.paymentStatus}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>Date: {po.date}</span>
                              <span className="font-semibold text-foreground text-sm">
                                {fmt(po.totalAmount)}
                              </span>
                            </div>

                            <div className="bg-sand-soft/40 p-2 rounded-lg space-y-1">
                              {po.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px]">
                                  <span>
                                    {item.qty}x {item.productName} ({item.unitType})
                                  </span>
                                  <span className="font-mono">{fmt(item.lineTotal)}</span>
                                </div>
                              ))}
                            </div>

                            {isUnpaid && (
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-rose font-medium text-[11px]">
                                  Due: {po.creditDueDate || "Within credit terms"}
                                </span>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-[11px] rounded-lg"
                                  onClick={() => handleMarkPaid(po.id)}
                                >
                                  Mark as Settled
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

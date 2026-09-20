import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import {
  Truck, Plus, Search, Phone, Mail, MapPin, ShoppingCart,
  Building2, ExternalLink, Package, CheckCircle2, Clock, AlertCircle, Eye, User
} from "lucide-react";
import {
  getSuppliers, addSupplier, updateSupplier, Supplier
} from "@/lib/supplier-state";
import { getPurchases, Purchase } from "@/lib/purchase-state";
import { fmt } from "@/lib/finance-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/business/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers · BRG Suite" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Search & Filter
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  // Add Supplier Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Supplier Detail Drawer
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const refreshData = () => {
    setSuppliers(getSuppliers());
    setPurchases(getPurchases());
  };

  useEffect(() => {
    refreshData();
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
        (s.contact_name && s.contact_name.toLowerCase().includes(q.toLowerCase())) ||
        (s.phone && s.phone.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q.toLowerCase()));
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" ? s.is_active : !s.is_active);
      return matchQ && matchStatus;
    });
  }, [suppliers, q, statusFilter]);

  // Overall Stats
  const activeCount = suppliers.filter((s) => s.is_active).length;
  const totalSuppliers = suppliers.length;

  // Handle Add Supplier
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a Supplier / Company Name.");
      return;
    }

    const created = addSupplier({
      name: name.trim(),
      contact_name: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      is_active: isActive,
    });

    toast.success(`Supplier "${created.name}" created successfully.`);
    setAddOpen(false);

    // Reset form
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setIsActive(true);

    refreshData();
  };

  // Helper to get stats for a supplier
  const getSupplierStats = (sup: Supplier) => {
    const supPurchases = purchases.filter(
      (p) => p.supplier_id === sup.id || p.supplier_name.toLowerCase() === sup.name.toLowerCase()
    );
    const totalSpent = supPurchases.reduce((acc, p) => acc + (p.total_minor ? p.total_minor / 100 : 0), 0);
    const unpaidAmount = supPurchases.reduce(
      (acc, p) => acc + (p.total_minor - (p.amount_paid_minor || 0)) / 100,
      0
    );

    return {
      purchaseCount: supPurchases.length,
      totalSpent,
      unpaidAmount,
      purchases: supPurchases,
    };
  };

  const handleToggleStatus = (sup: Supplier) => {
    const updatedStatus = !sup.is_active;
    updateSupplier(sup.id, { is_active: updatedStatus });
    toast.success(`${sup.name} marked as ${updatedStatus ? "Active" : "Inactive"}.`);
    refreshData();
    if (selectedSupplier && selectedSupplier.id === sup.id) {
      setSelectedSupplier({ ...selectedSupplier, is_active: updatedStatus });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Suppliers"
        description="Vendor directory storing verified suppliers, contact persons, and purchasing records."
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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Register New Supplier</DialogTitle>
                  <DialogDescription>
                    Add a verified vendor to your business procurement database.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSupplier} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Company / Supplier Name *</label>
                    <Input
                      placeholder="e.g. L'Oréal Nepal Pvt. Ltd."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Contact Person Name</label>
                    <Input
                      placeholder="e.g. Binod Shrestha"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Phone Number</label>
                      <Input
                        placeholder="+977 98XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/80">Email Address</label>
                      <Input
                        type="email"
                        placeholder="orders@supplier.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Physical Address / City</label>
                    <Input
                      placeholder="e.g. Tripureshwor, Kathmandu"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-sand-soft/30">
                    <div>
                      <div className="text-sm font-medium">Active Supplier</div>
                      <div className="text-xs text-muted-foreground">Available for creating new purchase orders</div>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

                  <div className="pt-3 border-t border-border flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                      Save Supplier
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
            <span className="text-xs font-medium text-muted-foreground">Total Registered Suppliers</span>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-foreground">{totalSuppliers}</div>
          <div className="mt-1 text-xs text-muted-foreground">Active directory</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Vendors</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-emerald-600">{activeCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">{totalSuppliers - activeCount} inactive vendors</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Orders Recorded</span>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-foreground">{purchases.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Purchases across all suppliers</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-2xl border border-border shadow-subtle">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers by name, contact, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="inline-flex rounded-xl border border-border bg-background p-1 text-xs font-medium">
            {(["All", "Active", "Inactive"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 rounded-lg transition-colors",
                  statusFilter === st
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-soft/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Supplier Name</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Contact Info</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No suppliers match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => {
                  const stats = getSupplierStats(s);
                  return (
                    <tr key={s.id} className="hover:bg-sand-soft/30 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{s.id}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-foreground/90">
                        {s.contact_name ? (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {s.contact_name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {s.phone}
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {s.email}
                          </div>
                        )}
                        {!s.phone && !s.email && <span className="italic">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {s.address ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[180px]">{s.address}</span>
                          </div>
                        ) : (
                          <span className="italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-foreground">{stats.purchaseCount} orders</div>
                        {stats.totalSpent > 0 && (
                          <div className="text-[11px] text-muted-foreground">{fmt(stats.totalSpent)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                            s.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.is_active ? "bg-emerald-500" : "bg-zinc-400")} />
                          {s.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedSupplier(s);
                              setSheetOpen(true);
                            }}
                            className="h-7 text-xs px-2"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate({ to: "/business/purchases" })}
                            className="h-7 text-xs px-2 border-border"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Order
                          </Button>
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

      {/* Supplier Detail Sheet */}
      {selectedSupplier && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-serif text-xl">{selectedSupplier.name}</SheetTitle>
                <Badge variant={selectedSupplier.is_active ? "default" : "outline"}>
                  {selectedSupplier.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <SheetDescription>Supplier Profile & Order History</SheetDescription>
            </SheetHeader>

            <div className="py-5 space-y-6">
              {/* Contact Information */}
              <div className="rounded-xl border border-border p-4 bg-sand-soft/20 space-y-3 text-xs">
                <div className="font-semibold text-foreground text-sm flex items-center justify-between">
                  <span>Vendor Information</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(selectedSupplier)}
                    className="h-6 text-[11px] px-2"
                  >
                    Toggle {selectedSupplier.is_active ? "Inactive" : "Active"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Contact Person</span>
                    <span className="font-medium text-foreground">{selectedSupplier.contact_name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone</span>
                    <span className="font-medium text-foreground">{selectedSupplier.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email</span>
                    <span className="font-medium text-foreground">{selectedSupplier.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Address</span>
                    <span className="font-medium text-foreground">{selectedSupplier.address || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Purchase Orders</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSheetOpen(false);
                      navigate({ to: "/business/purchases" });
                    }}
                    className="h-7 text-xs border-border"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Purchase
                  </Button>
                </div>

                {getSupplierStats(selectedSupplier).purchases.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl text-xs text-muted-foreground">
                    No purchase orders recorded for this supplier yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getSupplierStats(selectedSupplier).purchases.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-mono font-semibold text-foreground">{p.purchase_number || p.id}</div>
                          <div className="text-muted-foreground text-[11px] mt-0.5">
                            {p.created_at} · {p.items?.length || 0} items
                            {p.reference_number && ` · Ref: ${p.reference_number}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">
                            {fmt(p.total_minor ? p.total_minor / 100 : 0)}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider mt-0.5">
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

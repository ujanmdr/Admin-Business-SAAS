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
  CreditCard, CheckCircle2, Clock, AlertCircle, FileText, Trash2, Eye, RotateCcw, Building2,
  Tags, Edit2, X, Check, PackagePlus, Layers, Sparkles, ArrowRightLeft, Box
} from "lucide-react";
import {
  getPurchases, addPurchase, updatePurchaseStatus, recordPurchasePayment, recordPurchaseReturn,
  getPurchasePayments, getPurchaseReturns, getPurchaseCategories,
  addPurchaseCategory, updatePurchaseCategory, deletePurchaseCategory,
  Purchase, PurchaseCategory, PurchaseStatus, PurchaseLineItem, PurchasePayment, PurchaseReturn
} from "@/lib/purchase-state";
import { getSuppliers, addSupplier, Supplier } from "@/lib/supplier-state";
import { getInventoryProducts, addNewProduct, updateProductSupplier } from "@/lib/inventory-state";
import { fmt, Product } from "@/lib/finance-data";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductVariantRow {
  id: string;
  size: string;
  containerType: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  threshold: number;
  retail: boolean;
}

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

  // Line items state with packaging unit, pack size conversion, auto-detected suppliers, and category tracking
  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      qty: number;
      unitCost: number;
      unitType: string;
      packSize: number;
      supplierId?: string;
      supplierName: string;
      categoryId?: string;
      categoryName?: string;
      updateSupplier?: boolean;
    }>
  >([
    {
      productId: "",
      productName: "",
      sku: "",
      qty: 1,
      unitCost: 0,
      unitType: "Bottle",
      packSize: 1,
      supplierId: undefined,
      supplierName: "",
      categoryId: undefined,
      categoryName: "",
      updateSupplier: false,
    },
  ]);

  // Inline Quick-Add New Product state
  const [inlineProductOpen, setInlineProductOpen] = useState(false);
  const [targetLineIndex, setTargetLineIndex] = useState<number | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Product["category"]>("Hair");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdUnit, setNewProdUnit] = useState("Bottle");
  const [newProdCost, setNewProdCost] = useState<number>(0);
  const [newProdRetail, setNewProdRetail] = useState<number>(0);
  const [newProdThreshold, setNewProdThreshold] = useState<number>(5);
  const [newProdSupplierId, setNewProdSupplierId] = useState<string>("");

  // Product Variant Generator State
  const [hasVariants, setHasVariants] = useState(false);
  const [addAllVariantsToOrder, setAddAllVariantsToOrder] = useState(true);
  const [variantRows, setVariantRows] = useState<ProductVariantRow[]>([
    { id: "v-1", size: "250ml", containerType: "Bottle", sku: "", costPrice: 0, sellingPrice: 0, threshold: 5, retail: true },
    { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: "", costPrice: 0, sellingPrice: 0, threshold: 3, retail: false },
  ]);

  const resetInlineProductForm = (targetIdx: number | null = null) => {
    const defaultSup = selectedSupplierId && selectedSupplierId !== "all" && selectedSupplierId !== "custom"
      ? selectedSupplierId
      : suppliers[0]?.id || "";
    const baseCode = `PRD-${Date.now().toString().slice(-4)}`;
    setTargetLineIndex(targetIdx);
    setNewProdName("");
    setNewProdCategory("Hair");
    setNewProdSku(baseCode);
    setNewProdUnit("Bottle");
    setNewProdCost(0);
    setNewProdRetail(0);
    setNewProdThreshold(5);
    setNewProdSupplierId(defaultSup);
    setHasVariants(false);
    setAddAllVariantsToOrder(true);
    setVariantRows([
      { id: "v-1", size: "250ml", containerType: "Bottle", sku: `${baseCode}-250B`, costPrice: 0, sellingPrice: 0, threshold: 5, retail: true },
      { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: `${baseCode}-1000PB`, costPrice: 0, sellingPrice: 0, threshold: 3, retail: false },
    ]);
  };

  const addVariantRow = (size: string, containerType: string, defaultRetail: boolean = true) => {
    const cleanSize = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cleanCont = containerType.slice(0, 2).toUpperCase();
    const base = newProdSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
    const newSku = `${base}-${cleanSize || "VAR"}${cleanCont}`;
    setVariantRows((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        size,
        containerType,
        sku: newSku,
        costPrice: Number(newProdCost) || 0,
        sellingPrice: defaultRetail ? Number(newProdRetail) || 0 : 0,
        threshold: 5,
        retail: defaultRetail,
      },
    ]);
  };

  const updateVariantRow = (id: string, field: keyof ProductVariantRow, value: any) => {
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

  // Inline Quick-Add New Supplier state (Chained from Quick Add Product or Line Item)
  const [inlineSupplierOpen, setInlineSupplierOpen] = useState(false);
  const [targetSupplierLineIndex, setTargetSupplierLineIndex] = useState<number | null>(null);
  const [newSupName, setNewSupName] = useState("");
  const [newSupContact, setNewSupContact] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupAddress, setNewSupAddress] = useState("");

  const handleCreateSupplier = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSupName.trim()) {
      toast.error("Please enter a supplier name.");
      return;
    }
    const created = addSupplier({
      name: newSupName.trim(),
      contact_name: newSupContact.trim() || undefined,
      phone: newSupPhone.trim() || undefined,
      email: newSupEmail.trim() || undefined,
      address: newSupAddress.trim() || undefined,
      is_active: true,
    });
    toast.success(`Supplier "${created.name}" registered!`);
    refreshData();

    // If opened from Quick Add Product modal, pre-select this new supplier
    if (inlineProductOpen) {
      setNewProdSupplierId(created.id);
    }

    // If opened from a line item, assign to that line item
    if (targetSupplierLineIndex !== null) {
      const copy = [...items];
      if (copy[targetSupplierLineIndex]) {
        copy[targetSupplierLineIndex] = {
          ...copy[targetSupplierLineIndex],
          supplierId: created.id,
          supplierName: created.name,
          updateSupplier: true,
        };
        setItems(copy);
      }
      setTargetSupplierLineIndex(null);
    }

    setNewSupName("");
    setNewSupContact("");
    setNewSupPhone("");
    setNewSupEmail("");
    setNewSupAddress("");
    setInlineSupplierOpen(false);
  };

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

  // Receive Delivery Dialog (when physical goods arrive with the supplier's bill)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receiveTargetPurchase, setReceiveTargetPurchase] = useState<Purchase | null>(null);
  const [receiveBillRef, setReceiveBillRef] = useState("");

  // Category Management State
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Inline Category creation modal (from New Purchase form)
  const [inlineCategoryOpen, setInlineCategoryOpen] = useState(false);
  const [inlineCatName, setInlineCatName] = useState("");

  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const created = addPurchaseCategory(newCatName.trim());
    toast.success(`Category "${created.name}" created.`);
    setNewCatName("");
    refreshData();
  };

  const handleInlineCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const created = addPurchaseCategory(inlineCatName.trim());
    toast.success(`Custom category "${created.name}" created & selected!`);
    setInlineCatName("");
    setInlineCategoryOpen(false);
    refreshData();
    setSelectedCategoryId(created.id);
  };

  const handleStartEditCategory = (cat: PurchaseCategory) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCatName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    updatePurchaseCategory(id, { name: editingCatName.trim() });
    toast.success("Category updated.");
    setEditingCatId(null);
    refreshData();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    deletePurchaseCategory(id);
    toast.success(`Category "${name}" removed.`);
    refreshData();
    if (selectedCategoryId === id) {
      setSelectedCategoryId("");
    }
  };

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

  // Catalog filter (defaults to "all" so user can pick any item without friction)
  const filteredCatalogProducts = useMemo(() => {
    if (!selectedSupplierId || selectedSupplierId === "all") return products;
    if (selectedSupplierId === "custom") return products;
    return products.filter((p) => p.supplierId === selectedSupplierId);
  }, [products, selectedSupplierId]);

  // Helper: auto-detect purchase category for a given catalog product
  const detectCategoryForProduct = (p: Product, cats: PurchaseCategory[]): { id?: string; name?: string } => {
    if (!cats || cats.length === 0) return { id: undefined, name: undefined };

    // 1. Consumables / Salon Hygiene
    if (p.category === "Consumables") {
      const match = cats.find((c) => /consumable|hygiene/i.test(c.name));
      if (match) return { id: match.id, name: match.name };
    }
    // 2. Hair Products
    if (p.category === "Hair") {
      const match = cats.find((c) => /hair/i.test(c.name));
      if (match) return { id: match.id, name: match.name };
    }
    // 3. Skin / Spa Essentials
    if (p.category === "Skin" || p.category === "Spa") {
      const match = cats.find((c) => /skin|spa/i.test(c.name));
      if (match) return { id: match.id, name: match.name };
    }
    // 4. Retail Line Products
    if (p.retail) {
      const match = cats.find((c) => /retail/i.test(c.name));
      if (match) return { id: match.id, name: match.name };
    }
    // 5. Fallback to first available category
    return { id: cats[0].id, name: cats[0].name };
  };

  // Line item helpers: Auto-detect supplier and category from product
  const handleProductSelect = (index: number, prodId: string) => {
    if (prodId === "__new__") {
      resetInlineProductForm(index);
      setInlineProductOpen(true);
      return;
    }

    const found = products.find((p) => p.id === prodId);
    if (found) {
      const copy = [...items];
      const detectedCat = detectCategoryForProduct(found, categories);
      copy[index] = {
        productId: found.id,
        productName: found.name,
        sku: found.sku || "",
        qty: copy[index]?.qty || 1,
        unitCost: found.costPrice || 0,
        unitType: found.unitType || "Bottle",
        packSize: copy[index]?.packSize || 1,
        supplierId: found.supplierId,
        supplierName: found.supplier || "Direct Vendor",
        categoryId: detectedCat.id,
        categoryName: detectedCat.name || "",
        updateSupplier: false,
      };
      setItems(copy);
    }
  };

  const handleItemSupplierChange = (index: number, newSupId: string) => {
    if (newSupId === "__new__") {
      setTargetSupplierLineIndex(index);
      setNewSupName("");
      setNewSupContact("");
      setNewSupPhone("");
      setNewSupEmail("");
      setNewSupAddress("");
      setInlineSupplierOpen(true);
      return;
    }

    const copy = [...items];
    const sup = suppliers.find((s) => s.id === newSupId);
    if (sup) {
      const curProd = copy[index].productId ? products.find((p) => p.id === copy[index].productId) : null;
      const isMismatch = curProd && curProd.supplierId !== sup.id;
      copy[index] = {
        ...copy[index],
        supplierId: sup.id,
        supplierName: sup.name,
        updateSupplier: Boolean(isMismatch),
      };
      setItems(copy);
    }
  };

  const handleItemCategoryChange = (index: number, newCatId: string) => {
    if (newCatId === "__new__") {
      setInlineCategoryOpen(true);
      return;
    }

    const copy = [...items];
    const cat = categories.find((c) => c.id === newCatId);
    if (cat) {
      copy[index] = {
        ...copy[index],
        categoryId: cat.id,
        categoryName: cat.name,
      };
      setItems(copy);
    }
  };

  const handleSaveInlineProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProdName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    const supObj = suppliers.find((s) => s.id === newProdSupplierId);
    const supplierName = supObj ? supObj.name : "Direct Vendor";
    const supplierId = supObj?.id;

    if (hasVariants) {
      if (variantRows.length === 0) {
        toast.error("Please add at least one variant or turn off variant mode.");
        return;
      }

      for (const v of variantRows) {
        if (!v.size.trim()) {
          toast.error("Please provide a size for all variants.");
          return;
        }
      }

      const createdProducts: Product[] = [];
      const basePrefix = newProdSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;

      for (let i = 0; i < variantRows.length; i++) {
        const v = variantRows[i];
        const vSku = v.sku.trim() || `${basePrefix}-${v.size.replace(/[^a-zA-Z0-9]/g, "")}-${i + 1}`;
        const compoundName = `${newProdName.trim()} · ${v.size.trim()} ${v.containerType}`;

        const createdProd = addNewProduct(
          {
            name: compoundName,
            category: newProdCategory,
            sku: vSku,
            threshold: Number(v.threshold) || 5,
            supplier: supplierName,
            supplierId: supplierId,
            unitType: v.containerType || "Bottle",
            size: v.size.trim(),
            containerType: v.containerType,
            costPrice: Number(v.costPrice) || 0,
            sellingPrice: v.retail ? Number(v.sellingPrice) || 0 : 0,
            expiry: "2027-12",
            usedIn: ["Salon Services"],
            retail: Boolean(v.retail),
          },
          0
        );
        createdProducts.push(createdProd);
      }

      toast.success(`Registered ${createdProducts.length} variants for "${newProdName.trim()}"!`);
      refreshData();

      // Insert into Purchase Order line items
      const targetIdx = targetLineIndex !== null ? targetLineIndex : items.length - 1;
      const copy = [...items];

      if (addAllVariantsToOrder) {
        createdProducts.forEach((prod, pIdx) => {
          const detectedCat = detectCategoryForProduct(prod, categories);
          const lineData = {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku || "",
            qty: 1,
            unitCost: prod.costPrice || 0,
            unitType: prod.unitType || "Bottle",
            packSize: 1,
            supplierId: prod.supplierId,
            supplierName: prod.supplier,
            categoryId: detectedCat.id,
            categoryName: detectedCat.name || "",
            updateSupplier: false,
          };

          if (pIdx === 0 && copy[targetIdx] && (!copy[targetIdx].productId || targetLineIndex !== null)) {
            copy[targetIdx] = { ...lineData, qty: copy[targetIdx]?.qty || 1 };
          } else {
            copy.push(lineData);
          }
        });
      } else {
        const first = createdProducts[0];
        const detectedCat = detectCategoryForProduct(first, categories);
        if (copy[targetIdx]) {
          copy[targetIdx] = {
            productId: first.id,
            productName: first.name,
            sku: first.sku || "",
            qty: copy[targetIdx]?.qty || 1,
            unitCost: first.costPrice || 0,
            unitType: first.unitType || "Bottle",
            packSize: 1,
            supplierId: first.supplierId,
            supplierName: first.supplier,
            categoryId: detectedCat.id,
            categoryName: detectedCat.name || "",
            updateSupplier: false,
          };
        }
      }

      setItems(copy);
      setInlineProductOpen(false);
      setTargetLineIndex(null);
      return;
    }

    // Single Product Flow
    const createdProd = addNewProduct(
      {
        name: newProdName.trim(),
        category: newProdCategory,
        sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        threshold: Number(newProdThreshold) || 5,
        supplier: supplierName,
        supplierId: supplierId,
        unitType: newProdUnit.trim() || "Bottle",
        size: undefined,
        containerType: newProdUnit.trim() || "Bottle",
        costPrice: Number(newProdCost) || 0,
        sellingPrice: Number(newProdRetail) || 0,
        expiry: "2027-12",
        usedIn: ["Salon Services"],
        retail: Number(newProdRetail) > 0,
      },
      0
    );

    toast.success(`Product "${createdProd.name}" registered to catalog with supplier "${supplierName}"!`);
    refreshData();

    // Assign to targeted line item with auto-detected supplier and category
    const detectedCat = detectCategoryForProduct(createdProd, categories);
    const targetIdx = targetLineIndex !== null ? targetLineIndex : items.length - 1;
    const copy = [...items];
    if (copy[targetIdx]) {
      copy[targetIdx] = {
        productId: createdProd.id,
        productName: createdProd.name,
        sku: createdProd.sku || "",
        qty: copy[targetIdx]?.qty || 1,
        unitCost: createdProd.costPrice || 0,
        unitType: createdProd.unitType || "Bottle",
        packSize: 1,
        supplierId: createdProd.supplierId,
        supplierName: createdProd.supplier,
        categoryId: detectedCat.id,
        categoryName: detectedCat.name || "",
        updateSupplier: false,
      };
      setItems(copy);
    }

    setInlineProductOpen(false);
    setTargetLineIndex(null);
  };

  const updateItemField = (index: number, field: string, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const addItem = () => {
    const defaultCat = categories.find((c) => c.id === selectedCategoryId) || categories[0];
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        sku: "",
        qty: 1,
        unitCost: 0,
        unitType: "Bottle",
        packSize: 1,
        supplierId: undefined,
        supplierName: "",
        categoryId: defaultCat?.id,
        categoryName: defaultCat?.name || "",
        updateSupplier: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Group items by supplier for auto-split preview and creation
  const supplierGroups = useMemo(() => {
    const map: Record<
      string,
      {
        supplierId?: string;
        supplierName: string;
        items: typeof items;
        subtotal: number;
      }
    > = {};

    items.forEach((item) => {
      if (!item.productName.trim() || (item.qty || 0) <= 0) return;
      const sName = item.supplierName?.trim() || "Direct Vendor";
      const key = item.supplierId || sName;
      if (!map[key]) {
        map[key] = {
          supplierId: item.supplierId,
          supplierName: sName,
          items: [],
          subtotal: 0,
        };
      }
      map[key].items.push(item);
      map[key].subtotal += (item.qty || 0) * (item.unitCost || 0);
    });

    return Object.values(map);
  }, [items]);

  // Create Purchase (Auto-Splits into multiple POs if items belong to different suppliers)
  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((i) => i.productName.trim() && i.qty > 0);
    if (validItems.length === 0 || supplierGroups.length === 0) {
      toast.error("Please add at least one valid line item with quantity > 0.");
      return;
    }

    const categoryObj = categories.find((c) => c.id === selectedCategoryId);
    const totalAllSubtotal = supplierGroups.reduce((acc, g) => acc + g.subtotal, 0);
    const createdPurchases: Purchase[] = [];

    for (const group of supplierGroups) {
      const groupDiscount =
        totalAllSubtotal > 0
          ? Math.round(discountAmount * (group.subtotal / totalAllSubtotal))
          : 0;
      const groupTaxable = Math.max(0, group.subtotal - groupDiscount);
      const groupTax = applyVat ? Math.round(groupTaxable * 0.13) : 0;
      const groupTotal = groupTaxable + groupTax;

      // Sync supplier update in product catalog if user flagged it
      group.items.forEach((item) => {
        if (item.updateSupplier && item.productId && item.supplierId) {
          updateProductSupplier(item.productId, item.supplierId, item.supplierName);
        }
      });

      // Determine category for this purchase order:
      const uniqueCats = Array.from(
        new Set(group.items.map((i) => i.categoryName?.trim()).filter(Boolean))
      );
      let finalCatName = categoryObj?.name;
      let finalCatId = selectedCategoryId && selectedCategoryId !== "auto" ? selectedCategoryId : undefined;

      if (!finalCatId) {
        if (uniqueCats.length === 1) {
          finalCatName = uniqueCats[0];
          const matchCat = categories.find((c) => c.name === uniqueCats[0]);
          finalCatId = matchCat?.id || group.items[0]?.categoryId;
        } else if (uniqueCats.length > 1) {
          finalCatName = `Mixed (${uniqueCats.join(", ")})`;
          finalCatId = undefined;
        } else {
          finalCatName = "General Purchase";
        }
      } else if (uniqueCats.length > 1) {
        finalCatName = `Mixed (${uniqueCats.join(", ")})`;
      }

      const created = addPurchase({
        business_id: "biz-aura",
        branch_id: "Jhamsikhel",
        category_id: finalCatId,
        category_name: finalCatName,
        supplier_id: group.supplierId,
        supplier_name: group.supplierName,
        reference_number: purchaseStatus === "received" ? (referenceNumber.trim() || undefined) : undefined,
        status: purchaseStatus,
        subtotal_minor: group.subtotal * 100,
        discount_minor: groupDiscount * 100,
        tax_minor: groupTax * 100,
        total_minor: groupTotal * 100,
        amount_paid_minor: 0,
        currency: "NPR",
        notes: notes.trim() || undefined,
        received_at: purchaseStatus === "received" ? new Date().toISOString() : undefined,
        items: group.items.map((item) => ({
          productId: item.productId || `prod-${Date.now()}`,
          productName: item.productName,
          sku: item.sku,
          qty: item.qty,
          unit_cost_minor: item.unitCost * 100,
          line_total_minor: item.qty * item.unitCost * 100,
          unitType: item.unitType || "Bottle",
          packSize: item.packSize || 1,
          totalUnits: (item.qty || 1) * (item.packSize || 1),
          category_id: item.categoryId,
          category_name: item.categoryName,
        })),
      });

      createdPurchases.push(created);
    }

    if (createdPurchases.length === 1) {
      toast.success(
        `Purchase ${createdPurchases[0].purchase_number} created for ${createdPurchases[0].supplier_name}.`
      );
    } else {
      toast.success(
        `⚡ Automatically created ${createdPurchases.length} separate Purchase Orders for: ${createdPurchases.map((p) => p.supplier_name).join(", ")}!`
      );
    }

    setOpenNewPurchase(false);

    // Reset Form
    setSelectedSupplierId("all");
    setCustomSupplierName("");
    setSelectedCategoryId("");
    setReferenceNumber("");
    setPurchaseStatus("draft");
    setDiscountAmount(0);
    setApplyVat(true);
    setNotes("");
    setItems([
      {
        productId: "",
        productName: "",
        sku: "",
        qty: 1,
        unitCost: 0,
        unitType: "Bottle",
        packSize: 1,
        supplierId: undefined,
        supplierName: "",
        categoryId: undefined,
        categoryName: "",
        updateSupplier: false,
      },
    ]);

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
  const handleOpenReceiveDialog = (p: Purchase) => {
    setReceiveTargetPurchase(p);
    setReceiveBillRef(p.reference_number || "");
    setReceiveDialogOpen(true);
  };

  const handleConfirmReceive = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!receiveTargetPurchase) return;

    const updated = updatePurchaseStatus(
      receiveTargetPurchase.id,
      "received",
      receiveBillRef.trim() || undefined
    );

    toast.success(
      `Purchase ${receiveTargetPurchase.purchase_number} marked as Received & inventory restocked!`
    );
    setReceiveDialogOpen(false);
    refreshData();

    if (viewPurchase && viewPurchase.id === receiveTargetPurchase.id && updated) {
      setViewPurchase(updated);
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
              onClick={() => setManageCategoriesOpen(true)}
              className="rounded-xl border-border"
            >
              <Tags className="h-4 w-4 mr-2" />
              Categories
            </Button>
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
              <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
                <DialogHeader className="border-b border-border pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <DialogTitle className="font-serif text-2xl flex items-center gap-2.5 text-foreground">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                        Create Purchase Order
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Select catalog items or register new SKUs. Suppliers and categories are auto-detected, with intelligent multi-vendor split on save.
                      </DialogDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg border-border bg-sand-soft/50 font-medium">
                        📍 Jhamsikhel Branch
                      </Badge>
                      {supplierGroups.length > 1 ? (
                        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
                          <Sparkles className="h-3 w-3" /> Auto-Split ({supplierGroups.length} POs)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-lg border-border text-muted-foreground">
                          🏢 Single Vendor
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <form onSubmit={handleCreatePurchase} className="space-y-5 pt-3">
                  {/* Order Meta Panel */}
                  <div className="p-4 rounded-2xl border border-border bg-sand-soft/30 dark:bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary" /> Order Details & Settings
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Fill in optional supplier bill reference or set defaults
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                      {/* Order Status */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/90">Order Status</label>
                        <Select value={purchaseStatus} onValueChange={(v: PurchaseStatus) => setPurchaseStatus(v)}>
                          <SelectTrigger className="h-9 text-xs bg-background rounded-xl border-border font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-slate-400" />
                                <span>Draft (Saved for review)</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="ordered">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-sky-500" />
                                <span>Ordered (Sent to vendor)</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="received">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span>Received (Goods in hand)</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Supplier Bill / Invoice # (Dynamic: only available if goods have arrived) */}
                      {purchaseStatus === "received" ? (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                          <label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>Supplier Bill / Invoice #</span>
                            <span className="text-[10px] text-muted-foreground font-normal">(Paper bill)</span>
                          </label>
                          <Input
                            placeholder="e.g. INV-2026-0891"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            className="h-9 text-xs bg-background rounded-xl border-border font-mono font-medium"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Supplier Bill / Invoice #</span>
                          </label>
                          <div className="h-9 rounded-xl border border-dashed border-border/80 bg-muted/40 px-3 flex items-center text-[11px] text-muted-foreground font-normal">
                            <span>Issued later upon delivery</span>
                          </div>
                        </div>
                      )}

                      {/* Default Category */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-foreground/80">Category Default</label>
                          <button
                            type="button"
                            onClick={() => setInlineCategoryOpen(true)}
                            className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                          >
                            <Plus className="h-3 w-3" /> Custom
                          </button>
                        </div>
                        <Select
                          value={selectedCategoryId || "auto"}
                          onValueChange={(val) => {
                            if (val === "__new__") {
                              setInlineCategoryOpen(true);
                            } else if (val === "auto") {
                              setSelectedCategoryId("");
                            } else {
                              setSelectedCategoryId(val);
                              const cat = categories.find((c) => c.id === val);
                              if (cat) {
                                setItems((prev) =>
                                  prev.map((it) => ({
                                    ...it,
                                    categoryId: cat.id,
                                    categoryName: cat.name,
                                  }))
                                );
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs bg-background rounded-xl border-border">
                            <SelectValue placeholder="Auto-detect per item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">
                              <span className="text-primary font-medium flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" /> Auto-detect per item
                              </span>
                            </SelectItem>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__new__" className="text-primary font-medium border-t border-border mt-1">
                              + Create Custom Category...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Catalog Filter */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                          <Filter className="h-3 w-3 text-muted-foreground" /> Catalog View Filter
                        </label>
                        <Select value={selectedSupplierId || "all"} onValueChange={setSelectedSupplierId}>
                          <SelectTrigger className="h-9 text-xs bg-background rounded-xl border-border">
                            <SelectValue placeholder="All Suppliers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Suppliers (Full Catalog)</SelectItem>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Line Items Container */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Box className="h-4 w-4 text-primary" />
                          Order Line Items
                          <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-full font-medium">
                            {items.length} {items.length === 1 ? "item" : "items"}
                          </Badge>
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Configure product, auto-detected vendor & category, packaging conversion, and order cost.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            resetInlineProductForm(items.length);
                            setInlineProductOpen(true);
                          }}
                          className="h-8 text-xs border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:text-primary rounded-xl"
                        >
                          <PackagePlus className="h-3.5 w-3.5 mr-1.5" /> Quick Register Product
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={addItem}
                          className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 rounded-xl px-3"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Line Item
                        </Button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/30 transition shadow-xs space-y-2.5"
                        >
                          {/* Row Top: Product Select + Supplier + Category + Delete */}
                          <div className="flex flex-col lg:flex-row gap-2.5 items-start lg:items-center justify-between">
                            {/* Product selection */}
                            <div className="flex items-center gap-2 flex-1 w-full min-w-0">
                              <span className="h-6 w-6 rounded-full bg-sand-soft dark:bg-muted text-[11px] font-bold flex items-center justify-center text-muted-foreground shrink-0 border border-border/80">
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-[200px]">
                                <Select
                                  value={item.productId}
                                  onValueChange={(val) => handleProductSelect(idx, val)}
                                >
                                  <SelectTrigger className="h-9 text-xs bg-background font-medium rounded-xl border-border">
                                    <SelectValue placeholder="Search or select catalog product..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    <SelectItem
                                      value="__new__"
                                      className="text-primary font-semibold border-b border-border pb-1.5 mb-1 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>+ Register New Product to Catalog...</span>
                                      </div>
                                    </SelectItem>

                                    {filteredCatalogProducts.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        <div className="flex items-center justify-between w-full gap-3">
                                          <span className="font-medium text-foreground">{p.name}</span>
                                          <span className="text-[11px] text-muted-foreground">
                                            {p.supplier ? `· ${p.supplier}` : ""} · Cost {fmt(p.costPrice)}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Supplier & Category controls */}
                            <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                              {/* Supplier */}
                              <div className="w-1/2 lg:w-44">
                                <Select
                                  value={item.supplierId || "direct"}
                                  onValueChange={(val) => handleItemSupplierChange(idx, val)}
                                >
                                  <SelectTrigger className="h-9 text-xs bg-background rounded-xl border-border">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <SelectValue placeholder="Auto Supplier" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="__new__"
                                      className="text-primary font-semibold border-b border-border pb-1.5 mb-1 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>+ Register New Supplier...</span>
                                      </div>
                                    </SelectItem>
                                    {suppliers.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-1.5">
                                          <Building2 className="h-3 w-3 text-muted-foreground" />
                                          <span>{s.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="direct">Direct / Local Vendor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Category */}
                              <div className="w-1/2 lg:w-44">
                                <Select
                                  value={item.categoryId || "none"}
                                  onValueChange={(val) => handleItemCategoryChange(idx, val)}
                                >
                                  <SelectTrigger className="h-9 text-xs bg-background rounded-xl border-border">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <Tags className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <SelectValue placeholder="Category" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        <div className="flex items-center gap-1.5">
                                          <Tags className="h-3 w-3 text-muted-foreground" />
                                          <span className="truncate">{c.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                    <SelectItem
                                      value="__new__"
                                      className="text-primary font-medium border-t border-border pt-1 mt-1 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Plus className="h-3 w-3" />
                                        <span>+ Custom Category...</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Remove Item Button */}
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(idx)}
                                  className="h-9 w-9 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl shrink-0 transition"
                                  title="Remove line item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Row Bottom: Packaging Unit, Pack Multiplier, Qty, Live Conversion, Unit Cost, Total */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 bg-sand-soft/30 dark:bg-muted/20 px-3 py-2 rounded-xl text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Packaging Unit */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium">Unit:</span>
                                <Select
                                  value={item.unitType || "Bottle"}
                                  onValueChange={(val) => updateItemField(idx, "unitType", val)}
                                >
                                  <SelectTrigger className="h-8 w-24 text-xs bg-background border-border rounded-lg">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Bottle">Bottle</SelectItem>
                                    <SelectItem value="Box">Box</SelectItem>
                                    <SelectItem value="Carton">Carton</SelectItem>
                                    <SelectItem value="Tube">Tube</SelectItem>
                                    <SelectItem value="Pack">Pack</SelectItem>
                                    <SelectItem value="Piece">Piece</SelectItem>
                                    <SelectItem value="Can">Can</SelectItem>
                                    <SelectItem value="Packet">Packet</SelectItem>
                                    <SelectItem value="Liter">Liter</SelectItem>
                                    <SelectItem value="Kg">Kg</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Pack Size */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium" title="Items inside each pack">
                                  Pack Size:
                                </span>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={item.packSize ?? 1}
                                  onChange={(e) =>
                                    updateItemField(idx, "packSize", Math.max(1, Number(e.target.value) || 1))
                                  }
                                  className="h-8 w-16 text-xs text-center bg-background border-border rounded-lg"
                                />
                              </div>

                              {/* Order Quantity */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium">Order Qty:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateItemField(idx, "qty", Math.max(1, Number(e.target.value) || 1))
                                  }
                                  className="h-8 w-16 text-xs text-center font-semibold bg-background border-border rounded-lg"
                                />
                              </div>

                              {/* Stock Conversion Badge */}
                              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                                <span>📦</span>
                                <span>
                                  +{(item.qty || 1) * (item.packSize || 1)} individual {(item.unitType || "unit").toLowerCase()}s stock
                                </span>
                              </div>
                            </div>

                            {/* Financials: Cost & Line Total */}
                            <div className="flex items-center gap-4 ml-auto">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-medium">Unit Cost:</span>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">
                                    रु
                                  </span>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={item.unitCost}
                                    onChange={(e) => updateItemField(idx, "unitCost", Number(e.target.value))}
                                    className="h-8 w-24 pl-5 text-xs text-right bg-background border-border font-medium rounded-lg"
                                  />
                                </div>
                              </div>

                              <div className="text-right pl-2">
                                <span className="text-[10px] text-muted-foreground block font-medium">Total</span>
                                <span className="text-xs font-bold text-foreground">
                                  {fmt((item.qty || 0) * (item.unitCost || 0))}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Supplier Override helper */}
                          {item.updateSupplier && (
                            <div className="pt-0.5">
                              <label className="flex items-center gap-2 cursor-pointer text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg text-[11px]">
                                <input
                                  type="checkbox"
                                  checked={!!item.updateSupplier}
                                  onChange={(e) => updateItemField(idx, "updateSupplier", e.target.checked)}
                                  className="rounded border-amber-300 text-primary h-3.5 w-3.5"
                                />
                                <span>
                                  Update catalog default: Set <b>{item.supplierName}</b> as primary vendor for <b>{item.productName}</b>
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Auto-Split Summary Card */}
                  {supplierGroups.length > 0 && (
                    <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                          <Layers className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">
                            {supplierGroups.length > 1
                              ? `⚡ Multi-Supplier Auto-Split: ${supplierGroups.length} Separate Purchase Orders will be created`
                              : `🏢 Single Supplier Order: 1 Purchase Order will be created`}
                          </span>
                        </div>
                        <Badge className="bg-primary text-primary-foreground font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                          {supplierGroups.length} {supplierGroups.length > 1 ? "Orders" : "Order"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                        {supplierGroups.map((grp, gIdx) => {
                          const grpCats = Array.from(
                            new Set(grp.items.map((it) => it.categoryName?.trim()).filter(Boolean))
                          );
                          const catBadge =
                            grpCats.length > 1
                              ? `Mixed (${grpCats.join(", ")})`
                              : grpCats[0] || "General Purchase";

                          return (
                            <div
                              key={gIdx}
                              className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-2 hover:border-primary/40 transition"
                            >
                              <div>
                                <div className="font-semibold text-foreground text-xs flex items-center justify-between gap-1.5">
                                  <span className="flex items-center gap-1.5 truncate font-medium">
                                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="truncate">{grp.supplierName}</span>
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-normal shrink-0">
                                    PO #{gIdx + 1}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                  {grp.items.length} item{grp.items.length > 1 ? "s" : ""}:{" "}
                                  {grp.items.map((it) => it.productName).join(", ")}
                                </div>
                                <div className="flex items-center gap-1 mt-1.5">
                                  <Tags className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-[10px] text-muted-foreground truncate font-medium bg-sand-soft/70 dark:bg-muted px-2 py-0.5 rounded-md border border-border/50">
                                    {catBadge}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground font-medium">Order Subtotal:</span>
                                <span className="font-bold text-foreground">{fmt(grp.subtotal)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bottom Grid: Notes & Financial Receipt */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Notes */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Notes & Delivery Instructions
                      </label>
                      <Textarea
                        rows={5}
                        placeholder="e.g. Delivery contact person, payment credit terms (30 days), batch inspection requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-xs bg-background rounded-xl border-border resize-none"
                      />
                    </div>

                    {/* Financial Summary */}
                    <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2.5 text-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="font-medium">Combined Subtotal:</span>
                          <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground font-medium">Discount (NPR):</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">रु</span>
                            <Input
                              type="number"
                              min="0"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(Number(e.target.value))}
                              className="h-8 w-32 pl-5 text-xs text-right bg-background border-border rounded-lg font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="text-muted-foreground flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={applyVat}
                              onChange={(e) => setApplyVat(e.target.checked)}
                              className="rounded border-border text-primary h-3.5 w-3.5"
                            />
                            <span className="font-medium text-foreground">Apply 13% Nepal VAT</span>
                          </label>
                          <span className="font-medium text-foreground">{fmt(taxAmount)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex justify-between items-center">
                        <div>
                          <span className="font-serif font-bold text-sm text-foreground block">Combined Grand Total:</span>
                          <span className="text-[11px] text-muted-foreground">
                            Split across {supplierGroups.length} supplier {supplierGroups.length > 1 ? "orders" : "order"}
                          </span>
                        </div>
                        <span className="text-lg font-serif font-bold text-foreground">
                          {fmt(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions Footer */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpenNewPurchase(false)}
                      className="text-muted-foreground hover:text-foreground rounded-xl"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="bg-foreground text-background hover:bg-foreground/90 font-medium px-5 rounded-xl h-10 flex items-center gap-2 shadow-xs"
                    >
                      {supplierGroups.length > 1 ? (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Save & Create {supplierGroups.length} Purchase Orders ({fmt(grandTotal)})</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Create Purchase Order ({fmt(grandTotal)})</span>
                        </>
                      )}
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
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              if (val === "__manage__") {
                setManageCategoriesOpen(true);
              } else {
                setCategoryFilter(val);
              }
            }}
          >
            <SelectTrigger className="h-9 w-44 text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
              <SelectItem value="__manage__" className="text-primary font-medium border-t border-border mt-1">
                + Manage Categories...
              </SelectItem>
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
                              onClick={() => handleOpenReceiveDialog(p)}
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
                  {viewPurchase.status !== "received" && viewPurchase.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReceiveDialog(viewPurchase)}
                      className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-2.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Receive Stock
                    </Button>
                  )}
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
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-center">Packaging / Qty</th>
                        <th className="p-2.5 text-center">Stock Conversion</th>
                        <th className="p-2.5 text-right">Unit Cost</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {viewPurchase.items.map((it, idx) => {
                        const packSize = it.packSize || 1;
                        const totalUnits = it.totalUnits || it.qty * packSize;
                        return (
                          <tr key={idx}>
                            <td className="p-2.5 font-medium">
                              <div>{it.productName}</div>
                              {it.sku ? <div className="text-muted-foreground text-[10px]">{it.sku}</div> : null}
                            </td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-sand-soft text-foreground border border-border">
                                {it.category_name || viewPurchase.category_name || "General"}
                              </span>
                            </td>
                            <td className="p-2.5 text-center">
                              {it.qty} {it.unitType || "unit"}{it.qty > 1 ? "s" : ""}
                              {packSize > 1 ? (
                                <span className="text-muted-foreground block text-[10px]">
                                  {packSize} units/pack
                                </span>
                              ) : null}
                            </td>
                            <td className="p-2.5 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                              +{totalUnits} units
                            </td>
                            <td className="p-2.5 text-right">{fmt(it.unit_cost_minor / 100)}</td>
                            <td className="p-2.5 text-right font-semibold">{fmt(it.line_total_minor / 100)}</td>
                          </tr>
                        );
                      })}
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

      {/* Receive Stock Delivery Dialog */}
      {receiveTargetPurchase && (
        <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Receive Stock Delivery
              </DialogTitle>
              <DialogDescription>
                Confirm that goods have physically arrived at the salon. Enter the supplier's paper bill number to link it and restock inventory.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmReceive} className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-sand-soft/40 dark:bg-muted/30 rounded-xl border border-border space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Purchase Order:</span>
                  <span className="font-mono text-foreground">{receiveTargetPurchase.purchase_number}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Supplier / Vendor:</span>
                  <span className="text-foreground">{receiveTargetPurchase.supplier_name}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Incoming Stock:</span>
                  <span className="text-emerald-600 font-semibold">
                    {receiveTargetPurchase.items.length} items (
                    +{receiveTargetPurchase.items.reduce((acc, it) => acc + (it.totalUnits || it.qty * (it.packSize || 1)), 0)} units
                    )
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Supplier Bill / Invoice #</span>
                  <span className="text-[11px] text-muted-foreground font-normal">(from paper delivery slip)</span>
                </label>
                <Input
                  placeholder="e.g. INV-8891, BP-BILL-4412"
                  value={receiveBillRef}
                  onChange={(e) => setReceiveBillRef(e.target.value)}
                  className="text-xs h-9 font-mono font-medium"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  The supplier's invoice number from the physical paper bill they handed to you upon delivery.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setReceiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium">
                  <Check className="h-4 w-4 mr-1" /> Confirm Delivery & Restock
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Custom Purchase Categories Dialog */}
      <Dialog open={manageCategoriesOpen} onOpenChange={setManageCategoriesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Tags className="h-5 w-5 text-primary" />
              Custom Purchase Categories
            </DialogTitle>
            <DialogDescription>
              Create and manage procurement categories for organizing supplier orders and expenses.
            </DialogDescription>
          </DialogHeader>

          {/* Add Category Input */}
          <form onSubmit={handleCreateCategory} className="flex gap-2 pt-2">
            <Input
              placeholder="e.g. Organic Spa Oils, Marketing Swag..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" className="h-9 px-3 text-xs bg-foreground text-background hover:bg-foreground/90 flex-shrink-0">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </form>

          {/* Categories List */}
          <div className="border border-border rounded-xl divide-y divide-border max-h-72 overflow-y-auto mt-2">
            {categories.map((c) => {
              const isEditing = editingCatId === c.id;
              return (
                <div key={c.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-sand-soft/30 transition">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <Input
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="h-7 text-xs bg-background"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleSaveEditCategory(c.id)} className="h-7 w-7 p-0 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCatId(null)} className="h-7 w-7 p-0 text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-foreground truncate">{c.name}</span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditCategory(c)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose"
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setManageCategoriesOpen(false)} className="rounded-xl text-xs">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Custom Category Dialog */}
      <Dialog open={inlineCategoryOpen} onOpenChange={setInlineCategoryOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Add Custom Category</DialogTitle>
            <DialogDescription>
              Create a custom purchase category to immediately assign to this order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInlineCreateCategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Category Name *</label>
              <Input
                placeholder="e.g. Marketing Packaging, Spa Oils..."
                value={inlineCatName}
                onChange={(e) => setInlineCatName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setInlineCategoryOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs">
                Create & Select
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Quick Add Product to Inventory Dialog with Variant Generator */}
      <Dialog open={inlineProductOpen} onOpenChange={setInlineProductOpen}>
        <DialogContent className={cn("max-h-[92vh] overflow-y-auto transition-all duration-200", hasVariants ? "max-w-3xl" : "max-w-md")}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="font-serif text-lg flex items-center gap-2">
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
                      const baseCode = newProdSku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
                      setVariantRows([
                        { id: "v-1", size: "250ml", containerType: "Bottle", sku: `${baseCode}-250B`, costPrice: newProdCost || 0, sellingPrice: newProdRetail || 0, threshold: 5, retail: true },
                        { id: "v-2", size: "1000ml (1L)", containerType: "Pump Bottle", sku: `${baseCode}-1000PB`, costPrice: (newProdCost ? newProdCost * 3 : 0), sellingPrice: 0, threshold: 3, retail: false },
                      ]);
                    }
                  }}
                />
              </div>
            </div>
            <DialogDescription>
              {hasVariants
                ? "Define a base product and generate its specific sizes, container types (bottles, tubes, jars), SKUs, and retail vs backbar pricing."
                : "Add a brand new product SKU to your catalog. It will immediately be attached to this purchase order."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveInlineProduct} className="space-y-3.5 pt-2">
            {/* Top base info: Name, Category, Primary Supplier */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-5" : "sm:col-span-12")}>
                <label className="text-xs font-semibold text-foreground/80">
                  {hasVariants ? "Base Product Brand & Name *" : "Product Name *"}
                </label>
                <Input
                  placeholder={hasVariants ? "e.g. Olaplex No. 4 Shampoo" : "e.g. Olaplex No. 4P Blonde Toning Shampoo"}
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-3" : "sm:col-span-6")}>
                <label className="text-xs font-semibold text-foreground/80">Category</label>
                <Select
                  value={newProdCategory}
                  onValueChange={(val: any) => setNewProdCategory(val)}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair">Hair</SelectItem>
                    <SelectItem value="Skin">Skin</SelectItem>
                    <SelectItem value="Nail">Nail</SelectItem>
                    <SelectItem value="Makeup">Makeup</SelectItem>
                    <SelectItem value="Spa">Spa</SelectItem>
                    <SelectItem value="Dental">Dental</SelectItem>
                    <SelectItem value="Consumables">Consumables</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={cn("space-y-1.5", hasVariants ? "sm:col-span-4" : "sm:col-span-6")}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/80">Primary Supplier *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSupplierLineIndex(null);
                      setNewSupName("");
                      setNewSupContact("");
                      setNewSupPhone("");
                      setNewSupEmail("");
                      setNewSupAddress("");
                      setInlineSupplierOpen(true);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </div>
                <Select
                  value={newProdSupplierId}
                  onValueChange={(val) => {
                    if (val === "__new__") {
                      setTargetSupplierLineIndex(null);
                      setNewSupName("");
                      setNewSupContact("");
                      setNewSupPhone("");
                      setNewSupEmail("");
                      setNewSupAddress("");
                      setInlineSupplierOpen(true);
                    } else {
                      setNewProdSupplierId(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Select primary vendor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="__new__"
                      className="text-primary font-semibold border-b border-border pb-1.5 mb-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Register New Supplier...</span>
                      </div>
                    </SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* If Single Product: Show Base SKU, Unit, Cost, Retail, Threshold */}
            {!hasVariants && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">SKU / Code</label>
                    <Input
                      placeholder="e.g. OLP-4P-250"
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Base Packaging Unit</label>
                    <Select
                      value={newProdUnit}
                      onValueChange={(val) => setNewProdUnit(val)}
                    >
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bottle">Bottle</SelectItem>
                        <SelectItem value="Box">Box</SelectItem>
                        <SelectItem value="Carton">Carton</SelectItem>
                        <SelectItem value="Tube">Tube</SelectItem>
                        <SelectItem value="Pack">Pack</SelectItem>
                        <SelectItem value="Piece">Piece</SelectItem>
                        <SelectItem value="Can">Can</SelectItem>
                        <SelectItem value="Packet">Packet</SelectItem>
                        <SelectItem value="Liter">Liter</SelectItem>
                        <SelectItem value="Kg">Kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Cost Price (NPR) *</label>
                    <Input
                      type="number"
                      min="0"
                      value={newProdCost}
                      onChange={(e) => setNewProdCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Retail Price (NPR)</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0 if Backbar only"
                      value={newProdRetail}
                      onChange={(e) => setNewProdRetail(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Low Stock Alert</label>
                    <Input
                      type="number"
                      min="0"
                      value={newProdThreshold}
                      onChange={(e) => setNewProdThreshold(Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* If Multiple Variants: Variant Generator Matrix */}
            {hasVariants && (
              <div className="space-y-3 pt-1">
                {/* Presets & Base Code Helper */}
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

                {/* Variant Table */}
                <div className="border border-border rounded-xl overflow-hidden shadow-xs">
                  <div className="max-h-[280px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-xs z-10 border-b border-border">
                        <tr>
                          <th className="p-2 pl-3 font-semibold">Size / Volume</th>
                          <th className="p-2 font-semibold">Container Type</th>
                          <th className="p-2 font-semibold">SKU Code</th>
                          <th className="p-2 font-semibold w-24">Cost (NPR)</th>
                          <th className="p-2 font-semibold w-24">Retail (NPR)</th>
                          <th className="p-2 font-semibold text-center w-28">Type</th>
                          <th className="p-2 font-semibold w-16 text-center">Alert</th>
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
                                {v.retail ? "Retail Sale" : "In-Salon Backbar"}
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

                {/* Purchase Order Line Integration Setting */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addAllVariants"
                      checked={addAllVariantsToOrder}
                      onChange={(e) => setAddAllVariantsToOrder(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="addAllVariants" className="text-xs font-medium cursor-pointer text-foreground">
                      Add all <span className="font-bold text-primary">{variantRows.length} variants</span> as line items to this Purchase Order
                    </label>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {addAllVariantsToOrder ? "Inserts each size with its cost into the order" : "Inserts first variant only"}
                  </span>
                </div>
              </div>
            )}

            {/* Dialog Action Buttons */}
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInlineProductOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
              >
                {hasVariants
                  ? `Save ${variantRows.length} Variants & Attach to Order`
                  : "Register & Add to Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Quick Add Supplier Dialog (Chained from PO or Product modal) */}
      <Dialog open={inlineSupplierOpen} onOpenChange={setInlineSupplierOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Register New Supplier
            </DialogTitle>
            <DialogDescription>
              Add a brand new distributor or vendor profile without leaving your order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSupplier} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Supplier / Company Name *</label>
              <Input
                placeholder="e.g. Kérastase Nepal, Wella Pro Imports..."
                value={newSupName}
                onChange={(e) => setNewSupName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Contact Person</label>
                <Input
                  placeholder="e.g. Ramesh Giri"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Phone Number</label>
                <Input
                  placeholder="+977 980-..."
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="orders@vendor.com"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">City / Location</label>
                <Input
                  placeholder="e.g. Kathmandu, Lalitpur"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInlineSupplierOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
              >
                Save & Select Supplier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

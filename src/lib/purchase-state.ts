import { adjustProductStock } from "./inventory-state";

export interface PurchaseCategory {
  id: string;
  name: string;
  position: number;
  is_active: boolean;
}

export type PurchaseStatus = "draft" | "ordered" | "received" | "cancelled";

export interface PurchaseLineItem {
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unit_cost_minor: number;
  line_total_minor: number;
}

export interface Purchase {
  id: string;
  business_id: string;
  branch_id: string;
  category_id?: string;
  category_name?: string;
  supplier_id?: string;
  purchase_number: string; // server-generated: PUR-YYYYMMDD-XXXXXX
  supplier_name: string;   // frozen snapshot; auto-filled from Supplier.name or custom
  reference_number?: string; // supplier's own bill/invoice number
  status: PurchaseStatus;
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  total_minor: number;
  amount_paid_minor: number;
  currency: string;
  notes?: string;
  received_at?: string;
  created_at: string;
  items: PurchaseLineItem[];
}

export interface PurchasePayment {
  id: string;
  purchase_id: string;
  business_id: string;
  amount_minor: number;
  method?: string; // eSewa, Khalti, Bank Transfer, Cash
  note?: string;
  paid_at: string;
  created_by: string;
  created_at: string;
}

export interface PurchaseReturnLine {
  product_id: string;
  product_name: string;
  quantity: number;
  refund_minor: number;
}

export interface PurchaseReturn {
  id: string;
  purchase_id: string;
  business_id: string;
  branch_id: string;
  reason?: string;
  refund_minor: number;
  created_by: string;
  created_at: string;
  lines: PurchaseReturnLine[];
}

export const INITIAL_CATEGORIES: PurchaseCategory[] = [
  { id: "cat-1", name: "Professional Hair Products", position: 1, is_active: true },
  { id: "cat-2", name: "Skin & Spa Essentials", position: 2, is_active: true },
  { id: "cat-3", name: "Salon Equipment & Tools", position: 3, is_active: true },
  { id: "cat-4", name: "Daily Consumables & Hygiene", position: 4, is_active: true },
  { id: "cat-5", name: "Retail Line Inventory", position: 5, is_active: true },
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: "pur-uuid-1041",
    business_id: "biz-aura",
    branch_id: "Jhamsikhel",
    category_id: "cat-1",
    category_name: "Professional Hair Products",
    supplier_id: "sup-1",
    purchase_number: "PUR-20260919-001041",
    supplier_name: "L'Oréal Nepal",
    reference_number: "INV-LOR-8891",
    status: "received",
    subtotal_minor: 2580000,
    discount_minor: 80000,
    tax_minor: 325000,
    total_minor: 2825000,
    amount_paid_minor: 1000000,
    currency: "NPR",
    notes: "Monthly color line restock. 30 days credit terms with supplier.",
    received_at: "2026-09-19T14:30:00Z",
    created_at: "2026-09-19T10:15:00Z",
    items: [
      {
        productId: "i1",
        productName: "L'Oréal Majirel 7.43",
        sku: "LOR-MAJ-743",
        qty: 12,
        unit_cost_minor: 120000,
        line_total_minor: 1440000,
      },
      {
        productId: "i10",
        productName: "L'Oréal Smoothing Cream",
        sku: "LOR-SMTH-200",
        qty: 6,
        unit_cost_minor: 190000,
        line_total_minor: 1140000,
      },
    ],
  },
  {
    id: "pur-uuid-1040",
    business_id: "biz-aura",
    branch_id: "Jhamsikhel",
    category_id: "cat-1",
    category_name: "Professional Hair Products",
    supplier_id: "sup-2",
    purchase_number: "PUR-20260918-001040",
    supplier_name: "Beauty Plus",
    reference_number: "BP-BILL-4412",
    status: "received",
    subtotal_minor: 4800000,
    discount_minor: 200000,
    tax_minor: 598000,
    total_minor: 5198000,
    amount_paid_minor: 5198000,
    currency: "NPR",
    notes: "Direct bank transfer upon delivery.",
    received_at: "2026-09-18T16:00:00Z",
    created_at: "2026-09-18T11:00:00Z",
    items: [
      {
        productId: "i2",
        productName: "Olaplex No.3 Treatment",
        sku: "OLP-N3-100",
        qty: 24,
        unit_cost_minor: 200000,
        line_total_minor: 4800000,
      },
    ],
  },
  {
    id: "pur-uuid-1039",
    business_id: "biz-aura",
    branch_id: "Jhamsikhel",
    category_id: "cat-4",
    category_name: "Daily Consumables & Hygiene",
    supplier_id: "sup-8",
    purchase_number: "PUR-20260919-001039",
    supplier_name: "Salon Supplies KTM",
    reference_number: "SSK-7712",
    status: "draft",
    subtotal_minor: 850000,
    discount_minor: 0,
    tax_minor: 110500,
    total_minor: 960500,
    amount_paid_minor: 0,
    currency: "NPR",
    notes: "Awaiting approval from manager before placing order.",
    created_at: "2026-09-19T09:00:00Z",
    items: [
      {
        productId: "i12",
        productName: "Disposables & Foil Rolls",
        sku: "DSP-FOIL-100",
        qty: 10,
        unit_cost_minor: 85000,
        line_total_minor: 850000,
      },
    ],
  },
];

export const INITIAL_PAYMENTS: PurchasePayment[] = [
  {
    id: "pay-1",
    purchase_id: "pur-uuid-1041",
    business_id: "biz-aura",
    amount_minor: 1000000,
    method: "Bank Transfer",
    note: "Initial 35% advance via NIC Asia gateway",
    paid_at: "2026-09-19T11:00:00Z",
    created_by: "Receptionist / Admin",
    created_at: "2026-09-19T11:00:00Z",
  },
  {
    id: "pay-2",
    purchase_id: "pur-uuid-1040",
    business_id: "biz-aura",
    amount_minor: 5198000,
    method: "Bank Transfer",
    note: "Paid in full via Bank wire",
    paid_at: "2026-09-18T16:15:00Z",
    created_by: "Receptionist / Admin",
    created_at: "2026-09-18T16:15:00Z",
  },
];

export const INITIAL_RETURNS: PurchaseReturn[] = [];

// LocalStorage Keys
const PURCHASES_KEY = "brg_purchases_v2";
const CATEGORIES_KEY = "brg_purchase_categories_v2";
const PAYMENTS_KEY = "brg_purchase_payments_v2";
const RETURNS_KEY = "brg_purchase_returns_v2";

// ── Categories ──────────────────────────────────────────
export function getPurchaseCategories(): PurchaseCategory[] {
  if (typeof window === "undefined") return INITIAL_CATEGORIES;
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  savePurchaseCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
}

export function savePurchaseCategories(cats: PurchaseCategory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

// ── Purchases ───────────────────────────────────────────
export function getPurchases(): Purchase[] {
  if (typeof window === "undefined") return INITIAL_PURCHASES;
  const stored = localStorage.getItem(PURCHASES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  savePurchases(INITIAL_PURCHASES);
  return INITIAL_PURCHASES;
}

export function savePurchases(purchases: Purchase[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
}

export function generatePurchaseNumber(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `PUR-${yyyy}${mm}${dd}-${rand}`;
}

export function addPurchase(data: Omit<Purchase, "id" | "purchase_number" | "created_at">): Purchase {
  const purchases = getPurchases();
  const id = `pur-uuid-${Date.now()}`;
  const purchase_number = generatePurchaseNumber();
  const newPurchase: Purchase = {
    ...data,
    id,
    purchase_number,
    created_at: new Date().toISOString(),
  };

  purchases.unshift(newPurchase);
  savePurchases(purchases);

  // If status is received upon creation, update inventory stock
  if (newPurchase.status === "received") {
    for (const item of newPurchase.items) {
      if (item.productId && item.qty > 0) {
        adjustProductStock(item.productId, item.qty, `Purchase receipt ${newPurchase.purchase_number}`);
      }
    }
  }

  return newPurchase;
}

export function updatePurchaseStatus(purchaseId: string, status: PurchaseStatus): Purchase | null {
  const purchases = getPurchases();
  const idx = purchases.findIndex((p) => p.id === purchaseId);
  if (idx === -1) return null;

  const prevStatus = purchases[idx].status;
  purchases[idx].status = status;

  if (status === "received" && prevStatus !== "received") {
    purchases[idx].received_at = new Date().toISOString();
    // Update inventory stock
    for (const item of purchases[idx].items) {
      if (item.productId && item.qty > 0) {
        adjustProductStock(item.productId, item.qty, `Stock received from ${purchases[idx].purchase_number}`);
      }
    }
  }

  savePurchases(purchases);
  return purchases[idx];
}

// ── Payments ────────────────────────────────────────────
export function getPurchasePayments(purchaseId?: string): PurchasePayment[] {
  if (typeof window === "undefined") return INITIAL_PAYMENTS;
  let allPayments: PurchasePayment[] = INITIAL_PAYMENTS;
  const stored = localStorage.getItem(PAYMENTS_KEY);
  if (stored) {
    try {
      allPayments = JSON.parse(stored);
    } catch {}
  } else {
    savePurchasePayments(INITIAL_PAYMENTS);
  }

  if (purchaseId) {
    return allPayments.filter((p) => p.purchase_id === purchaseId);
  }
  return allPayments;
}

export function savePurchasePayments(payments: PurchasePayment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function recordPurchasePayment(
  purchaseId: string,
  amount_minor: number,
  method: string,
  note?: string,
  createdBy = "Receptionist / Admin"
): PurchasePayment | null {
  const purchases = getPurchases();
  const pIdx = purchases.findIndex((p) => p.id === purchaseId);
  if (pIdx === -1) return null;

  const nowIso = new Date().toISOString();
  const newPayment: PurchasePayment = {
    id: `pay-${Date.now()}`,
    purchase_id: purchaseId,
    business_id: purchases[pIdx].business_id,
    amount_minor,
    method,
    note,
    paid_at: nowIso,
    created_by: createdBy,
    created_at: nowIso,
  };

  const allPayments = getPurchasePayments();
  allPayments.push(newPayment);
  savePurchasePayments(allPayments);

  // Update amount_paid_minor on Purchase
  purchases[pIdx].amount_paid_minor = (purchases[pIdx].amount_paid_minor || 0) + amount_minor;
  savePurchases(purchases);

  return newPayment;
}

// ── Returns ─────────────────────────────────────────────
export function getPurchaseReturns(purchaseId?: string): PurchaseReturn[] {
  if (typeof window === "undefined") return INITIAL_RETURNS;
  let allReturns: PurchaseReturn[] = INITIAL_RETURNS;
  const stored = localStorage.getItem(RETURNS_KEY);
  if (stored) {
    try {
      allReturns = JSON.parse(stored);
    } catch {}
  }

  if (purchaseId) {
    return allReturns.filter((r) => r.purchase_id === purchaseId);
  }
  return allReturns;
}

export function savePurchaseReturns(returns: PurchaseReturn[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
}

export function recordPurchaseReturn(
  purchaseId: string,
  reason: string,
  refund_minor: number,
  lines: PurchaseReturnLine[],
  createdBy = "Receptionist / Admin"
): PurchaseReturn | null {
  const purchases = getPurchases();
  const pIdx = purchases.findIndex((p) => p.id === purchaseId);
  if (pIdx === -1) return null;

  const nowIso = new Date().toISOString();
  const newReturn: PurchaseReturn = {
    id: `ret-${Date.now()}`,
    purchase_id: purchaseId,
    business_id: purchases[pIdx].business_id,
    branch_id: purchases[pIdx].branch_id,
    reason,
    refund_minor,
    created_by: createdBy,
    created_at: nowIso,
    lines,
  };

  const allReturns = getPurchaseReturns();
  allReturns.push(newReturn);
  savePurchaseReturns(allReturns);

  // Deduct returned stock from inventory
  for (const line of lines) {
    if (line.product_id && line.quantity > 0) {
      adjustProductStock(line.product_id, -line.quantity, `Returned on ${purchases[pIdx].purchase_number}: ${reason}`);
    }
  }

  return newReturn;
}

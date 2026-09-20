import { adjustProductStock, getInventoryProducts } from "./inventory-state";

export type PurchaseType = "Regular Restock" | "Emergency Buy" | "New Product Trial" | "Bulk Order";
export type PurchasePaymentStatus = "Paid" | "Credit (Unpaid)" | "Partially Paid";
export type UnitType = "Bottle" | "Box" | "Carton" | "Piece" | "Tube" | "Can" | "Packet" | "Pack";

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  qty: number; // number of packages / cartons / bottles bought
  unitType: UnitType | string; // e.g. "Bottle", "Carton", "Box"
  packSize: number; // e.g. 1 for single bottle, 12 for carton of 12
  totalUnits: number; // qty * packSize (e.g. 2 cartons of 12 = 24 bottles into inventory)
  unitCost: number; // purchase price per unit/pack
  lineTotal: number; // qty * unitCost
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  purchaseType: PurchaseType;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: "Cash" | "Bank Transfer" | "Credit";
  amountPaid: number;
  creditDueDate: string;
  invoiceRef: string;
  notes: string;
  branch: string;
  recordedBy: string;
  createdAt: string;
}

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: "PO-1041",
    date: "2026-05-02",
    supplierId: "sup-1",
    supplierName: "L'Oréal Nepal",
    purchaseType: "Regular Restock",
    items: [
      {
        productId: "i1",
        productName: "L'Oréal Majirel 7.43",
        sku: "LOR-MAJ-743",
        category: "Hair",
        qty: 12,
        unitType: "Tube",
        packSize: 1,
        totalUnits: 12,
        unitCost: 1200,
        lineTotal: 14400,
      },
      {
        productId: "i10",
        productName: "L'Oréal Smoothing Cream",
        sku: "LOR-SMTH-200",
        category: "Hair",
        qty: 6,
        unitType: "Bottle",
        packSize: 1,
        totalUnits: 6,
        unitCost: 1900,
        lineTotal: 11400,
      },
    ],
    subtotal: 25800,
    discount: 800,
    totalAmount: 25000,
    paymentStatus: "Credit (Unpaid)",
    paymentMethod: "Credit",
    amountPaid: 0,
    creditDueDate: "2026-06-01",
    invoiceRef: "INV-LOR-8891",
    notes: "Monthly color line restock. 30 days credit.",
    branch: "Jhamsikhel",
    recordedBy: "Receptionist / Admin",
    createdAt: "2026-05-02T11:00:00Z",
  },
  {
    id: "PO-1040",
    date: "2026-04-28",
    supplierId: "sup-2",
    supplierName: "Beauty Plus",
    purchaseType: "Bulk Order",
    items: [
      {
        productId: "i2",
        productName: "Olaplex No.3 Treatment",
        sku: "OLP-N3-100",
        category: "Hair",
        qty: 2,
        unitType: "Carton",
        packSize: 10,
        totalUnits: 20,
        unitCost: 27000,
        lineTotal: 54000,
      },
    ],
    subtotal: 54000,
    discount: 2000,
    totalAmount: 52000,
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    amountPaid: 52000,
    creditDueDate: "",
    invoiceRef: "BP-9921",
    notes: "Bulk carton deal on Olaplex 100ml bottles.",
    branch: "Jhamsikhel",
    recordedBy: "Salon Manager",
    createdAt: "2026-04-28T14:30:00Z",
  },
  {
    id: "PO-1039",
    date: "2026-04-20",
    supplierId: "sup-8",
    supplierName: "Salon Supplies KTM",
    purchaseType: "Regular Restock",
    items: [
      {
        productId: "i8",
        productName: "Disposable Towels (50pk)",
        sku: "CON-TOW-50",
        category: "Consumables",
        qty: 10,
        unitType: "Pack",
        packSize: 1,
        totalUnits: 10,
        unitCost: 800,
        lineTotal: 8000,
      },
      {
        productId: "i9",
        productName: "Cotton Pads (Bulk)",
        sku: "CON-COT-BLK",
        category: "Consumables",
        qty: 15,
        unitType: "Pack",
        packSize: 1,
        totalUnits: 15,
        unitCost: 450,
        lineTotal: 6750,
      },
    ],
    subtotal: 14750,
    discount: 0,
    totalAmount: 14750,
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    amountPaid: 14750,
    creditDueDate: "",
    invoiceRef: "SSK-4421",
    notes: "Cash on delivery at salon desk.",
    branch: "Jhamsikhel",
    recordedBy: "Receptionist",
    createdAt: "2026-04-20T09:15:00Z",
  },
  {
    id: "PO-1038",
    date: "2026-04-12",
    supplierId: "sup-4",
    supplierName: "SkinLab Nepal",
    purchaseType: "New Product Trial",
    items: [
      {
        productId: "i4",
        productName: "Dermalogica HydraSerum",
        sku: "DER-HYD-30",
        category: "Skin",
        qty: 5,
        unitType: "Bottle",
        packSize: 1,
        totalUnits: 5,
        unitCost: 4500,
        lineTotal: 22500,
      },
    ],
    subtotal: 22500,
    discount: 500,
    totalAmount: 22000,
    paymentStatus: "Partially Paid",
    paymentMethod: "Credit",
    amountPaid: 10000,
    creditDueDate: "2026-05-25",
    invoiceRef: "SLN-3012",
    notes: "Trial batch for new HydraFacial packages. Paid 10k advance.",
    branch: "Jhamsikhel",
    recordedBy: "Dr. Prerana / Admin",
    createdAt: "2026-04-12T16:00:00Z",
  },
];

const PURCHASES_KEY = "brg_purchases_data";

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

export function getPurchasesBySupplier(supplierId: string): Purchase[] {
  return getPurchases().filter((p) => p.supplierId === supplierId);
}

export function addPurchase(
  purchaseData: Omit<Purchase, "id" | "createdAt">,
  updateStockAutomatically: boolean = true
): Purchase {
  const purchases = getPurchases();
  const nextId = `PO-${1042 + purchases.length}`;
  const newPurchase: Purchase = {
    ...purchaseData,
    id: nextId,
    createdAt: new Date().toISOString(),
  };

  purchases.unshift(newPurchase);
  savePurchases(purchases);

  // Auto-increment inventory stock if requested
  if (updateStockAutomatically && typeof window !== "undefined") {
    newPurchase.items.forEach((item) => {
      if (item.productId && item.totalUnits > 0) {
        adjustProductStock(
          item.productId,
          "Restock",
          item.totalUnits,
          `Purchase ${newPurchase.id} (${newPurchase.supplierName}${newPurchase.invoiceRef ? " · " + newPurchase.invoiceRef : ""})`
        );
      }
    });
  }

  return newPurchase;
}

export function markPurchasePaid(purchaseId: string): boolean {
  const purchases = getPurchases();
  const idx = purchases.findIndex((p) => p.id === purchaseId);
  if (idx === -1) return false;
  purchases[idx].paymentStatus = "Paid";
  purchases[idx].amountPaid = purchases[idx].totalAmount;
  purchases[idx].creditDueDate = "";
  savePurchases(purchases);
  return true;
}

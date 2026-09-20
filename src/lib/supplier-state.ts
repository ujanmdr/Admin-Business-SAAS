export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentMethod: "Cash" | "Bank Transfer" | "Credit";
  creditDays: number; // 0 for cash/bank, 15/30/45/60 for credit
  productCategories: string[]; // ["Hair", "Skin", "Nail", etc.]
  notes: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "L'Oréal Nepal",
    contactPerson: "Binod Shrestha",
    phone: "+977 980-1234567",
    email: "orders@lorealnepal.com",
    address: "Tripureshwor, Kathmandu",
    paymentMethod: "Credit",
    creditDays: 30,
    productCategories: ["Hair"],
    notes: "Official distributor for Majirel & professional salon hair color range.",
    status: "Active",
    createdAt: "2026-01-15",
  },
  {
    id: "sup-2",
    name: "Beauty Plus",
    contactPerson: "Alisha Tuladhar",
    phone: "+977 984-1882233",
    email: "alisha@beautyplus.com.np",
    address: "New Road, Kathmandu",
    paymentMethod: "Credit",
    creditDays: 15,
    productCategories: ["Hair", "Consumables"],
    notes: "Authorized distributor of Olaplex and Brazilian blowout treatments.",
    status: "Active",
    createdAt: "2026-02-01",
  },
  {
    id: "sup-3",
    name: "Nail Pro Imports",
    contactPerson: "Rajesh Maharjan",
    phone: "+977 981-9988776",
    email: "contact@nailpro.com.np",
    address: "Patan Industrial Estate, Lalitpur",
    paymentMethod: "Bank Transfer",
    creditDays: 0,
    productCategories: ["Nail"],
    notes: "Direct importer of OPI, Kiara Sky, and UV gel curing equipment.",
    status: "Active",
    createdAt: "2026-02-10",
  },
  {
    id: "sup-4",
    name: "SkinLab Nepal",
    contactPerson: "Dr. Prerana Karki",
    phone: "+977 980-3344556",
    email: "distribution@skinlab.com.np",
    address: "Baluwatar, Kathmandu",
    paymentMethod: "Credit",
    creditDays: 45,
    productCategories: ["Skin"],
    notes: "Medical grade skincare and Dermalogica salon peel kits.",
    status: "Active",
    createdAt: "2026-01-20",
  },
  {
    id: "sup-5",
    name: "MAC Cosmetics",
    contactPerson: "Deepak Bajracharya",
    phone: "+977 985-1122334",
    email: "macnepal@luxuryretail.com",
    address: "Durbar Marg, Kathmandu",
    paymentMethod: "Bank Transfer",
    creditDays: 0,
    productCategories: ["Makeup"],
    notes: "Professional HD foundations, primers, and bridal palettes.",
    status: "Active",
    createdAt: "2026-03-05",
  },
  {
    id: "sup-6",
    name: "Forest Essentials",
    contactPerson: "Sujata Joshi",
    phone: "+977 980-5566778",
    email: "sujata@forestessentials.np",
    address: "Jhamsikhel, Lalitpur",
    paymentMethod: "Cash",
    creditDays: 0,
    productCategories: ["Spa"],
    notes: "Ayurvedic massage oils, scrubs, and cold-pressed facial blends.",
    status: "Active",
    createdAt: "2026-02-28",
  },
  {
    id: "sup-7",
    name: "Colgate Nepal",
    contactPerson: "Bikram Khadka",
    phone: "+977 984-7766554",
    email: "institutional@colgate.com.np",
    address: "Teku, Kathmandu",
    paymentMethod: "Bank Transfer",
    creditDays: 0,
    productCategories: ["Dental"],
    notes: "Teeth whitening kits, prophy pastes, and dental trays.",
    status: "Active",
    createdAt: "2026-03-12",
  },
  {
    id: "sup-8",
    name: "Salon Supplies KTM",
    contactPerson: "Manoj Gurung",
    phone: "+977 986-0011223",
    email: "manoj@salonsuppliesktm.com",
    address: "Asan, Kathmandu",
    paymentMethod: "Cash",
    creditDays: 0,
    productCategories: ["Consumables"],
    notes: "Disposables, towels, foils, capes, gloves, and sanitizing solutions.",
    status: "Active",
    createdAt: "2026-01-10",
  },
];

const SUPPLIERS_KEY = "brg_suppliers_data";

export function getSuppliers(): Supplier[] {
  if (typeof window === "undefined") return INITIAL_SUPPLIERS;
  const stored = localStorage.getItem(SUPPLIERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  saveSuppliers(INITIAL_SUPPLIERS);
  return INITIAL_SUPPLIERS;
}

export function saveSuppliers(suppliers: Supplier[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export function getSupplierById(id: string): Supplier | undefined {
  const suppliers = getSuppliers();
  return suppliers.find((s) => s.id === id);
}

export function getSupplierByName(name: string): Supplier | undefined {
  const suppliers = getSuppliers();
  return suppliers.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function addSupplier(supplierData: Omit<Supplier, "id" | "createdAt">): Supplier {
  const suppliers = getSuppliers();
  const nextId = `sup-${Date.now().toString().slice(-4)}`;
  const newSupplier: Supplier = {
    ...supplierData,
    id: nextId,
    createdAt: new Date().toISOString().split("T")[0],
  };
  suppliers.push(newSupplier);
  saveSuppliers(suppliers);
  return newSupplier;
}

export function updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
  const suppliers = getSuppliers();
  const idx = suppliers.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  suppliers[idx] = { ...suppliers[idx], ...updates };
  saveSuppliers(suppliers);
  return suppliers[idx];
}

export function deleteSupplier(id: string): boolean {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter((s) => s.id !== id);
  if (filtered.length === suppliers.length) return false;
  saveSuppliers(filtered);
  return true;
}

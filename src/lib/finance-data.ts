export const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export type PayMethod = "eSewa" | "Khalti" | "Cash" | "Card" | "Gift Card" | "Package";
export type PayStatus = "Paid" | "Pending" | "Refunded" | "Failed";
export type SettleStatus = "Settled" | "Pending" | "Processing";

export type Payment = {
  id: string;
  customer: string;
  reference: string;
  refType: "Booking" | "Package" | "Gift Card" | "POS";
  amount: number;
  method: PayMethod;
  status: PayStatus;
  date: string;
  branch: string;
  staff: string;
  settlement: SettleStatus;
};

export const PAYMENTS: Payment[] = [
  { id: "PAY-10421", customer: "Pratima Joshi", reference: "BK-2241 · Balayage", refType: "Booking", amount: 8500, method: "eSewa", status: "Paid", date: "2026-05-06 10:42", branch: "Jhamsikhel", staff: "Anisha", settlement: "Pending" },
  { id: "PAY-10420", customer: "Sneha Karki", reference: "PKG-Glass Skin Series", refType: "Package", amount: 24500, method: "Khalti", status: "Paid", date: "2026-05-06 10:18", branch: "Jhamsikhel", staff: "Sneha", settlement: "Settled" },
  { id: "PAY-10419", customer: "Reema Shrestha", reference: "BK-2240 · Spa Pedicure", refType: "Booking", amount: 2200, method: "Cash", status: "Paid", date: "2026-05-06 09:55", branch: "Lazimpat", staff: "Ritu", settlement: "Settled" },
  { id: "PAY-10418", customer: "Ankita Rai", reference: "BK-2239 · Hot Stone", refType: "Booking", amount: 5200, method: "Card", status: "Paid", date: "2026-05-05 19:22", branch: "Patan", staff: "Bishal", settlement: "Settled" },
  { id: "PAY-10417", customer: "Rojina Basnet", reference: "GC-AURA-7842-XK", refType: "Gift Card", amount: 10000, method: "eSewa", status: "Paid", date: "2026-05-05 17:10", branch: "Jhamsikhel", staff: "Rojan", settlement: "Pending" },
  { id: "PAY-10416", customer: "Manisha Lama", reference: "BK-2237 · HydraFacial", refType: "Booking", amount: 6500, method: "Khalti", status: "Pending", date: "2026-05-05 16:40", branch: "Baneshwor", staff: "Sneha", settlement: "Pending" },
  { id: "PAY-10415", customer: "Pooja Maharjan", reference: "BK-2236 · Bridal Trial", refType: "Booking", amount: 8000, method: "Card", status: "Refunded", date: "2026-05-05 14:20", branch: "Jhamsikhel", staff: "Pooja", settlement: "Settled" },
  { id: "PAY-10414", customer: "Karuna K.C.", reference: "BK-2235 · Party HD Makeup", refType: "Booking", amount: 4500, method: "eSewa", status: "Failed", date: "2026-05-05 13:05", branch: "Thamel", staff: "Karuna", settlement: "Pending" },
  { id: "PAY-10413", customer: "Anuj Shrestha", reference: "POS · Hair products", refType: "POS", amount: 3200, method: "Cash", status: "Paid", date: "2026-05-05 12:38", branch: "Jhamsikhel", staff: "Rojan", settlement: "Settled" },
  { id: "PAY-10412", customer: "Sushma Rai", reference: "BK-2233 · Whitening", refType: "Booking", amount: 12500, method: "Khalti", status: "Paid", date: "2026-05-05 11:15", branch: "Pokhara", staff: "Dr. Sushma", settlement: "Settled" },
];

export type Product = {
  id: string;
  name: string;
  category: "Hair" | "Skin" | "Nail" | "Makeup" | "Spa" | "Dental" | "Consumables";
  sku: string;
  stock: number;
  threshold: number;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  expiry: string;
  usedIn: string[];
  retail: boolean;
};

export const PRODUCTS: Product[] = [
  { id: "i1", name: "L'Oréal Majirel 7.43", category: "Hair", sku: "LOR-MAJ-743", stock: 4, threshold: 6, supplier: "L'Oréal Nepal", costPrice: 1200, sellingPrice: 0, expiry: "2027-02", usedIn: ["Balayage", "Color Touch-up"], retail: false },
  { id: "i2", name: "Olaplex No.3 Treatment", category: "Hair", sku: "OLP-N3-100", stock: 18, threshold: 10, supplier: "Beauty Plus", costPrice: 2800, sellingPrice: 4200, expiry: "2027-08", usedIn: ["Keratin", "Hair Spa"], retail: true },
  { id: "i3", name: "OPI Gel Polish · Bubble Bath", category: "Nail", sku: "OPI-GEL-BB", stock: 2, threshold: 5, supplier: "Nail Pro Imports", costPrice: 1500, sellingPrice: 2400, expiry: "2027-05", usedIn: ["Gel Manicure", "Gel Extensions"], retail: true },
  { id: "i4", name: "Dermalogica HydraSerum", category: "Skin", sku: "DER-HYD-30", stock: 9, threshold: 5, supplier: "SkinLab Nepal", costPrice: 4500, sellingPrice: 6800, expiry: "2026-09", usedIn: ["HydraFacial Premium"], retail: true },
  { id: "i5", name: "MAC Studio Fix Foundation", category: "Makeup", sku: "MAC-SF-NW20", stock: 6, threshold: 4, supplier: "MAC Cosmetics", costPrice: 3800, sellingPrice: 5400, expiry: "2027-12", usedIn: ["Bridal Makeup", "HD Makeup"], retail: true },
  { id: "i6", name: "Forest Essentials Oil Blend", category: "Spa", sku: "FE-OIL-200", stock: 12, threshold: 6, supplier: "Forest Essentials", costPrice: 2200, sellingPrice: 3500, expiry: "2026-11", usedIn: ["Ayurvedic Massage", "Wellness Detox"], retail: true },
  { id: "i7", name: "Colgate Whitening Gel Kit", category: "Dental", sku: "COL-WG-KIT", stock: 3, threshold: 4, supplier: "Colgate Nepal", costPrice: 4200, sellingPrice: 6500, expiry: "2026-07", usedIn: ["Teeth Whitening"], retail: true },
  { id: "i8", name: "Disposable Towels (50pk)", category: "Consumables", sku: "CON-TOW-50", stock: 24, threshold: 10, supplier: "Salon Supplies KTM", costPrice: 800, sellingPrice: 0, expiry: "—", usedIn: ["All services"], retail: false },
  { id: "i9", name: "Cotton Pads (Bulk)", category: "Consumables", sku: "CON-COT-BLK", stock: 1, threshold: 8, supplier: "Salon Supplies KTM", costPrice: 450, sellingPrice: 0, expiry: "—", usedIn: ["Skin services"], retail: false },
  { id: "i10", name: "L'Oréal Smoothing Cream", category: "Hair", sku: "LOR-SMTH-200", stock: 7, threshold: 5, supplier: "L'Oréal Nepal", costPrice: 1900, sellingPrice: 2900, expiry: "2026-06", usedIn: ["Keratin Smoothing"], retail: true },
];

export const SETTLEMENTS = [
  { id: "STL-2026-19", date: "2026-05-04", marketplaceBookings: 38, gross: 268500, brgCommission: 13425, businessEarning: 255075, status: "Settled" as const },
  { id: "STL-2026-18", date: "2026-04-27", marketplaceBookings: 42, gross: 312800, brgCommission: 15640, businessEarning: 297160, status: "Settled" as const },
  { id: "STL-2026-17", date: "2026-04-20", marketplaceBookings: 31, gross: 224000, brgCommission: 11200, businessEarning: 212800, status: "Settled" as const },
  { id: "STL-2026-20", date: "2026-05-11", marketplaceBookings: 24, gross: 188400, brgCommission: 9420, businessEarning: 178980, status: "Pending" as const },
  { id: "STL-2026-21", date: "2026-05-18", marketplaceBookings: 6, gross: 42500, brgCommission: 2125, businessEarning: 40375, status: "Processing" as const },
];

export function methodTone(m: PayMethod) {
  switch (m) {
    case "eSewa": return "bg-[color-mix(in_oklab,var(--sage)_22%,white)] border-[color-mix(in_oklab,var(--sage)_40%,white)] text-deep-olive";
    case "Khalti": return "bg-[color-mix(in_oklab,#7B53A8_22%,white)] border-[color-mix(in_oklab,#7B53A8_40%,white)] text-foreground/80";
    case "Cash": return "bg-sand-soft border-border text-foreground/80";
    case "Card": return "bg-mist-soft border-mist text-foreground/80";
    case "Gift Card": return "bg-rose-soft border-rose text-foreground/80";
    case "Package": return "bg-[color-mix(in_oklab,var(--gold)_22%,white)] border-[color-mix(in_oklab,var(--gold)_40%,white)] text-foreground/80";
  }
}

export function payStatusTone(s: PayStatus) {
  switch (s) {
    case "Paid": return "bg-[color-mix(in_oklab,var(--sage)_25%,white)] border-[color-mix(in_oklab,var(--sage)_45%,white)] text-deep-olive";
    case "Pending": return "bg-sand-soft border-border text-foreground/80";
    case "Refunded": return "bg-mist-soft border-mist text-foreground/80";
    case "Failed": return "bg-rose-soft border-rose text-foreground/80";
  }
}

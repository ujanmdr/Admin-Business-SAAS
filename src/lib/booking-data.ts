// Shared mock data + helpers for Calendar & Bookings
export type BookingStatus =
  | "Confirmed" | "Pending" | "Checked-in" | "In progress" | "Completed" | "Cancelled" | "No-show";

export type PaymentStatus = "Paid" | "Pending" | "Partial" | "Refunded";

export type Source = "BRG Marketplace" | "Walk-in" | "Phone" | "WhatsApp" | "Dashboard";

export type Booking = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  category: "Hair" | "Skin" | "Bridal" | "Spa" | "Dental" | "Academy";
  staff: string;
  room: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM (24h)
  duration: number; // minutes
  amount: number;
  branch: string;
  payment: { method: "eSewa" | "Khalti" | "Cash" | "Card"; status: PaymentStatus };
  status: BookingStatus;
  source: Source;
  notes?: string;
  package?: string;
  giftCard?: string;
  loyalty?: number;
};

export const STAFF = ["Anisha", "Ram Sharma", "Sita Gurung", "Sneha Tamang", "Anjali Shrestha", "Bibek Magar", "Pooja Rai", "Dr. Suman Rai", "Manisha Limbu"];
export const ROOMS = ["Suite 1", "Suite 2", "Spa Room", "Dental Bay", "Bridal Studio", "Chair 4"];
export const BRANCHES = ["Jhamsikhel", "Lazimpat", "Baneshwor", "Patan", "Thamel", "Pokhara"];
export const CATEGORIES: Booking["category"][] = ["Hair", "Skin", "Bridal", "Spa", "Dental", "Academy"];
export const STATUSES: BookingStatus[] = ["Confirmed", "Pending", "Checked-in", "In progress", "Completed", "Cancelled", "No-show"];
export const PAY_STATUSES: PaymentStatus[] = ["Paid", "Pending", "Partial", "Refunded"];
export const SOURCES: Source[] = ["BRG Marketplace", "Walk-in", "Phone", "WhatsApp", "Dashboard"];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const seed: Omit<Booking, "id" | "date">[] = [
  { customer: "Aastha Karki", phone: "98012-34567", service: "Bridal Trial Makeup", category: "Bridal", staff: "Sneha Tamang", room: "Bridal Studio", start: "10:30", duration: 90, amount: 12500, branch: "Jhamsikhel", payment: { method: "eSewa", status: "Paid" }, status: "Confirmed", source: "BRG Marketplace", notes: "Allergic to mineral foundation. Prefers dewy finish.", package: "Bridal Glow Pkg (2/4 used)", loyalty: 240 },
  { customer: "Riya Maharjan", phone: "98456-11220", service: "Hydra Facial", category: "Skin", staff: "Anjali Shrestha", room: "Suite 1", start: "11:15", duration: 60, amount: 4800, branch: "Lazimpat", payment: { method: "Khalti", status: "Pending" }, status: "Checked-in", source: "WhatsApp", giftCard: "GC-AURA-1042 (NPR 2,000)" },
  { customer: "Pratik Rana", phone: "98011-99882", service: "Beard Sculpt & Cut", category: "Hair", staff: "Bibek Magar", room: "Chair 4", start: "12:00", duration: 45, amount: 1200, branch: "Patan", payment: { method: "Cash", status: "Paid" }, status: "In progress", source: "Walk-in" },
  { customer: "Sneha Joshi", phone: "98203-77631", service: "Keratin Treatment", category: "Hair", staff: "Pooja Rai", room: "Suite 2", start: "13:30", duration: 120, amount: 9500, branch: "Thamel", payment: { method: "Khalti", status: "Partial" }, status: "Confirmed", source: "Dashboard", loyalty: 95 },
  { customer: "Manisha Gurung", phone: "98012-44519", service: "Dental Cleaning", category: "Dental", staff: "Dr. Suman Rai", room: "Dental Bay", start: "15:00", duration: 45, amount: 3500, branch: "Baneshwor", payment: { method: "Cash", status: "Pending" }, status: "Pending", source: "Phone" },
  { customer: "Bipasha Thapa", phone: "98512-00091", service: "Bridal Mehendi", category: "Bridal", staff: "Sneha Tamang", room: "Bridal Studio", start: "16:30", duration: 90, amount: 7800, branch: "Pokhara", payment: { method: "eSewa", status: "Paid" }, status: "Confirmed", source: "BRG Marketplace" },
  { customer: "Sushmita Khadka", phone: "98401-22311", service: "Aroma Body Massage", category: "Spa", staff: "Manisha Limbu", room: "Spa Room", start: "09:30", duration: 60, amount: 4200, branch: "Jhamsikhel", payment: { method: "Card", status: "Paid" }, status: "Completed", source: "BRG Marketplace" },
  { customer: "Anita Lama", phone: "98011-66332", service: "Balayage Color", category: "Hair", staff: "Pooja Rai", room: "Suite 2", start: "14:00", duration: 150, amount: 11500, branch: "Lazimpat", payment: { method: "Khalti", status: "Paid" }, status: "Cancelled", source: "WhatsApp" },
  { customer: "Roshani Tamang", phone: "98012-77441", service: "Academy: Bridal Module", category: "Academy", staff: "Sneha Tamang", room: "Suite 1", start: "11:00", duration: 180, amount: 15000, branch: "Jhamsikhel", payment: { method: "eSewa", status: "Paid" }, status: "Confirmed", source: "Dashboard" },
  { customer: "Diya Adhikari", phone: "98404-30021", service: "Express Facial", category: "Skin", staff: "Anjali Shrestha", room: "Suite 1", start: "17:30", duration: 30, amount: 2200, branch: "Patan", payment: { method: "Cash", status: "Paid" }, status: "No-show", source: "Walk-in" },
  { customer: "Karuna Basnet", phone: "98203-99114", service: "Pedicure & Manicure", category: "Spa", staff: "Manisha Limbu", room: "Spa Room", start: "10:00", duration: 75, amount: 2800, branch: "Thamel", payment: { method: "Card", status: "Paid" }, status: "Confirmed", source: "BRG Marketplace" },
  { customer: "Sabita Rana", phone: "98012-12011", service: "Threading & Brow", category: "Skin", staff: "Anjali Shrestha", room: "Suite 1", start: "16:00", duration: 30, amount: 800, branch: "Baneshwor", payment: { method: "Cash", status: "Paid" }, status: "Completed", source: "Walk-in" },
];

// Spread bookings across -2 .. +3 days
export const BOOKINGS: Booking[] = seed.flatMap((b, i) => {
  const offsets = [0, 0, 0, 1, -1, 2, 1, -2, 0, -1, 3, 0];
  const off = offsets[i % offsets.length];
  return [{
    ...b,
    id: `BK-${(2401 + i).toString().padStart(4, "0")}`,
    date: iso(addDays(today, off)),
  }];
});

// Add a few extra for the table
const extras: Booking[] = Array.from({ length: 8 }).map((_, i) => {
  const base = seed[i % seed.length];
  return {
    ...base,
    id: `BK-${(2500 + i).toString().padStart(4, "0")}`,
    customer: ["Niraj Shahi", "Prerana Bhatt", "Aayush K.C.", "Sweta Pandey", "Manish Karki", "Pratistha Giri", "Saurav Lama", "Apsara Joshi"][i],
    date: iso(addDays(today, (i % 5) - 2)),
    start: ["09:00","10:30","12:15","14:00","15:30","17:00","18:15","19:00"][i],
  };
});
BOOKINGS.push(...extras);

export const TODAY_ISO = iso(today);
export const addDaysIso = (n: number) => iso(addDays(today, n));

export function statusTone(s: BookingStatus) {
  switch (s) {
    case "Confirmed": return "bg-primary/12 text-primary border-primary/25";
    case "Checked-in": return "bg-mist-soft text-deep-olive border-border";
    case "In progress": return "bg-sand-soft text-gold border-border";
    case "Completed": return "bg-primary/15 text-primary border-primary/25";
    case "Pending": return "bg-sand-soft text-gold border-border";
    case "Cancelled": return "bg-rose-soft text-deep-olive border-border";
    case "No-show": return "bg-[color-mix(in_oklab,var(--rose)_55%,white)] text-deep-olive border-border";
  }
}

export function payTone(s: PaymentStatus) {
  switch (s) {
    case "Paid": return "bg-primary/10 text-primary border-primary/20";
    case "Pending": return "bg-sand-soft text-gold border-border";
    case "Partial": return "bg-mist-soft text-deep-olive border-border";
    case "Refunded": return "bg-rose-soft text-deep-olive border-border";
  }
}

export function categoryTone(c: Booking["category"]) {
  switch (c) {
    case "Hair": return { bg: "color-mix(in oklab, var(--sage) 22%, white)", bar: "var(--olive)" };
    case "Skin": return { bg: "color-mix(in oklab, var(--rose) 28%, white)", bar: "var(--rose)" };
    case "Bridal": return { bg: "color-mix(in oklab, var(--gold) 18%, white)", bar: "var(--gold)" };
    case "Spa": return { bg: "color-mix(in oklab, var(--mist) 55%, white)", bar: "var(--mist)" };
    case "Dental": return { bg: "color-mix(in oklab, var(--deep-olive) 14%, white)", bar: "var(--deep-olive)" };
    case "Academy": return { bg: "color-mix(in oklab, var(--sand) 60%, white)", bar: "var(--sand)" };
  }
}

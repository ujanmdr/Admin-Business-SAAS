export type CustomerStatus = "New" | "Regular" | "VIP" | "At Risk" | "Inactive";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string; // MM-DD
  city: string;
  tags: string[];
  status: CustomerStatus;
  lastVisit: string; // YYYY-MM-DD
  totalVisits: number;
  totalSpend: number;
  loyaltyStamps: number; // out of 10
  activePackages: number;
  giftCardBalance: number;
  preferredStaff: string;
  favoriteServices: string[];
  notes?: string;
  allergies?: string;
  source: "BRG Marketplace" | "Walk-in" | "Referral" | "WhatsApp" | "Instagram";
};

const N = (n: number) => n;
export const CUSTOMERS: Customer[] = [
  { id: "C-1000", name: "Pratima Joshi", phone: "98012-34567", email: "pratima.joshi@gmail.com", birthday: "04-12", city: "Kathmandu", tags: ["Hair", "VIP", "Regular"], status: "VIP", lastVisit: "2026-05-06", totalVisits: 16, totalSpend: 98500, loyaltyStamps: 9, activePackages: 1, giftCardBalance: 2500, preferredStaff: "Anisha", favoriteServices: ["Balayage Color & Toner", "Hair Spa"], notes: "Level 7 cool ash toner. 20 vol on roots. Prefers gentle scalp massage.", allergies: "None reported", source: "BRG Marketplace" },
  { id: "C-1015", name: "Sneha Karki", phone: "98456-11220", email: "sneha.karki@outlook.com", birthday: "09-19", city: "Lalitpur", tags: ["Hair", "Regular"], status: "Regular", lastVisit: "2026-05-02", totalVisits: 8, totalSpend: 54000, loyaltyStamps: 7, activePackages: 0, giftCardBalance: 0, preferredStaff: "Anisha", favoriteServices: ["Keratin Treatment", "Blowout"], notes: "Formaldehyde-free keratin formula only. Likes coffee during session.", source: "WhatsApp" },
  { id: "C-1016", name: "Ankita Rai", phone: "98011-99882", email: "ankita.rai@yahoo.com", birthday: "01-15", city: "Patan", tags: ["Hair"], status: "Regular", lastVisit: "2026-04-20", totalVisits: 6, totalSpend: 28400, loyaltyStamps: 5, activePackages: 1, giftCardBalance: 1000, preferredStaff: "Anisha", favoriteServices: ["Hair Spa & Blowout", "Haircut"], notes: "Prefers eucalyptus essential oil for scalp therapy.", source: "Walk-in" },
  { id: "C-1017", name: "Rojina Basnet", phone: "98203-77631", email: "rojina.b@gmail.com", birthday: "07-04", city: "Kathmandu", tags: ["Bridal", "VIP"], status: "VIP", lastVisit: "2026-05-01", totalVisits: 14, totalSpend: 112000, loyaltyStamps: 10, activePackages: 2, giftCardBalance: 4000, preferredStaff: "Anisha", favoriteServices: ["Bridal Hair Trial", "Balayage"], notes: "Pokhara wedding next month. Bringing fresh floral accessories.", source: "Referral" },
  { id: "C-1001", name: "Aastha Karki", phone: "98012-34567", email: "aastha.k@gmail.com", birthday: "11-22", city: "Lalitpur", tags: ["Bridal", "VIP"], status: "VIP", lastVisit: "2026-05-02", totalVisits: 28, totalSpend: 184500, loyaltyStamps: 9, activePackages: 1, giftCardBalance: 2000, preferredStaff: "Sneha Tamang", favoriteServices: ["Bridal Trial", "Hydra Facial"], notes: "Wedding scheduled for Mangsir 2083. Prefers dewy bridal finish.", allergies: "Mineral foundation", source: "BRG Marketplace" },
  { id: "C-1002", name: "Riya Maharjan", phone: "98456-11220", email: "riya.m@outlook.com", birthday: "05-09", city: "Kathmandu", tags: ["Skincare"], status: "Regular", lastVisit: "2026-05-04", totalVisits: 12, totalSpend: 48200, loyaltyStamps: 6, activePackages: 0, giftCardBalance: 1500, preferredStaff: "Anjali Shrestha", favoriteServices: ["Hydra Facial", "Threading"], source: "WhatsApp" },
  { id: "C-1003", name: "Pratik Rana", phone: "98011-99882", email: "pratik@rana.np", birthday: "08-14", city: "Patan", tags: ["Barber"], status: "Regular", lastVisit: "2026-05-05", totalVisits: 18, totalSpend: 22400, loyaltyStamps: 8, activePackages: 0, giftCardBalance: 0, preferredStaff: "Bibek Magar", favoriteServices: ["Beard Sculpt", "Cut"], source: "Walk-in" },
  { id: "C-1004", name: "Sneha Joshi", phone: "98203-77631", email: "sneha.joshi@gmail.com", birthday: "05-26", city: "Kathmandu", tags: ["Hair", "VIP"], status: "VIP", lastVisit: "2026-04-28", totalVisits: 34, totalSpend: 218900, loyaltyStamps: 10, activePackages: 2, giftCardBalance: 5000, preferredStaff: "Pooja Rai", favoriteServices: ["Keratin", "Balayage"], notes: "Loves chai during long sessions.", source: "Referral" },
  { id: "C-1005", name: "Manisha Gurung", phone: "98012-44519", email: "manishag@yahoo.com", birthday: "02-03", city: "Bhaktapur", tags: ["Dental"], status: "Regular", lastVisit: "2026-04-15", totalVisits: 6, totalSpend: 18500, loyaltyStamps: 3, activePackages: 0, giftCardBalance: 0, preferredStaff: "Dr. Suman Rai", favoriteServices: ["Dental Cleaning"], source: "Walk-in" },
  { id: "C-1006", name: "Bipasha Thapa", phone: "98512-00091", email: "bipasha.t@gmail.com", birthday: "11-17", city: "Pokhara", tags: ["Bridal"], status: "VIP", lastVisit: "2026-05-01", totalVisits: 22, totalSpend: 142800, loyaltyStamps: 7, activePackages: 1, giftCardBalance: 0, preferredStaff: "Sneha Tamang", favoriteServices: ["Bridal Mehendi", "Hair Styling"], source: "BRG Marketplace" },
  { id: "C-1007", name: "Sushmita Khadka", phone: "98401-22311", email: "sushmita@khadka.np", birthday: "07-30", city: "Lalitpur", tags: ["Spa"], status: "Regular", lastVisit: "2026-04-30", totalVisits: 14, totalSpend: 56400, loyaltyStamps: 8, activePackages: 1, giftCardBalance: 0, preferredStaff: "Manisha Limbu", favoriteServices: ["Aroma Massage"], source: "Instagram" },
  { id: "C-1008", name: "Anita Lama", phone: "98011-66332", email: "anita.lama@gmail.com", birthday: "03-12", city: "Kathmandu", tags: ["Hair"], status: "At Risk", lastVisit: "2026-02-21", totalVisits: 9, totalSpend: 38200, loyaltyStamps: 4, activePackages: 0, giftCardBalance: 0, preferredStaff: "Pooja Rai", favoriteServices: ["Balayage"], notes: "Two cancellations in a row.", source: "WhatsApp" },
  { id: "C-1009", name: "Roshani Tamang", phone: "98012-77441", email: "roshani.t@gmail.com", birthday: "05-18", city: "Lalitpur", tags: ["Academy"], status: "New", lastVisit: "2026-05-06", totalVisits: 1, totalSpend: 15000, loyaltyStamps: 1, activePackages: 1, giftCardBalance: 0, preferredStaff: "Sneha Tamang", favoriteServices: ["Bridal Module"], source: "BRG Marketplace" },
  { id: "C-1010", name: "Diya Adhikari", phone: "98404-30021", email: "diya.a@gmail.com", birthday: "09-04", city: "Patan", tags: ["Skincare"], status: "Inactive", lastVisit: "2025-11-18", totalVisits: 4, totalSpend: 8800, loyaltyStamps: 2, activePackages: 0, giftCardBalance: 0, preferredStaff: "Anjali Shrestha", favoriteServices: ["Express Facial"], source: "Walk-in" },
  { id: "C-1011", name: "Karuna Basnet", phone: "98203-99114", email: "karuna.b@gmail.com", birthday: "05-22", city: "Kathmandu", tags: ["Spa", "Loyal"], status: "Regular", lastVisit: "2026-05-03", totalVisits: 16, totalSpend: 64200, loyaltyStamps: 9, activePackages: 0, giftCardBalance: 1000, preferredStaff: "Manisha Limbu", favoriteServices: ["Pedicure", "Manicure"], source: "Referral" },
  { id: "C-1012", name: "Sabita Rana", phone: "98012-12011", email: "sabita.r@gmail.com", birthday: "12-01", city: "Bhaktapur", tags: ["Skincare"], status: "Regular", lastVisit: "2026-05-04", totalVisits: 11, totalSpend: 12800, loyaltyStamps: 5, activePackages: 0, giftCardBalance: 0, preferredStaff: "Anjali Shrestha", favoriteServices: ["Threading", "Brow Shape"], source: "Walk-in" },
  { id: "C-1013", name: "Niraj Shahi", phone: "98103-55401", email: "niraj.s@gmail.com", birthday: "06-08", city: "Kathmandu", tags: ["Hair"], status: "New", lastVisit: "2026-05-05", totalVisits: 1, totalSpend: 1800, loyaltyStamps: 1, activePackages: 0, giftCardBalance: 0, preferredStaff: "Bibek Magar", favoriteServices: ["Cut"], source: "Walk-in" },
  { id: "C-1014", name: "Prerana Bhatt", phone: "98014-22301", email: "prerana@bhatt.np", birthday: "05-29", city: "Pokhara", tags: ["Bridal", "VIP"], status: "VIP", lastVisit: "2026-04-22", totalVisits: 41, totalSpend: 312000, loyaltyStamps: 10, activePackages: 2, giftCardBalance: 8000, preferredStaff: "Sneha Tamang", favoriteServices: ["Bridal Trial", "Hair Spa"], notes: "Brand ambassador candidate.", source: "Referral" },
].map((c, i) => ({ ...c, id: c.id ?? `C-${1000 + i}` })) as Customer[];

export const STATUSES: CustomerStatus[] = ["New", "Regular", "VIP", "At Risk", "Inactive"];

export function customerStatusTone(s: CustomerStatus) {
  switch (s) {
    case "VIP": return "bg-sand-soft text-gold border-border";
    case "Regular": return "bg-primary/12 text-primary border-primary/25";
    case "New": return "bg-mist-soft text-deep-olive border-border";
    case "At Risk": return "bg-rose-soft text-deep-olive border-border";
    case "Inactive": return "bg-muted text-muted-foreground border-border";
  }
}

export const SEGMENTS = [
  { key: "vip", label: "VIP Customers", desc: "Top 5% by lifetime spend", tone: "gold" },
  { key: "inactive60", label: "Inactive 60+ days", desc: "Win-back opportunity", tone: "rose" },
  { key: "bridal", label: "Bridal Leads", desc: "Tagged or showed interest", tone: "rose" },
  { key: "packages", label: "Package Buyers", desc: "Holds an active package", tone: "sage" },
  { key: "giftcards", label: "Gift Card Recipients", desc: "Has unused balance", tone: "mist" },
  { key: "highspend", label: "High Spend", desc: "Spent NPR 100k+ lifetime", tone: "gold" },
  { key: "cancel", label: "Frequent Cancellations", desc: "Needs gentle nudge", tone: "rose" },
] as const;
N(0);

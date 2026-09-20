// Shared mock data for Packages, Memberships, Gift Cards, Loyalty

export const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export type Package = {
  id: string;
  name: string;
  category: "Bridal" | "Birthday" | "Hair" | "Facial" | "Massage" | "Dental" | "Multi-session" | "Academy";
  description: string;
  services: string[];
  sessions: number;
  redeemed: number;
  totalValue: number;
  price: number;
  validityMonths: number;
  salesCount: number;
  revenue: number;
  active: boolean;
  marketplace: boolean;
  giftable: boolean;
};

export const PACKAGES: Package[] = [
  {
    id: "p1", name: "Newari Bridal Premium", category: "Bridal",
    description: "Complete bridal journey — pre-wedding, mehendi, engagement and bridal day.",
    services: ["Bridal Trial", "Mehendi", "Engagement Makeup", "Bridal Hair", "HD Makeup", "Touch-ups"],
    sessions: 6, redeemed: 142, totalValue: 78000, price: 58000, validityMonths: 12,
    salesCount: 28, revenue: 1624000, active: true, marketplace: true, giftable: false,
  },
  {
    id: "p2", name: "Birthday Glow Makeover", category: "Birthday",
    description: "Full makeover with hair, skin and makeup for your special day.",
    services: ["Hair Spa", "HydraFacial", "Party HD Makeup", "Manicure"],
    sessions: 1, redeemed: 64, totalValue: 14000, price: 9999, validityMonths: 6,
    salesCount: 64, revenue: 639936, active: true, marketplace: true, giftable: true,
  },
  {
    id: "p3", name: "Monsoon Hair Revival", category: "Hair",
    description: "6-session deep hair therapy for monsoon damage.",
    services: ["Keratin", "Hair Spa ×4", "Trim"],
    sessions: 6, redeemed: 320, totalValue: 22000, price: 15500, validityMonths: 6,
    salesCount: 81, revenue: 1255500, active: true, marketplace: true, giftable: true,
  },
  {
    id: "p4", name: "Glass Skin Facial Series", category: "Facial",
    description: "5 HydraFacial sessions for that K-beauty glass-skin glow.",
    services: ["HydraFacial ×5", "LED Therapy ×2"],
    sessions: 5, redeemed: 186, totalValue: 32500, price: 24500, validityMonths: 4,
    salesCount: 47, revenue: 1151500, active: true, marketplace: true, giftable: true,
  },
  {
    id: "p5", name: "Ayurvedic Wellness 4-Pack", category: "Massage",
    description: "Four 90-min Ayurvedic massages with herbal oils.",
    services: ["Ayurvedic Massage ×4"],
    sessions: 4, redeemed: 88, totalValue: 18000, price: 13500, validityMonths: 3,
    salesCount: 32, revenue: 432000, active: true, marketplace: true, giftable: true,
  },
  {
    id: "p6", name: "Smile Brightening Plan", category: "Dental",
    description: "Whitening + clean + polish + 6-month follow-up.",
    services: ["Teeth Whitening", "Polish & Clean", "Smile Consultation"],
    sessions: 3, redeemed: 22, totalValue: 18500, price: 14999, validityMonths: 12,
    salesCount: 19, revenue: 284981, active: true, marketplace: true, giftable: false,
  },
  {
    id: "p7", name: "10-Visit Beauty Bundle", category: "Multi-session",
    description: "Mix-and-match 10 visits across hair, nails and skin.",
    services: ["Any Service ×10 (under NPR 4,500)"],
    sessions: 10, redeemed: 410, totalValue: 42000, price: 29900, validityMonths: 9,
    salesCount: 56, revenue: 1674400, active: true, marketplace: true, giftable: true,
  },
  {
    id: "p8", name: "Hair Diploma · Foundation", category: "Academy",
    description: "12-week certified hair diploma with kit and externship.",
    services: ["Theory", "Practicals", "Kit", "Certification", "Externship"],
    sessions: 60, redeemed: 18, totalValue: 78000, price: 65000, validityMonths: 6,
    salesCount: 14, revenue: 910000, active: true, marketplace: true, giftable: false,
  },
];

export type Membership = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  perks: string[];
  discountPct: number;
  members: number;
  monthlyRevenue: number;
  renewalRate: number;
  tone: string;
};

export const MEMBERSHIPS: Membership[] = [
  {
    id: "m1", name: "Monthly Glow", tagline: "Beauty essentials, every month.",
    monthly: 4500, annual: 45000, discountPct: 15, members: 142, monthlyRevenue: 639000, renewalRate: 86,
    perks: ["1 facial / month", "1 hair spa / month", "15% off all services", "Priority booking"],
    tone: "from-[color-mix(in_oklab,var(--rose)_45%,white)] to-card",
  },
  {
    id: "m2", name: "Bridal Premium", tagline: "From engagement to honeymoon.",
    monthly: 12000, annual: 120000, discountPct: 25, members: 38, monthlyRevenue: 456000, renewalRate: 92,
    perks: ["Bridal trial included", "25% off bridal services", "Dedicated bridal consultant", "Free engagement makeup"],
    tone: "from-[color-mix(in_oklab,var(--gold)_30%,white)] to-card",
  },
  {
    id: "m3", name: "Wellness Monthly", tagline: "Slow down, restore, glow.",
    monthly: 5500, annual: 55000, discountPct: 20, members: 88, monthlyRevenue: 484000, renewalRate: 81,
    perks: ["2 massages / month", "20% off wellness services", "Free aromatherapy add-on", "Quarterly wellness review"],
    tone: "from-[color-mix(in_oklab,var(--sage)_28%,white)] to-card",
  },
  {
    id: "m4", name: "VIP Beauty Club", tagline: "The whole salon, on call.",
    monthly: 18000, annual: 180000, discountPct: 30, members: 24, monthlyRevenue: 432000, renewalRate: 95,
    perks: ["Unlimited services (fair use)", "30% off products", "Private suite access", "Complimentary refreshments"],
    tone: "from-[color-mix(in_oklab,var(--mist)_55%,white)] to-card",
  },
];

export const GIFT_CARD_DESIGNS = [
  { id: "gold", name: "Classic Gold", gradient: "from-[#d4af37] via-[#f3e5ab] to-[#aa7c11]", text: "text-amber-950", dot: "bg-[#d4af37]" },
  { id: "floral", name: "Floral Blush", gradient: "from-[#fbc2eb] to-[#a6c1ee]", text: "text-indigo-950", dot: "bg-[#fbc2eb]" },
  { id: "teal", name: "Festive Teal", gradient: "from-[#4facfe] to-[#00f2fe]", text: "text-blue-950", dot: "bg-[#4facfe]" },
  { id: "sage", name: "Minimal Sage", gradient: "from-[#e2d9c2] to-[#b0be99]", text: "text-emerald-950", dot: "bg-[#b0be99]" },
  { id: "luxe", name: "Midnight Luxe", gradient: "from-[#0f2027] via-[#203a43] to-[#2c5364]", text: "text-slate-100", dot: "bg-[#0f2027]" },
] as const;

export type GiftCard = {
  id: string;
  code: string;
  amount: number;
  remaining: number;
  sender: string;
  recipient: string;
  recipientPhone: string;
  message: string;
  deliveryDate: string;
  expiryDate: string;
  status: "Delivered" | "Scheduled" | "Redeemed" | "Expired";
  designId: string;
};

export const GIFT_CARDS: GiftCard[] = [
  { id: "g1", code: "AURA-7842-XK", amount: 10000, remaining: 6500, sender: "Pratima Joshi", recipient: "Sneha Karki", recipientPhone: "+977 98 4423 5612", message: "Happy birthday darling — go pamper yourself ✨", deliveryDate: "2026-04-22", expiryDate: "2027-04-22", status: "Redeemed", designId: "gold" },
  { id: "g2", code: "AURA-9221-AB", amount: 5000, remaining: 5000, sender: "Rojan Basnet", recipient: "Manisha Lama", recipientPhone: "+977 98 1100 4421", message: "For my favourite mom 💐", deliveryDate: "2026-05-08", expiryDate: "2027-05-08", status: "Scheduled", designId: "floral" },
  { id: "g3", code: "AURA-6610-PL", amount: 15000, remaining: 11200, sender: "Anuj Shrestha", recipient: "Reema Shrestha", recipientPhone: "+977 98 2244 5530", message: "Happy anniversary ❤️", deliveryDate: "2026-04-28", expiryDate: "2027-04-28", status: "Delivered", designId: "luxe" },
  { id: "g4", code: "AURA-5523-MN", amount: 8000, remaining: 0, sender: "Karuna K.C.", recipient: "Pooja Maharjan", recipientPhone: "+977 98 0123 9921", message: "Thanks for the bridal magic!", deliveryDate: "2026-03-12", expiryDate: "2027-03-12", status: "Redeemed", designId: "teal" },
  { id: "g5", code: "AURA-1188-QQ", amount: 3000, remaining: 3000, sender: "Sushma Rai", recipient: "Bishal Lama", recipientPhone: "+977 98 7733 1102", message: "Take a break, you earned it.", deliveryDate: "2026-05-01", expiryDate: "2027-05-01", status: "Delivered", designId: "sage" },
  { id: "g6", code: "AURA-3399-WX", amount: 20000, remaining: 0, sender: "Aura HQ", recipient: "Ankita Rai", recipientPhone: "+977 98 5566 1133", message: "Customer of the year reward 🌟", deliveryDate: "2026-01-15", expiryDate: "2026-04-15", status: "Expired", designId: "luxe" },
];

export type LoyaltyCustomer = {
  name: string;
  phone: string;
  stamps: number;
  required: number;
  freeVisitsRedeemed: number;
  category: string;
};

export const LOYALTY_CUSTOMERS: LoyaltyCustomer[] = [
  { name: "Pratima Joshi", phone: "+977 98 4423 5612", stamps: 9, required: 10, freeVisitsRedeemed: 2, category: "Hair" },
  { name: "Sneha Karki", phone: "+977 98 4123 5612", stamps: 7, required: 10, freeVisitsRedeemed: 1, category: "Skin" },
  { name: "Reema Shrestha", phone: "+977 98 2244 5530", stamps: 10, required: 10, freeVisitsRedeemed: 0, category: "Nails" },
  { name: "Ankita Rai", phone: "+977 98 5566 1133", stamps: 5, required: 10, freeVisitsRedeemed: 3, category: "Massage" },
  { name: "Rojina Basnet", phone: "+977 98 5512 8810", stamps: 4, required: 10, freeVisitsRedeemed: 0, category: "Hair" },
  { name: "Manisha Lama", phone: "+977 98 1100 4421", stamps: 8, required: 10, freeVisitsRedeemed: 1, category: "Skin" },
  { name: "Pooja Maharjan", phone: "+977 98 0123 9921", stamps: 2, required: 10, freeVisitsRedeemed: 0, category: "Bridal" },
  { name: "Karuna K.C.", phone: "+977 98 7733 1102", stamps: 6, required: 10, freeVisitsRedeemed: 2, category: "Makeup" },
];

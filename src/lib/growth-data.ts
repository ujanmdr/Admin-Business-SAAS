// Mock data for Offers, Reels, Reviews, Marketing
export const fmt = (n: number) => "रु " + n.toLocaleString("en-IN");

export type OfferType =
  | "Discount" | "Limited-time" | "Festival" | "Bridal" | "Birthday"
  | "Package" | "First-time" | "Off-peak";

export type Offer = {
  id: string;
  title: string;
  type: OfferType;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  validFrom: string;
  validTo: string;
  uses: number;
  revenue: number;
  active: boolean;
  marketplace: boolean;
};

export const OFFERS: Offer[] = [
  { id: "o1", title: "Tihar Glow Festival", type: "Festival", description: "Festive facial + hair spa combo with complimentary head massage.", originalPrice: 6500, discountedPrice: 4200, validFrom: "2026-04-20", validTo: "2026-05-15", uses: 84, revenue: 352800, active: true, marketplace: true },
  { id: "o2", title: "First Visit · 25% Off", type: "First-time", description: "New customer welcome. Any single service. One-time use.", originalPrice: 4000, discountedPrice: 3000, validFrom: "2026-01-01", validTo: "2026-12-31", uses: 162, revenue: 486000, active: true, marketplace: true },
  { id: "o3", title: "Bridal Dream Bundle", type: "Bridal", description: "Bridal trial + mehendi + HD makeup. Limited bookings.", originalPrice: 78000, discountedPrice: 58000, validFrom: "2026-03-01", validTo: "2026-08-31", uses: 12, revenue: 696000, active: true, marketplace: true },
  { id: "o4", title: "Birthday Makeover", type: "Birthday", description: "Hair, makeup and nails on your birthday week.", originalPrice: 12000, discountedPrice: 8400, validFrom: "2026-01-01", validTo: "2026-12-31", uses: 47, revenue: 394800, active: true, marketplace: true },
  { id: "o5", title: "Weekday Spa Hour", type: "Off-peak", description: "Mon–Thu, 11 AM–3 PM. 30% off all spa services.", originalPrice: 5500, discountedPrice: 3850, validFrom: "2026-02-01", validTo: "2026-06-30", uses: 138, revenue: 531300, active: true, marketplace: false },
  { id: "o6", title: "Flash 48h · Hair Color", type: "Limited-time", description: "Global colour with treatment. 48-hour flash deal.", originalPrice: 9500, discountedPrice: 6650, validFrom: "2026-05-04", validTo: "2026-05-06", uses: 21, revenue: 139650, active: true, marketplace: true },
  { id: "o7", title: "Glow Package · 5 Facials", type: "Package", description: "Five hydrating facials, redeemable over 6 months.", originalPrice: 22500, discountedPrice: 16500, validFrom: "2026-01-01", validTo: "2026-09-30", uses: 36, revenue: 594000, active: true, marketplace: true },
  { id: "o8", title: "Dental Cleaning · 20% Off", type: "Discount", description: "Professional cleaning + polish + checkup.", originalPrice: 4500, discountedPrice: 3600, validFrom: "2026-01-01", validTo: "2026-12-31", uses: 58, revenue: 208800, active: false, marketplace: false },
];

export type Reel = {
  id: string;
  caption: string;
  category: "Transformation" | "Bridal" | "Hair Color" | "Facial Glow" | "Makeup" | "Spa";
  thumbColor: string;
  emoji: string;
  taggedServices: string[];
  taggedStaff: string[];
  views: number;
  saves: number;
  bookings: number;
  status: "Published" | "Scheduled" | "Draft";
};

export const REELS: Reel[] = [
  { id: "r1", caption: "From dull to dazzling — Newari bridal transformation ✨", category: "Bridal", thumbColor: "var(--rose)", emoji: "👰", taggedServices: ["Bridal HD Makeup", "Bridal Hair"], taggedStaff: ["Aanchal", "Priya"], views: 24800, saves: 1240, bookings: 18, status: "Published" },
  { id: "r2", caption: "Honey balayage on jet black — see the magic", category: "Hair Color", thumbColor: "var(--gold)", emoji: "💇‍♀️", taggedServices: ["Balayage", "Hair Treatment"], taggedStaff: ["Rohan"], views: 18200, saves: 870, bookings: 11, status: "Published" },
  { id: "r3", caption: "Hydra-glow facial — instant radiance in 60 mins", category: "Facial Glow", thumbColor: "var(--sage)", emoji: "✨", taggedServices: ["Hydra Facial"], taggedStaff: ["Sneha"], views: 9600, saves: 420, bookings: 7, status: "Published" },
  { id: "r4", caption: "Soft glam birthday makeup tutorial 🎂", category: "Makeup", thumbColor: "var(--mist)", emoji: "💄", taggedServices: ["Party Makeup"], taggedStaff: ["Aanchal"], views: 14400, saves: 690, bookings: 9, status: "Published" },
  { id: "r5", caption: "Aromatherapy massage — pure stillness", category: "Spa", thumbColor: "var(--sand)", emoji: "🌿", taggedServices: ["Aromatherapy Massage"], taggedStaff: ["Mira"], views: 6800, saves: 280, bookings: 5, status: "Scheduled" },
  { id: "r6", caption: "Acne-clear skin journey — 4 weeks", category: "Transformation", thumbColor: "var(--rose)", emoji: "🌸", taggedServices: ["Acne Facial", "Peel"], taggedStaff: ["Sneha"], views: 0, saves: 0, bookings: 0, status: "Draft" },
];

export type Review = {
  id: string;
  customer: string;
  rating: number;
  service: string;
  staff: string;
  date: string;
  text: string;
  reply?: string;
  reported?: boolean;
};

export const REVIEWS: Review[] = [
  { id: "rv1", customer: "Sushmita K.", rating: 5, service: "Bridal HD Makeup", staff: "Aanchal", date: "2026-05-02", text: "Aanchal made my bridal day unforgettable. The makeup lasted 14 hours and the team was so kind.", reply: "Thank you Sushmita ji! Wishing you a beautiful married life 💐" },
  { id: "rv2", customer: "Reema T.", rating: 5, service: "Hydra Facial", staff: "Sneha", date: "2026-05-01", text: "Skin is glowing! Sneha really listens and customises everything.", },
  { id: "rv3", customer: "Bishal M.", rating: 4, service: "Hair Cut & Style", staff: "Rohan", date: "2026-04-28", text: "Great cut, slight wait time. Will come back." },
  { id: "rv4", customer: "Anjali P.", rating: 5, service: "Aromatherapy Massage", staff: "Mira", date: "2026-04-26", text: "Most relaxing hour of my month. The ambiance is so calming." },
  { id: "rv5", customer: "Pratiksha S.", rating: 2, service: "Manicure", staff: "Nisha", date: "2026-04-22", text: "Polish chipped within two days. Hoping for better next time.", reported: true },
  { id: "rv6", customer: "Karuna L.", rating: 5, service: "Balayage", staff: "Rohan", date: "2026-04-20", text: "Exactly the honey tone I wanted. Worth every rupee." },
  { id: "rv7", customer: "Manisha B.", rating: 4, service: "Dental Cleaning", staff: "Dr. Shrestha", date: "2026-04-18", text: "Painless and quick. Front desk was very helpful." },
];

export type CampaignType =
  | "WhatsApp Broadcast" | "Birthday Offers" | "Win-back" | "Package Expiry"
  | "Gift Card Promo" | "Loyalty Milestone" | "Bridal Follow-up" | "New Service";

export type Campaign = {
  id: string;
  name: string;
  type: CampaignType;
  segment: string;
  audience: number;
  sent: number;
  opened: number;
  bookings: number;
  revenue: number;
  status: "Sent" | "Scheduled" | "Draft";
  date: string;
};

export const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Tihar Glow Broadcast", type: "WhatsApp Broadcast", segment: "All active customers", audience: 2480, sent: 2480, opened: 1820, bookings: 142, revenue: 596400, status: "Sent", date: "2026-04-22" },
  { id: "c2", name: "May Birthday Wishes", type: "Birthday Offers", segment: "May birthdays", audience: 86, sent: 86, opened: 72, bookings: 31, revenue: 260400, status: "Sent", date: "2026-05-01" },
  { id: "c3", name: "We Miss You · 60 days", type: "Win-back", segment: "Inactive 60+ days", audience: 312, sent: 312, opened: 198, bookings: 24, revenue: 144000, status: "Sent", date: "2026-04-15" },
  { id: "c4", name: "Bridal Package Expiring", type: "Package Expiry", segment: "Bridal package buyers", audience: 18, sent: 0, opened: 0, bookings: 0, revenue: 0, status: "Scheduled", date: "2026-05-10" },
  { id: "c5", name: "Mother's Day Gift Cards", type: "Gift Card Promo", segment: "All customers", audience: 2480, sent: 0, opened: 0, bookings: 0, revenue: 0, status: "Draft", date: "—" },
  { id: "c6", name: "10th Visit Reward", type: "Loyalty Milestone", segment: "Stamp 9 customers", audience: 42, sent: 42, opened: 39, bookings: 28, revenue: 0, status: "Sent", date: "2026-04-30" },
];

export const CAMPAIGN_TYPES: { type: CampaignType; emoji: string; description: string; tone: string }[] = [
  { type: "WhatsApp Broadcast", emoji: "💬", description: "Send to all or a custom segment", tone: "var(--sage)" },
  { type: "Birthday Offers", emoji: "🎂", description: "Auto-send on customer birthdays", tone: "var(--rose)" },
  { type: "Win-back", emoji: "💌", description: "Re-engage inactive customers", tone: "var(--mist)" },
  { type: "Package Expiry", emoji: "📦", description: "Remind before sessions expire", tone: "var(--gold)" },
  { type: "Gift Card Promo", emoji: "🎁", description: "Promote gift card sales", tone: "var(--rose)" },
  { type: "Loyalty Milestone", emoji: "⭐", description: "Celebrate stamp milestones", tone: "var(--gold)" },
  { type: "Bridal Follow-up", emoji: "👰", description: "Nurture bridal enquiries", tone: "var(--rose)" },
  { type: "New Service", emoji: "✨", description: "Announce new services & launches", tone: "var(--sage)" },
];

export const SEGMENTS = [
  "All active customers",
  "VIP customers",
  "Inactive 60+ days",
  "Bridal leads",
  "Package buyers",
  "Gift card receivers",
  "May birthdays",
  "High-spend (top 10%)",
  "First-time customers",
];

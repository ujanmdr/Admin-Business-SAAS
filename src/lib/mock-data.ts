// Realistic Nepal mock data for BRG admin

export const npr = (n: number) =>
  "रू " + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const cities = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan"] as const;
export const businessTypes = [
  "Salon", "Spa", "Makeup Studio", "Bridal Studio", "Dental Studio",
  "Wellness Center", "Barber Shop", "Beauty Clinic", "Academy",
] as const;
export const paymentMethods = ["eSewa", "Khalti", "Cash", "Card"] as const;

const ownerNames = [
  "Aarav Sharma", "Sita Karki", "Nabin Thapa", "Priya Maharjan", "Rohan Shrestha",
  "Anjali Gurung", "Bikash Adhikari", "Sneha Tamang", "Sandesh Rai", "Manisha Pun",
  "Kabir Lama", "Pooja Bhandari", "Suman Bista", "Ritika Joshi", "Niraj Khadka",
];

const businessNames = [
  "Glow Avenue Salon", "Himalayan Bliss Spa", "Bridal House Kathmandu", "Pearl Dental Studio",
  "Pokhara Wellness Retreat", "Royal Barber Co.", "Lumbini Makeup Studio", "Newa Beauty Clinic",
  "Sage & Saffron Spa", "Patan Bridal Couture", "Thamel Hair Lounge", "Annapurna Wellness Hub",
  "The Gentleman's Cut", "Aurora Skin Clinic", "Kasthamandap Academy", "Lotus Ayurveda",
  "Mountain Mist Spa", "Gilded Glow Studio", "The Bridal Atelier", "Smile Crafters Dental",
];

const services = [
  "Hair Spa", "Bridal Makeup", "Hair Color", "Manicure", "Pedicure", "Threading",
  "Deep Tissue Massage", "Aromatherapy", "Teeth Whitening", "Root Canal",
  "Beard Trim", "Hair Cut", "Facial Glow", "HydraFacial", "Body Scrub",
];

const staff = ["Anita", "Rashmi", "Bishnu", "Karma", "Diya", "Kiran", "Saroj", "Nima"];

function pick<T>(arr: readonly T[], i: number): T { return arr[i % arr.length]; }
function rand(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

export type Business = {
  id: string; name: string; owner: string; phone: string; email: string;
  type: string; city: string; branches: number; bookings: number; revenue: number;
  commission: number; rating: number;
  status: "Pending" | "Active" | "Suspended" | "Rejected" | "Under Review";
  plan: "Free" | "Pro" | "Elite"; visible: boolean; submittedAt: string;
  riskFlag?: "Low" | "Medium" | "High";
};

export const businesses: Business[] = Array.from({ length: 28 }, (_, i) => {
  const r = rand(i + 1);
  const status = (["Active","Active","Active","Pending","Under Review","Suspended","Rejected"] as const)[i % 7];
  return {
    id: `BIZ-${1000 + i}`,
    name: pick(businessNames, i),
    owner: pick(ownerNames, i + 2),
    phone: `+977-98${(40000000 + i * 12345) % 100000000}`,
    email: pick(businessNames, i).toLowerCase().replace(/[^a-z]/g, "") + "@brg.np",
    type: pick(businessTypes, i),
    city: pick(cities, i),
    branches: 1 + (i % 4),
    bookings: 40 + Math.floor(r * 800),
    revenue: 50000 + Math.floor(r * 950000),
    commission: 5000 + Math.floor(r * 95000),
    rating: 3.6 + (r * 1.4),
    status,
    plan: (["Free", "Pro", "Elite"] as const)[i % 3],
    visible: i % 5 !== 0,
    submittedAt: `2025-0${(i % 9) + 1}-${10 + (i % 18)}`,
    riskFlag: (["Low", "Low", "Medium", "Low", "High"] as const)[i % 5],
  };
});

export const pendingBusinesses = businesses.filter(b => b.status === "Pending" || b.status === "Under Review");

export type Customer = {
  id: string; name: string; phone: string; email: string; city: string;
  bookings: number; spend: number; packages: number; giftCards: number;
  stamps: number; reviews: number; status: "Active" | "Blocked";
};

export const customers: Customer[] = Array.from({ length: 32 }, (_, i) => {
  const r = rand(i + 50);
  return {
    id: `CUS-${2000 + i}`,
    name: pick(ownerNames, i),
    phone: `+977-98${(10000000 + i * 23456) % 100000000}`,
    email: pick(ownerNames, i).toLowerCase().replace(/\s/g, ".") + "@gmail.com",
    city: pick(cities, i + 1),
    bookings: 1 + Math.floor(r * 40),
    spend: 1500 + Math.floor(r * 80000),
    packages: Math.floor(r * 4),
    giftCards: Math.floor(r * 3),
    stamps: Math.floor(r * 9),
    reviews: Math.floor(r * 12),
    status: i % 11 === 0 ? "Blocked" : "Active",
  };
});

export type Booking = {
  id: string; customer: string; business: string; service: string; staff: string;
  datetime: string; city: string; amount: number; method: string;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  status: "Pending" | "Confirmed" | "Checked-in" | "Completed" | "Cancelled" | "No-show" | "Refunded";
  source: "BRG Marketplace" | "Business Dashboard" | "Walk-in" | "WhatsApp" | "Phone";
};

export const bookings: Booking[] = Array.from({ length: 40 }, (_, i) => {
  const r = rand(i + 100);
  return {
    id: `BK-${30000 + i}`,
    customer: pick(ownerNames, i + 3),
    business: pick(businessNames, i),
    service: pick(services, i),
    staff: pick(staff, i),
    datetime: `2025-05-${String(1 + (i % 28)).padStart(2,"0")} ${String(9 + (i % 9)).padStart(2,"0")}:${i%2?"30":"00"}`,
    city: pick(cities, i),
    amount: 800 + Math.floor(r * 12000),
    method: pick(paymentMethods, i),
    paymentStatus: (["Paid","Paid","Paid","Pending","Refunded","Failed"] as const)[i % 6],
    status: (["Confirmed","Completed","Pending","Checked-in","Completed","Cancelled","No-show","Refunded"] as const)[i % 8],
    source: (["BRG Marketplace","Business Dashboard","Walk-in","WhatsApp","Phone"] as const)[i % 5],
  };
});

export const settlements = Array.from({ length: 20 }, (_, i) => {
  const r = rand(i + 200);
  const amount = 10000 + Math.floor(r * 200000);
  const commission = Math.floor(amount * 0.12);
  return {
    id: `STL-${5000 + i}`,
    business: pick(businessNames, i),
    amount, commission,
    earning: amount - commission,
    method: pick(paymentMethods, i),
    status: (["Pending","Completed","Pending","Completed","Processing"] as const)[i % 5],
    dueDate: `2025-05-${String(5 + (i % 25)).padStart(2,"0")}`,
    paidDate: i % 2 ? `2025-05-${String(6 + (i % 22)).padStart(2,"0")}` : "—",
  };
});

export const packages = Array.from({ length: 18 }, (_, i) => {
  const r = rand(i + 300);
  const price = 3000 + Math.floor(r * 25000);
  const value = Math.floor(price * 1.4);
  return {
    id: `PKG-${7000 + i}`,
    name: ["Bridal Glow Pack", "Monthly Spa Pass", "Hair Care 6x", "Dental Care Plus", "Makeup Trial Bundle", "Wellness Reset"][i % 6] + " " + (i + 1),
    business: pick(businessNames, i),
    category: pick(businessTypes, i),
    price, value, savings: value - price,
    validity: `${3 + (i % 9)} months`,
    sales: Math.floor(r * 220),
    revenue: price * Math.floor(r * 220),
    status: (["Active","Active","Pending","Hidden","Active"] as const)[i % 5],
    visible: i % 4 !== 0,
  };
});

export const giftCards = Array.from({ length: 22 }, (_, i) => {
  const r = rand(i + 400);
  const amount = [1000,2000,3000,5000,10000][i % 5];
  return {
    code: `BRG-${(8000 + i * 137).toString().slice(-6)}`,
    sender: pick(ownerNames, i),
    recipient: pick(ownerNames, i + 5),
    recipientPhone: `+977-98${(10000000 + i * 31337) % 100000000}`,
    amount,
    balance: Math.floor(amount * (0.2 + r * 0.8)),
    type: (i % 3 === 0 ? "Platform" : "Business") as "Platform" | "Business",
    purchaseDate: `2025-0${1 + (i % 5)}-${10 + (i % 18)}`,
    expiry: `2026-0${1 + (i % 9)}-${10 + (i % 18)}`,
    status: (["Active","Redeemed","Active","Expired","Active"] as const)[i % 5],
  };
});

export const loyalty = Array.from({ length: 18 }, (_, i) => {
  const stamps = (i * 3) % 10;
  return {
    customer: pick(ownerNames, i),
    business: pick(businessNames, i),
    service: pick(services, i),
    stamps,
    eligible: stamps >= 9,
    redeemed: Math.floor(i / 4),
    lastVisit: `2025-05-${String(1 + (i % 28)).padStart(2,"0")}`,
    status: stamps >= 9 ? "Free Visit Ready" : "In Progress",
  };
});

export const sponsoredCampaigns = Array.from({ length: 14 }, (_, i) => {
  const r = rand(i + 500);
  return {
    id: `SP-${9000 + i}`,
    business: pick(businessNames, i),
    type: ["Featured", "Search Sponsored", "Homepage Hero", "Category Top", "Package Promo"][i % 5],
    placement: ["Homepage", "Search", "Category", "Reels", "Package Detail"][i % 5],
    start: `2025-05-0${1 + (i % 9)}`,
    end: `2025-06-0${1 + (i % 9)}`,
    price: 5000 + Math.floor(r * 50000),
    status: (["Active","Pending","Paused","Completed","Active"] as const)[i % 5],
    views: 1000 + Math.floor(r * 50000),
    clicks: 50 + Math.floor(r * 2000),
    bookingsGen: 5 + Math.floor(r * 200),
  };
});

export const offers = Array.from({ length: 16 }, (_, i) => {
  const r = rand(i + 600);
  const orig = 2000 + Math.floor(r * 15000);
  const disc = Math.floor(orig * (0.5 + r * 0.3));
  return {
    id: `OFR-${4000 + i}`,
    title: ["Mother's Day Glow", "Bridal Season Special", "Weekend Spa Escape", "New Year Refresh", "Festival Glow"][i % 5],
    business: pick(businessNames, i),
    category: pick(businessTypes, i),
    original: orig, discounted: disc,
    validity: `2025-06-${String(10 + (i % 18)).padStart(2,"0")}`,
    used: Math.floor(r * 300),
    revenue: disc * Math.floor(r * 300),
    status: (["Active","Pending","Expired","Active","Hidden"] as const)[i % 5],
  };
});

export const reviews = Array.from({ length: 22 }, (_, i) => {
  const r = rand(i + 700);
  return {
    id: `RV-${6000 + i}`,
    customer: pick(ownerNames, i),
    business: pick(businessNames, i),
    service: pick(services, i),
    rating: 1 + Math.floor(r * 5),
    text: [
      "Absolutely loved the experience, will definitely return!",
      "Service was good but waiting time was too long.",
      "Best bridal makeup in Kathmandu, highly recommend.",
      "Staff was rude, not happy with the outcome.",
      "Wonderful ambience and very professional team.",
    ][i % 5],
    date: `2025-05-${String(1 + (i % 28)).padStart(2,"0")}`,
    reportStatus: (["Clean","Reported","Clean","Hidden","Flagged"] as const)[i % 5],
    reply: i % 3 === 0 ? "Thank you for your feedback!" : "—",
  };
});

export const reels = Array.from({ length: 12 }, (_, i) => {
  const r = rand(i + 800);
  return {
    id: `RL-${1200 + i}`,
    business: pick(businessNames, i),
    caption: ["Bridal transformation ✨", "Behind the scenes spa", "Hair color magic", "Glow up tutorial", "Reset & relax"][i % 5],
    service: pick(services, i),
    views: 1000 + Math.floor(r * 80000),
    saves: 20 + Math.floor(r * 2000),
    bookingsGen: Math.floor(r * 150),
    status: (["Approved","Pending","Approved","Featured","Removed"] as const)[i % 5],
  };
});

export const tickets = Array.from({ length: 18 }, (_, i) => {
  return {
    id: `TKT-${7700 + i}`,
    type: ["Booking issue","Payment issue","Refund request","Business complaint","Customer complaint","Review issue","Gift card issue","Package issue"][i % 8],
    party: pick(ownerNames, i),
    booking: `BK-${30000 + (i * 3) % 40}`,
    subject: ["Service not delivered","Double charge on Khalti","Refund pending 5 days","Rude staff behavior","Spam booking","Fake review posted","Gift card not working","Package validity issue"][i % 8],
    priority: (["High","Medium","Low","Urgent","Medium"] as const)[i % 5],
    status: (["Open","In Progress","Waiting","Resolved","Closed"] as const)[i % 5],
    assigned: ["Aarya K.","Bipin S.","Sneha M.","—","Rohan T."][i % 5],
    created: `2025-05-${String(1 + (i % 28)).padStart(2,"0")}`,
  };
});

export const refunds = Array.from({ length: 14 }, (_, i) => {
  const r = rand(i + 900);
  return {
    id: `RF-${8800 + i}`,
    customer: pick(ownerNames, i),
    business: pick(businessNames, i),
    booking: `BK-${30000 + (i * 5) % 40}`,
    amount: 500 + Math.floor(r * 10000),
    reason: ["Service not provided","Cancelled by business","Quality issue","Double charge","Customer request"][i % 5],
    method: pick(paymentMethods, i),
    status: (["Pending","Approved","Rejected","Processed","Pending"] as const)[i % 5],
    requested: `2025-05-${String(1 + (i % 28)).padStart(2,"0")}`,
  };
});

export const adminUsers = [
  { name: "Aarya Khatiwada", email: "aarya@brg.np", role: "Super Admin", status: "Active", lastActive: "2 min ago" },
  { name: "Bipin Shrestha",  email: "bipin@brg.np", role: "Operations Admin", status: "Active", lastActive: "12 min ago" },
  { name: "Sneha Maharjan",  email: "sneha@brg.np", role: "Finance Admin", status: "Active", lastActive: "1 hr ago" },
  { name: "Rohan Tamang",    email: "rohan@brg.np", role: "Support Admin", status: "Active", lastActive: "3 hr ago" },
  { name: "Diya Pun",        email: "diya@brg.np", role: "Content Moderator", status: "Active", lastActive: "Yesterday" },
  { name: "Kiran Bhandari",  email: "kiran@brg.np", role: "Sales Admin", status: "Inactive", lastActive: "5 days ago" },
];

export const activityLogs = Array.from({ length: 24 }, (_, i) => ({
  admin: pick(["Aarya K.","Bipin S.","Sneha M.","Rohan T.","Diya P."], i),
  action: ["Approved business","Suspended business","Processed settlement","Hid review","Approved offer","Resolved complaint","Created campaign","Refund processed"][i % 8],
  module: ["Businesses","Businesses","Settlements","Reviews","Offers","Support","Sponsored","Refunds"][i % 8],
  target: pick(businessNames, i),
  datetime: `2025-05-${String(1 + (i % 28)).padStart(2,"0")} ${String(8 + (i%10)).padStart(2,"0")}:${i%2?"45":"15"}`,
  ip: `103.${10 + (i%200)}.${i%256}.${(i*7)%256}`,
  status: (["Success","Success","Success","Failed","Success"] as const)[i % 5],
}));

// Charts
export const monthlyRevenue = [
  { month: "Nov", revenue: 1820000, commission: 218400 },
  { month: "Dec", revenue: 2140000, commission: 256800 },
  { month: "Jan", revenue: 2480000, commission: 297600 },
  { month: "Feb", revenue: 2210000, commission: 265200 },
  { month: "Mar", revenue: 2820000, commission: 338400 },
  { month: "Apr", revenue: 3120000, commission: 374400 },
  { month: "May", revenue: 3580000, commission: 429600 },
];

export const bookingsByCategory = [
  { name: "Salon", value: 1240 },
  { name: "Spa", value: 820 },
  { name: "Bridal", value: 410 },
  { name: "Dental", value: 320 },
  { name: "Barber", value: 690 },
  { name: "Wellness", value: 280 },
];

export const revenueByCity = cities.map((c, i) => ({
  city: c, revenue: [1280000, 940000, 520000, 760000, 380000][i],
}));

export const businessGrowth = [
  { month: "Nov", count: 142 }, { month: "Dec", count: 168 },
  { month: "Jan", count: 191 }, { month: "Feb", count: 210 },
  { month: "Mar", count: 244 }, { month: "Apr", count: 271 },
  { month: "May", count: 298 },
];

export const paymentBreakdown = [
  { name: "eSewa", value: 42 },
  { name: "Khalti", value: 28 },
  { name: "Cash", value: 18 },
  { name: "Card", value: 12 },
];

export const platformAlerts = [
  { type: "High Risk", text: "3 businesses flagged for verification mismatch", time: "10 min ago" },
  { type: "Settlement", text: "12 settlements due today (रू 4,82,000)", time: "1 hr ago" },
  { type: "Reviews", text: "5 reviews reported in the last 24h", time: "2 hr ago" },
  { type: "Refunds", text: "2 refunds pending > 72 hours", time: "Yesterday" },
];

export const smartInsights = [
  { title: "Pokhara growing fast", text: "Bookings up 38% MoM, consider sponsored push.", tone: "good" as const },
  { title: "Bridal season peak", text: "Bridal category revenue 2.4× last month.", tone: "good" as const },
  { title: "Refund rate rising", text: "Spa refunds at 3.2% — review top offenders.", tone: "warn" as const },
  { title: "Khalti share up", text: "Khalti now 28% of payments, +6pp this month.", tone: "info" as const },
];

export type SaasPackage = {
  id: string;
  name: string;
  price: number;
  billingPeriod: "Monthly" | "Yearly";
  maxBranches: number;
  maxStaff: number;
  maxServices: number;
  includesBRGAI: boolean;
  posFeatures: string[];
  reportGeneration: "Basic" | "Advanced" | "Custom";
  addOnPricing: {
    perExtraStaff?: number;
    perExtraBranch?: number;
    perExtraService?: number;
  };
  isPublic: boolean;
  assignedBusinesses?: string[];
  isDefault?: boolean;
  createdAt: string;
};

export const saasPackages: SaasPackage[] = [
  { id: "PKG-S1", name: "Starter Plan", price: 4900, billingPeriod: "Monthly", maxBranches: 1, maxStaff: 3, maxServices: 15, includesBRGAI: false, posFeatures: ["Basic Checkout", "Email Receipts"], reportGeneration: "Basic", addOnPricing: {}, isPublic: true, isDefault: true, createdAt: "2025-01-15" },
  { id: "PKG-S2", name: "Growth Plan", price: 12900, billingPeriod: "Monthly", maxBranches: 5, maxStaff: 15, maxServices: 50, includesBRGAI: true, posFeatures: ["Inventory Management", "Shift Management", "Multi-register"], reportGeneration: "Advanced", addOnPricing: { perExtraStaff: 500, perExtraBranch: 1500, perExtraService: 100 }, isPublic: true, isDefault: false, createdAt: "2025-02-10" },
  { id: "PKG-S3", name: "Enterprise Pro", price: 29900, billingPeriod: "Monthly", maxBranches: 25, maxStaff: 100, maxServices: 0, includesBRGAI: true, posFeatures: ["Inventory Management", "Offline Mode", "Custom Receipts", "Advanced Multi-register"], reportGeneration: "Custom", addOnPricing: { perExtraStaff: 400, perExtraBranch: 1000 }, isPublic: true, isDefault: false, createdAt: "2025-03-01" },
];

export type SaasSubscriber = {
  id: string;
  name: string;
  email: string;
  currentPackageName: string;
  subscriptionStatus: "Active" | "Past_Due" | "Canceled";
  totalBranches: number;
  totalStaff: number;
  nextBillingDate: string;
};

export const saasSubscribers: SaasSubscriber[] = [
  {
    id: "SUB-1",
    name: "Glow Avenue Salon",
    email: "billing@glowavenue.np",
    currentPackageName: "Growth Plan",
    subscriptionStatus: "Active",
    totalBranches: 3,
    totalStaff: 12,
    nextBillingDate: "2026-07-15",
  },
  {
    id: "SUB-2",
    name: "Himalayan Bliss Spa",
    email: "contact@himalayanbliss.np",
    currentPackageName: "Enterprise Pro",
    subscriptionStatus: "Active",
    totalBranches: 8,
    totalStaff: 45,
    nextBillingDate: "2026-07-20",
  },
  {
    id: "SUB-3",
    name: "Thamel Hair Lounge",
    email: "thamelhair@outlook.com",
    currentPackageName: "Starter Plan",
    subscriptionStatus: "Past_Due",
    totalBranches: 1,
    totalStaff: 2,
    nextBillingDate: "2026-06-10",
  },
  {
    id: "SUB-4",
    name: "Pokhara Wellness Retreat",
    email: "retreat@pokharawellness.np",
    currentPackageName: "Growth Plan",
    subscriptionStatus: "Active",
    totalBranches: 4,
    totalStaff: 14,
    nextBillingDate: "2026-07-01",
  },
  {
    id: "SUB-5",
    name: "Pearl Dental Studio",
    email: "info@pearldental.np",
    currentPackageName: "Starter Plan",
    subscriptionStatus: "Canceled",
    totalBranches: 1,
    totalStaff: 3,
    nextBillingDate: "2026-05-28",
  },
  {
    id: "SUB-6",
    name: "Sage & Saffron Spa",
    email: "billing@sagesaffron.np",
    currentPackageName: "Growth Plan",
    subscriptionStatus: "Active",
    totalBranches: 2,
    totalStaff: 8,
    nextBillingDate: "2026-07-18",
  },
  {
    id: "SUB-7",
    name: "The Gentleman's Cut",
    email: "gentle@gentlemanscut.np",
    currentPackageName: "Starter Plan",
    subscriptionStatus: "Active",
    totalBranches: 1,
    totalStaff: 3,
    nextBillingDate: "2026-07-12",
  },
];


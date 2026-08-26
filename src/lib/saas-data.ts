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
  featuresList: string[];
  isPublic: boolean;
  isDefault?: boolean;
  assignedBusinesses?: string[];
};

export const saasPackages: SaasPackage[] = [
  { 
    id: "PKG-S1", 
    name: "Starter Plan", 
    price: 4900, 
    billingPeriod: "Monthly", 
    maxBranches: 1, 
    maxStaff: 3, 
    maxServices: 15, 
    includesBRGAI: false, 
    posFeatures: ["Basic Checkout", "Email Receipts"], 
    reportGeneration: "Basic", 
    addOnPricing: {},
    featuresList: ["Manage up to 3 staff", "Up to 15 services", "Basic Checkout & Receipts", "Daily sales summary"],
    isPublic: true,
    isDefault: true
  },
  { 
    id: "PKG-S2", 
    name: "Growth Plan", 
    price: 12900, 
    billingPeriod: "Monthly", 
    maxBranches: 5, 
    maxStaff: 10, 
    maxServices: 50, 
    includesBRGAI: true, 
    posFeatures: ["Inventory Management", "Shift Management", "Multi-register"], 
    reportGeneration: "Advanced", 
    addOnPricing: { perExtraStaff: 500, perExtraBranch: 1500, perExtraService: 100 },
    featuresList: ["Manage up to 10 staff", "Up to 50 services", "Flexible Add-on Pricing", "Advanced Inventory", "BRG AI Reminders"],
    isPublic: true,
    isDefault: false
  },
  { 
    id: "PKG-S3", 
    name: "Enterprise Pro", 
    price: 29900, 
    billingPeriod: "Monthly", 
    maxBranches: 25, 
    maxStaff: 100, 
    maxServices: 0, // Unlimited
    includesBRGAI: true, 
    posFeatures: ["Inventory Management", "Offline Mode", "Custom Receipts", "Advanced Multi-register"], 
    reportGeneration: "Custom", 
    addOnPricing: { perExtraStaff: 400, perExtraBranch: 1000 },
    featuresList: ["Unlimited Services", "Custom Reporting", "Offline Mode POS", "Predictive AI Insights", "Dedicated Support"],
    isPublic: true,
    isDefault: false
  },
  {
    id: "PKG-CUSTOM1",
    name: "Glow Avenue VIP",
    price: 9900,
    billingPeriod: "Monthly",
    maxBranches: 2,
    maxStaff: 8,
    maxServices: 30,
    includesBRGAI: true,
    posFeatures: ["Inventory Management", "Shift Management"],
    reportGeneration: "Advanced",
    addOnPricing: { perExtraStaff: 300, perExtraBranch: 1000 },
    featuresList: ["Exclusive discounted rate", "Manage up to 8 staff", "BRG AI Reminders included"],
    isPublic: false,
    assignedBusinesses: ["Glow Avenue Salon"]
  }
];

export const currentSubscription = {
  packageId: "PKG-S2",
  status: "Active",
  nextBillingDate: "2026-08-01",
  usage: {
    branches: 3,
    staff: 10,
    services: 42,
  },
  addOns: {
    extraStaff: 0,
    extraBranches: 0,
    extraServices: 0,
  }
};

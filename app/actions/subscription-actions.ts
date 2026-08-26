"use server";

import { z } from "zod";

// Zod schema for server-side validation of package creation
export const CreatePackageSchema = z.object({
  name: z.string().min(2, "Package name must be at least 2 characters"),
  price: z.number().nonnegative("Price cannot be negative"),
  billingPeriod: z.enum(["MONTHLY", "YEARLY"]),
  maxBranches: z.number().int().nonnegative("Max branches cannot be negative"),
  maxStaff: z.number().int().nonnegative("Max staff cannot be negative"),
});

export type CreatePackageInput = z.infer<typeof CreatePackageSchema>;

export interface Package {
  id: string;
  name: string;
  price: number;
  billingPeriod: "MONTHLY" | "YEARLY";
  maxBranches: number;
  maxStaff: number;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  currentPackageName: string;
  subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED";
  totalBranches: number;
  totalStaff: number;
  nextBillingDate: string;
}

// In-memory mock database state for demo / server actions
let mockPackages: Package[] = [
  {
    id: "PKG-1",
    name: "Starter Plan",
    price: 49,
    billingPeriod: "MONTHLY",
    maxBranches: 1,
    maxStaff: 3,
    createdAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "PKG-2",
    name: "Growth Plan",
    price: 129,
    billingPeriod: "MONTHLY",
    maxBranches: 5,
    maxStaff: 15,
    createdAt: new Date("2026-02-10").toISOString(),
  },
  {
    id: "PKG-3",
    name: "Enterprise Pro",
    price: 299,
    billingPeriod: "MONTHLY",
    maxBranches: 25,
    maxStaff: 100,
    createdAt: new Date("2026-03-01").toISOString(),
  },
];

let mockSubscribers: Subscriber[] = [
  {
    id: "SUB-1",
    name: "Glow Avenue Salon",
    email: "billing@glowavenue.np",
    currentPackageName: "Growth Plan",
    subscriptionStatus: "ACTIVE",
    totalBranches: 3,
    totalStaff: 12,
    nextBillingDate: "2026-07-15",
  },
  {
    id: "SUB-2",
    name: "Himalayan Bliss Spa",
    email: "contact@himalayanbliss.np",
    currentPackageName: "Enterprise Pro",
    subscriptionStatus: "ACTIVE",
    totalBranches: 8,
    totalStaff: 45,
    nextBillingDate: "2026-07-20",
  },
  {
    id: "SUB-3",
    name: "Thamel Hair Lounge",
    email: "thamelhair@outlook.com",
    currentPackageName: "Starter Plan",
    subscriptionStatus: "PAST_DUE",
    totalBranches: 1,
    totalStaff: 2,
    nextBillingDate: "2026-06-10",
  },
  {
    id: "SUB-4",
    name: "Pokhara Wellness Retreat",
    email: "retreat@pokharawellness.np",
    currentPackageName: "Growth Plan",
    subscriptionStatus: "ACTIVE",
    totalBranches: 4,
    totalStaff: 14,
    nextBillingDate: "2026-07-01",
  },
  {
    id: "SUB-5",
    name: "Pearl Dental Studio",
    email: "info@pearldental.np",
    currentPackageName: "Starter Plan",
    subscriptionStatus: "CANCELED",
    totalBranches: 1,
    totalStaff: 3,
    nextBillingDate: "2026-05-28",
  },
];

/**
 * Fetch all subscription packages
 */
export async function getPackagesAction(): Promise<Package[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockPackages;
}

/**
 * Create a new subscription package with validation
 */
export async function createPackageAction(
  input: CreatePackageInput
): Promise<{ success: boolean; data?: Package; error?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // Validate inputs server-side
    const validated = CreatePackageSchema.parse(input);

    const newPackage: Package = {
      id: `PKG-${mockPackages.length + 1}`,
      name: validated.name,
      price: validated.price,
      billingPeriod: validated.billingPeriod,
      maxBranches: validated.maxBranches,
      maxStaff: validated.maxStaff,
      createdAt: new Date().toISOString(),
    };

    mockPackages = [newPackage, ...mockPackages];
    return { success: true, data: newPackage };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Fetch and filter subscribers
 */
export async function getSubscribersAction(
  searchQuery?: string
): Promise<Subscriber[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!searchQuery) {
    return mockSubscribers;
  }

  const query = searchQuery.toLowerCase();
  return mockSubscribers.filter(
    (sub) =>
      sub.name.toLowerCase().includes(query) ||
      sub.email.toLowerCase().includes(query)
  );
}

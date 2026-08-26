import { useSyncExternalStore } from "react";
import { SERVICES } from "./service-data";
import { CUSTOMERS } from "./customer-data";

export type LoyaltyRule = {
  id: string;
  name: string;
  triggerServiceIds: string[]; // ALL must be in a visit to count
  milestone: number;
  rewardServiceId: string;
  active: boolean;
  redemptionsCount: number;
  hasProgress: boolean; // whether any customer has tracked progress
  createdAt: string;
};

export type RedemptionStatus = "pending" | "used" | "expired";

export type LoyaltyRedemption = {
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  ruleId: string;
  ruleName: string;
  serviceId: string; // reward service
  serviceName: string;
  salonId: string;
  generatedAt: string; // ISO date
  status: RedemptionStatus;
  usedAt?: string;
  processedByStaffId?: string;
  processedByStaffName?: string;
  valueNpr: number;
  expiresAt: string; // ISO date (60 days from generation)
};

export type CustomerProgress = {
  customerId: string;
  customerName: string;
  customerPhone: string;
  ruleId: string;
  stampsCount: number;
};

export type WhatsAppLog = {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
};

const SALON_ID = "aura-jhamsikhel";

const haircutId = SERVICES.find((s) => s.category === "Hair")?.id || SERVICES[0].id;
const beardId = SERVICES.find((s) => s.category === "Barber")?.id || SERVICES[1].id;
const facialId = SERVICES.find((s) => s.category === "Skin")?.id || SERVICES[2].id;
const pediId = SERVICES.find((s) => s.category === "Nails")?.id || SERVICES[3].id;

// 1. Rules Store
let rules: LoyaltyRule[] = [
  {
    id: "lr-001",
    name: "Beard Trim Loyalty",
    triggerServiceIds: [haircutId, beardId],
    milestone: 10,
    rewardServiceId: beardId,
    active: true,
    redemptionsCount: 14,
    hasProgress: true,
    createdAt: "2025-12-01",
  },
  {
    id: "lr-002",
    name: "Facial Glow Club",
    triggerServiceIds: [facialId],
    milestone: 6,
    rewardServiceId: facialId,
    active: true,
    redemptionsCount: 9,
    hasProgress: true,
    createdAt: "2026-01-10",
  },
  {
    id: "lr-003",
    name: "Mani-Pedi Twin Reward",
    triggerServiceIds: [pediId],
    milestone: 8,
    rewardServiceId: pediId,
    active: false,
    redemptionsCount: 2,
    hasProgress: true,
    createdAt: "2026-03-12",
  },
];

// Helper to compute date offset
function getDateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// 2. Redemptions Store
let redemptions: LoyaltyRedemption[] = [
  {
    code: "BRG-LOY-A7K2",
    customerId: "C-1003",
    customerName: "Pratik Rana",
    customerPhone: "98011-99882",
    ruleId: "lr-001",
    ruleName: "Beard Trim Loyalty",
    serviceId: beardId,
    serviceName: SERVICES.find((s) => s.id === beardId)?.name || "Beard Sculpt",
    salonId: SALON_ID,
    generatedAt: getDateOffset(-20),
    status: "used",
    usedAt: getDateOffset(-18),
    processedByStaffId: "st-01",
    processedByStaffName: "Anisha Shrestha",
    valueNpr: SERVICES.find((s) => s.id === beardId)?.price || 1200,
    expiresAt: getDateOffset(40),
  },
  {
    code: "BRG-LOY-M3X9",
    customerId: "C-1002",
    customerName: "Riya Maharjan",
    customerPhone: "98456-11220",
    ruleId: "lr-002",
    ruleName: "Facial Glow Club",
    serviceId: facialId,
    serviceName: SERVICES.find((s) => s.id === facialId)?.name || "Hydra Facial",
    salonId: SALON_ID,
    generatedAt: getDateOffset(-10),
    status: "used",
    usedAt: getDateOffset(-9),
    processedByStaffId: "st-02",
    processedByStaffName: "Anjali Shrestha",
    valueNpr: SERVICES.find((s) => s.id === facialId)?.price || 4800,
    expiresAt: getDateOffset(50),
  },
  // Pending codes for simulation & POS checkout
  {
    code: "BRG-LOY-DEMO",
    customerId: "C-1001",
    customerName: "Aastha Karki",
    customerPhone: "98012-34567",
    ruleId: "lr-002",
    ruleName: "Facial Glow Club",
    serviceId: facialId,
    serviceName: SERVICES.find((s) => s.id === facialId)?.name || "Hydra Facial",
    salonId: SALON_ID,
    generatedAt: getDateOffset(-2),
    status: "pending",
    valueNpr: SERVICES.find((s) => s.id === facialId)?.price || 4800,
    expiresAt: getDateOffset(58),
  },
  {
    code: "BRG-LOY-EXPD",
    customerId: "C-1001",
    customerName: "Aastha Karki",
    customerPhone: "98012-34567",
    ruleId: "lr-002",
    ruleName: "Facial Glow Club",
    serviceId: facialId,
    serviceName: SERVICES.find((s) => s.id === facialId)?.name || "Hydra Facial",
    salonId: SALON_ID,
    generatedAt: getDateOffset(-65),
    status: "expired",
    valueNpr: SERVICES.find((s) => s.id === facialId)?.price || 4800,
    expiresAt: getDateOffset(-5),
  },
];

// 3. Customer Progress Store
let customerProgress: CustomerProgress[] = [
  // Aastha Karki progress (nearly at milestone 10 for Beard Trim, and already earned pending code for Facial Glow)
  { customerId: "C-1001", customerName: "Aastha Karki", customerPhone: "98012-34567", ruleId: "lr-001", stampsCount: 9 },
  { customerId: "C-1001", customerName: "Aastha Karki", customerPhone: "98012-34567", ruleId: "lr-002", stampsCount: 0 },
  
  // Riya Maharjan
  { customerId: "C-1002", customerName: "Riya Maharjan", customerPhone: "98456-11220", ruleId: "lr-002", stampsCount: 5 },
  
  // Pratik Rana
  { customerId: "C-1003", customerName: "Pratik Rana", customerPhone: "98011-99882", ruleId: "lr-001", stampsCount: 8 },
  
  // Sneha Joshi
  { customerId: "C-1004", customerName: "Sneha Joshi", customerPhone: "98203-77631", ruleId: "lr-002", stampsCount: 6 }, // Milestone reached!
];

// 4. WhatsApp Message Logs Store (For sandbox demonstration)
let whatsappLogs: WhatsAppLog[] = [
  {
    id: "wl-001",
    phone: "98012-34567",
    message: "Congratulations! You've earned a free Hydra Facial Premium at Aura Beauty Lounge. Open the BRG app to claim your reward.",
    timestamp: new Date(Date.now() - 3600000 * 48).toLocaleTimeString(),
  }
];

// Listeners for reactivity
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

// Basic getters
export function getRules() { return rules; }
export function getRedemptions() { return redemptions; }
export function getCustomerProgress() { return customerProgress; }
export function getWhatsAppLogs() { return whatsappLogs; }

export function useLoyaltyRules() { return useSyncExternalStore(subscribe, getRules, getRules); }
export function useLoyaltyRedemptions() { return useSyncExternalStore(subscribe, getRedemptions, getRedemptions); }
export function useCustomerProgress() { return useSyncExternalStore(subscribe, getCustomerProgress, getCustomerProgress); }
export function useWhatsAppLogs() { return useSyncExternalStore(subscribe, getWhatsAppLogs, getWhatsAppLogs); }

// Upsert Loyalty Rule
export function upsertRule(rule: LoyaltyRule) {
  const ix = rules.findIndex((r) => r.id === rule.id);
  if (ix >= 0) {
    rules = rules.map((r) => (r.id === rule.id ? rule : r));
  } else {
    rules = [...rules, rule];
  }
  emit();
}

// Toggle Rule state (Active/Paused)
export function toggleRule(id: string) {
  rules = rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
  emit();
}

// Delete Rule
export function deleteRule(id: string) {
  rules = rules.filter((r) => r.id !== id);
  // Remove customer progress for this rule
  customerProgress = customerProgress.filter((p) => p.ruleId !== id);
  // Remove pending (unclaimed) codes generated under this rule, keep completed redemptions
  redemptions = redemptions.filter((x) => !(x.ruleId === id && x.status === "pending"));
  emit();
}

export function newRuleId() {
  return "lr-" + Math.random().toString(36).slice(2, 8);
}

// Increment customer stamps on completed booking in POS
export function incrementCustomerStamps(customerId: string, serviceIds: string[]) {
  const customerObj = CUSTOMERS.find((c) => c.id === customerId);
  if (!customerObj) return;

  let progressChanged = false;

  rules.forEach((rule) => {
    if (!rule.active) return;

    // Check if ALL trigger services are in the booking
    const triggersMet = rule.triggerServiceIds.every((id) => serviceIds.includes(id));
    if (triggersMet) {
      // Find or create customer progress record for this rule
      let record = customerProgress.find((p) => p.customerId === customerId && p.ruleId === rule.id);
      if (!record) {
        record = {
          customerId,
          customerName: customerObj.name,
          customerPhone: customerObj.phone,
          ruleId: rule.id,
          stampsCount: 0,
        };
        customerProgress = [...customerProgress, record];
      }

      // Check if they are already at the milestone but haven't claimed it yet
      // In that case, stamps don't exceed milestone until claimed (progress resets to 0)
      if (record.stampsCount < rule.milestone) {
        const nextStamps = record.stampsCount + 1;
        
        customerProgress = customerProgress.map((p) =>
          p.customerId === customerId && p.ruleId === rule.id
            ? { ...p, stampsCount: nextStamps }
            : p
        );
        progressChanged = true;
        rule.hasProgress = true;

        // If they just reached the milestone, send a simulated WhatsApp notification!
        if (nextStamps === rule.milestone) {
          const rewardName = SERVICES.find((s) => s.id === rule.rewardServiceId)?.name || "Free Service";
          const newLog: WhatsAppLog = {
            id: "wl-" + Math.random().toString(36).slice(2, 8),
            phone: customerObj.phone,
            message: `Congratulations! You've earned a free ${rewardName} at Aura Beauty Lounge. Open the BRG app to claim your reward.`,
            timestamp: new Date().toLocaleTimeString(),
          };
          whatsappLogs = [newLog, ...whatsappLogs];
        }
      }
    }
  });

  if (progressChanged) {
    emit();
  }
}

// Customer claims reward (converts stamps to alphanumeric code)
export function claimLoyaltyReward(customerId: string, ruleId: string): { success: boolean; code?: string; error?: string } {
  const record = customerProgress.find((p) => p.customerId === customerId && p.ruleId === ruleId);
  const rule = rules.find((r) => r.id === ruleId);
  
  if (!record || !rule) {
    return { success: false, error: "Loyalty record or rule not found." };
  }

  if (record.stampsCount < rule.milestone) {
    return { success: false, error: "You haven't reached the milestone stamps required." };
  }

  // Generate 4-character random alphanumeric suffix
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing characters (I, O, 0, 1)
  let codeSuffix = "";
  for (let i = 0; i < 4; i++) {
    codeSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const code = `BRG-LOY-${codeSuffix}`;
  const rewardService = SERVICES.find((s) => s.id === rule.rewardServiceId);

  // 1. Create a redemption record
  const newRedemption: LoyaltyRedemption = {
    code,
    customerId,
    customerName: record.customerName,
    customerPhone: record.customerPhone,
    ruleId,
    ruleName: rule.name,
    serviceId: rule.rewardServiceId,
    serviceName: rewardService?.name || "Free Service",
    salonId: SALON_ID,
    generatedAt: new Date().toISOString().slice(0, 10),
    status: "pending",
    valueNpr: rewardService?.price || 0,
    expiresAt: getDateOffset(60), // Valid for 60 days
  };

  redemptions = [newRedemption, ...redemptions];

  // 2. Reset customer progress stamps back to 0
  customerProgress = customerProgress.map((p) =>
    p.customerId === customerId && p.ruleId === ruleId
      ? { ...p, stampsCount: 0 }
      : p
  );

  // 3. Send WhatsApp confirmation message with code
  const newLog: WhatsAppLog = {
    id: "wl-" + Math.random().toString(36).slice(2, 8),
    phone: record.customerPhone,
    message: `Your loyalty reward code is ${code}. Show this code to staff at checkout. Valid for 60 days from today.`,
    timestamp: new Date().toLocaleTimeString(),
  };
  whatsappLogs = [newLog, ...whatsappLogs];

  emit();
  return { success: true, code };
}

// POS Code Redemption
export type RedeemResult =
  | { ok: true; redemption: LoyaltyRedemption }
  | { ok: false; error: string };

export function attemptRedeem(opts: {
  rawCode: string;
  serviceIdsInCart: string[];
  customerName: string;
  staffName: string;
  salonId?: string;
}): RedeemResult {
  const code = opts.rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a redemption code." };
  if (!/^BRG-LOY-[A-Z0-9]{4}$/.test(code)) {
    return { ok: false, error: "Invalid code format. Expected BRG-LOY-XXXX." };
  }
  const r = redemptions.find((x) => x.code === code);
  if (!r) return { ok: false, error: "This code does not exist. Please check and try again." };
  
  if (opts.salonId && r.salonId !== opts.salonId) {
    return { ok: false, error: "This code is not valid at this salon." };
  }
  if (r.status === "used") return { ok: false, error: "This code has already been redeemed." };
  if (r.status === "expired") {
    return { ok: false, error: `This code expired on ${r.expiresAt}.` };
  }
  
  // Check if code has expired dynamically (60 days check)
  const today = new Date().toISOString().slice(0, 10);
  if (r.expiresAt < today) {
    r.status = "expired";
    emit();
    return { ok: false, error: `This code expired on ${r.expiresAt}.` };
  }

  // Verify that the reward service is present in checkout
  if (!opts.serviceIdsInCart.includes(r.serviceId)) {
    return { ok: false, error: `This reward is for [${r.serviceName}] which is not in this booking.` };
  }

  // Mark used
  const updated: LoyaltyRedemption = {
    ...r,
    status: "used",
    usedAt: new Date().toISOString().slice(0, 10),
    processedByStaffName: opts.staffName,
  };
  redemptions = redemptions.map((x) => (x.code === code ? updated : x));
  
  // Increment redemptions counter on the rule
  rules = rules.map((rr) =>
    rr.id === r.ruleId ? { ...rr, redemptionsCount: rr.redemptionsCount + 1 } : rr
  );
  
  emit();
  return { ok: true, redemption: updated };
}

// Remove code from cart (cancel redemption back to pending)
export function cancelRedeem(code: string) {
  const r = redemptions.find((x) => x.code === code);
  if (!r || r.status !== "used") return;

  const updated: LoyaltyRedemption = {
    ...r,
    status: "pending",
    usedAt: undefined,
    processedByStaffName: undefined,
  };
  
  redemptions = redemptions.map((x) => (x.code === code ? updated : x));
  
  rules = rules.map((rr) =>
    rr.id === r.ruleId ? { ...rr, redemptionsCount: Math.max(0, rr.redemptionsCount - 1) } : rr
  );
  
  emit();
}

// Lookup codes by customer phone
export function lookUpCodesByPhone(phone: string): LoyaltyRedemption[] {
  const formattedPhone = phone.replace(/\s+/g, "");
  return redemptions.filter(
    (r) => r.customerPhone.replace(/\s+/g, "") === formattedPhone && r.status === "pending"
  );
}

export const LOYALTY_SALON_ID = SALON_ID;

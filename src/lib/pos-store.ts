import { create } from "zustand";

export interface PosSettingsState {
  includeTax: boolean;
  taxType: "vat" | "gst" | "sales_tax";
  taxRateBps: number; // 1300 = 13%
  
  discountType: "none" | "percentage" | "fixed";
  discountBps: number; // 1000 = 10%
  discountMinor: number; // 50000 = 500
  
  requireStaff: boolean;
  
  enableTipping: boolean;
  tipOptions: [number, number, number]; // [5, 10, 15]
  
  receiptBehavior: "print" | "ask" | "none";
  
  updateSetting: <K extends keyof PosSettingsState>(key: K, value: PosSettingsState[K]) => void;
}

export const usePosStore = create<PosSettingsState>((set) => ({
  includeTax: false,
  taxType: "vat",
  taxRateBps: 1300,
  
  discountType: "percentage",
  discountBps: 1000,
  discountMinor: 50000,
  
  requireStaff: true,
  
  enableTipping: true,
  tipOptions: [5, 10, 15],
  
  receiptBehavior: "ask",
  
  updateSetting: (key, value) => set({ [key]: value })
}));

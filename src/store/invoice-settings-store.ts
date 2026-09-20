import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockBusinesses } from "@/lib/tenant-data";

export type InvoiceType = "Estimate" | "Tax Invoice" | "Bill" | "Proforma";
export type PrinterFormat = "thermal-80mm" | "standard-a4";

export interface InvoiceSettings {
  // Business Information
  invoiceType: InvoiceType;
  legalName: string;
  logoUrl: string;
  address: string;
  contact: string;
  taxNumber: string; // PAN or VAT
  division: string;

  // Font Settings
  fontSize: number; // e.g. 10-24, default 13
  fontFamily: string;

  // Customer Detail Toggles
  showCustomerPhone: boolean;
  showCustomerPan: boolean;
  showCustomerAddress: boolean;

  // Invoice Heading Details Toggles
  showDetailForEstimate: boolean;
  showInvoiceNo: boolean;
  showDate: boolean;
  showTime: boolean;
  showOrderType: boolean;

  // Line Item Details Toggles
  showSN: boolean;
  showHsCode: boolean;
  showParticular: boolean;
  showRate: boolean;
  showQty: boolean;
  showAmount: boolean;
  showStaff: boolean; // toggle whether assigned staff displays per line item
  qtyLabel: string; // editable column header for QTY

  // Layout & Formatting
  compactView: boolean;
  defaultFormat: PrinterFormat;

  // Sub Total Calculation Toggles
  showItemTotal: boolean;
  enableLoyaltyDiscount: boolean;
  enableOfferDiscount: boolean;
  enableServiceCharge: boolean;
  serviceChargeRate: number; // e.g. 10 or 11.5%
  enableTax: boolean;
  taxRate: number; // e.g. 13% VAT
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  invoiceType: "Tax Invoice",
  legalName: "Aura Beauty Lounge Pvt. Ltd.",
  logoUrl: "",
  address: "Jhamsikhel, Lalitpur, Nepal",
  contact: "+977 01 5520 118 · hello@aurabeauty.np",
  taxNumber: "601928374",
  division: "03",

  fontSize: 13,
  fontFamily: "Inter, sans-serif",

  showCustomerPhone: true,
  showCustomerPan: true,
  showCustomerAddress: true,

  showDetailForEstimate: true,
  showInvoiceNo: true,
  showDate: true,
  showTime: true,
  showOrderType: true,

  showSN: true,
  showHsCode: true,
  showParticular: true,
  showRate: true,
  showQty: true,
  showAmount: true,
  showStaff: true,
  qtyLabel: "QTY",

  compactView: false,
  defaultFormat: "thermal-80mm",

  showItemTotal: true,
  enableLoyaltyDiscount: true,
  enableOfferDiscount: true,
  enableServiceCharge: true,
  serviceChargeRate: 10,
  enableTax: true,
  taxRate: 13,
};

function generateDefaultSettingsForBiz(bizId: string): InvoiceSettings {
  const biz = mockBusinesses.find((b) => b.id === bizId);
  if (!biz) return { ...DEFAULT_INVOICE_SETTINGS };

  const isRestro = biz.category?.toLowerCase().includes("restaurant") || biz.category?.toLowerCase().includes("cafe");

  return {
    ...DEFAULT_INVOICE_SETTINGS,
    invoiceType: isRestro ? "Estimate" : "Tax Invoice",
    legalName: `${biz.name}${biz.name.includes("Pvt") ? "" : " Pvt. Ltd."}`,
    address: biz.address || "Kathmandu, Nepal",
    contact: [biz.phone, biz.email].filter(Boolean).join(" · ") || "+977 01 5520 118",
    taxNumber: biz.taxNumber || "601928374",
    division: biz.division || "01",
    logoUrl: biz.logoUrl || "",
    serviceChargeRate: isRestro ? 10 : 0,
    enableServiceCharge: isRestro,
  };
}

interface InvoiceSettingsState {
  settingsByBusiness: Record<string, InvoiceSettings>;
  getSettings: (businessId?: string) => InvoiceSettings;
  updateSettings: (businessId: string, partial: Partial<InvoiceSettings>) => void;
  resetSettings: (businessId: string) => void;
  syncWithBusinessProfile: (businessId: string) => InvoiceSettings;
}

export const useInvoiceSettingsStore = create<InvoiceSettingsState>()(
  persist(
    (set, get) => ({
      settingsByBusiness: {
        b1: generateDefaultSettingsForBiz("b1"),
        b2: generateDefaultSettingsForBiz("b2"),
        b3: generateDefaultSettingsForBiz("b3"),
        b4: generateDefaultSettingsForBiz("b4"),
        b5: generateDefaultSettingsForBiz("b5"),
        default: DEFAULT_INVOICE_SETTINGS,
      },

      getSettings: (businessId = "default") => {
        const state = get();
        if (state.settingsByBusiness[businessId]) {
          return state.settingsByBusiness[businessId];
        }
        // If not in state yet, derive from business profile
        const fresh = generateDefaultSettingsForBiz(businessId);
        return fresh;
      },

      updateSettings: (businessId: string, partial: Partial<InvoiceSettings>) => {
        set((state) => {
          const current = state.settingsByBusiness[businessId] || generateDefaultSettingsForBiz(businessId);
          return {
            settingsByBusiness: {
              ...state.settingsByBusiness,
              [businessId]: {
                ...current,
                ...partial,
              },
            },
          };
        });
      },

      resetSettings: (businessId: string) => {
        const fresh = generateDefaultSettingsForBiz(businessId);
        set((state) => ({
          settingsByBusiness: {
            ...state.settingsByBusiness,
            [businessId]: fresh,
          },
        }));
      },

      syncWithBusinessProfile: (businessId: string) => {
        const fresh = generateDefaultSettingsForBiz(businessId);
        set((state) => {
          const existing = state.settingsByBusiness[businessId] || fresh;
          // Keep font and layout customizations, but sync legal identity from profile
          const synced: InvoiceSettings = {
            ...existing,
            legalName: fresh.legalName,
            address: fresh.address,
            contact: fresh.contact,
            taxNumber: fresh.taxNumber,
            division: fresh.division,
            logoUrl: fresh.logoUrl,
          };
          return {
            settingsByBusiness: {
              ...state.settingsByBusiness,
              [businessId]: synced,
            },
          };
        });
        return fresh;
      },
    }),
    {
      name: "brg-invoice-settings-storage",
    }
  )
);

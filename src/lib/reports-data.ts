// Daily Reports Backend Schema Types & Mock Data Generator
// Strictly matching GET /api/v1/business/:businessId/branches/:branchId/reports/daily-sales?date=YYYY-MM-DD
// and Daily VAT Report backend schema

export interface DailySalesSummary {
  gross_revenue_minor: number;
  discounts_minor: number;
  refunds_minor: number;
  net_revenue_minor: number;
  cogs_minor: number;
  gross_profit_minor: number;
  salary_accrued_minor: number;
  commission_accrued_minor: number;
  staff_cost_minor: number;
  expenses_minor: number;
  net_profit_minor: number;
  vat_collected_minor: number;
  sales_count: number;
  refunded_sales_count: number;
  void_sales_count: number; // always 0 for now
}

export interface PaymentBreakdown {
  method: string;
  amount_minor: number;
}

export interface SoldItemBreakdown {
  id: string;
  name: string;
  type: "service" | "product";
  quantity_sold: number;
  gross_revenue_minor: number;
  net_revenue_minor: number;
}

export interface StaffEarningsBreakdown {
  staff_id: string;
  display_name: string;
  salary_accrued_minor: number;
  commission_accrued_minor: number;
  total_minor: number;
}

export interface ExpenseItemBreakdown {
  id: string;
  category: string;
  description: string;
  amount_minor: number;
}

export interface RefundBreakdown {
  sale_id: string;
  receipt_number: string;
  refunded_at: string;
  amount_minor: number;
  reason: string;
}

export interface StockMovementBreakdown {
  product_id: string;
  product_name: string;
  movement_type: "sale" | "return" | "restock" | "damage";
  quantity_delta: number;
}

export interface DailySalesReportData {
  date: string;
  branch_id: string;
  business_id: string;
  currency: string;
  summary: DailySalesSummary;
  payments: PaymentBreakdown[];
  items: SoldItemBreakdown[];
  staff: StaffEarningsBreakdown[];
  expenses: ExpenseItemBreakdown[];
  refunds: RefundBreakdown[];
  voids: any[];
  stock_movements: StockMovementBreakdown[];
}

// ── Daily VAT Report Interfaces ─────────────────────────
export interface VatBreakdownByRate {
  vat_rate_bps: number; // e.g. 1300 for 13%
  sales_count: number;
  taxable_base_minor: number;
  vat_collected_minor: number;
}

export interface DailyVatSummary {
  taxable_base_minor: number;
  vat_collected_minor: number;
  vat_refunded_minor: number;
  net_vat_collected_minor: number;
  non_vat_sales_count: number;
}

export interface DailyVatSaleEntry {
  sale_id: string;
  receipt_number: string;
  paid_at: string;
  vat_rate_bps: number | null;
  taxable_base_minor: number;
  tax_minor: number;
}

export interface DailyVatReportData {
  date: string;
  branch_id: string;
  business_id: string;
  currency: string;
  vat_enabled: boolean;
  current_vat_rate_bps: number | null;
  breakdown_by_rate: VatBreakdownByRate[];
  summary: DailyVatSummary;
  sales: DailyVatSaleEntry[];
}

// ── Mock Generator ──────────────────────────────────────
export function getDailySalesReport(date = "2026-09-19", branchId = "Jhamsikhel"): DailySalesReportData {
  const grossRev = 14250000; // NPR 1,42,500
  const discounts = 750000;  // NPR 7,500
  const refunds = 350000;    // NPR 3,500
  const netRev = grossRev - discounts - refunds; // NPR 1,31,500
  const cogs = 2850000;      // NPR 28,500
  const grossProfit = netRev - cogs; // NPR 1,03,000

  const salaryAccrued = 1600000;     // NPR 16,000
  const commAccrued = 1425000;       // NPR 14,250
  const staffCost = salaryAccrued + commAccrued; // NPR 30,250
  const expenses = 1200000;          // NPR 12,000
  const netProfit = grossProfit - staffCost - expenses; // NPR 60,750
  const vatCollected = 1512800;      // NPR 15,128 (13% on taxable portion)

  return {
    date,
    branch_id: branchId,
    business_id: "biz-aura",
    currency: "NPR",
    summary: {
      gross_revenue_minor: grossRev,
      discounts_minor: discounts,
      refunds_minor: refunds,
      net_revenue_minor: netRev,
      cogs_minor: cogs,
      gross_profit_minor: grossProfit,
      salary_accrued_minor: salaryAccrued,
      commission_accrued_minor: commAccrued,
      staff_cost_minor: staffCost,
      expenses_minor: expenses,
      net_profit_minor: netProfit,
      vat_collected_minor: vatCollected,
      sales_count: 24,
      refunded_sales_count: 1,
      void_sales_count: 0,
    },
    payments: [
      { method: "eSewa", amount_minor: 6250000 },
      { method: "Khalti", amount_minor: 3100000 },
      { method: "Card (POS)", amount_minor: 2500000 },
      { method: "Cash", amount_minor: 1650000 },
    ],
    items: [
      { id: "s1", name: "Balayage Color & Toner", type: "service", quantity_sold: 4, gross_revenue_minor: 2600000, net_revenue_minor: 2450000 },
      { id: "s2", name: "Keratin Deep Smoothening", type: "service", quantity_sold: 3, gross_revenue_minor: 2850000, net_revenue_minor: 2700000 },
      { id: "s3", name: "HydraFacial Glow Treatment", type: "service", quantity_sold: 5, gross_revenue_minor: 2500000, net_revenue_minor: 2400000 },
      { id: "s4", name: "Signature Hair Spa & Blowout", type: "service", quantity_sold: 6, gross_revenue_minor: 1680000, net_revenue_minor: 1600000 },
      { id: "p1", name: "Olaplex No.3 Hair Perfector", type: "product", quantity_sold: 4, gross_revenue_minor: 1400000, net_revenue_minor: 1350000 },
      { id: "p2", name: "L'Oréal Pro Smoothing Cream", type: "product", quantity_sold: 2, gross_revenue_minor: 620000, net_revenue_minor: 600000 },
      { id: "p3", name: "Dermalogica Daily Microfoliant", type: "product", quantity_sold: 2, gross_revenue_minor: 2600000, net_revenue_minor: 2050000 },
    ],
    staff: [
      { staff_id: "st-1", display_name: "Ram Sharma", salary_accrued_minor: 500000, commission_accrued_minor: 540000, total_minor: 1040000 },
      { staff_id: "st-2", display_name: "Sita Gurung", salary_accrued_minor: 450000, commission_accrued_minor: 420000, total_minor: 870000 },
      { staff_id: "st-3", display_name: "Anisha", salary_accrued_minor: 350000, commission_accrued_minor: 285000, total_minor: 635000 },
      { staff_id: "st-4", display_name: "Sneha Tamang", salary_accrued_minor: 300000, commission_accrued_minor: 180000, total_minor: 480000 },
    ],
    expenses: [
      { id: "exp-1", category: "Supplies", description: "Fresh disposable towels & hygiene foil packs", amount_minor: 650000 },
      { id: "exp-2", category: "Refreshments", description: "Customer welcome herbal tea, espresso & snacks", amount_minor: 350000 },
      { id: "exp-3", category: "Utilities", description: "Laundry service daily batch", amount_minor: 200000 },
    ],
    refunds: [
      { sale_id: "sale-8891", receipt_number: "INV-20260919-0012", refunded_at: "2026-09-19T15:45:00Z", amount_minor: 350000, reason: "Client sensitivity to scalp toner, service cancelled amicably" },
    ],
    voids: [],
    stock_movements: [
      { product_id: "p1", product_name: "Olaplex No.3 Hair Perfector", movement_type: "sale", quantity_delta: -4 },
      { product_id: "p2", product_name: "L'Oréal Pro Smoothing Cream", movement_type: "sale", quantity_delta: -2 },
      { product_id: "p3", product_name: "Dermalogica Daily Microfoliant", movement_type: "sale", quantity_delta: -2 },
      { product_id: "i1", product_name: "L'Oréal Majirel Color Tubes", movement_type: "restock", quantity_delta: 12 },
    ],
  };
}

export function getDailyVatReport(date = "2026-09-19", branchId = "Jhamsikhel"): DailyVatReportData {
  const taxableBase = 11636900; // NPR 1,16,369.00
  const vatRateBps = 1300;     // 13.00%
  const vatCollected = Math.round((taxableBase * vatRateBps) / 10000); // NPR 15,128.00
  const vatRefunded = 40265;   // NPR 402.65
  const netVatCollected = vatCollected - vatRefunded; // NPR 14,725.35

  return {
    date,
    branch_id: branchId,
    business_id: "biz-aura",
    currency: "NPR",
    vat_enabled: true,
    current_vat_rate_bps: vatRateBps,
    breakdown_by_rate: [
      {
        vat_rate_bps: 1300,
        sales_count: 24,
        taxable_base_minor: taxableBase,
        vat_collected_minor: vatCollected,
      },
    ],
    summary: {
      taxable_base_minor: taxableBase,
      vat_collected_minor: vatCollected,
      vat_refunded_minor: vatRefunded,
      net_vat_collected_minor: netVatCollected,
      non_vat_sales_count: 0,
    },
    sales: [
      { sale_id: "s-01", receipt_number: "INV-20260919-0001", paid_at: "2026-09-19T10:15:00Z", vat_rate_bps: 1300, taxable_base_minor: 575221, tax_minor: 74779 },
      { sale_id: "s-02", receipt_number: "INV-20260919-0002", paid_at: "2026-09-19T10:45:00Z", vat_rate_bps: 1300, taxable_base_minor: 840708, tax_minor: 109292 },
      { sale_id: "s-03", receipt_number: "INV-20260919-0003", paid_at: "2026-09-19T11:20:00Z", vat_rate_bps: 1300, taxable_base_minor: 1238938, tax_minor: 161062 },
      { sale_id: "s-04", receipt_number: "INV-20260919-0004", paid_at: "2026-09-19T11:55:00Z", vat_rate_bps: 1300, taxable_base_minor: 424779, tax_minor: 55221 },
      { sale_id: "s-05", receipt_number: "INV-20260919-0005", paid_at: "2026-09-19T12:30:00Z", vat_rate_bps: 1300, taxable_base_minor: 752212, tax_minor: 97788 },
      { sale_id: "s-06", receipt_number: "INV-20260919-0006", paid_at: "2026-09-19T13:10:00Z", vat_rate_bps: 1300, taxable_base_minor: 973451, tax_minor: 126549 },
      { sale_id: "s-07", receipt_number: "INV-20260919-0007", paid_at: "2026-09-19T14:00:00Z", vat_rate_bps: 1300, taxable_base_minor: 1592920, tax_minor: 207080 },
      { sale_id: "s-08", receipt_number: "INV-20260919-0008", paid_at: "2026-09-19T14:40:00Z", vat_rate_bps: 1300, taxable_base_minor: 619469, tax_minor: 80531 },
      { sale_id: "s-09", receipt_number: "INV-20260919-0009", paid_at: "2026-09-19T15:15:00Z", vat_rate_bps: 1300, taxable_base_minor: 1106195, tax_minor: 143805 },
      { sale_id: "s-10", receipt_number: "INV-20260919-0010", paid_at: "2026-09-19T16:00:00Z", vat_rate_bps: 1300, taxable_base_minor: 884956, tax_minor: 115044 },
      { sale_id: "s-11", receipt_number: "INV-20260919-0011", paid_at: "2026-09-19T16:30:00Z", vat_rate_bps: 1300, taxable_base_minor: 1327434, tax_minor: 172566 },
      { sale_id: "s-12", receipt_number: "INV-20260919-0012", paid_at: "2026-09-19T17:15:00Z", vat_rate_bps: 1300, taxable_base_minor: 1300885, tax_minor: 169115 },
    ],
  };
}

import React, { useState, useEffect, useMemo } from "react";
import { useInvoiceSettingsStore, InvoiceSettings, InvoiceType, PrinterFormat, DEFAULT_INVOICE_SETTINGS } from "@/store/invoice-settings-store";
import { useTenantStore } from "@/store/tenant-store";
import { InvoiceDocument, InvoiceData } from "./InvoiceDocument";
import { printInvoiceElement } from "@/lib/invoice-utils";
import { getSampleInvoiceForBusiness } from "@/lib/invoice-preview-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  RotateCcw,
  Upload,
  Trash2,
  Printer,
  ChevronDown,
  Info,
  Edit2,
  Save,
  CheckCircle2,
  FileText,
  Receipt,
  Sparkles,
  Building2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { mockBusinesses } from "@/lib/tenant-data";

export function InvoiceSettingsView() {
  const { activeBusinessId } = useTenantStore();
  const currentBizId = activeBusinessId || "b1";
  const activeBiz = mockBusinesses.find((b) => b.id === currentBizId) || mockBusinesses[0];

  const { getSettings, updateSettings, resetSettings, syncWithBusinessProfile } = useInvoiceSettingsStore();
  const storedSettings = getSettings(currentBizId);

  // Local draft state for real-time preview before clicking Save
  const [form, setForm] = useState<InvoiceSettings>({ ...storedSettings });
  const [editingQtyLabel, setEditingQtyLabel] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<PrinterFormat>("thermal-80mm");

  // Keep local state synced if business changes
  useEffect(() => {
    setForm({ ...getSettings(currentBizId) });
  }, [currentBizId, getSettings]);

  // Generate category-adaptive sample bill for the live preview (Salon, Spa, Dental, Restaurant, Academy)
  const previewBill: InvoiceData = useMemo(() => {
    const base = getSampleInvoiceForBusiness(activeBiz);
    return {
      ...base,
      status: form.invoiceType === "Estimate" ? "Estimate" : "Paid",
    };
  }, [activeBiz, form.invoiceType]);

  const updateField = <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(currentBizId, form);
    toast.success("Invoice settings saved successfully!", {
      description: `Settings updated for ${form.legalName || activeBiz?.name}`,
    });
  };

  const handleDiscard = () => {
    setForm({ ...storedSettings });
    toast.info("Unsaved changes discarded.");
  };

  const handleResetToDefault = () => {
    resetSettings(currentBizId);
    setForm({ ...getSettings(currentBizId) });
    toast.success("Reset to default settings for " + activeBiz.name);
  };

  const handleSyncProfile = () => {
    const synced = syncWithBusinessProfile(currentBizId);
    setForm((prev) => ({
      ...prev,
      legalName: synced.legalName,
      address: synced.address,
      contact: synced.contact,
      taxNumber: synced.taxNumber,
      division: synced.division,
      logoUrl: synced.logoUrl,
    }));
    toast.success("Business profile information synced!", {
      description: `Copied name, address, contact, and tax number from ${activeBiz.name}.`,
    });
  };

  const handleTestPrint = () => {
    printInvoiceElement("settings-live-invoice", `Invoice-Preview-${form.invoiceType}`, previewFormat === "standard-a4");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">
              Invoice Setting
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand-soft border border-border text-foreground/80 font-sans">
              {activeBiz?.name} ({activeBiz?.category})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Customize print layout, header information, line items, and calculation rules for all invoices.
          </p>
        </div>

        {/* Right side Print Preview selector */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted/40 text-xs font-medium transition shadow-sm">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>Print Preview</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                ({previewFormat === "thermal-80mm" ? "80mm POS" : "A4 Page"})
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => setPreviewFormat("thermal-80mm")}
                className="flex items-center gap-2 text-xs"
              >
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>Thermal POS Slip (80mm)</span>
                {previewFormat === "thermal-80mm" && <Check className="h-3.5 w-3.5 ml-auto text-emerald-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPreviewFormat("standard-a4")}
                className="flex items-center gap-2 text-xs"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Standard A4 Document</span>
                {previewFormat === "standard-a4" && <Check className="h-3.5 w-3.5 ml-auto text-emerald-600" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={handleTestPrint}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <Printer className="h-3.5 w-3.5" />
            Test Print
          </Button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Sticky Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Business Information Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <h2 className="font-serif text-lg font-medium text-foreground">
                  Business Information
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Inherited from your Business Profile. Custom legal entity info can be overridden below.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncProfile}
                className="h-8 rounded-lg text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 self-start sm:self-auto shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync from Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">
                  Invoice Type <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.invoiceType}
                  onChange={(e) => updateField("invoiceType", e.target.value as InvoiceType)}
                  placeholder="Estimate, Tax Invoice, Bill..."
                  className="rounded-xl bg-background"
                />
              </div>

              {/* Business Logo Upload / Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">
                  Business Logo
                </label>
                <div className="flex items-center gap-3 border border-border rounded-xl p-2 bg-background">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className="h-9 w-9 rounded-lg object-contain bg-white border border-border p-0.5"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-sand-soft border border-border grid place-items-center text-xs font-serif font-bold text-gold">
                      {form.legalName ? form.legalName.charAt(0) : activeBiz.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-medium truncate">{form.legalName || activeBiz.name}</div>
                    <div className="text-[10px] text-muted-foreground">{form.logoUrl ? "Uploaded image" : "Profile initials"}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="cursor-pointer p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition">
                      <Upload className="h-3.5 w-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => updateField("logoUrl", reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={() => updateField("logoUrl", "")}
                        className="p-1.5 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Name */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground/90">
                    Business Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">Appears at top of receipts</span>
                </div>
                <Input
                  value={form.legalName}
                  onChange={(e) => updateField("legalName", e.target.value)}
                  placeholder={`${activeBiz.name} Pvt. Ltd. (from Profile)`}
                  className="rounded-xl bg-background"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-foreground/90">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={activeBiz.address || "e.g., Pokhara-0km, Nepal"}
                  className="rounded-xl bg-background"
                />
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">Contact</label>
                <Input
                  value={form.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                  placeholder={activeBiz.phone ? `${activeBiz.phone} · ${activeBiz.email || ""}` : "Phone or email"}
                  className="rounded-xl bg-background"
                />
              </div>

              {/* Tax / PAN Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">Tax / PAN Number</label>
                <Input
                  value={form.taxNumber}
                  onChange={(e) => updateField("taxNumber", e.target.value)}
                  placeholder={activeBiz.taxNumber || "e.g. 88888 or 601928374"}
                  className="rounded-xl bg-background font-mono text-sm"
                />
              </div>

              {/* Division */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-foreground/90">Division</label>
                  <span title="Tax division or sub-branch code">
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </span>
                </div>
                <Input
                  value={form.division}
                  onChange={(e) => updateField("division", e.target.value)}
                  placeholder={activeBiz.division || "e.g., ER or 01"}
                  className="rounded-xl bg-background"
                />
              </div>
            </div>
          </div>

          {/* 2. Font Setting Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-foreground">
                Font Setting
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateField("fontSize", 13)}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">Font Family</label>
                <Input
                  value={form.fontFamily}
                  onChange={(e) => updateField("fontFamily", e.target.value)}
                  placeholder="Inter, monospace, system-ui..."
                  className="rounded-xl bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/90">
                  Font Size <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden h-10 px-1">
                  <button
                    type="button"
                    onClick={() => updateField("fontSize", Math.max(10, form.fontSize - 1))}
                    className="h-8 w-8 rounded-lg hover:bg-muted/70 text-foreground font-semibold flex items-center justify-center transition"
                  >
                    –
                  </button>
                  <div className="flex-1 text-center font-mono font-medium text-sm">
                    {form.fontSize}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField("fontSize", Math.min(24, form.fontSize + 1))}
                    className="h-8 w-8 rounded-lg hover:bg-muted/70 text-foreground font-semibold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Customer Detail Toggles */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Customer Detail
            </h2>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <CheckChip
                label="Customer Phone"
                active={form.showCustomerPhone}
                onClick={() => updateField("showCustomerPhone", !form.showCustomerPhone)}
              />
              <CheckChip
                label="Customer Pan"
                active={form.showCustomerPan}
                onClick={() => updateField("showCustomerPan", !form.showCustomerPan)}
              />
              <CheckChip
                label="Customer Address"
                active={form.showCustomerAddress}
                onClick={() => updateField("showCustomerAddress", !form.showCustomerAddress)}
              />
            </div>
          </div>

          {/* 4. Invoice Heading Details Toggles */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Invoice Heading Details
            </h2>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <CheckChip
                label="Detail For Estimate"
                active={form.showDetailForEstimate}
                onClick={() => updateField("showDetailForEstimate", !form.showDetailForEstimate)}
              />
              <CheckChip
                label="Invoice No"
                active={form.showInvoiceNo}
                onClick={() => updateField("showInvoiceNo", !form.showInvoiceNo)}
              />
              <CheckChip
                label="Date"
                active={form.showDate}
                onClick={() => updateField("showDate", !form.showDate)}
              />
              <CheckChip
                label="Time"
                active={form.showTime}
                onClick={() => updateField("showTime", !form.showTime)}
              />
              <CheckChip
                label="Order Type"
                active={form.showOrderType}
                onClick={() => updateField("showOrderType", !form.showOrderType)}
              />
            </div>
          </div>

          {/* 5. Line Item Details Toggles */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Line Item Details
            </h2>
            <div className="flex flex-wrap gap-2.5 pt-1 items-center">
              <CheckChip
                label="S.N"
                active={form.showSN}
                onClick={() => updateField("showSN", !form.showSN)}
              />
              <CheckChip
                label="HS Code"
                active={form.showHsCode}
                onClick={() => updateField("showHsCode", !form.showHsCode)}
              />
              <CheckChip
                label="Particular"
                active={form.showParticular}
                onClick={() => updateField("showParticular", !form.showParticular)}
              />
              <CheckChip
                label="Rate"
                active={form.showRate}
                onClick={() => updateField("showRate", !form.showRate)}
              />
              <div className="inline-flex items-center gap-1">
                <CheckChip
                  label={form.qtyLabel || "QTY"}
                  active={form.showQty}
                  onClick={() => updateField("showQty", !form.showQty)}
                />
                <button
                  type="button"
                  title="Rename QTY column header"
                  onClick={() => {
                    const newLabel = window.prompt("Enter column header label for quantity:", form.qtyLabel);
                    if (newLabel !== null) updateField("qtyLabel", newLabel.trim() || "QTY");
                  }}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <CheckChip
                label="Amount"
                active={form.showAmount}
                onClick={() => updateField("showAmount", !form.showAmount)}
              />
              <CheckChip
                label="Staff (Per Service)"
                active={form.showStaff}
                onClick={() => updateField("showStaff", !form.showStaff)}
              />
            </div>
          </div>

          {/* 6. Compact View Switch */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-foreground">
                Compact View
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enabling Compact View will print Invoices with minimal gap.
              </p>
            </div>
            <Switch
              checked={form.compactView}
              onCheckedChange={(val) => updateField("compactView", val)}
            />
          </div>

          {/* 7. Sub Total Calculation Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-medium text-foreground">
              Sub Total Calculation
            </h2>

            <div className="space-y-3 divide-y divide-border/60 text-xs">
              {/* Item Total */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">Item Total</div>
                  <div className="text-muted-foreground">Total of items / dishes / services in invoice</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  Default (Active)
                </span>
              </div>

              {/* Loyalty Discount */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm text-foreground">Loyalty Discount</div>
                  <div className="text-muted-foreground">Apply loyalty tier or point redemptions on invoice subtotal</div>
                </div>
                <Switch
                  checked={form.enableLoyaltyDiscount}
                  onCheckedChange={(val) => updateField("enableLoyaltyDiscount", val)}
                />
              </div>

              {/* Dish / Offer Discount */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm text-foreground">Dish / Offer Discount</div>
                  <div className="text-muted-foreground">Discount based on items or promotional vouchers</div>
                </div>
                <Switch
                  checked={form.enableOfferDiscount}
                  onCheckedChange={(val) => updateField("enableOfferDiscount", val)}
                />
              </div>

              {/* Service Charge */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm text-foreground">Service Charge ({form.serviceChargeRate}%)</div>
                  <div className="text-muted-foreground">Optional hospitality or dine-in service charge</div>
                </div>
                <Switch
                  checked={form.enableServiceCharge}
                  onCheckedChange={(val) => updateField("enableServiceCharge", val)}
                />
              </div>

              {/* Tax / VAT */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm text-foreground">Tax / VAT ({form.taxRate}%)</div>
                  <div className="text-muted-foreground">Applicable government tax / VAT (e.g. 13% for Nepal IRD)</div>
                </div>
                <Switch
                  checked={form.enableTax}
                  onCheckedChange={(val) => updateField("enableTax", val)}
                />
              </div>
            </div>
          </div>

          {/* Sticky Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefault}
              className="text-xs text-muted-foreground hover:text-rose-600 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to default
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="rounded-xl px-5 text-xs h-10"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl px-6 text-xs h-10 bg-[#B82B2B] hover:bg-[#9E2424] text-white shadow-md font-medium"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Real-time Print Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden">
            {/* Preview Card Header */}
            <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-card to-sand-soft/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-deep-olive" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Live Print Preview
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Industry: <span className="font-medium text-foreground">{activeBiz.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {previewFormat === "thermal-80mm" ? "Thermal (80mm)" : "A4 Page"}
                </span>
                <button
                  type="button"
                  onClick={handleTestPrint}
                  title="Print live preview"
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Container with authentic paper background */}
            <div className="p-4 sm:p-6 bg-neutral-100/80 max-h-[calc(100vh-140px)] overflow-y-auto flex justify-center">
              <div className="w-full flex justify-center">
                <InvoiceDocument
                  id="settings-live-invoice"
                  bill={previewBill}
                  settings={form}
                  format={previewFormat}
                  className="rounded-lg shadow-md border border-neutral-200/90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Checkable toggle chip matching the green checked pills from reference screenshot */
function CheckChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        active
          ? "border-emerald-500/80 bg-emerald-50/40 text-emerald-900 shadow-xs"
          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
      }`}
    >
      <span
        className={`h-3.5 w-3.5 rounded grid place-items-center text-[10px] ${
          active ? "bg-emerald-600 text-white" : "border border-muted-foreground/40 text-transparent"
        }`}
      >
        ✓
      </span>
      <span>{label}</span>
    </button>
  );
}

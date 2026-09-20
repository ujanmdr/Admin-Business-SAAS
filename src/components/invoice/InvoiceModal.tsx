import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceDocument, InvoiceData } from "./InvoiceDocument";
import { useInvoiceSettingsStore, PrinterFormat, InvoiceType } from "@/store/invoice-settings-store";
import { useTenantStore } from "@/store/tenant-store";
import { printInvoiceElement, getWhatsAppShareUrl } from "@/lib/invoice-utils";
import {
  Printer,
  Download,
  Share2,
  X,
  FileText,
  Receipt,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceModalProps {
  bill: InvoiceData | null;
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
}

export function InvoiceModal({ bill, isOpen, onClose, businessId }: InvoiceModalProps) {
  const { activeBusinessId } = useTenantStore();
  const targetBiz = businessId || activeBusinessId || "b1";

  const { getSettings } = useInvoiceSettingsStore();
  const baseSettings = getSettings(targetBiz);

  const [currentFormat, setCurrentFormat] = useState<PrinterFormat>(baseSettings.defaultFormat || "thermal-80mm");
  const [currentType, setCurrentType] = useState<InvoiceType>(baseSettings.invoiceType || "Tax Invoice");

  // Keep state updated when settings or modal open changes
  useEffect(() => {
    if (isOpen) {
      setCurrentFormat(baseSettings.defaultFormat || "thermal-80mm");
      setCurrentType(baseSettings.invoiceType || "Tax Invoice");
    }
  }, [isOpen, baseSettings.defaultFormat, baseSettings.invoiceType]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  // Active settings merged with modal state
  const activeSettings = {
    ...baseSettings,
    invoiceType: currentType,
    defaultFormat: currentFormat,
  };

  const handlePrint = () => {
    printInvoiceElement("invoice-modal-content", `Invoice-${bill.invoiceNo}`, currentFormat === "standard-a4");
  };

  const handleDownloadPDF = () => {
    toast.info("Opening PDF print dialog. Select 'Save as PDF' as your printer destination.");
    printInvoiceElement("invoice-modal-content", `Invoice-${bill.invoiceNo}`, currentFormat === "standard-a4");
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppShareUrl(bill, activeSettings.legalName);
    window.open(url, "_blank");
    toast.success("WhatsApp chat opened with invoice summary.");
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-foreground/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-gradient-to-r from-card to-sand-soft/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                Invoice Preview
              </div>
              <div className="font-serif text-base font-medium flex items-center gap-2">
                <span>#{bill.invoiceNo || "Draft"}</span>
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-sand-soft border border-border text-foreground/80">
                  {currentType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setCurrentFormat("thermal-80mm")}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  currentFormat === "thermal-80mm"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setCurrentFormat("standard-a4")}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  currentFormat === "standard-a4"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                A4 Document
              </button>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Invoice Actions Sub-Bar */}
        <div className="px-5 py-2.5 border-b border-border/60 bg-muted/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Type:</span>
            <button
              type="button"
              onClick={() => setCurrentType("Tax Invoice")}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition ${
                currentType === "Tax Invoice"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => setCurrentType("Estimate")}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition ${
                currentType === "Estimate"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Estimate
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="h-8 rounded-lg gap-1.5 text-[#25D366] hover:text-[#25D366] hover:bg-emerald-50 border-emerald-200"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 rounded-lg gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 rounded-lg gap-1.5 bg-foreground text-background hover:bg-foreground/90"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100/70 flex justify-center">
          <div className="w-full flex justify-center">
            <InvoiceDocument
              id="invoice-modal-content"
              bill={bill}
              settings={activeSettings}
              format={currentFormat}
              className="rounded-xl shadow-lg border border-neutral-200/80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

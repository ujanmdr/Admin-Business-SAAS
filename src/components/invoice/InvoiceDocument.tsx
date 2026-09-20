import React from "react";
import { InvoiceSettings } from "@/store/invoice-settings-store";
import { fmt } from "@/lib/finance-data";
import { cn } from "@/lib/utils";

export interface InvoiceItem {
  sn?: number;
  hsCode?: string;
  particular: string;
  rate: number;
  qty: number;
  amount: number;
  staff?: string; // staff assigned specifically to this service
}

export interface InvoiceData {
  invoiceNo: string;
  orderNo?: string | number;
  date: string;
  time?: string;
  orderType?: string;
  deliveryStaff?: string;
  customer: {
    name: string;
    phone?: string;
    pan?: string;
    address?: string;
  };
  items: InvoiceItem[];
  itemTotal?: number;
  loyaltyDiscount?: number;
  loyaltyDiscountPct?: number;
  offerDiscount?: number;
  subtotal?: number;
  serviceCharge?: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

interface InvoiceDocumentProps {
  bill: InvoiceData;
  settings: InvoiceSettings;
  format?: "thermal-80mm" | "standard-a4";
  className?: string;
  id?: string;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  bill,
  settings,
  format = "thermal-80mm",
  className,
  id = "printable-invoice",
}) => {
  const isA4 = format === "standard-a4";
  const isCompact = settings.compactView;

  // Calculate totals if not directly provided
  const calculatedItemTotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
  const itemTotal = bill.itemTotal ?? calculatedItemTotal;
  const totalQty = bill.items.reduce((sum, item) => sum + item.qty, 0);

  const loyaltyDisc = settings.enableLoyaltyDiscount ? (bill.loyaltyDiscount ?? 0) : 0;
  const offerDisc = settings.enableOfferDiscount ? (bill.offerDiscount ?? 0) : 0;
  const subTotalAfterDiscount = Math.max(0, itemTotal - loyaltyDisc - offerDisc);

  const serviceChargeAmt =
    settings.enableServiceCharge && settings.serviceChargeRate > 0
      ? (bill.serviceCharge ?? Math.round(subTotalAfterDiscount * (settings.serviceChargeRate / 100)))
      : 0;

  const taxableAmount = subTotalAfterDiscount + serviceChargeAmt;
  const taxAmt =
    settings.enableTax && settings.taxRate > 0
      ? (bill.tax ?? Math.round(taxableAmount * (settings.taxRate / 100)))
      : 0;

  const grandTotal = bill.total || taxableAmount + taxAmt;

  const formatCurrency = (amount: number) => `Rs ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // THERMAL 80MM LAYOUT (Matches reference image accurately)
  if (!isA4) {
    return (
      <div
        id={id}
        className={cn(
          "bg-white text-neutral-900 mx-auto transition-all print:m-0 print:p-0 select-text",
          isCompact ? "p-3 leading-tight" : "p-6 leading-normal",
          className
        )}
        style={{
          width: "100%",
          maxWidth: "340px",
          fontFamily: settings.fontFamily || "monospace, system-ui, sans-serif",
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {/* Header Branding */}
        <div className="text-center space-y-1">
          {settings.logoUrl ? (
            <div className="flex justify-center mb-2">
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-12 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  // Hide image on broken URL
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="font-serif font-bold text-lg tracking-wide uppercase text-neutral-800">
              {settings.legalName || "Business Name"}
            </div>
          )}

          {settings.taxNumber && (
            <div className="text-[0.9em] font-medium tracking-tight text-neutral-700">
              PAN: {settings.taxNumber}
            </div>
          )}

          {settings.address && (
            <div className="text-[0.85em] text-neutral-600">
              {settings.address}
            </div>
          )}

          {settings.contact && (
            <div className="text-[0.82em] text-neutral-600">
              {settings.contact}
            </div>
          )}

          {settings.division && (
            <div className="text-[0.8em] text-neutral-500 font-mono">
              Division: {settings.division}
            </div>
          )}
        </div>

        {/* Invoice Title & Order Number */}
        <div className={cn("text-center border-t border-dashed border-neutral-300 mt-3 pt-2.5", isCompact && "mt-1.5 pt-1.5")}>
          <div className="font-bold uppercase tracking-wider text-[1.15em] text-neutral-900">
            {settings.invoiceType === "Estimate" ? "ESTIMATE" : settings.invoiceType.toUpperCase()}
          </div>
          {bill.orderNo && (
            <div className="text-[0.9em] font-semibold text-neutral-800">
              Order No: {bill.orderNo}
            </div>
          )}
        </div>

        {/* Invoice Meta Grid */}
        <div className={cn("text-[0.85em] border-y border-dashed border-neutral-300 my-2.5 py-2 space-y-1", isCompact && "my-1.5 py-1")}>
          <div className="flex justify-between">
            {settings.showInvoiceNo && (
              <div>
                <span className="text-neutral-500">Invoice No: </span>
                <span className="font-semibold">{bill.invoiceNo || "Draft"}</span>
              </div>
            )}
            {settings.showDate && (
              <div className="text-right">
                <span className="text-neutral-500">Date: </span>
                <span>{bill.date}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-baseline gap-2">
            {settings.showTime && bill.time ? (
              <div>
                <span className="text-neutral-500">Time: </span>
                <span>{bill.time}</span>
              </div>
            ) : <div />}

            {settings.showOrderType && bill.orderType && (
              <div className="text-right">
                <span className="text-neutral-500">
                  {bill.orderType.toLowerCase() === "delivery" ? "Delivery: " : "Order Type: "}
                </span>
                <span className="font-medium">
                  {bill.orderType.toLowerCase() === "delivery" && bill.deliveryStaff
                    ? bill.deliveryStaff
                    : bill.orderType}
                </span>
              </div>
            )}
          </div>

          {bill.deliveryStaff && bill.orderType?.toLowerCase() !== "delivery" && (
            <div className="flex justify-between items-baseline text-[0.92em]">
              <span className="text-neutral-500">Cashier:</span>
              <span className="font-medium text-neutral-800">
                {bill.deliveryStaff.replace(/^(stylist|therapist|instructor|doctor|dr\.|cashier|server):\s*/i, "")}
              </span>
            </div>
          )}
        </div>

        {/* Customer Information Block */}
        {(bill.customer.name || bill.customer.phone || bill.customer.pan || bill.customer.address) && (
          <div className={cn("text-[0.85em] space-y-0.5 pb-2 border-b border-dashed border-neutral-300 mb-2", isCompact && "pb-1 mb-1")}>
            <div className="flex justify-between">
              <span className="text-neutral-500">Customer:</span>
              <span className="font-semibold text-right">{bill.customer.name || "Walk-in"}</span>
            </div>

            {settings.showCustomerPan && bill.customer.pan && (
              <div className="flex justify-between">
                <span className="text-neutral-500">PAN:</span>
                <span className="font-mono text-right">{bill.customer.pan}</span>
              </div>
            )}

            {settings.showCustomerPhone && bill.customer.phone && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Contact:</span>
                <span className="text-right">{bill.customer.phone}</span>
              </div>
            )}

            {settings.showCustomerAddress && bill.customer.address && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Address:</span>
                <span className="text-right truncate max-w-[200px]">{bill.customer.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Line Items Table */}
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-400 text-[0.8em] uppercase tracking-wider text-neutral-600">
                {settings.showSN && <th className="pb-1 text-center w-6">S.N</th>}
                {settings.showHsCode && <th className="pb-1 text-left w-12">HS Code</th>}
                {settings.showParticular && <th className="pb-1 text-left">Particular</th>}
                {settings.showRate && <th className="pb-1 text-right">Rate</th>}
                {settings.showQty && <th className="pb-1 text-center">{settings.qtyLabel || "QTY"}</th>}
                {settings.showAmount && <th className="pb-1 text-right">Amount</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-neutral-200">
              {bill.items.map((item, idx) => (
                <tr key={idx} className={cn("align-top text-[0.85em]", isCompact ? "py-0.5" : "py-1.5")}>
                  {settings.showSN && <td className="py-1 text-center text-neutral-500">{item.sn ?? idx + 1}</td>}
                  {settings.showHsCode && <td className="py-1 text-neutral-500 font-mono text-[0.9em]">{item.hsCode || "-"}</td>}
                  {settings.showParticular && (
                    <td className="py-1 pr-1 font-medium text-neutral-800 break-words leading-tight">
                      <div>{item.particular}</div>
                      {settings.showStaff && item.staff && (
                        <div className="text-[0.78em] text-neutral-500 font-normal tracking-tight">
                          Staff: {item.staff}
                        </div>
                      )}
                    </td>
                  )}
                  {settings.showRate && (
                    <td className="py-1 text-right text-neutral-600 whitespace-nowrap">
                      {item.rate.toFixed(2)}
                    </td>
                  )}
                  {settings.showQty && (
                    <td className="py-1 text-center font-medium whitespace-nowrap">
                      {item.qty}
                    </td>
                  )}
                  {settings.showAmount && (
                    <td className="py-1 text-right font-medium text-neutral-900 whitespace-nowrap">
                      {item.amount.toFixed(2)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Calculations */}
        <div className={cn("border-t-2 border-neutral-800 mt-2 pt-2 text-[0.88em] space-y-1.5", isCompact && "mt-1.5 pt-1.5 space-y-1")}>
          {/* Total Count / Item Total */}
          {settings.showItemTotal && (
            <div className="flex justify-between font-medium">
              <span>Total (Particular/QTY)</span>
              <span className="font-semibold">{bill.items.length}/{totalQty} &nbsp; {formatCurrency(itemTotal)}</span>
            </div>
          )}

          {/* Loyalty Discount */}
          {settings.enableLoyaltyDiscount && loyaltyDisc > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Loyalty Discount {bill.loyaltyDiscountPct ? `(${bill.loyaltyDiscountPct}%)` : ""}</span>
              <span>- {formatCurrency(loyaltyDisc)}</span>
            </div>
          )}

          {/* Dish / Offer Discount */}
          {settings.enableOfferDiscount && offerDisc > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Offer Discount</span>
              <span>- {formatCurrency(offerDisc)}</span>
            </div>
          )}

          {/* Sub Total */}
          <div className="flex justify-between font-semibold border-t border-dashed border-neutral-300 pt-1">
            <span>Sub Total</span>
            <span>{formatCurrency(subTotalAfterDiscount)}</span>
          </div>

          {/* Service Charge */}
          {settings.enableServiceCharge && serviceChargeAmt > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Service Charge ({settings.serviceChargeRate}%)</span>
              <span>{formatCurrency(serviceChargeAmt)}</span>
            </div>
          )}

          {/* VAT / Tax */}
          {settings.enableTax && taxAmt > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>VAT ({settings.taxRate}%)</span>
              <span>{formatCurrency(taxAmt)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between font-bold text-[1.15em] border-t-2 border-neutral-900 pt-1.5 text-neutral-950">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          {bill.paymentMethod && (
            <div className="flex justify-between text-[0.82em] text-neutral-500 pt-0.5">
              <span>Payment Mode:</span>
              <span className="font-medium text-neutral-800">{bill.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="text-center text-[0.8em] text-neutral-500 mt-4 pt-3 border-t border-dashed border-neutral-300 space-y-1">
          <p className="font-medium text-neutral-700">Thank you for your business!</p>
          <p className="text-[0.9em]">Goods or services once sold are non-refundable.</p>
          <p className="text-[0.75em] text-neutral-400 font-mono">BRG Suite · Powered by Antigravity</p>
        </div>
      </div>
    );
  }

  // STANDARD A4 FULL PAGE LAYOUT
  return (
    <div
      id={id}
      className={cn(
        "bg-white text-neutral-900 mx-auto p-10 max-w-[800px] border border-neutral-200 shadow-sm print:shadow-none print:border-0 print:p-0",
        className
      )}
      style={{
        fontFamily: settings.fontFamily || "Inter, system-ui, sans-serif",
      }}
    >
      {/* A4 Header */}
      <div className="flex justify-between items-start border-b border-neutral-200 pb-6 mb-6">
        <div>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-3" />
          ) : (
            <div className="font-serif font-bold text-2xl text-neutral-900 mb-1">{settings.legalName || "Business Name"}</div>
          )}
          <div className="text-sm text-neutral-600 space-y-0.5">
            {settings.address && <div>{settings.address}</div>}
            {settings.contact && <div>{settings.contact}</div>}
            {settings.taxNumber && <div className="font-medium">Tax / PAN No: {settings.taxNumber}</div>}
            {settings.division && <div className="text-xs text-neutral-400">Division: {settings.division}</div>}
          </div>
        </div>

        <div className="text-right space-y-2">
          <span className="inline-block px-3 py-1 bg-neutral-900 text-white rounded font-semibold text-xs tracking-wider uppercase">
            {settings.invoiceType}
          </span>
          <div className="font-serif text-2xl font-bold text-neutral-900">
            #{bill.invoiceNo || "DRAFT"}
          </div>
          <div className="text-sm text-neutral-600">
            <div>Date: <span className="font-medium text-neutral-800">{bill.date}</span></div>
            {bill.time && <div>Time: <span className="font-medium text-neutral-800">{bill.time}</span></div>}
            {bill.orderNo && <div>Order Ref: <span className="font-mono text-neutral-800">#{bill.orderNo}</span></div>}
          </div>
        </div>
      </div>

      {/* Bill To Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
          <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">Billed To</div>
          <div className="font-bold text-base text-neutral-900">{bill.customer.name || "Walk-in Customer"}</div>
          {settings.showCustomerPhone && bill.customer.phone && (
            <div className="text-neutral-600 mt-1">Phone: {bill.customer.phone}</div>
          )}
          {settings.showCustomerPan && bill.customer.pan && (
            <div className="text-neutral-600 font-mono mt-0.5">PAN: {bill.customer.pan}</div>
          )}
          {settings.showCustomerAddress && bill.customer.address && (
            <div className="text-neutral-600 mt-0.5">Address: {bill.customer.address}</div>
          )}
        </div>

        <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">Service & Handling</div>
            <div className="text-neutral-700">
              <span className="text-neutral-500">Processed by: </span>
              <span className="font-medium">{bill.deliveryStaff || "Main Counter"}</span>
            </div>
            {bill.orderType && (
              <div className="text-neutral-700 mt-1">
                <span className="text-neutral-500">Service Mode: </span>
                <span className="font-medium">{bill.orderType}</span>
              </div>
            )}
          </div>
          {bill.paymentMethod && (
            <div className="text-xs font-medium text-neutral-500">
              Paid via <span className="text-neutral-900 font-semibold">{bill.paymentMethod}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse mb-8 text-sm">
        <thead>
          <tr className="bg-neutral-100 text-neutral-700 font-semibold border-y border-neutral-200">
            {settings.showSN && <th className="p-3 text-center w-12">#</th>}
            {settings.showHsCode && <th className="p-3 w-28">HS Code</th>}
            {settings.showParticular && <th className="p-3">Description</th>}
            {settings.showRate && <th className="p-3 text-right w-28">Rate</th>}
            {settings.showQty && <th className="p-3 text-center w-20">{settings.qtyLabel || "Qty"}</th>}
            {settings.showAmount && <th className="p-3 text-right w-32">Amount</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {bill.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-neutral-50/50">
              {settings.showSN && <td className="p-3 text-center text-neutral-400">{item.sn ?? idx + 1}</td>}
              {settings.showHsCode && <td className="p-3 text-neutral-500 font-mono text-xs">{item.hsCode || "-"}</td>}
              {settings.showParticular && (
                <td className="p-3 text-neutral-900">
                  <div className="font-medium">{item.particular}</div>
                  {settings.showStaff && item.staff && (
                    <div className="text-xs text-neutral-500 mt-0.5 font-normal">Assigned: {item.staff}</div>
                  )}
                </td>
              )}
              {settings.showRate && <td className="p-3 text-right text-neutral-600">{formatCurrency(item.rate)}</td>}
              {settings.showQty && <td className="p-3 text-center font-medium">{item.qty}</td>}
              {settings.showAmount && <td className="p-3 text-right font-semibold text-neutral-900">{formatCurrency(item.amount)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Notes */}
      <div className="flex justify-between items-start gap-8">
        <div className="flex-1 text-xs text-neutral-500 space-y-2">
          <div className="font-semibold text-neutral-700 uppercase tracking-wider">Terms & Notes</div>
          <p>1. Payments are due within 15 days of invoice date unless agreed otherwise.</p>
          <p>2. Please quote invoice number #{bill.invoiceNo} on bank transfers or mobile payments.</p>
          {bill.notes && <p className="italic text-neutral-600">{bill.notes}</p>}
        </div>

        <div className="w-80 space-y-2 text-sm border-t border-neutral-200 pt-3">
          <div className="flex justify-between text-neutral-600">
            <span>Item Subtotal ({totalQty} items)</span>
            <span>{formatCurrency(itemTotal)}</span>
          </div>

          {settings.enableLoyaltyDiscount && loyaltyDisc > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Loyalty Discount</span>
              <span>- {formatCurrency(loyaltyDisc)}</span>
            </div>
          )}

          {settings.enableOfferDiscount && offerDisc > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Offer Discount</span>
              <span>- {formatCurrency(offerDisc)}</span>
            </div>
          )}

          {settings.enableServiceCharge && serviceChargeAmt > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Service Charge ({settings.serviceChargeRate}%)</span>
              <span>{formatCurrency(serviceChargeAmt)}</span>
            </div>
          )}

          {settings.enableTax && taxAmt > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Tax / VAT ({settings.taxRate}%)</span>
              <span>{formatCurrency(taxAmt)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg text-neutral-950 border-t border-neutral-900 pt-2">
            <span>Total Payable</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

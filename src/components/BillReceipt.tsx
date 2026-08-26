import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/finance-data";
import { Printer, X, CheckCircle2 } from "lucide-react";

export type BillItem = {
  name: string;
  type: string;
  price: number;
  qty: number;
};

export type BillData = {
  invoiceNo: string;
  date: string;
  customer: string;
  method: string;
  items: BillItem[];
  subtotal: number;
  discountPct: number;
  discountAmt: number;
  loyaltyAmt: number;
  vat: number;
  total: number;
  business?: string;
  branch?: string;
  staff?: string;
};

type Props = {
  bill: BillData;
  onClose: () => void;
};

export function BillReceipt({ bill, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handlePrint() {
    const node = printRef.current;
    if (!node) return;
    const w = window.open("", "_blank", "width=420,height=720");
    if (!w) {
      window.print();
      return;
    }
    w.document.write(`<!doctype html><html><head><title>Bill ${bill.invoiceNo}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;padding:24px;color:#1a1a1a;background:#fff}
  .bill{max-width:340px;margin:0 auto}
  .center{text-align:center}
  .row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px}
  .muted{color:#666;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
  .brand{font-family:Georgia,"Times New Roman",serif;font-size:22px;margin:0 0 4px}
  hr{border:none;border-top:1px dashed #cfcfcf;margin:14px 0}
  table{width:100%;border-collapse:collapse;font-size:12px}
  td{padding:4px 0;vertical-align:top}
  .qty{width:30px;text-align:center;color:#666}
  .amt{text-align:right;white-space:nowrap}
  .tot{font-family:Georgia,serif;font-size:20px;display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #1a1a1a;margin-top:8px}
  .foot{margin-top:18px;text-align:center;font-size:11px;color:#666;line-height:1.55}
  @page{margin:8mm}
</style></head><body>${node.innerHTML}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script></body></html>`);
    w.document.close();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-luxe overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-card to-sand-soft/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-deep-olive" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Payment successful</div>
              <div className="font-serif text-base">Bill #{bill.invoiceNo}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div ref={printRef}>
            <div className="bill">
              <div className="center">
                <h1 className="brand">{bill.business || "Aura Beauty Lounge"}</h1>
                <div className="muted">Tax Invoice</div>
              </div>

              <hr />

              <div className="row"><span className="muted">Invoice</span><span>{bill.invoiceNo}</span></div>
              <div className="row"><span className="muted">Date</span><span>{bill.date}</span></div>
              <div className="row"><span className="muted">Customer</span><span>{bill.customer}</span></div>
              {bill.branch && <div className="row"><span className="muted">Branch</span><span>{bill.branch}</span></div>}
              {bill.staff && <div className="row"><span className="muted">Served by</span><span>{bill.staff}</span></div>}
              <div className="row"><span className="muted">Payment</span><span>{bill.method}</span></div>

              <hr />

              <table>
                <tbody>
                  {bill.items.map((it, i) => (
                    <tr key={i}>
                      <td>
                        <div>{it.name}</div>
                        <div className="muted">{it.type}</div>
                      </td>
                      <td className="qty">{it.qty}</td>
                      <td className="amt">{fmt(it.price * it.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr />

              <div className="row"><span className="muted">Subtotal</span><span>{fmt(bill.subtotal)}</span></div>
              {bill.discountAmt > 0 && (
                <div className="row"><span className="muted">Discount ({bill.discountPct}%)</span><span>−{fmt(bill.discountAmt)}</span></div>
              )}
              {bill.loyaltyAmt > 0 && (
                <div className="row"><span className="muted">Loyalty</span><span>−{fmt(bill.loyaltyAmt)}</span></div>
              )}
              <div className="row"><span className="muted">VAT 13%</span><span>{fmt(bill.vat)}</span></div>

              <div className="tot"><span>Total</span><span>{fmt(bill.total)}</span></div>

              <div className="foot">
                Thank you for visiting.<br />
                We look forward to seeing you again soon.
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border bg-card flex items-center gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />Print bill
          </Button>
        </div>
      </div>
    </div>
  );
}

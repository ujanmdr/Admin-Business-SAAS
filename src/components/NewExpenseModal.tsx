import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, Wallet, Hash, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { STAFF, COMMISSION_BREAKDOWN } from "@/lib/staff-data";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenant-store";
import { mockBranches } from "@/lib/tenant-data";

const DEFAULT_CATS = ["Rent", "Payroll", "Marketing", "Utilities", "Office Supplies", "Maintenance", "Miscellaneous"];
const PAID_BY_OPTIONS = ["Business Account (Bank)", "Cash Drawer", "Staff Pocket (Needs Reimbursement)"];

const getMonthOptions = () => {
  const opts = [];
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  for (let i = 0; i < 6; i++) {
    opts.push(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d));
    d.setMonth(d.getMonth() + 1);
  }
  return opts;
};
const MONTH_OPTIONS = getMonthOptions();

type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paidBy: string;
  staffId?: string; 
  reimbursementStatus?: "Pending" | "Paid";
  tags: string[];
  receipt: boolean;
  billingMonth?: string;
  payrollDetails?: {
    baseSalary: number;
    commission: number;
    advanceDeduction: number;
  };
  branchId?: string; // Support for tracking overall expenses
};

export function NewExpenseModal({ 
  open, 
  onOpenChange, 
  onAddExpense 
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  onAddExpense: (expense: Expense) => void;
}) {
  const { activeBranchId, activeBusinessId } = useTenantStore();
  const isOverall = activeBranchId === 'OVERALL';
  const myBranches = mockBranches.filter(b => b.businessId === activeBusinessId);

  const [assignedBranch, setAssignedBranch] = useState("GLOBAL");
  const [cat, setCat] = useState("Rent");
  const [customCatName, setCustomCatName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(PAID_BY_OPTIONS[0]);
  const [tags, setTags] = useState("");
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  
  const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
  const [billingMonth, setBillingMonth] = useState(currentMonthYear);

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [payoutType, setPayoutType] = useState<"Full" | "Advance">("Full");

  const totalCommissionMock = COMMISSION_BREAKDOWN.reduce((s, x) => s + x.value, 0);

  useEffect(() => {
    if (cat === "Payroll" && selectedStaffId) {
      const staff = STAFF.find(s => s.id === selectedStaffId);
      if (staff) {
        if (payoutType === "Full") {
          const finalPay = staff.baseSalary + totalCommissionMock - staff.advancesTaken;
          setAmount(finalPay.toString());
          setDescription(`[${billingMonth}] Final month-end payout for ${staff.name} (Base: Rs. ${staff.baseSalary}, Commission: Rs. ${totalCommissionMock}, Less Advances: Rs. ${staff.advancesTaken})`);
        } else if (payoutType === "Advance") {
          setAmount("");
          setDescription(`[${billingMonth}] Advance salary payout for ${staff.name}`);
        }
      }
    } else if (cat === "Rent") {
      setDescription(`[${billingMonth}] Monthly shop rent`);
    } else if (cat !== "Payroll" && !paidBy.includes("Reimbursement")) {
      setSelectedStaffId("");
      if (amount && description.includes("payout for")) {
        setAmount("");
        setDescription("");
      }
      setPayoutType("Full");
    }
  }, [selectedStaffId, cat, payoutType, paidBy, billingMonth]);

  const handleAdd = () => {
    if (!amount || !description) return;
    
    const parsedTags = tags.split(',').map(t => t.trim()).filter(t => t);
    const finalCategory = cat === "Custom" ? (customCatName || "Miscellaneous") : cat;

    const newExpense: Expense = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: finalCategory,
      amount: Number(amount),
      description,
      status: paidBy.includes("Reimbursement") ? "Pending Reimbursement" : "Paid",
      paidBy,
      tags: parsedTags,
      hasReceipt: receiptUploaded,
      staffId: selectedStaffId || undefined,
    };

    onAddExpense(newExpense);
    
    // Reset state
    setAmount("");
    setDescription("");
    setCat("Rent");
    setCustomCatName("");
    setPaidBy(PAID_BY_OPTIONS[0]);
    setTags("");
    setReceiptUploaded(false);
    setSelectedStaffId("");
    setPayoutType("Full");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add Expense</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Log an operational expense, utility bill, or payroll payout.</p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Branch Assignment for Overall View */}
          {isOverall && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <label className="text-xs font-semibold text-primary block mb-2">Assign to Branch</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                value={assignedBranch}
                onChange={(e) => setAssignedBranch(e.target.value)}
              >
                <option value="GLOBAL">Head Office (Global Expense)</option>
                <optgroup label="Specific Branches">
                  {myBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Top Grid: Category & Paid By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Category</label>
              <select 
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                {DEFAULT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Custom">+ Create Custom Category</option>
              </select>
              {cat === "Custom" && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                  <Input 
                    placeholder="E.g. Travel, Software, Events..." 
                    value={customCatName}
                    onChange={(e) => setCustomCatName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Wallet className="h-3 w-3" /> Paid From
              </label>
              <select 
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                {PAID_BY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Billing Month Section for Rent & Payroll */}
          {(cat === "Rent" || cat === "Payroll") && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-medium text-primary">Billing Month</label>
              <select 
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-primary/30 bg-primary/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={billingMonth}
                onChange={(e) => {
                  setBillingMonth(e.target.value);
                  if (cat === "Rent") {
                    setDescription(`[${e.target.value}] Monthly shop rent`);
                  }
                }}
              >
                {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          {/* Smart Payroll / Reimbursement Section */}
          {(cat === "Payroll" || paidBy.includes("Reimbursement")) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
              <div>
                <label className="text-xs font-medium text-primary">
                  {cat === "Payroll" ? "Select Staff Member" : "Who Paid Out of Pocket?"}
                </label>
                <select 
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-primary/30 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="" disabled>Choose a staff member...</option>
                  {STAFF.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              {selectedStaffId && cat === "Payroll" && (
                <div>
                  <label className="text-xs font-medium">Payout Type</label>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => setPayoutType("Full")}
                      className={cn("flex-1 text-xs py-2 rounded-lg border transition", payoutType === "Full" ? "bg-foreground text-background border-foreground shadow-sm" : "bg-card border-border hover:bg-secondary")}
                    >
                      Final Month-End Salary
                    </button>
                    <button 
                      onClick={() => setPayoutType("Advance")}
                      className={cn("flex-1 text-xs py-2 rounded-lg border transition", payoutType === "Advance" ? "bg-foreground text-background border-foreground shadow-sm" : "bg-card border-border hover:bg-secondary")}
                    >
                      Advance Pay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Amount (NPR)</label>
              <Input 
                type="number" 
                className="mt-1.5" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Hash className="h-3 w-3" /> Tags (Optional)
              </label>
              <Input 
                className="mt-1.5" 
                placeholder="e.g. meta-ads, coffee, repair" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Description</label>
            <Textarea 
              className="mt-1.5" 
              rows={3} 
              placeholder="What was this expense for?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="text-xs font-medium">Proof of Purchase</label>
            {!receiptUploaded ? (
              <button 
                onClick={() => setReceiptUploaded(true)}
                className="w-full mt-1.5 h-20 rounded-xl border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs font-medium">Click to upload receipt photo</span>
              </button>
            ) : (
              <div className="w-full mt-1.5 h-20 rounded-xl border border-deep-olive/30 bg-sage/10 flex items-center justify-center gap-2 text-deep-olive">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Receipt uploaded successfully</span>
                <button 
                  onClick={() => setReceiptUploaded(false)}
                  className="ml-4 text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

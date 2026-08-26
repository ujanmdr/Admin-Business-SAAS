import { useState } from "react";
import { CUSTOMERS } from "@/lib/customer-data";
import { SERVICES } from "@/lib/service-data";
import {
  useLoyaltyRules,
  useLoyaltyRedemptions,
  useCustomerProgress,
  useWhatsAppLogs,
  claimLoyaltyReward,
} from "@/lib/loyalty-program-data";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Copy,
  Check,
  MessageSquare,
  Gift,
  Calendar,
  CreditCard,
  Building,
  User,
  Heart,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CustomerLoyaltySimulator() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMERS[0].id);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Claim states
  const [confirmClaimRuleId, setConfirmClaimRuleId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const rules = useLoyaltyRules();
  const redemptions = useLoyaltyRedemptions();
  const progressList = useCustomerProgress();
  const whatsappLogs = useWhatsAppLogs();

  const currentCustomer = CUSTOMERS.find((c) => c.id === selectedCustomerId) || CUSTOMERS[0];

  // Fetch all active progress records for this customer
  const customerProgress = rules.filter(r => r.active).map((rule) => {
    const prog = progressList.find(
      (p) => p.customerId === selectedCustomerId && p.ruleId === rule.id
    );
    return {
      rule,
      stamps: prog ? prog.stampsCount : 0,
      milestone: rule.milestone,
    };
  });

  // Fetch all claimed rewards for this customer
  const customerRedemptions = redemptions
    .filter((r) => r.customerId === selectedCustomerId)
    .sort((a, b) => {
      // Sort: pending (Active) first, then used, then expired
      const statusWeight = { pending: 1, used: 2, expired: 3 };
      return statusWeight[a.status] - statusWeight[b.status];
    });

  // Fetch WhatsApp logs for this customer
  const customerWhatsapp = whatsappLogs.filter(
    (l) => l.phone === currentCustomer.phone
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStartClaim = (ruleId: string) => {
    setConfirmClaimRuleId(ruleId);
    setGeneratedCode(null);
  };

  const handleConfirmClaim = () => {
    if (!confirmClaimRuleId) return;

    const res = claimLoyaltyReward(selectedCustomerId, confirmClaimRuleId);
    if (res.success && res.code) {
      setGeneratedCode(res.code);
      setConfirmClaimRuleId(null);
      toast.success("Reward claimed successfully!");
    } else {
      toast.error(res.error || "Failed to claim reward");
    }
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr_360px] gap-6 items-stretch">
      {/* COLUMN 1: Customer Selector */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h3 className="font-serif text-lg">Select Customer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulate the customer mobile app experience for any client.
          </p>
        </div>
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {CUSTOMERS.map((c) => {
            const active = c.id === selectedCustomerId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCustomerId(c.id);
                  setConfirmClaimRuleId(null);
                  setGeneratedCode(null);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition flex items-center gap-3",
                  active
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "border-transparent hover:bg-sand-soft/50"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-secondary grid place-items-center text-xs font-serif font-semibold text-deep-olive">
                  {c.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.phone}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Customer App Mockup (Phone Shell) */}
      <div className="flex flex-col items-center justify-center py-4 bg-background/50 rounded-2xl border border-border">
        {/* Device Shell */}
        <div className="w-[330px] h-[640px] rounded-[42px] border-[10px] border-neutral-900 bg-neutral-950 shadow-2xl relative flex flex-col overflow-hidden">
          {/* Speaker / Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-neutral-900 rounded-b-2xl z-20 flex justify-center items-center">
            <div className="h-1.5 w-12 bg-neutral-800 rounded-full mb-1" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 bg-[#F9F6F0] text-neutral-800 p-4 pt-8 overflow-y-auto flex flex-col font-sans">
            {/* App Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-4 mt-2">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold">BRG Rewards</div>
                <div className="font-serif text-lg font-bold text-neutral-900">Aura Lounge</div>
              </div>
              <div className="h-7 w-7 rounded-full bg-neutral-900 text-white grid place-items-center text-[10px] font-bold">
                {currentCustomer.name.charAt(0)}
              </div>
            </div>

            {/* Claim Confirmation Screen Overlay */}
            {confirmClaimRuleId && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg text-center space-y-4 my-auto">
                <Gift className="h-12 w-12 text-gold mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-semibold text-neutral-900">Claim Free Service?</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Claim your reward at Aura Beauty Lounge? Your stamp progress will reset to 0.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClaimRuleId(null)}
                    className="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClaim}
                    className="flex-1 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800"
                  >
                    Confirm & Claim
                  </button>
                </div>
              </div>
            )}

            {/* Generated Code Display Screen Overlay */}
            {generatedCode && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg text-center space-y-4 my-auto">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full grid place-items-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-semibold text-neutral-900">Reward Claimed!</h4>
                  <p className="text-xs text-neutral-500">
                    Give this code to the receptionist at checkout.
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-lg text-neutral-900 tracking-wider">
                    {generatedCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(generatedCode)}
                    className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600"
                    aria-label="Copy code"
                  >
                    {copiedCode === generatedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-neutral-400 leading-normal">
                  Show this code to staff at checkout. Valid for 60 days from today.
                </div>
                <Button
                  onClick={() => setGeneratedCode(null)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-2 text-xs"
                >
                  Done
                </Button>
              </div>
            )}

            {/* Default Display (Stamp Cards & Rewards Tabs) */}
            {!confirmClaimRuleId && !generatedCode && (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Section A: Active Stamp Cards */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    My Stamp Cards
                  </h4>
                  {customerProgress.map(({ rule, stamps, milestone }) => {
                    const earned = stamps >= milestone;
                    const rewardSvc = SERVICES.find((s) => s.id === rule.rewardServiceId)?.name || "Free Visit";
                    
                    return (
                      <div
                        key={rule.id}
                        className={cn(
                          "rounded-2xl border p-4 shadow-sm flex flex-col gap-3 transition",
                          earned
                            ? "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300 ring-2 ring-amber-400/20"
                            : "bg-white border-neutral-200/60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-serif text-sm font-semibold text-neutral-900 leading-tight">
                              {rule.name}
                            </div>
                            <div className="text-[9px] text-neutral-500 mt-0.5">
                              Free {rewardSvc} every {milestone} stamps
                            </div>
                          </div>
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                            earned ? "bg-amber-200 text-amber-900" : "bg-neutral-100 text-neutral-600"
                          )}>
                            {earned ? "REWARD!" : `${stamps}/${milestone}`}
                          </span>
                        </div>

                        {/* Stamp Grid */}
                        <div className="grid grid-cols-5 gap-1.5 my-1">
                          {Array.from({ length: milestone }).map((_, i) => {
                            const filled = i < stamps;
                            const isLast = i === milestone - 1;
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "aspect-square rounded-full border text-[10px] grid place-items-center font-bold",
                                  filled
                                    ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                                    : isLast
                                    ? "border-amber-400 bg-amber-50 text-amber-700"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-400"
                                )}
                              >
                                {isLast ? "★" : filled ? "✓" : i + 1}
                              </div>
                            );
                          })}
                        </div>

                        {/* Celebration claim button */}
                        {earned ? (
                          <button
                            onClick={() => handleStartClaim(rule.id)}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs rounded-xl shadow-md hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-1"
                          >
                            <Gift className="h-3.5 w-3.5" /> Claim Your Free Service
                          </button>
                        ) : (
                          <div className="text-[10px] text-neutral-400 italic">
                            Earn stamps automatically on booking checkout!
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {customerProgress.length === 0 && (
                    <div className="text-center py-6 text-xs text-neutral-400 bg-white rounded-2xl border border-neutral-100">
                      No active loyalty programs running.
                    </div>
                  )}
                </div>

                {/* Section B: My Rewards Wallet */}
                <div className="space-y-2 mt-2 flex-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    My Claimed Rewards
                  </h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                    {customerRedemptions.map((red) => {
                      const isPending = red.status === "pending";
                      const isExpired = red.status === "expired";
                      
                      return (
                        <div
                          key={red.code}
                          className={cn(
                            "rounded-xl border p-3 flex items-center justify-between gap-3 text-xs bg-white",
                            isExpired
                              ? "border-neutral-200 opacity-60 text-neutral-400 bg-neutral-50/50"
                              : isPending
                              ? "border-neutral-200"
                              : "border-neutral-200 bg-neutral-50/20"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-900 truncate">{red.serviceName}</div>
                            <div className="text-[9px] text-neutral-400 truncate mt-0.5">
                              {red.ruleName}
                            </div>
                            <div className="text-[9px] text-neutral-500 mt-0.5 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {isPending
                                ? `Expires: ${red.expiresAt}`
                                : red.status === "used"
                                ? `Redeemed: ${red.usedAt}`
                                : `Expired: ${red.expiresAt}`}
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {isPending ? (
                              <button
                                onClick={() => handleCopyCode(red.code)}
                                className="flex items-center gap-1 bg-neutral-950 text-white font-mono px-2 py-1 rounded border border-neutral-900 text-[10px] hover:bg-neutral-800"
                              >
                                {red.code.replace("BRG-LOY-", "")}
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            ) : (
                              <span className={cn(
                                "text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border",
                                red.status === "used"
                                  ? "bg-neutral-100 border-neutral-200 text-neutral-500"
                                  : "bg-red-50 border-red-100 text-red-500"
                              )}>
                                {red.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {customerRedemptions.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-neutral-400 italic bg-white rounded-xl border border-neutral-100">
                        No rewards claimed yet. Keep visiting to earn stamps!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar indicator */}
          <div className="h-1 w-28 bg-neutral-800 rounded-full mx-auto mb-2 shrink-0" />
        </div>
      </div>

      {/* COLUMN 3: WhatsApp Simulator Logs */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-serif text-lg leading-none">WhatsApp Notifications</h3>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Simulated Log</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {customerWhatsapp.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-secondary/60 rounded-xl border border-border space-y-1.5 text-xs animate-in fade-in duration-200"
            >
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span className="font-semibold">{currentCustomer.name}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="text-foreground leading-normal italic font-serif">
                "{log.message}"
              </p>
            </div>
          ))}
          {customerWhatsapp.length === 0 && (
            <div className="text-center py-12 text-xs text-muted-foreground italic">
              No WhatsApp messages sent yet. Complete bookings or claim rewards to trigger notifications!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

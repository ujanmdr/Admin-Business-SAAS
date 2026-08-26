import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Handshake, UserPlus, Mail, ShieldAlert, ArrowRightLeft, Trash2, Edit2, ShieldCheck, PieChart, Clock, Star, ArrowUpRight, TrendingUp, History, Banknote, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/business/partners")({
  component: PartnersPage,
});

type Partner = {
  id: string;
  name: string;
  email: string;
  role: "Primary Owner" | "Co-Owner" | "Investor";
  equity: number;
  scope: "Overall" | "Massage" | "Hair" | "Skin" | "Nails";
  joinDate: string;
};

type Invite = {
  id: string;
  email: string;
  role: "Co-Owner" | "Investor";
  equity: number;
  scope: "Overall" | "Massage" | "Hair" | "Skin" | "Nails";
  deadline: string;
};

const INITIAL_PARTNERS: Partner[] = [
  { id: "p1", name: "Suresh Shrestha", email: "suresh@aurabeauty.com", role: "Primary Owner", equity: 70, scope: "Overall", joinDate: "2023-01-15" },
  { id: "p2", name: "Anisha Karki", email: "anisha@aurabeauty.com", role: "Co-Owner", equity: 30, scope: "Overall", joinDate: "2024-06-10" },
  { id: "p3", name: "Dr. Ramesh", email: "ramesh.spa@gmail.com", role: "Investor", equity: 50, scope: "Massage", joinDate: "2025-02-22" },
];

const INITIAL_INVITES: Invite[] = [
  { id: "inv1", email: "investor.john@capital.com", role: "Investor", equity: 10, scope: "Overall", deadline: "2026-08-15" }
];

// Mock Financials for Payouts
const MONTHLY_PROFIT_OVERALL = 450000;
const MONTHLY_PROFIT_MASSAGE = 120000;
const MONTHLY_PROFIT_HAIR = 200000;
const MONTHLY_PROFIT_SKIN = 80000;
const MONTHLY_PROFIT_NAILS = 50000;

function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "payouts">("dashboard");
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [invites, setInvites] = useState<Invite[]>(INITIAL_INVITES);
  
  // Payouts State
  const [paidPartners, setPaidPartners] = useState<string[]>([]);

  // Modals State
  const [showInvite, setShowInvite] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [historyPartnerId, setHistoryPartnerId] = useState<string | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Co-Owner" | "Investor">("Co-Owner");
  const [inviteEquity, setInviteEquity] = useState<number>(10);
  const [inviteScope, setInviteScope] = useState<string>("Overall");
  const [inviteDeadline, setInviteDeadline] = useState("");
  const [transferToId, setTransferToId] = useState<string>("");

  const primaryOwner = partners.find(p => p.role === "Primary Owner");
  const totalOverallEquity = partners.filter(p => p.scope === "Overall").reduce((sum, p) => sum + p.equity, 0);

  const formatCurrency = (amount: number) => "Rs. " + amount.toLocaleString("en-IN");

  const getProfitBasis = (scope: string) => {
    switch(scope) {
      case "Massage": return MONTHLY_PROFIT_MASSAGE;
      case "Hair": return MONTHLY_PROFIT_HAIR;
      case "Skin": return MONTHLY_PROFIT_SKIN;
      case "Nails": return MONTHLY_PROFIT_NAILS;
      default: return MONTHLY_PROFIT_OVERALL;
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteDeadline) return toast.error("Please fill all required fields.");
    if (inviteScope === "Overall" && totalOverallEquity + inviteEquity > 100) return toast.error("Cannot exceed 100% overall equity!");

    const newInvite: Invite = {
      id: "inv-" + Date.now(),
      email: inviteEmail,
      role: inviteRole,
      equity: inviteEquity,
      scope: inviteScope as any,
      deadline: inviteDeadline,
    };
    setInvites([...invites, newInvite]);
    setShowInvite(false);
    toast.success("Partnership invitation sent successfully!");
  };

  const handleDeletePartner = (id: string) => {
    if (confirm("Are you sure you want to remove this partner? Their overall equity will return to the Primary Owner.")) {
      const partnerToRemove = partners.find(p => p.id === id);
      if (!partnerToRemove) return;
      
      let updatedPartners = partners.filter(p => p.id !== id);
      
      if (partnerToRemove.scope === "Overall" && primaryOwner) {
        updatedPartners = updatedPartners.map(p => 
          p.id === primaryOwner.id ? { ...p, equity: p.equity + partnerToRemove.equity } : p
        );
      }
      
      setPartners(updatedPartners);
      toast.success("Partner removed. Equity updated.");
    }
  };

  const handleTransferOwnership = () => {
    if (!transferToId) return toast.error("Select a partner to transfer to.");
    if (!confirm("Are you absolutely sure? You will lose Primary Owner status and become a regular Co-Owner.")) return;
    
    const updatedPartners = partners.map(p => {
      if (p.role === "Primary Owner") return { ...p, role: "Co-Owner" as const };
      if (p.id === transferToId) return { ...p, role: "Primary Owner" as const };
      return p;
    });
    setPartners(updatedPartners);
    setShowTransfer(false);
    toast.success("Primary Ownership transferred successfully.");
  };

  const markAsPaid = (id: string) => {
    setPaidPartners([...paidPartners, id]);
    toast.success("Payout logged successfully.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Premium Gradient Header Background */}
      <div className="h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1e293b] absolute top-0 left-0 right-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto space-y-8 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-white mb-1">Partners & Equity</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Manage your business co-owners, specialized department investors, and overall profit-sharing structure.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowTransfer(true)} className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all hidden sm:flex">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Primary Status
            </Button>
            <Button onClick={() => setShowInvite(true)} className="bg-[#D4AF37] hover:bg-[#B5952F] text-slate-900 font-semibold border-none shadow-lg shadow-black/20">
              <UserPlus className="w-4 h-4 mr-2" /> Invite Partner
            </Button>
          </div>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/10 shadow-lg">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", activeTab === "dashboard" ? "bg-white text-slate-900 shadow-sm" : "text-white hover:bg-white/10")}
          >
            Dashboard & Members
          </button>
          <button 
            onClick={() => setActiveTab("payouts")}
            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === "payouts" ? "bg-white text-slate-900 shadow-sm" : "text-white hover:bg-white/10")}
          >
            <Banknote className="w-4 h-4" /> Monthly Payouts
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <>
            {/* Equity Dashboard Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Primary Owner Highlight Card */}
              <div className="bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] rounded-2xl p-6 shadow-xl shadow-amber-900/10 md:col-span-2 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                  <Star className="w-32 h-32 text-amber-900" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/10 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
                      <ShieldCheck className="w-3.5 h-3.5" /> Primary Owner
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-amber-950 mb-2">{primaryOwner?.name}</h3>
                    <div className="flex items-center gap-2 text-amber-900/80 text-sm font-medium">
                      <Mail className="w-4 h-4" /> {primaryOwner?.email}
                    </div>
                  </div>
                  <p className="text-sm text-amber-950/70 max-w-md mt-6 leading-relaxed font-medium">
                    The Primary Owner retains full administrative control. When an overall partner is removed, their equity shares automatically revert to you.
                  </p>
                </div>
              </div>

              {/* Overall Equity Chart Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Overall Equity</div>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform duration-300">
                    <PieChart className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  {partners.filter(p => p.scope === "Overall").map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-8 rounded-full", p.role === "Primary Owner" ? "bg-primary" : "bg-primary/30")} />
                        <div>
                          <div className="text-sm font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{p.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-base text-slate-700">{p.equity}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unallocated</span>
                  <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">{100 - totalOverallEquity}%</span>
                </div>
              </div>
            </div>

            {/* Current Partners */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Active Partners
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {partners.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
                    <div className={cn("absolute top-0 left-0 w-1 h-full", 
                      p.role === "Primary Owner" ? "bg-[#D4AF37]" : 
                      p.role === "Co-Owner" ? "bg-blue-400" : "bg-purple-400"
                    )} />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{p.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{p.email}</p>
                      </div>
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", 
                        p.role === "Primary Owner" ? "bg-amber-100 text-amber-700" : 
                        p.role === "Co-Owner" ? "bg-blue-50 text-blue-700" : 
                        "bg-purple-50 text-purple-700"
                      )}>
                        {p.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Equity</div>
                        <div className="font-bold text-xl text-slate-700">{p.equity}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Scope</div>
                        <div className="font-semibold text-sm text-slate-700 flex items-center gap-1">
                          {p.scope === "Overall" ? "Overall" : p.scope}
                          {p.scope !== "Overall" && <TrendingUp className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <Button variant="link" className="px-0 text-[11px] h-auto text-slate-500 font-bold" onClick={() => setHistoryPartnerId(p.id)}>
                        <History className="w-3 h-3 mr-1" /> View History
                      </Button>
                      {p.role !== "Primary Owner" && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePartner(p.id)} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-400" /> Pending Invitations
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {invites.map(inv => (
                    <div key={inv.id} className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50/50 flex flex-col relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <span className="px-2 py-1 rounded-md bg-amber-100/50 text-amber-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                        </span>
                      </div>
                      
                      <div className="font-semibold text-slate-800 mt-2 truncate">{inv.email}</div>
                      
                      <div className="flex gap-4 mt-4">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Role</div>
                          <div className="text-xs font-medium text-slate-600">{inv.role}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Offer</div>
                          <div className="text-xs font-medium text-slate-600">{inv.equity}% ({inv.scope})</div>
                        </div>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-slate-200/60 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> Expires {inv.deadline}
                        </div>
                        <button 
                          onClick={() => cancelInvite(inv.id)} 
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* PAYOUTS TAB */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Overall Profit Pool (July 2026)</div>
              <div className="text-5xl font-serif font-bold text-slate-800">{formatCurrency(MONTHLY_PROFIT_OVERALL)}</div>
              <div className="mt-6 flex justify-center gap-4 text-sm font-medium">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Massage Dept: {formatCurrency(MONTHLY_PROFIT_MASSAGE)}</span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Other Depts: {formatCurrency(MONTHLY_PROFIT_OVERALL - MONTHLY_PROFIT_MASSAGE)}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Partner Distributions</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Partner</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Equity & Scope</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Basis</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Calculated Cut</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map(p => {
                    const basis = getProfitBasis(p.scope);
                    const cut = (basis * p.equity) / 100;
                    const isPaid = paidPartners.includes(p.id);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{p.equity}%</div>
                          <div className="text-xs text-slate-400">{p.scope}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {formatCurrency(basis)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-lg text-slate-800">{formatCurrency(cut)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-bold text-xs border border-green-200">
                              <CheckCircle2 className="w-4 h-4" /> Paid
                            </span>
                          ) : (
                            <Button 
                              onClick={() => markAsPaid(p.id)} 
                              size="sm" 
                              variant={p.role === "Primary Owner" ? "outline" : "default"}
                              className={p.role === "Primary Owner" ? "font-bold text-xs" : "bg-slate-800 hover:bg-slate-900 font-bold text-xs shadow-md shadow-slate-900/10"}
                            >
                              Log Payout
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View History Modal */}
        <Dialog open={!!historyPartnerId} onOpenChange={(open) => !open && setHistoryPartnerId(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" /> Payout History
              </DialogTitle>
              <p className="text-sm text-slate-500">Historical equity changes and payouts for this partner.</p>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">June 2026 Payout</div>
                  <div className="text-xs text-slate-500">Bank Transfer • Processed on Jul 2, 2026</div>
                </div>
                <div className="ml-auto font-bold text-slate-700">Rs. 85,000</div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">May 2026 Payout</div>
                  <div className="text-xs text-slate-500">Bank Transfer • Processed on Jun 3, 2026</div>
                </div>
                <div className="ml-auto font-bold text-slate-700">Rs. 92,500</div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Equity Increased</div>
                  <div className="text-xs text-slate-500">Increased from 10% to 20%</div>
                </div>
                <div className="ml-auto text-xs font-bold text-slate-400">Apr 15, 2026</div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setHistoryPartnerId(null)} className="w-full">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Modal & Transfer Modal remain unchanged... (omitted for brevity, but I must keep them so I'll include the actual JSX) */}
        
        {/* Invite Modal */}
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Left Side: Form */}
              <div className="p-8 md:w-1/2 overflow-y-auto bg-white">
                <DialogHeader className="mb-6 text-left">
                  <DialogTitle className="text-xl font-bold text-slate-800">Draft Partnership Offer</DialogTitle>
                  <p className="text-sm text-slate-500 mt-1">Configure the terms of equity and access for the new partner.</p>
                </DialogHeader>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Partner Email</label>
                    <Input 
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)} 
                      placeholder="investor@example.com" 
                      className="h-11 rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Access Role</label>
                      <select 
                        value={inviteRole} 
                        onChange={e => setInviteRole(e.target.value as any)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Co-Owner">Co-Owner (Full)</option>
                        <option value="Investor">Investor (View)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Deadline</label>
                      <Input 
                        type="date" 
                        value={inviteDeadline} 
                        onChange={e => setInviteDeadline(e.target.value)} 
                        className="h-11 rounded-xl bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                      <PieChart className="w-3.5 h-3.5"/> Equity Allocation
                    </h4>
                    
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target Scope</label>
                      <select 
                        value={inviteScope} 
                        onChange={e => setInviteScope(e.target.value)}
                        className="w-full h-11 rounded-xl border border-white bg-white shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Overall">Overall Business (All Depts)</option>
                        <option value="Massage">Massage Dept Only</option>
                        <option value="Hair">Hair Dept Only</option>
                        <option value="Skin">Skin Dept Only</option>
                        <option value="Nails">Nails Dept Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Percentage (%)</label>
                      <div className="relative">
                        <Input 
                          type="number" min="1" max="100" 
                          value={inviteEquity} 
                          onChange={e => setInviteEquity(Number(e.target.value))} 
                          className="h-11 rounded-xl border border-white bg-white shadow-sm pl-4 pr-10 text-lg font-bold text-slate-800"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setShowInvite(false)} className="rounded-xl font-semibold">Cancel</Button>
                  <Button onClick={handleSendInvite} className="rounded-xl font-bold shadow-md shadow-primary/20">Send Offer</Button>
                </div>
              </div>

              {/* Right Side: Email Preview */}
              <div className="p-8 md:w-1/2 bg-slate-900 overflow-y-auto hidden md:flex flex-col relative text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Preview
                </h3>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex-1 flex flex-col">
                  <div className="bg-white/5 p-5 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-200 flex items-center justify-center shadow-inner">
                      <Handshake className="w-5 h-5 text-amber-900" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-300 font-medium">From: Aura Beauty Lounge</div>
                      <h4 className="font-serif text-lg font-bold text-white">Partnership Offer</h4>
                    </div>
                  </div>
                  <div className="p-6 space-y-5 text-sm text-slate-200 flex-1">
                    <p className="text-lg font-serif">Hello there,</p>
                    <p className="leading-relaxed">
                      You have been invited by <strong className="text-white">{primaryOwner?.name}</strong> to join the ownership team at Aura Beauty Lounge.
                    </p>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-5 space-y-4 shadow-inner">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Proposed Role</div>
                        <div className="font-semibold text-white text-base">{inviteRole}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Equity</div>
                          <div className="font-bold text-white text-2xl">{inviteEquity}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Scope</div>
                          <div className="font-semibold text-white text-base">{inviteScope}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 pt-2">
                      Please review and accept this offer before <strong className="text-white">{inviteDeadline || "the deadline"}</strong> to finalize your partnership.
                    </p>
                  </div>
                  <div className="p-5 border-t border-white/10 bg-black/10">
                    <Button className="w-full rounded-xl bg-white text-slate-900 hover:bg-slate-200 font-bold" disabled>Review & Accept Proposal</Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transfer Ownership Modal */}
        <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
            <div className="bg-rose-500 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white mb-2">Transfer Primary Status</DialogTitle>
              <p className="text-rose-100 text-sm">
                This will transfer your legal and administrative control to another partner. You will become a regular Co-Owner.
              </p>
            </div>
            <div className="p-6 bg-white space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select New Primary Owner</label>
                <select 
                  value={transferToId} 
                  onChange={e => setTransferToId(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">-- Choose Partner --</option>
                  {partners.filter(p => p.role !== "Primary Owner").map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.equity}% Equity)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowTransfer(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1 rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700" onClick={handleTransferOwnership}>Confirm Transfer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

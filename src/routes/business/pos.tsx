import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt } from "@/lib/finance-data";
import { SERVICES, CATEGORY_META } from "@/lib/service-data";
import { PRODUCTS } from "@/lib/finance-data";
import { CUSTOMERS } from "@/lib/customer-data";
import { PACKAGES } from "@/lib/programs-data";
import { BOOKINGS, TODAY_ISO, statusTone, STAFF } from "@/lib/booking-data";
import {
  Search, Plus, Minus, Trash, Sparkles, Package as PkgIcon, Gift, Tag, Heart,
  Wallet, Smartphone, CreditCard, Receipt, X, Clock, ChevronDown, CheckCircle2, Ticket, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BillReceipt, type BillData } from "@/components/BillReceipt";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import type { InvoiceData } from "@/components/invoice/InvoiceDocument";
import { attemptRedeem, LOYALTY_SALON_ID, type LoyaltyRedemption, incrementCustomerStamps, cancelRedeem, lookUpCodesByPhone, useLoyaltyRedemptions } from "@/lib/loyalty-program-data";
import { usePosStore } from "@/lib/pos-store";
import { toast } from "sonner";

export const Route = createFileRoute("/business/pos")({
  head: () => ({ meta: [{ title: "POS Â· BRG Suite" }] }),
  component: POSPage,
});

type CartItem = {
  key: string;
  serviceId?: string;
  name: string;
  type: "Service" | "Product" | "Package" | "Gift Card";
  price: number;
  qty: number;
  staff?: string;
  loyaltyFree?: boolean;
  loyaltyCode?: string;
  loyaltyRuleName?: string;
};

const TABS = [
  { v: "service", label: "Services", icon: Sparkles },
  { v: "package", label: "Packages", icon: PkgIcon },
  { v: "gift", label: "Gift Card", icon: Gift },
  { v: "product", label: "Products", icon: Tag },
];

const METHODS = [
  { v: "eSewa", icon: Smartphone, tone: "text-[#60B95B]" },
  { v: "Khalti", icon: Smartphone, tone: "text-[#5C2D91]" },
  { v: "Cash", icon: Wallet, tone: "text-foreground" },
  { v: "Card", icon: CreditCard, tone: "text-foreground" },
];

export function POSPage() {
  const store = usePosStore();
  // RBAC Setup
  const [userRole, setUserRole] = useState<"manager"|"receptionist"|"provider">("manager");
  
  useEffect(() => {
    const auth = localStorage.getItem("brg_auth");
    if (auth) {
      const u = JSON.parse(auth);
      if (u.role === "staff") {
        setUserRole(u.staffRole || "provider");
      } else {
        setUserRole("manager");
      }
    }
  }, []);

  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [bookingQ, setBookingQ] = useState("");
  const [tab, setTab] = useState("service");
  const [q, setQ] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("Walk-in");
  const [method, setMethod] = useState("eSewa");
  
  // Use store for default discount, but allow overriding in this transaction
  const [discountVal, setDiscountVal] = useState(store.discountType === "percentage" ? store.discountBps / 100 : (store.discountType === "fixed" ? store.discountMinor / 100 : 0));
  const [isDiscountPercent, setIsDiscountPercent] = useState(store.discountType === "percentage");
  
  // Tipping
  const [tipAmt, setTipAmt] = useState(0);

  const [bill, setBill] = useState<BillData | null>(null);
  const [invoiceModalData, setInvoiceModalData] = useState<InvoiceData | null>(null);
  
  // Loyalty redemption states
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemInput, setRedeemInput] = useState("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [appliedRedemption, setAppliedRedemption] = useState<LoyaltyRedemption | null>(null);

  // Load redemptions list
  const activeRedemptions = useLoyaltyRedemptions();
  
  const customerObj = useMemo(() => CUSTOMERS.find((c) => c.name === customer), [customer]);

  const customerPendingRedemptions = useMemo(() => {
    if (!customerObj) return [];
    return activeRedemptions.filter((r) => r.customerId === customerObj.id && r.status === "pending");
  }, [customerObj, activeRedemptions]);

  const matchingPendingCodes = useMemo(() => {
    const serviceIdsInCart = cart.map((c) => c.serviceId).filter(Boolean);
    return customerPendingRedemptions.filter((r) => serviceIdsInCart.includes(r.serviceId));
  }, [customerPendingRedemptions, cart]);

  const todaysBookings = useMemo(() => {
    return BOOKINGS.filter(b => b.date === TODAY_ISO && b.customer.toLowerCase().includes(bookingQ.toLowerCase()))
      .sort((a,b) => a.start.localeCompare(b.start));
  }, [bookingQ]);

  function handleBookingClick(b: typeof BOOKINGS[0]) {
    setCustomer(b.customer);
    const service = SERVICES.find(s => s.name === b.service);
    if (service) {
      add({
        key: `b-${b.id}-${service.id}`,
        serviceId: service.id,
        name: service.name,
        price: service.price,
        type: "Service",
        staff: b.staff,
        desc: service.description,
        duration: service.duration
      });
    }
    toast.success(`Loaded booking for ${b.customer}`);
  }

  function applyRedemption(codeToApply?: string) {
    setRedeemError(null);
    const targetCode = codeToApply || redeemInput;
    if (!targetCode) {
      setRedeemError("Enter a redemption code.");
      return;
    }
    const serviceIds = cart.map((c) => c.serviceId).filter(Boolean) as string[];
    const result = attemptRedeem({
      rawCode: targetCode,
      serviceIdsInCart: serviceIds,
      customerName: customer,
      staffName: "Admin",
      salonId: LOYALTY_SALON_ID,
    });
    if (!result.ok) {
      setRedeemError(result.error);
      return;
    }
    const r = result.redemption;
    setCart((c) => {
      const ix = c.findIndex((x) => x.serviceId === r.serviceId && !x.loyaltyFree);
      if (ix === -1) return c;
      return c.map((x, i) =>
        i === ix ? { ...x, loyaltyFree: true, loyaltyCode: r.code, loyaltyRuleName: r.ruleName } : x
      );
    });
    setAppliedRedemption(r);
    setRedeemInput("");
    setShowRedeem(false);
    toast.success(`Reward applied â€” ${r.serviceName} is free!`);
  }

  function clearRedemption() {
    if (!appliedRedemption) return;
    cancelRedeem(appliedRedemption.code);
    setCart((c) => c.map((x) => x.loyaltyCode === appliedRedemption.code
      ? { ...x, loyaltyFree: false, loyaltyCode: undefined, loyaltyRuleName: undefined } : x));
    setAppliedRedemption(null);
    toast("Reward removed");
  }

  function handleCharge() {
    if (cart.length === 0) return;
    
    // Check "Require Staff Selection" rule from Settings
    if (store.requireStaff) {
      const missingStaff = cart.some(c => c.type === "Service" && !c.staff);
      if (missingStaff) {
        toast.error("POS Settings Requirement: Please select a staff member for all services.");
        return;
      }
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const invoiceNo = `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const custObj = CUSTOMERS.find((c) => c.name === customer);
    setInvoiceModalData({
      invoiceNo,
      orderNo: "512",
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      orderType: "POS Sale",
      deliveryStaff: cart.find(c => c.staff)?.staff || "Anisha",
      customer: {
        name: customer,
        phone: custObj?.phone || "+977 9800000000",
        pan: "601" + (custObj?.phone?.replace(/\D/g, "").slice(-7) || "1234567"),
        address: "Jhamsikhel, Lalitpur",
      },
      items: cart.map((c, i) => ({
        sn: i + 1,
        particular: c.loyaltyFree ? `${c.name} (Loyalty Reward)` : c.name,
        rate: c.loyaltyFree ? 0 : c.price,
        qty: c.qty,
        amount: (c.loyaltyFree ? 0 : c.price) * c.qty,
        staff: c.staff,
      })),
      itemTotal: subtotal,
      offerDiscount: discountAmt,
      subtotal: subtotal - discountAmt,
      serviceCharge: tipAmt,
      tax: vat,
      total: total,
      paymentMethod: method,
      status: "Paid",
      notes: tipAmt > 0 ? `Includes gratuity/tip: ${fmt(tipAmt)}` : undefined,
    });
    setBill({
      invoiceNo,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      customer,
      method,
      items: cart.map((c) => ({
        name: c.loyaltyFree ? `${c.name} (Loyalty Reward)` : c.name,
        type: c.type,
        price: c.loyaltyFree ? 0 : c.price,
        qty: c.qty,
      })),
      subtotal, discountPct: isDiscountPercent ? discountVal : 0, discountAmt, loyaltyAmt: 0, vat, total,
      business: "Aura Beauty Lounge",
      branch: "Jhamsikhel",
      staff: cart.find(c => c.staff)?.staff || "Anisha",
    });
  }

  function closeBill() {
    const custObj = CUSTOMERS.find((c) => c.name === customer);
    if (custObj) {
      const serviceIds = cart.filter((c) => c.type === "Service" && !c.loyaltyFree).map((c) => c.serviceId).filter(Boolean) as string[];
      if (serviceIds.length > 0) incrementCustomerStamps(custObj.id, serviceIds);
    }
    setBill(null);
    setInvoiceModalData(null);
    setCart([]);
    setCustomer("Walk-in");
    setAppliedRedemption(null);
    setTipAmt(0);
    setDiscountVal(store.discountType === "percentage" ? store.discountBps / 100 : (store.discountType === "fixed" ? store.discountMinor / 100 : 0));
    setIsDiscountPercent(store.discountType === "percentage");
  }

  const items = useMemo(() => {
    const lc = q.toLowerCase();
    if (tab === "service") return SERVICES.filter((s) => s.name.toLowerCase().includes(lc)).map((s) => ({ key: s.id, serviceId: s.id, name: s.name, sub: s.category, price: s.price, type: "Service" as const, desc: s.description, duration: s.duration, tone: CATEGORY_META[s.category]?.tone }));
    if (tab === "product") return PRODUCTS.filter((p) => p.retail && p.name.toLowerCase().includes(lc)).map((p) => ({ key: p.id, name: p.name, sub: p.category, price: p.sellingPrice, type: "Product" as const, desc: p.supplier, tone: "bg-mist-soft" }));
    if (tab === "package") return PACKAGES.filter((p) => p.name.toLowerCase().includes(lc)).map((p) => ({ key: p.id, name: p.name, sub: p.category, price: p.price, type: "Package" as const, desc: p.description, duration: p.sessions * 60, tone: "bg-rose-soft" }));
    return [3000, 5000, 10000, 15000, 20000].map((v) => ({ key: "gc-" + v, name: "Gift Card", sub: "Aura GC", price: v, type: "Gift Card" as const, desc: `NPR ${v.toLocaleString()} Gift Card`, tone: "bg-[color-mix(in_oklab,var(--gold)_20%,white)]" }));
  }, [tab, q]);

  function add(item: any) {
    setCart((c) => {
      // Services/Packages are always added as separate line items
      if (item.type !== "Product") {
        return [...c, { ...item, key: item.key + "-" + Date.now(), qty: 1 }];
      }
      // Products can increment qty
      const ex = c.find((x) => x.key === item.key);
      if (ex) return c.map((x) => (x.key === item.key ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...item, qty: 1 }];
    });
  }
  
  function remove(key: string) {
    setCart((c) => {
      const item = c.find((x) => x.key === key);
      if (item?.loyaltyCode && appliedRedemption?.code === item.loyaltyCode) setAppliedRedemption(null);
      return c.filter((x) => x.key !== key);
    });
  }
  
  function setQty(key: string, d: number) {
    setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x)));
  }

  function updateItemStaff(key: string, staffName: string) {
    setCart((c) => c.map((x) => x.key === key ? { ...x, staff: staffName } : x));
  }

  const handleDiscountChange = (val: number) => {
    if (userRole === "receptionist" && isDiscountPercent && val > 10) {
      toast.error("Manager Override Required: Receptionists cannot apply discounts over 10%.");
      setDiscountVal(10);
      return;
    }
    setDiscountVal(val);
  };

  const subtotal = cart.reduce((s, x) => s + (x.loyaltyFree ? 0 : x.price * x.qty), 0);
  
  // Calculate discount based on type (percentage or fixed)
  const discountAmt = isDiscountPercent ? Math.round(subtotal * (discountVal / 100)) : discountVal;
  
  const prePayment = 0; // Mock prepayment
  const taxable = Math.max(0, subtotal - discountAmt - prePayment);
  
  // Calculate VAT based on settings
  const vatRate = store.taxRateBps / 10000; // 1300 -> 0.13
  let vat = 0;
  let finalSubtotal = subtotal;
  
  if (store.includeTax) {
    // If tax is included, the price already contains tax. We extract it.
    // Price = Base + (Base * vatRate)  => Base = Price / (1 + vatRate)
    const base = taxable / (1 + vatRate);
    vat = taxable - base;
  } else {
    // Standard: Tax is added on top
    vat = taxable * vatRate;
  }
  
  // Final total includes tip
  const total = (store.includeTax ? taxable : taxable + vat) + tipAmt;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-h-screen overflow-hidden bg-[#FAFAF9]">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">Point Of Sale</h1>
          <p className="text-sm text-muted-foreground mt-1">Sell Services, Products, Packages And Gift Cards In Seconds.</p>
        </div>
        <Button className="bg-[#8B8678] hover:bg-[#7A7568] text-white rounded-lg shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Walk In Customer
        </Button>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid lg:grid-cols-[300px_1fr_400px] gap-6 px-4 lg:px-6 pb-6 overflow-hidden min-h-0 relative">
        
        {/* COL 1: Today's Bookings */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-3">Today's Booking</h2>
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={bookingQ}
              onChange={(e) => setBookingQ(e.target.value)}
              placeholder="Search Today's Booking"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {todaysBookings.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10">No bookings found</div>
            )}
            {todaysBookings.map((b) => (
              <button
                key={b.id}
                onClick={() => handleBookingClick(b)}
                className="w-full text-left rounded-xl border border-border bg-white p-4 hover:border-primary/40 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    {b.start} - {b.duration}mins
                  </div>
                  <div className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border", statusTone(b.status))}>
                    {b.status}
                  </div>
                </div>
                <div className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{b.customer}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{b.service}</div>
                <div className="text-[11px] text-muted-foreground mt-2 font-medium">w/ {b.staff}</div>
              </button>
            ))}
          </div>
        </div>

        {/* COL 2: Catalog */}
        <div className="flex flex-col min-h-0 bg-white rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 shrink-0 overflow-x-auto pb-1 custom-scrollbar">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.v}
                  onClick={() => setTab(t.v)}
                  className={cn(
                    "text-xs px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 whitespace-nowrap font-medium",
                    tab === t.v ? "bg-[#8B8678] text-white border-[#8B8678] shadow-sm" : "bg-white text-foreground border-border hover:bg-sand-soft"
                  )}
                >
                  <Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${TABS.find(t=>t.v===tab)?.label}...`}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="h-10 px-4 rounded-xl border border-border bg-background flex items-center gap-2 text-sm font-medium hover:bg-sand-soft transition">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Categories
              <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {items.map((i) => (
                <button
                  key={i.key}
                  onClick={() => add(i)}
                  className="text-left rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  <div className={cn("h-36 w-full relative bg-gradient-to-br", i.tone || "from-sand-soft to-mist-soft")}>
                    {/* Simulated Image area */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide text-foreground shadow-sm">
                      {i.sub}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{i.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1 min-h-[32px] leading-relaxed">
                      {i.desc}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" /> {i.duration ? `${Math.floor(i.duration/60)}hr ${i.duration%60}min` : '--'}
                      </span>
                      <span className="font-serif font-semibold text-foreground">{fmt(i.price)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COL 3: Receipt Preview */}
        <div className="flex flex-col min-h-0 bg-white rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm font-semibold">Receipt Preview <span className="text-muted-foreground font-normal ml-1">({customer})</span></h2>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-[150px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60">
                <Receipt className="h-10 w-10" />
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              cart.map((x) => (
                <div key={x.key} className="flex gap-3 items-start group">
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium text-foreground leading-tight", x.loyaltyFree && "line-through text-muted-foreground")}>
                      {x.name}
                    </div>
                    {x.loyaltyFree ? (
                      <div className="text-[10px] uppercase tracking-wider text-gold flex items-center gap-1 mt-1 font-semibold">
                        <Ticket className="h-3 w-3" />Loyalty Reward
                      </div>
                    ) : x.type !== "Product" ? (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-medium">Service w/</span>
                        <select 
                          value={x.staff || ""} 
                          onChange={(e) => updateItemStaff(x.key, e.target.value)}
                          className={cn("text-[11px] bg-transparent outline-none font-medium pb-0.5 border-b border-dashed", !x.staff ? "text-rose-500 border-rose-500/50" : "text-foreground border-border cursor-pointer")}
                        >
                          <option value="">Not Selected</option>
                          {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1">
                        <button onClick={() => setQty(x.key, -1)} className="h-5 w-5 border border-border bg-sand-soft/30 hover:bg-sand-soft flex items-center justify-center rounded transition-colors"><Minus className="h-3 w-3"/></button>
                        <span className="text-xs font-medium w-6 text-center">{x.qty}</span>
                        <button onClick={() => setQty(x.key, 1)} className="h-5 w-5 border border-border bg-sand-soft/30 hover:bg-sand-soft flex items-center justify-center rounded transition-colors"><Plus className="h-3 w-3"/></button>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <div className={cn("text-sm font-medium", x.loyaltyFree && "line-through text-muted-foreground")}>{fmt(x.price * x.qty)}</div>
                    {userRole !== "provider" && (
                    <button onClick={() => remove(x.key)} className="h-6 w-6 rounded border border-transparent hover:border-border hover:bg-sand-soft text-muted-foreground hover:text-rose-500 inline-flex items-center justify-center transition-all lg:opacity-0 lg:group-hover:opacity-100"><Trash className="h-3 w-3"/></button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 shrink-0 space-y-4">
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-10 text-xs font-medium border-border/80">
                <Gift className="h-4 w-4 mr-2" /> Redeem Gift Card
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs font-medium border-border/80"
                onClick={() => setShowRedeem(true)}
              >
                <Heart className="h-4 w-4 mr-2" /> Redeem Loyalty Card
              </Button>
            </div>

            {/* Loyalty Redeem Input area */}
            {showRedeem && !appliedRedemption && (
              <div className="flex gap-2">
                <Input autoFocus value={redeemInput} onChange={(e) => setRedeemInput(e.target.value)} placeholder="Enter code..." className="h-9 text-xs" />
                <Button size="sm" onClick={() => applyRedemption()} className="shrink-0 h-9 bg-foreground">Apply</Button>
                <Button size="sm" variant="outline" onClick={() => setShowRedeem(false)} className="shrink-0 h-9"><X className="h-4 w-4"/></Button>
              </div>
            )}
            {redeemError && <div className="text-[10px] text-rose-500 font-medium">{redeemError}</div>}

            {/* Active Loyalty / Applied code */}
            {appliedRedemption ? (
              <div className="bg-[#FAF7F2] border border-[#F2E8D5] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                  <span className="font-semibold text-[#D4AF37]">Applied: {appliedRedemption.code}</span>
                </div>
                <button onClick={clearRedemption} className="text-muted-foreground hover:text-rose-500"><X className="h-4 w-4"/></button>
              </div>
            ) : matchingPendingCodes.length > 0 ? (
               <div className="bg-[#FAF7F2] border border-[#F2E8D5] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <Heart className="h-4 w-4 text-[#D4AF37]" />
                   <span className="font-medium text-[#8B7355] truncate max-w-[200px]">{customer} Has A Free {matchingPendingCodes[0].serviceName} Available!</span>
                 </div>
                 <button onClick={() => applyRedemption(matchingPendingCodes[0].code)} className="font-semibold text-[#D4AF37] hover:underline flex items-center">Apply <Plus className="h-3 w-3 ml-0.5"/></button>
               </div>
            ) : null}

            {/* Discount */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Discount</label>
                <Input type="number" value={discountVal} onChange={(e) => setDiscountVal(Number(e.target.value))} className="h-9 w-full bg-sand-soft/30 border-border/60 font-medium" />
              </div>
              <div className="w-[100px]">
                <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Type</label>
                <select 
                  value={isDiscountPercent ? "percent" : "fixed"} 
                  onChange={(e) => setIsDiscountPercent(e.target.value === "percent")}
                  className="h-9 w-full rounded-md border border-border/60 bg-sand-soft/30 text-xs font-medium px-2 outline-none"
                >
                  <option value="percent">%</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-xs font-medium pt-2">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount {isDiscountPercent ? `(${discountVal}%)` : ""}</span><span>âˆ’{fmt(discountAmt)}</span></div>}
              {store.includeTax ? (
                <div className="flex justify-between text-muted-foreground"><span>Includes {store.taxType.toUpperCase()} ({(store.taxRateBps/100)}%)</span><span>{fmt(vat)}</span></div>
              ) : (
                <div className="flex justify-between text-muted-foreground"><span>{store.taxType.toUpperCase()} ({(store.taxRateBps/100)}%)</span><span>{fmt(vat)}</span></div>
              )}
            </div>
            
            {/* Tipping UI */}
            {store.enableTipping && (
              <div className="pt-2 border-t border-border/60">
                <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Add Gratuity</label>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setTipAmt(0)} className={cn("h-8 rounded-md text-xs font-medium border", tipAmt === 0 ? "bg-foreground text-background" : "bg-white border-border text-foreground hover:bg-sand-soft")}>None</button>
                  {store.tipOptions.map(pct => {
                    const amt = Math.round((store.includeTax ? taxable : taxable + vat) * (pct / 100));
                    return (
                      <button 
                        key={pct} 
                        onClick={() => setTipAmt(amt)} 
                        className={cn("h-8 rounded-md text-xs font-medium border", tipAmt === amt && amt > 0 ? "bg-foreground text-background" : "bg-white border-border text-foreground hover:bg-sand-soft")}
                      >
                        {pct}%
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-border/60">
              <span className="text-sm font-semibold">Total Amount</span>
              <span className="font-serif text-xl font-bold">{fmt(total)}</span>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.v}
                    onClick={() => setMethod(m.v)}
                    className={cn(
                      "h-10 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-xs font-semibold",
                      method === m.v ? `border-foreground bg-sand-soft/50 shadow-sm ${m.tone}` : "border-border bg-white text-muted-foreground hover:bg-sand-soft/30"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{m.v}</span>
                  </button>
                );
              })}
            </div>

            <Button onClick={handleCharge} disabled={cart.length === 0} className="w-full h-12 bg-[#8B8678] hover:bg-[#7A7568] text-white rounded-xl shadow-sm font-semibold text-sm">
              Charge {fmt(total)}
            </Button>
          </div>
        </div>
      </div>
      <InvoiceModal
        isOpen={Boolean(invoiceModalData)}
        bill={invoiceModalData}
        onClose={closeBill}
      />
      {bill && !invoiceModalData && <BillReceipt bill={bill} onClose={closeBill} />}
    </div>
  );
}





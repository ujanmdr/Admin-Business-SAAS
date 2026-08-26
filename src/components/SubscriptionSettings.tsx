import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { saasPackages, currentSubscription, SaasPackage } from "@/lib/saas-data";
import { Check, Sparkles, AlertCircle, Plus, Minus, CreditCard, Wallet, Lock, Star, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to format currency
const fmt = (v: number) => `रू ${(v).toLocaleString("en-IN")}`;

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-8 text-rose bg-rose/10 rounded-xl font-mono text-sm border border-rose/20 whitespace-pre-wrap">Error in SubscriptionSettings: {this.state.error?.toString()}</div>;
    return this.props.children;
  }
}

export function SubscriptionSettings() {
  return (
    <ErrorBoundary>
      <style dangerouslySetInnerHTML={{ __html: `body { pointer-events: auto !important; }` }} />
      <SubscriptionSettingsInner />
    </ErrorBoundary>
  );
}

function SubscriptionSettingsInner() {
  const [activePlanId, setActivePlanId] = useState(currentSubscription.packageId);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  
  // Add-ons State
  const [extraStaff, setExtraStaff] = useState(currentSubscription.addOns.extraStaff);
  const [extraBranches, setExtraBranches] = useState(currentSubscription.addOns.extraBranches);
  const [extraServices, setExtraServices] = useState(currentSubscription.addOns.extraServices);

  // Checkout State
  const [isCheckout, setIsCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [isSuccess, setIsSuccess] = useState(false);

  const currentPkg = saasPackages.find(p => p.id === activePlanId) || saasPackages[1];
  
  const isCurrentPlan = currentPkg.id === currentSubscription.packageId;

  // Calculate current add-ons cost to find the prorated difference
  const currentAddOnsCost = (currentSubscription.addOns.extraStaff * (currentPkg.addOnPricing.perExtraStaff || 0)) +
                            (currentSubscription.addOns.extraBranches * (currentPkg.addOnPricing.perExtraBranch || 0)) +
                            (currentSubscription.addOns.extraServices * (currentPkg.addOnPricing.perExtraService || 0));

  // Calculate Base + Add-ons
  const addOnsCost = (extraStaff * (currentPkg.addOnPricing.perExtraStaff || 0)) +
                     (extraBranches * (currentPkg.addOnPricing.perExtraBranch || 0)) +
                     (extraServices * (currentPkg.addOnPricing.perExtraService || 0));
                     
  const newTotal = currentPkg.price + addOnsCost;
  const dueToday = isCurrentPlan ? Math.max(0, addOnsCost - currentAddOnsCost) : newTotal;

  const handleUpdateClick = () => {
    if (!currentPkg.isPublic && !isCurrentPlan) {
      // Custom plan upgrade requests skip checkout and go straight to success
      handleConfirmPayment();
    } else {
      setIsCheckout(true);
    }
  };

  const handleConfirmPayment = () => {
    if (!currentPkg.isPublic) {
      setPendingRequests(prev => [...prev, currentPkg.id]);
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsManageModalOpen(false);
      setIsCheckout(false);
      setIsSuccess(false);
    }, 2000);
  };

  const openManageModal = (pkgId: string) => {
    setActivePlanId(pkgId);
    setExtraStaff(0);
    setExtraBranches(0);
    setExtraServices(0);
    setIsCheckout(false);
    setIsSuccess(false);
    setIsManageModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <header className="px-6 py-5 border-b border-border bg-gradient-to-br from-card to-sand-soft/40 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl">Current Subscription</h3>
            <p className="text-xs text-muted-foreground mt-1">Manage your BRG Suite billing and usage.</p>
          </div>
          <Button onClick={() => openManageModal(currentSubscription.packageId)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            Manage Plan & Add-ons
          </Button>
        </header>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="font-serif text-2xl">{currentPkg.name}</div>
                <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              <div className="text-3xl font-semibold">{fmt(currentPkg.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              <p className="text-sm text-muted-foreground">Next billing date: <span className="font-medium text-foreground">{new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</span></p>
            </div>
            
            <div className="flex-1 space-y-4">
              <h4 className="text-sm font-semibold border-b border-border pb-1">Usage vs Limits</h4>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Staff ({currentSubscription.usage.staff}/{currentPkg.maxStaff})</span>
                  <span className={currentSubscription.usage.staff >= currentPkg.maxStaff ? "text-rose" : "text-muted-foreground"}>
                    {currentSubscription.usage.staff >= currentPkg.maxStaff ? "Limit Reached" : ""}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${currentSubscription.usage.staff >= currentPkg.maxStaff ? "bg-rose" : "bg-deep-olive"}`} 
                       style={{ width: `${Math.min((currentSubscription.usage.staff / currentPkg.maxStaff) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Branches ({currentSubscription.usage.branches}/{currentPkg.maxBranches})</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-deep-olive rounded-full transition-all" style={{ width: `${Math.min((currentSubscription.usage.branches / currentPkg.maxBranches) * 100, 100)}%` }} />
                </div>
              </div>

              {currentSubscription.usage.staff >= currentPkg.maxStaff && (
                <div className="flex items-center gap-2 text-xs text-rose bg-rose/10 p-2 rounded-lg mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>You have reached your staff limit. Add an extra staff member via add-ons or upgrade your plan.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Available Plans */}
      {(() => {
        const publicPackages = saasPackages.filter(p => p.isPublic);
        const customPackages = saasPackages.filter(p => !p.isPublic && p.assignedBusinesses?.includes("Glow Avenue Salon"));

        const renderPackageCard = (pkg: SaasPackage, isCustom = false) => {
          const isPending = pendingRequests.includes(pkg.id);
          return (
            <div key={pkg.id} className={cn("rounded-2xl border p-5 relative overflow-hidden transition-all flex flex-col", 
                pkg.id === currentSubscription.packageId 
                  ? "border-primary ring-1 ring-primary/20 shadow-luxe bg-card" 
                  : isCustom 
                  ? "border-gold/30 bg-gradient-to-b from-gold/10 to-card shadow-sm hover:border-gold/60" 
                  : "border-border bg-card hover:border-primary/50")}>
              
              {pkg.id === currentSubscription.packageId && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl z-10">
                  Current
                </div>
              )}
              {pkg.isDefault && pkg.id !== currentSubscription.packageId && !isCustom && (
                <div className="absolute top-0 right-0 bg-gold text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" /> Recommended
                </div>
              )}

              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{pkg.billingPeriod}</div>
              <div className="font-serif text-2xl mt-1">{pkg.name}</div>
              <div className="text-xl font-semibold mt-2">{fmt(pkg.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              
              <ul className="mt-4 space-y-2 mb-16 flex-1">
                {pkg.featuresList.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className={cn("h-4 w-4 shrink-0 mt-0.5", isCustom ? "text-gold" : "text-primary")} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="absolute bottom-5 left-5 right-5 z-20">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openManageModal(pkg.id);
                  }}
                  disabled={isPending}
                  variant={pkg.id === currentSubscription.packageId ? "outline" : "default"} 
                  className={cn("w-full rounded-xl", pkg.id !== currentSubscription.packageId && (isCustom ? "bg-gold hover:bg-gold/90 text-white" : "bg-foreground hover:bg-foreground/90"))}
                >
                  {isPending ? (
                    <><Clock className="h-4 w-4 mr-1.5" /> Pending Approval</>
                  ) : pkg.id === currentSubscription.packageId ? "Manage Add-ons" : !pkg.isPublic ? "Request Upgrade" : "Select Plan"}
                </Button>
              </div>
            </div>
          );
        };

        return (
          <>
            {customPackages.length > 0 && (
              <section className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-xl">Exclusive Plan For You</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {customPackages.map(pkg => renderPackageCard(pkg, true))}
                </div>
              </section>
            )}

            <section className="space-y-4 pt-4">
              <h3 className="font-serif text-xl">Available Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {publicPackages.map(pkg => renderPackageCard(pkg))}
              </div>
            </section>
          </>
        );
      })()}

      {/* Manage / Checkout Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl relative border border-border">
            <button 
              onClick={() => setIsManageModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 hover:text-foreground z-10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          {isSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 text-primary grid place-items-center mb-2">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="font-serif text-3xl">
                {!currentPkg.isPublic ? "Request Sent!" : "Payment Successful!"}
              </h2>
              <p className="text-muted-foreground">
                {!currentPkg.isPublic && !isCurrentPlan
                  ? `Your request to upgrade to ${currentPkg.name} has been sent to the admin for approval. We will notify you once it is activated.` 
                  : isCurrentPlan
                  ? `Your add-ons for ${currentPkg.name} have been updated successfully!`
                  : `Your subscription has been updated to ${currentPkg.name} with your new add-ons.`}
              </p>
            </div>
          ) : isCheckout ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-serif text-2xl flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" /> Secure Checkout
                </h3>
              </div>

              <div className="grid gap-6">
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h4 className="font-semibold border-b border-border pb-2">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{currentPkg.name} (Base)</span>
                    <span>{fmt(currentPkg.price)}</span>
                  </div>
                  {extraStaff > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extra Staff (x{extraStaff})</span>
                      <span>{fmt(extraStaff * (currentPkg.addOnPricing.perExtraStaff || 0))}</span>
                    </div>
                  )}
                  {extraBranches > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extra Branches (x{extraBranches})</span>
                      <span>{fmt(extraBranches * (currentPkg.addOnPricing.perExtraBranch || 0))}</span>
                    </div>
                  )}
                  {extraServices > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extra Services (x{extraServices})</span>
                      <span>{fmt(extraServices * (currentPkg.addOnPricing.perExtraService || 0))}</span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="flex justify-between text-sm italic text-muted-foreground pt-1">
                      <span>Already Paid Add-ons</span>
                      <span>-{fmt(currentAddOnsCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                    <span>Total Due Today</span>
                    <span className="text-primary">{fmt(dueToday)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Select Payment Method</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {["esewa", "khalti", "card"].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
                          paymentMethod === method ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        {method === "esewa" && <Wallet className="h-6 w-6 text-green-600" />}
                        {method === "khalti" && <Wallet className="h-6 w-6 text-purple-600" />}
                        {method === "card" && <CreditCard className="h-6 w-6 text-foreground" />}
                        <span className="text-xs font-semibold capitalize">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCheckout(false)}>Back to Configurator</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleConfirmPayment}>
                  {dueToday === 0 ? "Confirm Changes" : `Pay ${fmt(dueToday)} & Confirm`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div>
                <h3 className="font-serif text-2xl">
                  {isCurrentPlan ? `Manage Add-ons for ${currentPkg.name}` : `Configure ${currentPkg.name}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Configure your plan limits and dynamic add-ons.</p>
              </div>
              
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4 border border-border">
                  <div>
                    <h4 className="font-semibold text-sm">Base Plan Price</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Includes {currentPkg.maxStaff} staff, {currentPkg.maxBranches} branches.</p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-xl">{fmt(currentPkg.price)}/mo</div>
                    {isCurrentPlan && <div className="text-[10px] uppercase font-bold text-primary mt-1">Active Plan</div>}
                  </div>
                </div>

                {Object.keys(currentPkg.addOnPricing).length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Dynamic Add-ons
                    </h4>
                    
                    {currentPkg.addOnPricing.perExtraStaff && (
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <div className="font-medium text-sm">Extra Staff</div>
                          <div className="text-xs text-muted-foreground">{fmt(currentPkg.addOnPricing.perExtraStaff)}/mo per member</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setExtraStaff(Math.max(0, extraStaff - 1))} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                          <span className="w-4 text-center font-medium text-sm">{extraStaff}</span>
                          <button onClick={() => setExtraStaff(extraStaff + 1)} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    )}
                    
                    {currentPkg.addOnPricing.perExtraBranch && (
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <div className="font-medium text-sm">Extra Branches</div>
                          <div className="text-xs text-muted-foreground">{fmt(currentPkg.addOnPricing.perExtraBranch)}/mo per location</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setExtraBranches(Math.max(0, extraBranches - 1))} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                          <span className="w-4 text-center font-medium text-sm">{extraBranches}</span>
                          <button onClick={() => setExtraBranches(extraBranches + 1)} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    )}

                    {currentPkg.addOnPricing.perExtraService && (
                      <div className="flex items-center justify-between pb-2">
                        <div>
                          <div className="font-medium text-sm">Extra Services</div>
                          <div className="text-xs text-muted-foreground">{fmt(currentPkg.addOnPricing.perExtraService)}/mo per service</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setExtraServices(Math.max(0, extraServices - 1))} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                          <span className="w-4 text-center font-medium text-sm">{extraServices}</span>
                          <button onClick={() => setExtraServices(extraServices + 1)} className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-sand-soft/50 rounded-xl p-4 text-sm text-center text-muted-foreground border border-border">
                    This plan does not support dynamic add-ons. If you need more resources, please upgrade to a higher tier.
                  </div>
                )}
              </div>
              
              <div className="mt-8 border-t border-border pt-4 flex sm:justify-between items-center w-full">
                <div className="text-left w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">New Monthly Total</div>
                  <div className="font-serif text-2xl text-primary font-bold">{fmt(newTotal)}</div>
                </div>
                <Button className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto" onClick={handleUpdateClick}>
                  {!currentPkg.isPublic && !isCurrentPlan ? "Submit Upgrade Request" : "Proceed to Checkout"}
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, ShoppingBag, BookOpen, Plus, Users, Receipt, CreditCard, LifeBuoy, X, Coffee, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isReceptionist } = useAuth();
  
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleOpenBooking = () => {
    setShowFABMenu(false);
    window.dispatchEvent(new CustomEvent("open-new-booking"));
  };

  const handleOpenPOS = () => {
    setShowFABMenu(false);
    navigate({ to: "/staff/pos" });
  };

  const handleToggleBreak = () => {
    setShowFABMenu(false);
    window.dispatchEvent(new CustomEvent("toggle-staff-break"));
  };

  // Provider bottom tabs: My Chair, My Schedule, My Clients, Support
  const providerTabs = [
    { label: "My Chair", to: "/staff", icon: LayoutDashboard },
    { label: "Schedule", to: "/staff/calendar", icon: Calendar },
    { label: "Clients", to: "/staff/customers", icon: Users },
    { label: "Support", to: "/staff/support", icon: LifeBuoy },
  ];

  // Receptionist bottom tabs: Front Desk, Calendar, POS, Bookings
  const receptionistTabs = [
    { label: "Front Desk", to: "/staff", icon: LayoutDashboard },
    { label: "Calendar", to: "/staff/calendar", icon: Calendar },
    { label: "POS", to: "/staff/pos", icon: ShoppingBag },
    { label: "Bookings", to: "/staff/bookings", icon: BookOpen },
  ];

  const receptionistMoreLinks = [
    { label: "Customers", to: "/staff/customers", icon: Users },
    { label: "Payments", to: "/staff/payments", icon: CreditCard },
    { label: "Expenses", to: "/staff/expenses", icon: Receipt },
    { label: "Support", to: "/staff/support", icon: LifeBuoy },
  ];

  return (
    <>
      {/* FAB Quick Action Menu Overlay */}
      {showFABMenu && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end pb-24 px-6 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl mb-4 transform transition-all flex flex-col gap-2 max-w-sm mx-auto w-full">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-2 border-b border-border">
              {isReceptionist ? "Front Desk Quick Actions" : "Station Quick Actions"}
            </h3>
            
            <button 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-soft text-left text-sm font-medium transition-colors" 
              onClick={handleOpenBooking}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div>New Reservation</div>
                <div className="text-[10px] text-muted-foreground">Book appointment for any service</div>
              </div>
            </button>

            {isReceptionist ? (
              <>
                <button 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-soft text-left text-sm font-medium transition-colors" 
                  onClick={handleOpenPOS}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <div>New Sale (POS)</div>
                    <div className="text-[10px] text-muted-foreground">Checkout walk-in or product sale</div>
                  </div>
                </button>
                <button 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-soft text-left text-sm font-medium transition-colors" 
                  onClick={handleOpenBooking}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Walk-in Check-in</div>
                    <div className="text-[10px] text-muted-foreground">Assign next available stylist</div>
                  </div>
                </button>
              </>
            ) : (
              <button 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-soft text-left text-sm font-medium transition-colors" 
                onClick={handleToggleBreak}
              >
                <div className="h-8 w-8 rounded-lg bg-sand-soft text-gold grid place-items-center">
                  <Coffee className="h-4 w-4" />
                </div>
                <div>
                  <div>Toggle Break Status</div>
                  <div className="text-[10px] text-muted-foreground">Switch between Available & On Break</div>
                </div>
              </button>
            )}
          </div>

          {/* Close button matching FAB position */}
          <div className="flex justify-center">
            <button 
              onClick={() => setShowFABMenu(false)}
              className="h-14 w-14 rounded-full bg-rose-500 text-white shadow-lg flex items-center justify-center transform rotate-45 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* More Menu Overlay (For Receptionist) */}
      {showMoreMenu && isReceptionist && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex flex-col justify-end pb-[72px] animate-in fade-in">
          <div className="bg-card rounded-t-3xl border-t border-border shadow-2xl p-6 flex flex-col gap-4 max-w-md mx-auto w-full">
            <div className="flex justify-between items-center pb-2">
              <h3 className="font-serif text-xl font-medium">Front Desk Menu</h3>
              <button onClick={() => setShowMoreMenu(false)} className="p-2 rounded-full hover:bg-sand-soft">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {receptionistMoreLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setShowMoreMenu(false)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border bg-sand-soft/30 hover:bg-sand-soft transition-colors"
                  >
                    <Icon className="h-6 w-6 text-foreground/80" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 px-2 pb-safe">
        <div className="flex items-center justify-between h-full relative max-w-lg mx-auto">
          
          {/* Left Tabs */}
          <div className="flex-1 flex justify-evenly">
            {(isReceptionist ? receptionistTabs.slice(0, 2) : providerTabs.slice(0, 2)).map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.to || (tab.to !== "/staff" && pathname.startsWith(tab.to));
              return (
                <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center w-16 h-full gap-1 group">
                  <div className={cn("transition-all duration-200 p-1.5 rounded-xl", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-sand-soft")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Center FAB Spacer */}
          <div className="w-16 flex justify-center relative">
            <div className="absolute -top-5">
              <button 
                onClick={() => setShowFABMenu(true)}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-luxe flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                title="Quick Actions"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Right Tabs */}
          <div className="flex-1 flex justify-evenly">
            {(isReceptionist ? receptionistTabs.slice(2, 4) : providerTabs.slice(2, 4)).map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname.startsWith(tab.to);
              return (
                <Link key={tab.to} to={tab.to} className="flex flex-col items-center justify-center w-16 h-full gap-1 group">
                  <div className={cn("transition-all duration-200 p-1.5 rounded-xl", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-sand-soft")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>{tab.label}</span>
                </Link>
              );
            })}
            
            {/* The More Button for Receptionist */}
            {isReceptionist && (
              <button onClick={() => setShowMoreMenu(true)} className="flex flex-col items-center justify-center w-16 h-full gap-1 group">
                <div className="transition-all duration-200 p-1.5 rounded-xl text-muted-foreground group-hover:bg-sand-soft flex flex-col justify-center items-center h-8">
                  <div className="flex gap-0.5 justify-center">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">More</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

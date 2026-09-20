import { Link, useRouterState } from "@tanstack/react-router";
import { navItems, receptionistNavItems, providerNavItems } from "@/lib/nav";
import { Sparkles, MapPin, UserCircle, Scissors, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses, mockBranches } from "@/lib/tenant-data";
import { useAuth } from "@/lib/auth";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStaff = pathname.startsWith("/staff");
  const { user, isReceptionist } = useAuth();
  
  const itemsToUse = isStaff 
    ? (isReceptionist ? receptionistNavItems : providerNavItems) 
    : navItems;
  const groups = Array.from(new Set(itemsToUse.map((i) => i.group)));
  
  const { activeBusinessId, activeBranchId } = useTenantStore();
  const activeBiz = mockBusinesses.find(b => b.id === activeBusinessId) || mockBusinesses[0];
  const activeBr = activeBranchId === 'OVERALL' ? null : mockBranches.find(b => b.id === activeBranchId);
  
  const plan = activeBiz?.subscriptionPlan || 'Basic';

  // Feature Locks based on Subscription Plan and Overall View Logic
  const filterNavItems = (items: typeof navItems) => {
    return items.filter(item => {
      // Hide Pro features if Basic
      if (plan === 'Basic' && (item.label === 'Loyalty' || item.label === 'Gift Cards' || item.label === 'Loyalty Report')) return false;
      
      // Hide Branch-Specific tools if in Overall Dashboard
      if (activeBranchId === 'OVERALL' && (item.label === 'Calendar' || item.label === 'Staff')) return false;
      
      return true;
    });
  };

  return (
    <aside className="h-full w-20 lg:w-72 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all">
      <div className="px-2 lg:px-5 pt-5 pb-3">
        <Link to={isStaff ? "/staff" : "/business"} onClick={onNavigate} className="flex items-center justify-center lg:justify-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-luxe shrink-0">
            {isStaff ? (isReceptionist ? <Building className="h-5 w-5" /> : <Scissors className="h-5 w-5" />) : <Sparkles className="h-5 w-5" />}
          </div>
          <div className="hidden lg:block">
            <div className="font-serif text-xl leading-none text-foreground">BRG</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
              {isStaff ? (isReceptionist ? "Front Desk" : "Stylist Station") : "Business Suite"}
            </div>
          </div>
        </Link>

        {/* User / Branch Display */}
        <div className="w-full flex items-center justify-center lg:justify-start gap-3 rounded-2xl border border-sidebar-border bg-card p-2 lg:px-3 lg:py-2.5 text-left">
          <div className="h-9 w-9 rounded-xl bg-sand-soft text-gold grid place-items-center font-serif text-base shrink-0">
            {isStaff ? (user?.name?.charAt(0) || "S") : activeBiz?.name.charAt(0)}
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {isStaff ? (user?.name || "Staff Member") : activeBiz?.name}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3 inline" /> 
              {isStaff ? (isReceptionist ? "Front Desk · Jhamsikhel" : "Chair 2 · Jhamsikhel") : (activeBr ? activeBr.name : 'Overall Dashboard')}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-1.5 lg:px-3 py-3 space-y-4 lg:space-y-6">
        {groups.map((group) => {
          const groupItems = filterNavItems(itemsToUse.filter((i) => i.group === group));
          if (groupItems.length === 0) return null;
          
          return (
            <div key={group}>
              <div className="hidden lg:block px-3 mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 font-medium">
                {group}
              </div>
              <ul className="space-y-1">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = (item.to === "/business" || item.to === "/staff") 
                    ? pathname === item.to 
                    : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className={cn(
                          "group flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 rounded-xl lg:rounded-lg py-2 px-1 lg:px-3 lg:py-2.5 text-xs lg:text-sm transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-luxe"
                            : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
                        )}
                        title={item.label}
                      >
                        <Icon className={cn("h-5 w-5 lg:h-4 lg:w-4 shrink-0", active ? "" : "text-muted-foreground group-hover:text-foreground")} />
                        <span className="font-medium tracking-tight text-[10px] lg:text-sm text-center lg:text-left truncate max-w-full">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {!isStaff && plan !== 'Enterprise' && (
        <div className="hidden lg:block m-3 rounded-2xl bg-sand-soft border border-border p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">Premium</div>
          <div className="font-serif text-lg mt-1 leading-tight">Unlock {plan === 'Basic' ? 'Pro' : 'Enterprise'}</div>
          <p className="text-xs text-muted-foreground mt-1">Get access to advanced tools & CRM.</p>
          <button className="mt-3 w-full rounded-lg bg-foreground text-background text-xs py-2 font-medium hover:opacity-90 transition">
            Upgrade Now
          </button>
        </div>
      )}
    </aside>
  );
}

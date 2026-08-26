import { Link, useRouterState } from "@tanstack/react-router";
import { navItems } from "@/lib/nav";
import { Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses, mockBranches } from "@/lib/tenant-data";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = Array.from(new Set(navItems.map((i) => i.group)));
  
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
    <aside className="h-full w-72 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link to="/business" onClick={onNavigate} className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-luxe">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-xl leading-none text-foreground">BRG</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
              Business Suite
            </div>
          </div>
        </Link>

        {/* Static Display since Switcher is in Header */}
        <div className="w-full flex items-center gap-3 rounded-2xl border border-sidebar-border bg-card px-3 py-2.5 text-left">
          <div className="h-9 w-9 rounded-xl bg-sand-soft text-gold grid place-items-center font-serif text-lg">
            {activeBiz?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{activeBiz?.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate flex items-center gap-1">
               <MapPin className="h-3 w-3 inline" /> {activeBr ? activeBr.name : 'Overall Dashboard'}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {groups.map((group) => {
          const groupItems = filterNavItems(navItems.filter((i) => i.group === group));
          if (groupItems.length === 0) return null;
          
          return (
            <div key={group}>
              <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 font-medium">
                {group}
              </div>
              <ul className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.to === "/business" ? pathname === "/business" : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-luxe"
                            : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "" : "text-muted-foreground group-hover:text-foreground")} />
                        <span className="font-medium tracking-tight">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {plan !== 'Enterprise' && (
        <div className="m-3 rounded-2xl bg-sand-soft border border-border p-4">
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

import { useBusiness } from "@/components/BusinessProvider";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Wallet, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BranchMetrics {
  name: string;
  bookings: number;
  alerts: number;
  posActive: boolean;
  desc: string;
}

const BRANCH_MOCKS: Record<string, BranchMetrics> = {
  Jhamsikhel: { name: "Jhamsikhel Branch", bookings: 12, alerts: 0, posActive: true, desc: "Lalitpur · Main hub" },
  Lazimpat: { name: "Lazimpat Branch", bookings: 8, alerts: 1, posActive: true, desc: "North Kathmandu · Premium Spa" },
  Baneshwor: { name: "Baneshwor Branch", bookings: 6, alerts: 0, posActive: false, desc: "East Kathmandu · Salon" },
  Patan: { name: "Patan Branch", bookings: 7, alerts: 0, posActive: true, desc: "Lalitpur Area · Salon & Academy" },
  Thamel: { name: "Thamel Branch", bookings: 5, alerts: 2, posActive: true, desc: "Tourist Hub · Wellness lounge" },
  Pokhara: { name: "Pokhara Branch", bookings: 4, alerts: 0, posActive: true, desc: "Lakeside Pokhara · Resort partner" },
};

export function BranchSelectorFallback({ pageName }: { pageName: string }) {
  const { setBranch, branches } = useBusiness();
  
  // Get active branch options excluding "All Branches (HQ)"
  const branchOptions = branches.filter((b) => b !== "All Branches (HQ)");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-8 fade-rise">
      <div className="w-full max-w-4xl bg-card/65 backdrop-blur-md border border-border rounded-3xl p-6 md:p-10 shadow-luxe text-center space-y-6">
        
        {/* Header Icon & Title */}
        <div className="space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 grid place-items-center mx-auto">
            <MapPin className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
            Select a Branch to Access {pageName}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            You are currently in <strong>All Branches (HQ)</strong> mode. Operational tools like {pageName} must be run within a specific physical branch context.
          </p>
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {branchOptions.map((branchName) => {
            const mock = BRANCH_MOCKS[branchName] || {
              name: `${branchName} Branch`,
              bookings: 0,
              alerts: 0,
              posActive: false,
              desc: "Aura Beauty Lounge location",
            };

            return (
              <div
                key={branchName}
                onClick={() => setBranch(branchName)}
                className="group border border-border bg-card/90 hover:border-amber-500/40 hover:bg-gradient-to-b hover:from-amber-500/5 hover:to-card hover:shadow-luxe transition-all duration-300 rounded-2xl p-5 text-left cursor-pointer flex flex-col justify-between min-h-[170px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-serif text-lg font-medium text-foreground tracking-tight">
                      {branchName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-light leading-snug">
                    {mock.desc}
                  </p>

                  {/* Summary Indicators */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                      <CalendarDays className="h-3.5 w-3.5 text-sage" />
                      <span>{mock.bookings} bookings today</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                      <Wallet className="h-3.5 w-3.5 text-slate-500" />
                      <span>POS Terminal: {mock.posActive ? "Active" : "Closed"}</span>
                    </div>

                    {mock.alerts > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-rose font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{mock.alerts} Stock Alert{mock.alerts > 1 && "s"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-medium group-hover:text-amber-800 transition-colors">
                  <span>Open {pageName}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div className="pt-6 border-t border-slate-100 flex justify-center items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-gold shrink-0" />
          <span>Need to see consolidated metrics? Switch back to "All Branches" in the sidebar anytime.</span>
        </div>
      </div>
    </div>
  );
}

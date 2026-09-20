import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "../business/customers";
import { useAuth } from "@/lib/auth";
import { CUSTOMERS, type Customer, customerStatusTone } from "@/lib/customer-data";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Search, Phone, MessageCircle, Heart, Star, Sparkles, User, 
  Calendar, AlertCircle, FileText, Scissors, Clock
} from "lucide-react";

export const Route = createFileRoute("/staff/customers")({
  head: () => ({ meta: [{ title: "My Clients · Staff Portal" }] }),
  component: StaffCustomersRoute,
});

function StaffCustomersRoute() {
  const { user, isReceptionist } = useAuth();

  if (isReceptionist) {
    // Receptionist sees the full salon CRM customer database
    return <CustomersPage />;
  }

  // Hair Stylist sees only their own regular clients with formulas & notes
  const staffName = user?.name || "Anisha";
  return <StylistClientDirectory staffName={staffName} />;
}

function StylistClientDirectory({ staffName }: { staffName: string }) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string>("All");

  // Filter to clients whose preferred staff is this stylist or hair clients
  const myClients = useMemo(() => {
    return CUSTOMERS.filter(c => {
      const isMyClient = c.preferredStaff === staffName || 
                         c.preferredStaff.includes(staffName) ||
                         c.tags.includes("Hair");
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.phone.includes(search);
      const matchTag = filterTag === "All" || c.status === filterTag || c.tags.includes(filterTag);

      return isMyClient && matchSearch && matchTag;
    });
  }, [staffName, search, filterTag]);

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <PageHeader
        eyebrow="My Station Clients"
        title="My Client Book"
        description="View your regular clients, previous color formulas, hair preferences, and contact details."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-xl border border-primary/20">
              {myClients.length} Clients Assigned to Your Chair
            </span>
          </div>
        }
      />

      {/* Search & Tag Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name or phone..."
            className="pl-9 h-10 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {["All", "VIP", "Regular", "Hair"].map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={cn("px-3 py-1.5 rounded-xl font-medium transition shrink-0",
                filterTag === tag 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80")}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      {myClients.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
          <User className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <div className="text-sm font-semibold text-foreground">No matching clients found</div>
          <p className="text-xs max-w-sm mx-auto">Try clearing your search query or check back as new clients are assigned to your station.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClients.map((c) => (
            <div 
              key={c.id} 
              className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                {/* Header: Name, Status Badge, Visits */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-sand-soft text-gold grid place-items-center font-serif text-lg shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-base">{c.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-semibold border", customerStatusTone(c.status))}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{c.totalVisits} visits with salon</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 inline" /> Last: {c.lastVisit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Links */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                  <a
                    href={`tel:${c.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sand-soft text-foreground text-xs font-medium hover:bg-sand-soft/80 transition border border-border/60"
                  >
                    <Phone className="h-3 w-3 text-primary" /> {c.phone}
                  </a>
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
                </div>

                {/* Formula / Technical Notes Box */}
                {c.notes && (
                  <div className="mt-3 bg-muted/50 rounded-xl p-3 border border-border/50 text-xs space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary">
                      <Scissors className="h-3 w-3" /> Formula & Station Notes
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{c.notes}</p>
                  </div>
                )}

                {/* Allergies / Special Care */}
                {c.allergies && (
                  <div className="mt-2 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span><strong>Allergy alert:</strong> {c.allergies}</span>
                  </div>
                )}

                {/* Favorite Services */}
                {c.favoriteServices && c.favoriteServices.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Favorites:</span>
                    {c.favoriteServices.map(srv => (
                      <span key={srv} className="px-2 py-0.5 rounded-md bg-sand-soft/60 text-foreground text-[10px] font-medium border border-border/40">
                        {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

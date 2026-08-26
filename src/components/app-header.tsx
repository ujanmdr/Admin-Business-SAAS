import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Search, Plus, ChevronRight, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const titles: Record<string, string> = {
  "/": "Overview",
  "/approvals": "Business Approvals",
  "/businesses": "Businesses",
  "/customers": "Customers",
  "/bookings": "Bookings",
  "/payments": "Payments & Settlements",
  "/packages": "Packages",
  "/gift-cards": "Gift Cards",
  "/loyalty": "Loyalty",
  "/sponsored": "Sponsored Listings",
  "/offers": "Deals & Offers",
  "/reviews": "Reviews",
  "/reels": "Reels & Content",
  "/support": "Complaints & Support",
  "/refunds": "Refunds",
  "/reports": "Reports",
  "/admins": "Admin Users & Roles",
  "/activity": "Activity Logs",
  "/settings": "Platform Settings",
};

export function AppHeader() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const title = titles[path] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-muted-foreground" />

      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <Link to="/" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses, customers, bookings…"
            className="h-9 w-[280px] border-border bg-secondary/40 pl-9 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-primary/30 lg:w-[360px]"
          />
        </div>

        <Button size="sm" className="hidden gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex">
          <Plus className="h-4 w-4" /> Quick action
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Sun className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[oklch(0.605_0.110_70)]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-serif">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { t: "3 new business approvals waiting", s: "10 min ago" },
              { t: "Settlement of रू 1,84,000 due today", s: "1 hr ago" },
              { t: "Review reported on Glow Avenue Salon", s: "2 hr ago" },
              { t: "Refund pending over 72h", s: "Yesterday" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2.5">
                <span className="text-sm text-foreground">{n.t}</span>
                <span className="text-[11px] text-muted-foreground">{n.s}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-left transition hover:bg-secondary/60">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">AK</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col leading-tight md:flex">
                <span className="text-xs font-semibold text-foreground">Aarya K.</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Super Admin</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Aarya Khatiwada</span>
                <span className="text-[11px] text-muted-foreground">aarya@brg.np</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Security</DropdownMenuItem>
            <DropdownMenuItem>API tokens</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={() => {
                localStorage.removeItem("brg_auth");
                window.location.href = "/";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PageHeader({
  title, description, actions, badge,
}: { title: string; description?: string; actions?: React.ReactNode; badge?: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {badge && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {badge}
          </Badge>
        )}
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

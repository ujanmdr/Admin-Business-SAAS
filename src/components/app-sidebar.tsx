import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ClipboardCheck, Building2, Users, CalendarCheck, Wallet,
  Package, Gift, Stamp, Megaphone, Tag, Star, Film, LifeBuoy, Undo2,
  BarChart3, ShieldCheck, History, Settings, Sparkles, CreditCard,
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Business Approvals", url: "/admin/approvals", icon: ClipboardCheck },
  { title: "Businesses", url: "/admin/businesses", icon: Building2 },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
];

const finance = [
  { title: "Payments & Settlements", url: "/admin/payments", icon: Wallet },
  { title: "SaaS Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Packages", url: "/admin/packages", icon: Package },
  { title: "Gift Cards", url: "/admin/gift-cards", icon: Gift },
  { title: "Loyalty", url: "/admin/loyalty", icon: Stamp },
];

const growth = [
  { title: "Sponsored Listings", url: "/admin/sponsored", icon: Megaphone },
  { title: "Deals & Offers", url: "/admin/offers", icon: Tag },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Reels & Content", url: "/admin/reels", icon: Film },
];

const ops = [
  { title: "Complaints & Support", url: "/admin/support", icon: LifeBuoy },
  { title: "FAQ Manager", url: "/admin/faqs", icon: ClipboardCheck },
  { title: "Refunds", url: "/admin/refunds", icon: Undo2 },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
];

const system = [
  { title: "Admin Users & Roles", url: "/admin/admins", icon: ShieldCheck },
  { title: "Activity Logs", url: "/admin/activity", icon: History },
  { title: "Platform Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => url === "/admin" ? path === "/admin" : path.startsWith(url);

  const Group = ({ label, items }: { label: string; items: typeof main }) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground brg-card-shadow">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">BRG Admin</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Book · Relax · Glow</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        <Group label="Operations" items={main} />
        <Group label="Finance" items={finance} />
        <Group label="Growth" items={growth} />
        <Group label="Support" items={ops} />
        <Group label="System" items={system} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="rounded-lg bg-secondary/60 p-3">
            <p className="font-serif text-sm text-foreground">All systems healthy</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Updated just now · v2.4.1</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

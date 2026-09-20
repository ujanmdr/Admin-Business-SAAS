import {
  LayoutDashboard, Calendar, BookOpen, Users, UserCog, Sparkles, Package, BadgeCheck,
  Gift, Heart, CreditCard, ShoppingBag, Boxes, Tag, Film, Star, Megaphone, GraduationCap,
  BarChart3, Settings, Handshake, Receipt, LifeBuoy, ShoppingCart, Truck
} from "lucide-react";

export type NavItem = { label: string; to: string; icon: any; group: string };

export const navItems: NavItem[] = [
  { label: "Overview", to: "/business", icon: LayoutDashboard, group: "Workspace" },
  { label: "Calendar", to: "/business/calendar", icon: Calendar, group: "Workspace" },
  { label: "Bookings", to: "/business/bookings", icon: BookOpen, group: "Workspace" },
  { label: "Customers", to: "/business/customers", icon: Users, group: "Workspace" },
  { label: "Staff", to: "/business/staff", icon: UserCog, group: "Workspace" },
  { label: "Partners", to: "/business/partners", icon: Handshake, group: "Workspace" },

  { label: "Services", to: "/business/services", icon: Sparkles, group: "Catalog" },
  { label: "Packages", to: "/business/packages", icon: Package, group: "Catalog" },
  { label: "Memberships", to: "/business/memberships", icon: BadgeCheck, group: "Catalog" },
  { label: "Gift Cards", to: "/business/gift-cards", icon: Gift, group: "Catalog" },
  { label: "Loyalty", to: "/business/loyalty", icon: Heart, group: "Catalog" },

  { label: "Payments", to: "/business/payments", icon: CreditCard, group: "Finance" },
  { label: "POS", to: "/business/pos", icon: ShoppingBag, group: "Finance" },
  { label: "Inventory", to: "/business/inventory", icon: Boxes, group: "Finance" },
  { label: "Purchases", to: "/business/purchases", icon: ShoppingCart, group: "Finance" },
  { label: "Suppliers", to: "/business/suppliers", icon: Truck, group: "Finance" },
  { label: "Expenses", to: "/business/expenses", icon: Receipt, group: "Finance" },

  { label: "Offers", to: "/business/offers", icon: Tag, group: "Growth" },
  { label: "Reels & Content", to: "/business/reels", icon: Film, group: "Growth" },
  { label: "Reviews", to: "/business/reviews", icon: Star, group: "Growth" },
  { label: "Marketing", to: "/business/marketing", icon: Megaphone, group: "Growth" },
  { label: "Academy", to: "/business/academy", icon: GraduationCap, group: "Growth" },

  { label: "Reports", to: "/business/reports", icon: BarChart3, group: "System" },
  { label: "Loyalty Report", to: "/business/loyalty-report", icon: Heart, group: "System" },
  { label: "Subscriptions", to: "/business/subscriptions", icon: Star, group: "System" },
  { label: "Support", to: "/business/support", icon: LifeBuoy, group: "System" },
  { label: "Settings", to: "/business/settings", icon: Settings, group: "System" },
];

export const branches = ["Jhamsikhel", "Lazimpat", "Baneshwor", "Patan", "Thamel", "Pokhara"];
export const businesses = ["Aura Beauty Lounge", "Aura Wellness Spa", "Aura Academy"];

export const receptionistNavItems: NavItem[] = [
  { label: "Front Desk", to: "/staff", icon: LayoutDashboard, group: "Daily" },
  { label: "Calendar", to: "/staff/calendar", icon: Calendar, group: "Daily" },
  { label: "POS Billing", to: "/staff/pos", icon: ShoppingBag, group: "Daily" },
  { label: "Bookings", to: "/staff/bookings", icon: BookOpen, group: "Daily" },
  { label: "Customers", to: "/staff/customers", icon: Users, group: "Front Office" },
  { label: "Payments", to: "/staff/payments", icon: CreditCard, group: "Front Office" },
  { label: "Purchases", to: "/business/purchases", icon: ShoppingCart, group: "Front Office" },
  { label: "Suppliers", to: "/business/suppliers", icon: Truck, group: "Front Office" },
  { label: "Expenses", to: "/staff/expenses", icon: Receipt, group: "Front Office" },
  { label: "Support", to: "/staff/support", icon: LifeBuoy, group: "Help" },
];

export const providerNavItems: NavItem[] = [
  { label: "My Chair", to: "/staff", icon: LayoutDashboard, group: "My Work" },
  { label: "My Schedule", to: "/staff/calendar", icon: Calendar, group: "My Work" },
  { label: "My Clients", to: "/staff/customers", icon: Users, group: "My Work" },
  { label: "Support", to: "/staff/support", icon: LifeBuoy, group: "Help" },
];

export const staffNavItems: NavItem[] = receptionistNavItems;


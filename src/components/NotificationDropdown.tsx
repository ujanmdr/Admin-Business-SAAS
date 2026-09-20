import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  CreditCard,
  Sparkles,
  RotateCcw,
  Star,
  Flag,
  Package,
  Gift,
  Headphones,
  Megaphone,
  Lock,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationCategory =
  | "verification_pending"
  | "verification_accepted"
  | "verification_rejected"
  | "booking_new"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "payment_payout"
  | "subscription_alert"
  | "refund_request"
  | "review_new"
  | "review_flagged"
  | "inventory_low"
  | "gift_card"
  | "support_ticket"
  | "campaign_ad"
  | "security_alert"
  | "system";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
  businessName?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export const ADMIN_DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "adm-1",
    category: "verification_pending",
    title: "New Business Verification Request",
    description: "Glow Avenue Salon uploaded PAN certificate, business registration, and trade license for approval.",
    time: "5 min ago",
    read: false,
    businessName: "Glow Avenue Salon",
    actionLabel: "Review Application",
    actionUrl: "/admin/approvals",
  },
  {
    id: "adm-2",
    category: "verification_accepted",
    title: "Business Verification Approved",
    description: "Himalayan Bliss Spa has been officially approved and published to the BRG public marketplace.",
    time: "45 min ago",
    read: false,
    businessName: "Himalayan Bliss Spa",
    actionLabel: "View Business Profile",
    actionUrl: "/admin/businesses",
  },
  {
    id: "adm-3",
    category: "verification_rejected",
    title: "Business Verification Declined",
    description: "Pokhara Wellness application was rejected due to an expired tax clearance certificate.",
    time: "2 hrs ago",
    read: false,
    businessName: "Pokhara Wellness",
    actionLabel: "View Rejection Details",
    actionUrl: "/admin/activity",
  },
  {
    id: "adm-4",
    category: "verification_pending",
    title: "New Branch Verification Submitted",
    description: "Nirvana Spa added Branch #3 (Jhamsikhel) with updated lease documents awaiting review.",
    time: "3 hrs ago",
    read: false,
    businessName: "Nirvana Spa",
    actionLabel: "Review Branch",
    actionUrl: "/admin/approvals",
  },
  {
    id: "adm-5",
    category: "payment_payout",
    title: "Daily Settlement Batch Ready",
    description: "Payout batch of रू 2,45,000 generated across 18 verified salons scheduled for transfer today.",
    time: "4 hrs ago",
    read: false,
    actionLabel: "View Settlements",
    actionUrl: "/admin/payments",
  },
  {
    id: "adm-6",
    category: "refund_request",
    title: "Urgent Customer Refund Request (>72h)",
    description: "Customer dispute on cancelled booking #BK-8821 exceeds 72h SLA and requires Super Admin approval.",
    time: "6 hrs ago",
    read: false,
    actionLabel: "Resolve Refund",
    actionUrl: "/admin/refunds",
  },
  {
    id: "adm-7",
    category: "subscription_alert",
    title: "SaaS Plan Upgraded",
    description: "Aura Beauty Lounge upgraded subscription from Starter Plan to Enterprise Pro tier.",
    time: "10 hrs ago",
    read: true,
    actionLabel: "View Subscriptions",
    actionUrl: "/admin/subscriptions",
  },
  {
    id: "adm-8",
    category: "subscription_alert",
    title: "Subscription Auto-Debit Failed",
    description: "Karma Lounge subscription payment of रू 4,999 failed (past due 3 days). Account flagged.",
    time: "Yesterday",
    read: false,
    actionLabel: "Manage Account",
    actionUrl: "/admin/subscriptions",
  },
  {
    id: "adm-9",
    category: "review_flagged",
    title: "Defamatory Review Reported",
    description: "Salon manager flagged a 1-star review on Nirvana Spa containing abusive language for moderation.",
    time: "Yesterday",
    read: true,
    actionLabel: "Moderate Review",
    actionUrl: "/admin/reviews",
  },
  {
    id: "adm-10",
    category: "campaign_ad",
    title: "Sponsored Banner Campaign Submitted",
    description: "The Barber Club purchased a 7-day Homepage Hero banner sponsorship for रू 15,000.",
    time: "Yesterday",
    read: true,
    actionLabel: "Review Ad Creative",
    actionUrl: "/admin/sponsored",
  },
  {
    id: "adm-11",
    category: "gift_card",
    title: "Bulk Corporate Gift Card Order",
    description: "Laxmi Bank purchased 50 branded digital gift cards totaling रू 1,00,000 for employee rewards.",
    time: "2 days ago",
    read: true,
    actionLabel: "View Gift Cards",
    actionUrl: "/admin/gift-cards",
  },
  {
    id: "adm-12",
    category: "support_ticket",
    title: "High-Priority Support Ticket #841",
    description: "Urban Nail Studio reported an eSewa API callback mismatch on checkout transactions.",
    time: "2 days ago",
    read: true,
    actionLabel: "Open Ticket",
    actionUrl: "/admin/support",
  },
  {
    id: "adm-13",
    category: "booking_new",
    title: "High Booking Surge Alert",
    description: "Kathmandu Valley recorded over 120 appointment bookings in the last 60 minutes.",
    time: "3 days ago",
    read: true,
    actionLabel: "View Bookings",
    actionUrl: "/admin/bookings",
  },
  {
    id: "adm-14",
    category: "security_alert",
    title: "Admin Login from New Location",
    description: "Super Admin account accessed from Pokhara (IP: 103.14.22.8) using two-factor authentication.",
    time: "3 days ago",
    read: true,
    actionLabel: "Security Log",
    actionUrl: "/admin/activity",
  },
  {
    id: "adm-15",
    category: "system",
    title: "Nightly Database & CDN Sync",
    description: "Cloudflare global edge cache purged and PostgreSQL incremental snapshot created successfully.",
    time: "4 days ago",
    read: true,
  },
];

export const BUSINESS_DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "biz-1",
    category: "verification_accepted",
    title: "Business Verification Approved! 🎉",
    description: "Congratulations! Your business registration and documents have been approved by Super Admin. You are now live on BRG Marketplace.",
    time: "10 min ago",
    read: false,
    actionLabel: "View Public Listing",
    actionUrl: "/business/marketing",
  },
  {
    id: "biz-2",
    category: "verification_pending",
    title: "Branch Documents Under Review",
    description: "Your document submission for Branch #2 (Thamel) has been queued for Super Admin review. Estimated review: 24h.",
    time: "1 hr ago",
    read: false,
    actionLabel: "Check Status",
    actionUrl: "/business/settings",
  },
  {
    id: "biz-3",
    category: "verification_rejected",
    title: "Verification Action Required",
    description: "PAN Registration document was declined (blurry photo). Please re-upload a clear scanned copy to maintain active badge.",
    time: "2 hrs ago",
    read: false,
    actionLabel: "Re-upload Document",
    actionUrl: "/business/settings",
  },
  {
    id: "biz-4",
    category: "booking_new",
    title: "New Online Appointment Booked",
    description: "Pooja Gurung booked 'Hydra Facial Luxe' (60 mins) for today at 3:00 PM with Senior Stylist Rita.",
    time: "Just now",
    read: false,
    actionLabel: "View Calendar",
    actionUrl: "/business/calendar",
  },
  {
    id: "biz-5",
    category: "booking_rescheduled",
    title: "Appointment Rescheduled by Client",
    description: "Aarav Sharma requested time change for 'Royal Beard & Hair Grooming' from 2:00 PM to 4:30 PM.",
    time: "20 min ago",
    read: false,
    actionLabel: "Review Schedule",
    actionUrl: "/business/calendar",
  },
  {
    id: "biz-6",
    category: "booking_cancelled",
    title: "Appointment Cancelled",
    description: "Client cancelled booking #BK-4921 for tomorrow 11:00 AM. 50% late cancellation policy credit retained.",
    time: "1 hr ago",
    read: false,
    actionLabel: "View Details",
    actionUrl: "/business/bookings",
  },
  {
    id: "biz-7",
    category: "payment_payout",
    title: "Weekly Settlement Deposited",
    description: "Net settlement of रू 48,250 has been transferred into your Nabil Bank registered business account.",
    time: "3 hrs ago",
    read: true,
    actionLabel: "View Statement",
    actionUrl: "/business/payments",
  },
  {
    id: "biz-8",
    category: "inventory_low",
    title: "Low Inventory Warning",
    description: "Olaplex No. 3 Hair Perfector stock is down to 2 bottles (reorder threshold is set to 5 units).",
    time: "5 hrs ago",
    read: false,
    actionLabel: "Reorder Stock",
    actionUrl: "/business/inventory",
  },
  {
    id: "biz-9",
    category: "review_new",
    title: "New 5-Star Review Received ⭐⭐⭐⭐⭐",
    description: "'The scalp massage and herbal hair treatment was sublime. Highly recommended!' — Sunita Maharjan",
    time: "6 hrs ago",
    read: true,
    actionLabel: "Reply to Review",
    actionUrl: "/business/reviews",
  },
  {
    id: "biz-10",
    category: "review_flagged",
    title: "Critical Feedback Alert",
    description: "Customer left a 2-star rating mentioning a 25-minute delay before seating. Reply to resolve client issue.",
    time: "Yesterday",
    read: false,
    actionLabel: "View & Respond",
    actionUrl: "/business/reviews",
  },
  {
    id: "biz-11",
    category: "subscription_alert",
    title: "BRG Growth Plan Renewed",
    description: "Your monthly SaaS subscription of रू 3,999 has renewed successfully. Next billing: Oct 2, 2026.",
    time: "Yesterday",
    read: true,
    actionLabel: "Billing Settings",
    actionUrl: "/business/settings",
  },
  {
    id: "biz-12",
    category: "gift_card",
    title: "Gift Card Redeemed at Checkout",
    description: "Client redeemed Gift Card #GC-8041 (रू 2,500 applied) against bill #INV-2901.",
    time: "Yesterday",
    read: true,
    actionLabel: "Gift Card Log",
    actionUrl: "/business/gift-cards",
  },
  {
    id: "biz-13",
    category: "campaign_ad",
    title: "Weekend Flash Promo Live",
    description: "Your 'Monsoon Glow 20% Off' flash deal is now active and has been viewed by 184 clients nearby.",
    time: "2 days ago",
    read: true,
    actionLabel: "Campaign Stats",
    actionUrl: "/business/marketing",
  },
  {
    id: "biz-14",
    category: "support_ticket",
    title: "Support Ticket #412 Resolved",
    description: "BRG Technical Support updated: SMS appointment reminder sender ID 'BRG-SALON' is verified and live.",
    time: "3 days ago",
    read: true,
    actionLabel: "View Ticket",
    actionUrl: "/business/support",
  },
  {
    id: "biz-15",
    category: "system",
    title: "Cloud Backup & POS Sync",
    description: "All offline POS transactions, staff commissions, and customer loyalty records synced with cloud.",
    time: "4 days ago",
    read: true,
  },
];

interface NotificationDropdownProps {
  role?: "admin" | "business";
  triggerClassName?: string;
}

export function NotificationDropdown({
  role = "admin",
  triggerClassName,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    role === "admin" ? ADMIN_DUMMY_NOTIFICATIONS : BUSINESS_DUMMY_NOTIFICATIONS
  );
  const [filter, setFilter] = useState<
    "all" | "verifications" | "bookings" | "finance" | "unread"
  >("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "verifications") {
      return (
        n.category === "verification_pending" ||
        n.category === "verification_accepted" ||
        n.category === "verification_rejected"
      );
    }
    if (filter === "bookings") {
      return (
        n.category === "booking_new" ||
        n.category === "booking_cancelled" ||
        n.category === "booking_rescheduled" ||
        n.category === "inventory_low"
      );
    }
    if (filter === "finance") {
      return (
        n.category === "payment_payout" ||
        n.category === "subscription_alert" ||
        n.category === "refund_request" ||
        n.category === "gift_card"
      );
    }
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryConfig = (category: NotificationCategory) => {
    switch (category) {
      case "verification_pending":
        return {
          icon: ShieldAlert,
          iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
          tagLabel: "Verification Request",
          tagBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
          highlightBorder: "border-l-amber-500",
        };
      case "verification_accepted":
        return {
          icon: ShieldCheck,
          iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
          tagLabel: "Verified / Accepted",
          tagBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
          highlightBorder: "border-l-emerald-500",
        };
      case "verification_rejected":
        return {
          icon: ShieldX,
          iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30",
          tagLabel: "Verification Rejected",
          tagBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
          highlightBorder: "border-l-rose-500",
        };
      case "booking_new":
        return {
          icon: CalendarCheck,
          iconBg: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30",
          tagLabel: "New Booking",
          tagBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25",
          highlightBorder: "border-l-blue-500",
        };
      case "booking_cancelled":
        return {
          icon: CalendarX,
          iconBg: "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30",
          tagLabel: "Booking Cancelled",
          tagBg: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25",
          highlightBorder: "border-l-red-500",
        };
      case "booking_rescheduled":
        return {
          icon: CalendarClock,
          iconBg: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30",
          tagLabel: "Rescheduled",
          tagBg: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
          highlightBorder: "border-l-sky-500",
        };
      case "payment_payout":
        return {
          icon: CreditCard,
          iconBg: "bg-primary/15 text-primary border border-primary/30",
          tagLabel: "Payout / Settlement",
          tagBg: "bg-primary/10 text-primary border-primary/25",
          highlightBorder: "border-l-primary",
        };
      case "subscription_alert":
        return {
          icon: Sparkles,
          iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
          tagLabel: "SaaS Subscription",
          tagBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
          highlightBorder: "border-l-amber-500",
        };
      case "refund_request":
        return {
          icon: RotateCcw,
          iconBg: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30",
          tagLabel: "Refund Alert",
          tagBg: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25",
          highlightBorder: "border-l-orange-500",
        };
      case "review_new":
        return {
          icon: Star,
          iconBg: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30",
          tagLabel: "New Review",
          tagBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
          highlightBorder: "border-l-purple-500",
        };
      case "review_flagged":
        return {
          icon: Flag,
          iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30",
          tagLabel: "Moderation Flag",
          tagBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
          highlightBorder: "border-l-rose-500",
        };
      case "inventory_low":
        return {
          icon: Package,
          iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
          tagLabel: "Low Inventory",
          tagBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
          highlightBorder: "border-l-amber-500",
        };
      case "gift_card":
        return {
          icon: Gift,
          iconBg: "bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30",
          tagLabel: "Gift Card",
          tagBg: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/25",
          highlightBorder: "border-l-pink-500",
        };
      case "support_ticket":
        return {
          icon: Headphones,
          iconBg: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30",
          tagLabel: "Support Ticket",
          tagBg: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
          highlightBorder: "border-l-teal-500",
        };
      case "campaign_ad":
        return {
          icon: Megaphone,
          iconBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30",
          tagLabel: "Marketing & Ads",
          tagBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
          highlightBorder: "border-l-indigo-500",
        };
      case "security_alert":
        return {
          icon: Lock,
          iconBg: "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30",
          tagLabel: "Security Alert",
          tagBg: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25",
          highlightBorder: "border-l-red-500",
        };
      case "system":
      default:
        return {
          icon: Sparkles,
          iconBg: "bg-secondary text-foreground border border-border",
          tagLabel: "System Sync",
          tagBg: "bg-secondary text-muted-foreground border-border",
          highlightBorder: "border-l-muted-foreground",
        };
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative h-10 w-10 grid place-items-center rounded-xl border border-border bg-card transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            triggerClassName
          )}
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4 text-foreground/85 transition-transform hover:scale-105" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[oklch(0.605_0.110_70)] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[375px] sm:w-[440px] p-0 rounded-2xl border border-border/80 bg-popover shadow-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-br from-card to-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <Badge
                  variant="outline"
                  className="rounded-full bg-primary/10 border-primary/20 text-primary text-[10px] font-medium px-2 py-0.5"
                >
                  {unreadCount} unread
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground">All caught up</span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-border/60">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("verifications")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                filter === "verifications"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <ShieldAlert className="h-3 w-3" />
              Verifications (
              {
                notifications.filter(
                  (n) =>
                    n.category === "verification_pending" ||
                    n.category === "verification_accepted" ||
                    n.category === "verification_rejected"
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("bookings")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                filter === "bookings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <CalendarCheck className="h-3 w-3" />
              Bookings & Ops (
              {
                notifications.filter(
                  (n) =>
                    n.category === "booking_new" ||
                    n.category === "booking_cancelled" ||
                    n.category === "booking_rescheduled" ||
                    n.category === "inventory_low"
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("finance")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                filter === "finance"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <CreditCard className="h-3 w-3" />
              Finance (
              {
                notifications.filter(
                  (n) =>
                    n.category === "payment_payout" ||
                    n.category === "subscription_alert" ||
                    n.category === "refund_request" ||
                    n.category === "gift_card"
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                filter === "unread"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List - 100% Native Smooth Scroll */}
        <div
          tabIndex={0}
          className="max-h-[420px] overflow-y-auto overscroll-contain focus:outline-none divide-y divide-border/50 [scrollbar-width:thin] [scrollbar-color:oklch(var(--border))_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
        >
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="h-11 w-11 rounded-2xl bg-muted/60 grid place-items-center text-muted-foreground">
                <Bell className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                {filter === "unread"
                  ? "You have read all pending messages."
                  : filter === "verifications"
                  ? "No business verification notifications in this view."
                  : filter === "bookings"
                  ? "No booking or operational alerts."
                  : filter === "finance"
                  ? "No finance or payout notifications."
                  : "You're all up to date with platform activity."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredNotifications.map((notif) => {
                const config = getCategoryConfig(notif.category);
                const IconComponent = config.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => toggleRead(notif.id)}
                    className={cn(
                      "group relative p-3.5 transition-all cursor-pointer hover:bg-muted/40 flex items-start gap-3 border-l-[3.5px]",
                      notif.read
                        ? "border-l-transparent bg-transparent opacity-85 hover:opacity-100"
                        : cn("bg-card/75", config.highlightBorder)
                    )}
                  >
                    {/* Status Icon with Category Tint */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105",
                        config.iconBg
                      )}
                    >
                      <IconComponent className="h-4 w-4 stroke-[2.2]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-md text-[9.5px] font-semibold tracking-wide uppercase px-1.5 py-0 border shrink-0",
                            config.tagBg
                          )}
                        >
                          {config.tagLabel}
                        </Badge>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[10.5px] text-muted-foreground whitespace-nowrap">
                            {notif.time}
                          </span>
                          {!notif.read && (
                            <span
                              className="h-2 w-2 rounded-full bg-[oklch(0.605_0.110_70)] shrink-0"
                              title="Unread"
                            />
                          )}
                        </div>
                      </div>

                      <h4
                        className={cn(
                          "text-xs font-semibold leading-tight",
                          notif.read ? "text-foreground/80 font-medium" : "text-foreground"
                        )}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11.5px] leading-relaxed text-muted-foreground line-clamp-2">
                        {notif.description}
                      </p>

                      {/* Action Link if present */}
                      {notif.actionLabel && notif.actionUrl && (
                        <div className="pt-1 flex items-center gap-2">
                          <Link
                            to={notif.actionUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <span>{notif.actionLabel}</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Quick Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => removeNotification(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted/80"
                      title="Dismiss notification"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-secondary/30 border-t border-border flex items-center justify-between text-xs">
          <Link
            to={role === "admin" ? "/admin/activity" : "/business/settings"}
            onClick={() => setOpen(false)}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md transition hover:bg-muted/60"
          >
            <span>{role === "admin" ? "All Platform Activity" : "Notification Settings"}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>

          <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium">
            BRG {role === "admin" ? "Super Admin" : "Business Suite"}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

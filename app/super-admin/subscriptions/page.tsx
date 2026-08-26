import React from "react";
import SubscriptionDashboard from "../../../components/subscription-dashboard";
import { getPackagesAction, getSubscribersAction } from "../../../actions/subscription-actions";

// Metadata for SEO best practices
export const metadata = {
  title: "Subscription Management | Super Admin Dashboard",
  description: "Configure pricing plans, subscriber statuses, and branch/staff limits for SaaS tenants.",
};

export default async function SubscriptionsPage() {
  // Fetch initial data server-side
  const [packages, subscribers] = await Promise.all([
    getPackagesAction(),
    getSubscribersAction(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50/30 px-4 py-8 dark:bg-neutral-950/20 sm:px-6 lg:px-8">
      <SubscriptionDashboard 
        initialPackages={packages}
        initialSubscribers={subscribers}
      />
    </div>
  );
}

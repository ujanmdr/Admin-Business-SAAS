import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SubscriptionSettings } from "@/components/SubscriptionSettings";

export const Route = createFileRoute("/business/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions · BRG Suite" }] }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="System"
        title="Plan & Subscriptions"
        description="View your current BRG Suite plan and manage add-ons like extra staff and branches."
      />
      <div className="mt-6">
        <SubscriptionSettings />
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { PaymentsPage } from "../business/payments";
import { useAuth } from "@/lib/auth";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/staff/payments")({
  component: StaffPaymentsWrapper,
});

function StaffPaymentsWrapper() {
  const { isProvider } = useAuth();

  if (isProvider) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-card border border-border rounded-3xl p-8 shadow-sm space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto">
          <CreditCard className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Front Desk Finance Only</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            General business payments and financial accounts are managed by the Front Desk Receptionist and Salon Manager.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-primary text-primary-foreground shadow-luxe gap-2">
          <Link to="/staff">
            <ArrowLeft className="h-4 w-4" /> Return to My Chair
          </Link>
        </Button>
      </div>
    );
  }

  return <PaymentsPage />;
}


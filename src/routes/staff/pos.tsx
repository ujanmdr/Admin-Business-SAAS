import { createFileRoute, Link } from "@tanstack/react-router";
import { POSPage } from "../business/pos";
import { useAuth } from "@/lib/auth";
import { Receipt, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/staff/pos")({
  component: StaffPOSWrapper,
});

function StaffPOSWrapper() {
  const { isProvider } = useAuth();

  if (isProvider) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-card border border-border rounded-3xl p-8 shadow-sm space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto">
          <Building2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Front Desk Checkout Only</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In this salon, all client billings and payments are processed at the reception desk. Please send your client to the front desk for payment.
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

  return <POSPage />;
}


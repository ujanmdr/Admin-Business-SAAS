import { createFileRoute, redirect } from "@tanstack/react-router";
import { BusinessProvider } from "@/components/BusinessProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StaffAppShell } from "@/components/layout/StaffAppShell";

export const Route = createFileRoute("/staff")({
  beforeLoad: () => {
    // Simple mock auth guard: check if logged in as staff
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("brg_auth");
      // Allow business to also see staff view for testing, but in real world it would be strict
      if (!user || (JSON.parse(user).role !== "staff" && JSON.parse(user).role !== "business")) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  return (
    <BusinessProvider>
      <ThemeProvider>
        <StaffAppShell />
      </ThemeProvider>
    </BusinessProvider>
  );
}

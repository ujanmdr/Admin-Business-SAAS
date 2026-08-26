import { createFileRoute, redirect } from "@tanstack/react-router";
import { BusinessProvider } from "@/components/BusinessProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/business")({
  beforeLoad: () => {
    // Simple mock auth guard: check if logged in as business client
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("brg_auth");
      if (!user || JSON.parse(user).role !== "business") {
        throw redirect({ to: "/" });
      }
    }
  },
  component: BusinessLayout,
});

function BusinessLayout() {
  return (
    <BusinessProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </BusinessProvider>
  );
}

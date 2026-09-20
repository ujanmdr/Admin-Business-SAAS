import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "../business/calendar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/staff/calendar")({
  component: StaffCalendarRoute,
});

function StaffCalendarRoute() {
  const { user, isReceptionist } = useAuth();

  if (isReceptionist) {
    // Receptionist sees the multi-column Staff view across the entire branch
    return <CalendarPage defaultView="Staff" />;
  }

  // Hair Stylist / Provider gets their own locked station calendar
  const staffName = user?.name || "Anisha";
  return (
    <CalendarPage 
      defaultStaff={staffName} 
      lockStaff={true} 
      defaultView="Day"
      customTitle={`${staffName}'s Station Schedule`}
      customEyebrow="My Calendar"
    />
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { BookingsPage } from "../business/bookings";

export const Route = createFileRoute("/staff/bookings")({
  component: BookingsPage,
});

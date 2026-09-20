import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "../business/support";

export const Route = createFileRoute("/staff/support")({
  component: SupportPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { InvoiceSettingsView } from "@/components/invoice/InvoiceSettingsView";

export const Route = createFileRoute("/business/invoice-settings")({
  head: () => ({ meta: [{ title: "Invoice Settings · BRG Suite" }] }),
  component: InvoiceSettingsPage,
});

function InvoiceSettingsPage() {
  return <InvoiceSettingsView />;
}

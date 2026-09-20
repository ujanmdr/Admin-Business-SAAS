import { InvoiceData } from "@/components/invoice/InvoiceDocument";

/**
 * Open a dedicated popup or iframe to print the target invoice cleanly
 */
export function printInvoiceElement(elementId: string, title = "Invoice", isA4 = false) {
  const node = document.getElementById(elementId);
  if (!node) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", isA4 ? "width=900,height=1000" : "width=420,height=720");
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    ${styles}
    <style>
      @page {
        margin: ${isA4 ? "12mm" : "0mm"};
        size: ${isA4 ? "A4 portrait" : "80mm auto"};
      }
      body {
        margin: 0;
        padding: ${isA4 ? "20px" : "8px"};
        background: #ffffff !important;
        color: #111111 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      /* Ensure crisp thermal text */
      * {
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    ${node.outerHTML}
    <script>
      window.onload = () => {
        window.focus();
        window.print();
        setTimeout(() => {
          window.close();
        }, 500);
      };
    </script>
  </body>
</html>`);

  printWindow.document.close();
}

/**
 * Generate a pre-filled WhatsApp click-to-chat URL with clean summary text
 */
export function getWhatsAppShareUrl(bill: InvoiceData, businessName: string): string {
  const phone = bill.customer.phone ? bill.customer.phone.replace(/[^0-9]/g, "") : "";

  const itemsList = bill.items
    .map((item) => `• ${item.particular} (x${item.qty}) - Rs ${item.amount.toFixed(2)}`)
    .join("\n");

  const message = `*Receipt from ${businessName}*\n\n` +
    `Invoice: #${bill.invoiceNo}\n` +
    `Date: ${bill.date}\n` +
    `Customer: ${bill.customer.name || "Valued Client"}\n\n` +
    `*Items:*\n${itemsList}\n\n` +
    `*Total Paid: Rs ${bill.total.toFixed(2)}*\n\n` +
    `Thank you for choosing ${businessName}!`;

  const encodedMsg = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
}

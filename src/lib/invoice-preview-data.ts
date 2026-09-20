import { InvoiceData } from "@/components/invoice/InvoiceDocument";
import { Business } from "@/lib/tenant-data";

export function getSampleInvoiceForBusiness(business: Business): InvoiceData {
  const cat = (business.category || "").toLowerCase();
  const name = business.name || "Business";
  const branch = business.address ? business.address.split(",")[0] : "Main Branch";

  // 1. Hair Salon / Beauty Lounge
  if (cat.includes("salon") || cat.includes("hair") || cat.includes("beauty")) {
    return {
      invoiceNo: "INV-2026-0841",
      orderNo: 184,
      date: "May 06, 2026",
      time: "02:30 PM",
      orderType: "Appointment",
      deliveryStaff: "Anisha (Cashier)",
      customer: {
        name: "Pratima Joshi",
        phone: "977 9841234567",
        pan: "601928374",
        address: "Jhamsikhel-3, Lalitpur",
      },
      items: [
        { sn: 1, hsCode: "96.02", particular: "Designer Hair Cut & Styling", rate: 2500.0, qty: 1, amount: 2500.0, staff: "Ram" },
        { sn: 2, hsCode: "96.02", particular: "Balayage Hair Color & Tone", rate: 8500.0, qty: 1, amount: 8500.0, staff: "Sita" },
        { sn: 3, hsCode: "96.02", particular: "HydraFacial Glow Treatment", rate: 6500.0, qty: 1, amount: 6500.0, staff: "Anisha" },
        { sn: 4, hsCode: "33.04", particular: "Olaplex No.3 Treatment", rate: 4200.0, qty: 1, amount: 4200.0, staff: "Ram" },
      ],
      itemTotal: 21700.0,
      loyaltyDiscount: 2170.0,
      loyaltyDiscountPct: 10.0,
      offerDiscount: 0,
      subtotal: 19530.0,
      serviceCharge: 1953.0,
      tax: 2792.79,
      total: 24275.79,
      paymentMethod: "eSewa",
      status: "Tax Invoice",
    };
  }

  // 2. Spa & Massage / Wellness
  if (cat.includes("spa") || cat.includes("massage") || cat.includes("wellness")) {
    return {
      invoiceNo: "SPA-2026-0419",
      orderNo: 305,
      date: "May 06, 2026",
      time: "11:15 AM",
      orderType: "Session",
      deliveryStaff: "Bishal (Reception)",
      customer: {
        name: "Ankita Rai",
        phone: "977 9851098765",
        pan: "602394851",
        address: "Patan Heritage Walk, Lalitpur",
      },
      items: [
        { sn: 1, hsCode: "96.02", particular: "Ayurvedic Deep Tissue Massage (90m)", rate: 4500.0, qty: 1, amount: 4500.0, staff: "Bishal" },
        { sn: 2, hsCode: "96.02", particular: "Hot Stone Therapy Add-on", rate: 2500.0, qty: 1, amount: 2500.0, staff: "Ritu" },
        { sn: 3, hsCode: "33.07", particular: "Forest Essentials Herbal Oil", rate: 3200.0, qty: 1, amount: 3200.0 },
      ],
      itemTotal: 10200.0,
      loyaltyDiscount: 1000.0,
      loyaltyDiscountPct: 9.8,
      offerDiscount: 0,
      subtotal: 9200.0,
      serviceCharge: 920.0,
      tax: 1315.6,
      total: 11435.6,
      paymentMethod: "Card",
      status: "Tax Invoice",
    };
  }

  // 3. Dental Clinic
  if (cat.includes("dental") || cat.includes("clinic") || cat.includes("health")) {
    return {
      invoiceNo: "MED-2026-102",
      orderNo: 89,
      date: "May 06, 2026",
      time: "04:00 PM",
      orderType: "Treatment",
      deliveryStaff: "Front Desk",
      customer: {
        name: "Sushma Rai",
        phone: "977 9841122334",
        pan: "604719283",
        address: "Baneshwor Heights, Kathmandu",
      },
      items: [
        { sn: 1, hsCode: "90.18", particular: "Ultrasonic Scaling & Polishing", rate: 3500.0, qty: 1, amount: 3500.0, staff: "Dr. Sushma" },
        { sn: 2, hsCode: "90.18", particular: "In-Office Teeth Whitening Session", rate: 12500.0, qty: 1, amount: 12500.0, staff: "Dr. Suman" },
        { sn: 3, hsCode: "33.06", particular: "Colgate Enamel Care Professional Kit", rate: 2200.0, qty: 1, amount: 2200.0 },
      ],
      itemTotal: 18200.0,
      loyaltyDiscount: 0,
      offerDiscount: 1500.0,
      subtotal: 16700.0,
      serviceCharge: 0,
      tax: 2171.0,
      total: 18871.0,
      paymentMethod: "Khalti",
      status: "Tax Invoice",
    };
  }

  // 4. Academy / Education
  if (cat.includes("academy") || cat.includes("education") || cat.includes("training")) {
    return {
      invoiceNo: "ACAD-2026-055",
      orderNo: 55,
      date: "May 06, 2026",
      time: "10:00 AM",
      orderType: "Enrollment",
      deliveryStaff: "Pooja (Admin)",
      customer: {
        name: "Sunita Tamang",
        phone: "977 9813009988",
        pan: "603849102",
        address: "Pokhara, Kaski",
      },
      items: [
        { sn: 1, hsCode: "99.92", particular: "Pro Bridal Makeup Artistry (40h)", rate: 25000.0, qty: 1, amount: 25000.0 },
        { sn: 2, hsCode: "99.92", particular: "Certification & International Kit", rate: 8000.0, qty: 1, amount: 8000.0 },
      ],
      itemTotal: 33000.0,
      loyaltyDiscount: 0,
      offerDiscount: 3000.0,
      subtotal: 30000.0,
      serviceCharge: 0,
      tax: 3900.0,
      total: 33900.0,
      paymentMethod: "Bank Transfer",
      status: "Tax Invoice",
    };
  }

  // 5. Restaurant / Cafe (Matching reference screenshot)
  return {
    invoiceNo: "Draft",
    orderNo: 512,
    date: "Nov 24, 2025",
    time: "03:45 PM",
    orderType: "Delivery",
    deliveryStaff: "Nischal",
    customer: {
      name: "Nischal",
      phone: "977 9844736540",
      pan: "613635938",
      address: "Ranipauwa-11, Pokhara",
    },
    items: [
      { sn: 1, hsCode: "1.11", particular: "Chicken Cheese Pizza", rate: 601.77, qty: 1, amount: 601.77 },
      { sn: 2, hsCode: "-", particular: "Dry Mix", rate: 309.73, qty: 1, amount: 309.73 },
      { sn: 3, hsCode: "-", particular: "Veg Organic Thali", rate: 433.63, qty: 1, amount: 433.63 },
      { sn: 4, hsCode: "1.05", particular: "Burger - Veg", rate: 159.29, qty: 1, amount: 159.29 },
    ],
    itemTotal: 1504.42,
    loyaltyDiscount: 199.94,
    loyaltyDiscountPct: 13.29,
    offerDiscount: 0,
    subtotal: 1304.48,
    serviceCharge: 150.0,
    tax: 189.08,
    total: 1643.56,
    paymentMethod: "eSewa",
    status: "Estimate",
  };
}

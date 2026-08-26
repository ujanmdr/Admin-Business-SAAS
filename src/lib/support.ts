import { tickets as initialTickets } from "./mock-data";

export interface TicketMessage {
  sender: "business" | "admin" | "bot" | "system";
  senderName: string;
  message: string;
  timestamp: string;
  options?: string[]; // Clickable suggestion chips
}

export interface Ticket {
  id: string;
  type: string;
  party: string;
  booking: string;
  subject: string;
  description: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  assigned: string;
  created: string;
  messages: TicketMessage[];
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const STORAGE_KEY = "brg_tickets";
const FAQ_STORAGE_KEY = "brg_faqs";

// Agent Auto-Routing Rules (When Escalated)
export function autoRouteAgent(type: string): string {
  switch (type) {
    case "Payment issue":
    case "Refund request":
    case "Gift card issue":
      return "Sneha M. (Finance Admin)";
    case "Booking issue":
    case "Staff issue":
    case "Business complaint":
      return "Bipin S. (Operations Admin)";
    case "Customer complaint":
    case "Review issue":
    case "Package issue":
      return "Rohan T. (Support Admin)";
    default:
      return "Aarya K. (Super Admin)";
  }
}

// Bot Suggestion Chips Based on Category
export function getBotSuggestions(type: string): string[] {
  const escalateOption = "My issue is not listed / Speak to agent";
  switch (type) {
    case "Payment issue":
    case "Refund request":
      return [
        "How long does a refund take?",
        "My Khalti/eSewa payment failed but money was deducted.",
        escalateOption
      ];
    case "Booking issue":
    case "Staff issue":
      return [
        "How do I cancel or reschedule a booking?",
        "My staff member isn't showing in the calendar.",
        escalateOption
      ];
    case "Package issue":
      return [
        "How do I upgrade my SaaS subscription?",
        "I hit my limit on staff/branches.",
        escalateOption
      ];
    case "Review issue":
      return [
        "How do I dispute a fake review?",
        "How long does review verification take?",
        escalateOption
      ];
    default:
      return [
        "How do I update business profile details?",
        "Where can I adjust interface branding theme?",
        escalateOption
      ];
  }
}

// Bot Resolution Texts
export function getBotResolution(type: string, option: string): { answer: string; options?: string[]; escalate?: boolean } {
  const escalateOption = "My issue is not listed / Speak to agent";
  const noEscalate = "No, escalate to support team";
  const yesResolve = "Yes, issue is resolved";

  if (option === escalateOption || option === noEscalate) {
    return {
      answer: "Escalating ticket to our human support team now. A platform representative will look into this shortly.",
      escalate: true
    };
  }

  if (option === yesResolve) {
    return {
      answer: "Great! Glad I could help resolve your issue. If you need anything else, feel free to write a reply or raise another ticket.",
      options: []
    };
  }

  let answer = "";
  if (type === "Payment issue" || type === "Refund request") {
    if (option.includes("refund take")) {
      answer = "Refunds typically take 3 to 5 business days to clear and show up in the customer's Khalti/eSewa digital wallet. If it has been more than 5 days, please escalate.";
    } else if (option.includes("failed")) {
      answer = "If a transaction fails but money was deducted, the payment provider (Khalti/eSewa) will auto-revert the funds within 24 hours. Please check your wallet statements or escalate if it fails to revert.";
    }
  } else if (type === "Booking issue" || type === "Staff issue") {
    if (option.includes("cancel")) {
      answer = "To cancel/reschedule a booking: Go to 'Calendar' or 'Bookings' inside your Suite, click on the appointment card, and click 'Cancel' or 'Edit'. Note: Deposits are refunded based on your cancellation policy.";
    } else if (option.includes("staff")) {
      answer = "Make sure the staff member is marked as 'Active' in the Staff page and check under Settings > Hours that their working hours and working branches are defined correctly.";
    }
  } else if (type === "Package issue") {
    if (option.includes("upgrade")) {
      answer = "To upgrade your SaaS subscription: Go to Settings > Subscription, check the plans list, select 'Upgrade Plan', and complete the subscription payment using Khalti or eSewa.";
    } else if (option.includes("limit")) {
      answer = "Each SaaS plan has a limit on branches and staff. To add more branches/staff beyond your limit, you must upgrade your active plan (e.g. from Starter to Growth).";
    }
  } else if (type === "Review issue") {
    if (option.includes("dispute")) {
      answer = "If you receive a review that violates terms (spam/harassment), click 'Report review' on the Reviews page. Provide details of the dispute. The moderation team reviews reported comments within 24-48 hours.";
    } else if (option.includes("verification")) {
      answer = "Verification of flagged/reported reviews takes up to 48 hours. If the review is found to violate platform standards, it will be hidden automatically.";
    }
  } else {
    if (option.includes("details")) {
      answer = "To update business name or cover images, open Settings > Business Profile and click 'Save Changes' at the top right after modifying the fields.";
    } else if (option.includes("branding")) {
      answer = "You can customize your interface theme and select visual galleries under Settings > Branding. Changes apply instantly to your layout.";
    }
  }

  if (!answer) {
    answer = "I've noted your request. If the suggestions above do not help, click below to route to a support representative.";
  }

  return {
    answer: `${answer}\n\nDid this solve your problem?`,
    options: [yesResolve, noEscalate]
  };
}

// Help Center FAQs (Seed Data)
export const initialFaqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "Payment issue",
    question: "How do I process a booking refund?",
    answer: "Go to Payments & Settlements in your settings, click the transaction, and select 'Issue Refund'. Refund requests take 3-5 business days to process back to the customer's wallet (eSewa/Khalti)."
  },
  {
    id: "faq-2",
    category: "Booking issue",
    question: "My customer didn't receive their booking confirmation.",
    answer: "Check that their phone number has the correct +977 prefix. You can resend WhatsApp or SMS confirmations by opening the booking in your Calendar and clicking 'Resend Alerts'."
  },
  {
    id: "faq-3",
    category: "Package issue",
    question: "How do I add a new branch to my business?",
    answer: "Go to Settings > Business Profile, scroll to the Branches section, and click 'Add Branch'. Depending on your SaaS subscription tier, adding extra branches may incur additional fees."
  },
  {
    id: "faq-4",
    category: "Business complaint",
    question: "How can I feature my business on the BRG Marketplace search?",
    answer: "You can submit an inquiry under 'Sponsored Listings' in your growth settings or request support under 'Sponsored Inquiry' category to set up category-top or homepage banners."
  },
  {
    id: "faq-5",
    category: "Review issue",
    question: "Why is a customer's review flagged?",
    answer: "We automatically flag reviews containing inappropriate language or suspect activity. If you believe a review violates marketplace guidelines, raise a support ticket under 'Review issue' with the review ID."
  }
];

export function getFaqs(): FAQItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(FAQ_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing FAQs", e);
    }
  }
  saveFaqs(initialFaqs);
  return initialFaqs;
}

export function saveFaqs(faqsList: FAQItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(faqsList));
  window.dispatchEvent(new Event("storage_faqs_updated"));
}

export function addFaq(faq: Omit<FAQItem, "id">): FAQItem {
  const faqsList = getFaqs();
  const idStr = `faq-${Date.now()}`;
  const newFaq = { ...faq, id: idStr };
  faqsList.push(newFaq);
  saveFaqs(faqsList);
  return newFaq;
}

export function deleteFaq(id: string) {
  const faqsList = getFaqs().filter(f => f.id !== id);
  saveFaqs(faqsList);
}

// Initialize and Fetch tickets
export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing tickets from localStorage", e);
    }
  }

  // Fallback to initial seed data, mapping it to the new structure
  const seeded: Ticket[] = initialTickets.map((t) => ({
    id: t.id,
    type: t.type,
    party: t.party,
    booking: t.booking || "N/A",
    subject: t.subject,
    description: `I am having a ${t.type.toLowerCase()} regarding: ${t.subject}. Please assist.`,
    priority: t.priority as any,
    status: t.status as any,
    assigned: t.assigned === "—" ? autoRouteAgent(t.type) : `${t.assigned} (Support Admin)`,
    created: t.created,
    messages: [
      {
        sender: "business",
        senderName: t.party,
        message: `I am having a ${t.type.toLowerCase()} regarding: ${t.subject}. Please assist.`,
        timestamp: `${t.created} 09:30`
      }
    ]
  }));

  saveTickets(seeded);
  return seeded;
}

export function saveTickets(tickets: Ticket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  // Dispatch event for same-tab updates
  window.dispatchEvent(new Event("storage_tickets_updated"));
}

export function createTicket(ticketData: Omit<Ticket, "id" | "created" | "assigned" | "messages">): Ticket {
  const tickets = getTickets();
  
  // Find highest ID
  const ids = tickets.map(t => parseInt(t.id.replace("TKT-", "")) || 7700);
  const nextId = Math.max(...ids, 7700) + 1;
  const idStr = `TKT-${nextId}`;
  
  const now = new Date();
  const createdStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timestampStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timestamp = `${createdStr} ${timestampStr}`;

  const suggestions = getBotSuggestions(ticketData.type);
  
  const newTicket: Ticket = {
    ...ticketData,
    id: idStr,
    created: createdStr,
    assigned: "🤖 BRG Helper Bot",
    messages: [
      {
        sender: "business",
        senderName: ticketData.party,
        message: ticketData.description,
        timestamp
      },
      {
        sender: "bot",
        senderName: "🤖 BRG Helper Bot",
        message: `Hello! I am your BRG Support Assistant. I've received your query regarding "${ticketData.type}". Here are some questions/suggestions that might help you immediately:`,
        timestamp,
        options: suggestions
      }
    ]
  };

  tickets.unshift(newTicket); // Add new tickets to the top
  saveTickets(tickets);
  return newTicket;
}

export function handleBotInteraction(ticketId: string, option: string): Ticket | null {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return null;

  const ticket = tickets[idx];
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timestamp = `${dateStr} ${timeStr}`;

  // 1. Add Business message showing what they clicked
  ticket.messages.push({
    sender: "business",
    senderName: ticket.party,
    message: option,
    timestamp
  });

  // Remove options from the previous message so they can't double-click it
  if (ticket.messages.length >= 2) {
    const prevMsg = ticket.messages[ticket.messages.length - 2];
    if (prevMsg.sender === "bot") {
      delete prevMsg.options;
    }
  }

  // 2. Process bot response
  const botRes = getBotResolution(ticket.type, option);

  ticket.messages.push({
    sender: "bot",
    senderName: "🤖 BRG Helper Bot",
    message: botRes.answer,
    timestamp,
    options: botRes.options
  });

  // 3. Handle Escalation or Resolution
  if (botRes.escalate) {
    ticket.assigned = autoRouteAgent(ticket.type);
    ticket.status = "Open";
    ticket.messages.push({
      sender: "system",
      senderName: "System",
      message: `Chat transferred to ${ticket.assigned}`,
      timestamp
    });
  } else if (option === "Yes, issue is resolved") {
    ticket.status = "Resolved";
    ticket.assigned = "🤖 BRG Helper Bot";
    ticket.messages.push({
      sender: "system",
      senderName: "System",
      message: `Ticket marked as Resolved by Merchant`,
      timestamp
    });
  }

  tickets[idx] = ticket;
  saveTickets(tickets);
  
  // Custom event detail to announce escalation to admin panel
  if (botRes.escalate) {
    const event = new CustomEvent("support_ticket_escalated", { detail: { id: ticket.id, party: ticket.party } });
    window.dispatchEvent(event);
  }

  return ticket;
}

export function addTicketMessage(ticketId: string, sender: "business" | "admin", senderName: string, message: string): Ticket | null {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return null;

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timestamp = `${dateStr} ${timeStr}`;

  // If this ticket is currently assigned to the Bot, and the business types a custom message:
  // It should escalate automatically to a human member!
  const wasBot = tickets[idx].assigned.includes("🤖");
  if (sender === "business" && wasBot) {
    // 1. Log the business message
    tickets[idx].messages.push({
      sender,
      senderName,
      message,
      timestamp
    });

    // 2. Log automated bot message saying it's transferring
    tickets[idx].messages.push({
      sender: "bot",
      senderName: "🤖 BRG Helper Bot",
      message: "I didn't quite catch that. Let me transfer you directly to a support representative. Hang tight!",
      timestamp
    });

    // Remove any quick options from previous messages
    tickets[idx].messages.forEach(m => {
      if (m.sender === "bot") delete m.options;
    });

    // 3. Reassign and mark as open
    tickets[idx].assigned = autoRouteAgent(tickets[idx].type);
    tickets[idx].status = "Open";
    tickets[idx].messages.push({
      sender: "system",
      senderName: "System",
      message: `Chat transferred to ${tickets[idx].assigned}`,
      timestamp
    });
  } else {
    // Standard response flow
    tickets[idx].messages.push({
      sender,
      senderName,
      message,
      timestamp
    });

    // If business replies, make sure status is updated to Open/In Progress (not resolved/waiting)
    if (sender === "business" && (tickets[idx].status === "Resolved" || tickets[idx].status === "Closed")) {
      tickets[idx].status = "In Progress";
    }
  }

  saveTickets(tickets);
  return tickets[idx];
}

export function updateTicketStatus(ticketId: string, status: Ticket["status"], assigned?: string): Ticket | null {
  const tickets = getTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return null;

  tickets[idx].status = status;
  if (assigned !== undefined) {
    tickets[idx].assigned = assigned;
  }

  saveTickets(tickets);
  return tickets[idx];
}

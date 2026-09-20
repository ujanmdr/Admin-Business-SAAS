import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin-ui";
import { bookings, npr } from "@/lib/mock-data";
import { useBusiness } from "@/components/BusinessProvider";
import { getTickets, createTicket, addTicketMessage, handleBotInteraction, getFaqs, Ticket } from "@/lib/support";
import { LifeBuoy, Send, BookOpen, Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/business/support")({
  head: () => ({ meta: [{ title: "Support Â· BRG Suite" }] }),
  component: SupportPage,
});

export function SupportPage() {
  const { business } = useBusiness();
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Form State
  const [type, setType] = useState<string>("Booking issue");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [bookingId, setBookingId] = useState<string>("N/A");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Dialogue Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Map and filter mock bookings to the active business for selection
  const myBookings = bookings
    .map((b, index) => {
      let assignedBiz = "Aura Beauty Lounge";
      if (index % 3 === 1) assignedBiz = "Aura Wellness Spa";
      if (index % 3 === 2) assignedBiz = "Aura Academy";
      return { ...b, business: assignedBiz };
    })
    .filter((b) => b.business === business);

  const loadTickets = () => {
    const allTickets = getTickets();
    const filtered = allTickets.filter(t => t.party === business);
    setTicketsList(filtered);
    
    if (selectedTicket) {
      const updated = allTickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    loadTickets();

    const handleSync = () => {
      loadTickets();
    };

    window.addEventListener("storage_tickets_updated", handleSync);
    window.addEventListener("storage", (e) => {
      if (e.key === "brg_tickets") {
        loadTickets();
      }
    });

    return () => {
      window.removeEventListener("storage_tickets_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [business, selectedTicket?.id]);

  // Scroll chat window to bottom when a new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages?.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill out the subject and description.");
      return;
    }

    const newTicket = createTicket({
      type,
      priority,
      booking: bookingId,
      subject,
      description,
      status: "Open",
      party: business,
    });

    toast.success(`Ticket ${newTicket.id} created! Routed to support assistant.`);
    
    // Reset Form
    setSubject("");
    setDescription("");
    setBookingId("N/A");
    loadTickets();
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    // Send business reply
    const updated = addTicketMessage(selectedTicket.id, "business", business, replyMessage);
    if (updated) {
      setReplyMessage("");
      setSelectedTicket(updated);
      loadTickets();
      
      // If it was escalated in the process
      if (selectedTicket.assigned.includes("ðŸ¤–") && updated.assigned !== "ðŸ¤– BRG Helper Bot") {
        toast.info(`Ticket escalated to human representative: ${updated.assigned}`);
      } else {
        toast.success("Reply sent.");
      }
    }
  };

  const handleOptionClick = (option: string) => {
    if (!selectedTicket) return;

    const updated = handleBotInteraction(selectedTicket.id, option);
    if (updated) {
      setSelectedTicket(updated);
      loadTickets();
      
      // Alert user if escalated
      if (updated.assigned !== "ðŸ¤– BRG Helper Bot") {
        toast.info(`Escalated to Support: ${updated.assigned}`);
      } else if (option === "Yes, issue is resolved") {
        toast.success("Issue resolved successfully!");
      }
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Help Center"
        title="Support & Feedback"
        description="Raise tickets, select relevant bookings for quick review, and chat with our automated chatbot helper or admin team."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Request Form */}
        <div className="lg:col-span-2">
          <Card className="border border-border bg-card brg-card-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Raise a Support Ticket</CardTitle>
              <CardDescription>Submit your queries directly to BRG Platform Admins.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Support Category</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="border-border bg-background">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Booking issue">Booking Issue</SelectItem>
                        <SelectItem value="Payment issue">Payment Issue</SelectItem>
                        <SelectItem value="Refund request">Refund Request</SelectItem>
                        <SelectItem value="Review issue">Review Dispute</SelectItem>
                        <SelectItem value="Package issue">SaaS Plan / Package Issue</SelectItem>
                        <SelectItem value="Gift card issue">Gift Card Issue</SelectItem>
                        <SelectItem value="Business complaint">Platform Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground/80">Urgency Level</label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                      <SelectTrigger className="border-border bg-background">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low (General Inquiry)</SelectItem>
                        <SelectItem value="Medium">Medium (Normal Issue)</SelectItem>
                        <SelectItem value="High">High (Disruptive Issue)</SelectItem>
                        <SelectItem value="Urgent">Urgent (Operation Stopping)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Related Booking */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">
                    Related Booking (Optional)
                  </label>
                  <Select value={bookingId} onValueChange={setBookingId}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Select a booking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">None (Not booking related)</SelectItem>
                      {myBookings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.id} - {b.customer} ({b.service} - {npr(b.amount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    Linking a booking helps us trace logs and settle issues faster.
                  </p>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Subject</label>
                  <Input
                    placeholder="Short summary of the issue (e.g. Khalti transaction double charge)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border-border bg-background"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Detailed Description</label>
                  <Textarea
                    placeholder="Describe what happened, error codes, and steps to reproduce..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-border bg-background"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-luxe rounded-xl h-11 flex items-center justify-center gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  Submit Support Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQs sidebar deflection */}
        <div className="space-y-4">
          <Card className="border border-border bg-card brg-card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Help Center FAQs</CardTitle>
              <CardDescription>Instant answers to common merchant questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {getFaqs().map((faq, index) => {
                const isOpen = activeFAQ === index;
                return (
                  <div key={index} className="border-b border-border last:border-0 pb-2">
                    <button
                      onClick={() => setActiveFAQ(isOpen ? null : index)}
                      className="w-full text-left flex justify-between items-start py-2 text-sm font-medium hover:text-primary transition"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </button>
                    {isOpen && (
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed pl-1 border-l-2 border-primary/45">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border border-border bg-sand-soft/50 brg-card-shadow p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">Immediate Assistance</div>
            <div className="font-serif text-base mt-1.5 leading-tight">Need Urgent Call?</div>
            <p className="text-xs text-muted-foreground mt-1.5">If you have a critical billing issue or system outage, dial our helpline directly.</p>
            <div className="mt-3 text-sm font-medium font-mono text-foreground">+977 1 5520118 (Ext: 902)</div>
          </Card>
        </div>
      </div>

      {/* Tickets History Dashboard */}
      <Card className="border border-border bg-card brg-card-shadow">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">My Support Tickets</CardTitle>
          <CardDescription>Monitor resolutions and read direct replies from the admin team.</CardDescription>
        </CardHeader>
        <CardContent>
          {ticketsList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No tickets raised yet. Fill the form above to submit your first ticket.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3">Ticket</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3">Booking</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Assigned To</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsList.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-muted-foreground">{t.id}</td>
                      <td className="px-4 py-3">{t.type}</td>
                      <td className="px-4 py-3 font-medium">{t.subject}</td>
                      <td className="px-4 py-3">
                        {t.booking !== "N/A" ? (
                          <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {t.booking}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">â€”</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.created}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.assigned}</td>
                      <td className="px-4 py-3 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 border-border hover:bg-secondary"
                              onClick={() => setSelectedTicket(t)}
                            >
                              View Conversation
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
                            <DialogHeader>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-muted-foreground font-bold">{t.id}</span>
                                <StatusBadge status={t.priority} />
                                <StatusBadge status={t.status} />
                              </div>
                              <DialogTitle className="font-serif text-xl">{t.subject}</DialogTitle>
                              <DialogDescription>
                                Category: <span className="font-semibold text-foreground">{t.type}</span> 
                                {t.booking !== "N/A" && (
                                  <> | Booking: <span className="font-mono text-xs font-semibold text-primary">{t.booking}</span></>
                                )}
                              </DialogDescription>
                            </DialogHeader>

                            {/* Dialogue Chat Box */}
                            <div className="flex-1 overflow-y-auto border border-border rounded-xl bg-muted/30 p-4 space-y-4 my-4 min-h-[250px] max-h-[350px]">
                              {selectedTicket?.messages.map((m, mIdx) => {
                                const isAdmin = m.sender === "admin";
                                const isBot = m.sender === "bot";
                                return (
                                  <div
                                    key={mIdx}
                                    className={`flex flex-col max-w-[80%] ${
                                      isBot 
                                        ? "mr-auto items-start w-full" 
                                        : isAdmin 
                                          ? "mr-auto items-start" 
                                          : "ml-auto items-end"
                                    }`}
                                  >
                                    <span className="text-[10px] text-muted-foreground mb-1 px-1 flex items-center gap-1">
                                      {isBot ? (
                                        <>
                                          <Cpu className="h-3 w-3 text-primary animate-pulse" />
                                          {m.senderName}
                                        </>
                                      ) : isAdmin ? (
                                        `Admin: ${m.senderName}`
                                      ) : (
                                        `You (${m.senderName})`
                                      )}
                                    </span>
                                    <div
                                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed ${
                                        isBot
                                          ? "bg-indigo-50/70 border border-indigo-100 text-foreground rounded-tl-none font-serif"
                                          : isAdmin
                                            ? "bg-card border border-border text-foreground rounded-tl-none"
                                            : "bg-primary text-primary-foreground rounded-tr-none"
                                      }`}
                                    >
                                      {m.message}
                                    </div>
                                    
                                    {/* Action Suggestion Chips for Bot Messages */}
                                    {isBot && m.options && m.options.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2 pl-1">
                                        {m.options.map((opt, optIdx) => (
                                          <button
                                            key={optIdx}
                                            onClick={() => handleOptionClick(opt)}
                                            className="text-xs bg-background border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full transition shadow-sm font-medium"
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                                      {m.timestamp}
                                    </span>
                                  </div>
                                );
                              })}
                              <div ref={chatEndRef} />
                            </div>

                            {/* Reply Input Form */}
                            {t.status === "Closed" ? (
                              <div className="text-center py-2 bg-muted rounded-xl text-xs text-muted-foreground border border-border">
                                This ticket has been marked as Closed. Create a new ticket if the issue persists.
                              </div>
                            ) : (
                              <form onSubmit={handleSendReply} className="flex gap-2">
                                <Input
                                  placeholder={
                                    t.assigned.includes("ðŸ¤–")
                                      ? "Type a custom reply here to auto-escalate to a human representative..."
                                      : "Type your reply message to the support agent..."
                                  }
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  className="flex-1 border-border bg-background"
                                  autoFocus
                                />
                                <Button type="submit" size="sm" className="bg-primary text-primary-foreground gap-1 px-4">
                                  <Send className="h-3.5 w-3.5" />
                                  Send
                                </Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



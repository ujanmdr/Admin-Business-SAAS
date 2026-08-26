import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-header";
import { FilterBar, DataTable, StatusBadge, KpiCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LifeBuoy, Clock, CheckCircle2, AlertOctagon, Send, Bot } from "lucide-react";
import { adminUsers } from "@/lib/mock-data";
import { getTickets, addTicketMessage, updateTicketStatus, Ticket } from "@/lib/support";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  head: () => ({ meta: [{ title: "Support · BRG Admin" }] }),
  component: Support,
});

function Support() {
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");
  
  // Filter states
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Conversation Detail Dialog State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [adminStatus, setAdminStatus] = useState<Ticket["status"]>("Open");
  const [adminAssigned, setAdminAssigned] = useState("");

  const loadTickets = () => {
    const list = getTickets();
    setTicketsList(list);

    // Keep active ticket dialog in sync if open
    if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
        setAdminStatus(updated.status);
        setAdminAssigned(updated.assigned);
      }
    }
  };

  useEffect(() => {
    loadTickets();

    // Synced storage alerts for real-time simulation
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "brg_tickets") {
        loadTickets();
        
        // Find if any new ticket was added or reply made in this event
        const oldTickets = ticketsList;
        const newTickets = getTickets();
        if (newTickets.length > oldTickets.length) {
          const latest = newTickets[0];
          toast.info(`New Support Ticket received: "${latest.subject}" from ${latest.party}`);
        } else if (newTickets.length === oldTickets.length) {
          // Check if any message count increased (business reply)
          newTickets.forEach((nt) => {
            const ot = oldTickets.find(o => o.id === nt.id);
            if (ot && nt.messages.length > ot.messages.length) {
              const lastMsg = nt.messages[nt.messages.length - 1];
              if (lastMsg.sender === "business") {
                toast.info(`New reply on ${nt.id} from ${nt.party}: "${lastMsg.message.slice(0, 30)}..."`);
              }
            }
          });
        }
      }
    };

    const handleLocalSync = () => {
      loadTickets();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage_tickets_updated", handleLocalSync);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_tickets_updated", handleLocalSync);
    };
  }, [ticketsList.length, selectedTicket?.id]);

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAdminStatus(ticket.status);
    setAdminAssigned(ticket.assigned);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    // Simulate sending from logged-in admin (e.g. Rohan T.)
    const activeAdminName = "Rohan Tamang";
    const updated = addTicketMessage(selectedTicket.id, "admin", activeAdminName, replyMessage);
    
    if (updated) {
      // Also auto-update status to In Progress when admin replies, if it was Open
      let targetStatus = adminStatus;
      if (selectedTicket.status === "Open") {
        targetStatus = "In Progress";
        updateTicketStatus(selectedTicket.id, "In Progress");
      }
      
      setReplyMessage("");
      setSelectedTicket(updated);
      loadTickets();
      toast.success(`Reply sent. Ticket is now: ${targetStatus}.`);
    }
  };

  const handleApplyChanges = () => {
    if (!selectedTicket) return;
    
    const updated = updateTicketStatus(selectedTicket.id, adminStatus, adminAssigned);
    if (updated) {
      setSelectedTicket(updated);
      loadTickets();
      toast.success("Ticket details updated successfully.");
    }
  };

  // Filter Rows
  const rows = ticketsList.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(q.toLowerCase()) ||
      t.id.toLowerCase().includes(q.toLowerCase()) ||
      t.party.toLowerCase().includes(q.toLowerCase());

    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesPriority = selectedPriority === "all" || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints & Support" description="Customer and business support tickets." />
      
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Open tickets" value={ticketsList.filter((t) => t.status === "Open").length} icon={LifeBuoy} />
        <KpiCard label="In progress" value={ticketsList.filter((t) => t.status === "In Progress").length} icon={Clock} />
        <KpiCard label="Resolved (Total)" value={ticketsList.filter((t) => t.status === "Resolved" || t.status === "Closed").length} icon={CheckCircle2} />
        <KpiCard label="Urgent" value={ticketsList.filter((t) => t.priority === "Urgent" && t.status !== "Resolved" && t.status !== "Closed").length} deltaTone="bad" icon={AlertOctagon} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 brg-card-shadow">
        <div className="relative min-w-[200px] flex-1">
          <input
            placeholder="Search tickets..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        
        {/* Category Filter */}
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="h-9 w-[150px] border-border bg-background text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Booking issue">Booking issue</SelectItem>
            <SelectItem value="Payment issue">Payment issue</SelectItem>
            <SelectItem value="Refund request">Refund request</SelectItem>
            <SelectItem value="Business complaint">Business complaint</SelectItem>
            <SelectItem value="Customer complaint">Customer complaint</SelectItem>
            <SelectItem value="Review issue">Review issue</SelectItem>
            <SelectItem value="Gift card issue">Gift card issue</SelectItem>
            <SelectItem value="Package issue">Package issue</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="h-9 w-[150px] border-border bg-background text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-9 w-[150px] border-border bg-background text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Waiting">Waiting</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        getKey={(r) => r.id}
        rows={rows}
        columns={[
          { key: "id", header: "Ticket", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
          { key: "type", header: "Type", render: (r) => r.type },
          { key: "p", header: "Party", render: (r) => r.party },
          {
            key: "bk",
            header: "Booking",
            render: (r) =>
              r.booking !== "N/A" ? (
                <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                  {r.booking}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          { key: "s", header: "Subject", render: (r) => <span className="font-medium">{r.subject}</span> },
          { key: "pr", header: "Priority", render: (r) => <StatusBadge status={r.priority} /> },
          { key: "st", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "a", header: "Assigned", render: (r) => <span className="text-muted-foreground text-xs">{r.assigned}</span> },
          { key: "c", header: "Created", render: (r) => <span className="text-muted-foreground text-xs">{r.created}</span> },
          {
            key: "act",
            header: "",
            align: "right",
            render: (r) => (
              <Button size="sm" variant="outline" className="h-7 border-border" onClick={() => handleOpenTicket(r)}>
                Open
              </Button>
            ),
          },
        ]}
      />

      {/* Ticket Details & Chat Dialogue Modal */}
      {selectedTicket && (
        <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground font-bold">{selectedTicket.id}</span>
                <StatusBadge status={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
              </div>
              <DialogTitle className="font-serif text-xl">{selectedTicket.subject}</DialogTitle>
              <DialogDescription>
                From Business: <span className="font-semibold text-foreground">{selectedTicket.party}</span>
                {selectedTicket.booking !== "N/A" && (
                  <> | Booking Ref: <span className="font-mono text-xs font-semibold text-primary">{selectedTicket.booking}</span></>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Quick Resolution Controls */}
            <div className="grid grid-cols-2 gap-4 border border-border rounded-xl p-3 bg-secondary/20 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Ticket Status</label>
                <Select value={adminStatus} onValueChange={(v: any) => setAdminStatus(v)}>
                  <SelectTrigger className="h-8 border-border bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Assign Agent</label>
                <Select value={adminAssigned} onValueChange={setAdminAssigned}>
                  <SelectTrigger className="h-8 border-border bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.map((u) => (
                      <SelectItem key={u.email} value={`${u.name} (${u.role})`}>
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex justify-end pt-1">
                <Button onClick={handleApplyChanges} size="sm" className="h-7 text-xs bg-foreground text-background hover:opacity-90">
                  Apply Updates
                </Button>
              </div>
            </div>

            {/* Dialogue Conversation Logs */}
            <div className="flex-1 overflow-y-auto border border-border rounded-xl bg-muted/30 p-4 space-y-4 my-3 min-h-[220px] max-h-[300px]">
              {selectedTicket.messages.map((m, idx) => {
                const isAdmin = m.sender === "admin";
                const isBot = m.sender === "bot";
                const isSystem = m.sender === "system";
                const isOurTeam = isAdmin || isBot;

                if (isSystem) {
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center my-4 opacity-70">
                      <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        {m.message}
                      </span>
                      <span className="text-[9px] text-muted-foreground mt-1 px-1">
                        {m.timestamp}
                      </span>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[80%] ${isOurTeam ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <span className="text-[10px] text-muted-foreground mb-1 px-1 flex items-center gap-1">
                      {isBot && <Bot className="w-3 h-3 text-primary" />}
                      {isAdmin ? `You (${m.senderName})` : isBot ? "Support Bot" : `${m.senderName} (Merchant)`}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed ${
                        isAdmin
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : isBot
                          ? "bg-secondary text-secondary-foreground rounded-tr-none border border-border"
                          : "bg-card border border-border text-foreground rounded-tl-none"
                      }`}
                    >
                      <p>{m.message}</p>
                      {m.options && m.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 justify-end">
                          {m.options.map((opt, i) => (
                            <span key={i} className="text-[10px] bg-background/50 border border-border px-2 py-1 rounded-md opacity-80">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Admin Response Box */}
            {selectedTicket.status === "Closed" ? (
              <div className="text-center py-2 bg-muted rounded-xl text-xs text-muted-foreground border border-border">
                This ticket has been Closed. Re-open it using the status selector above to reply.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="flex gap-2">
                <Input
                  placeholder="Type a response to send to the merchant..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 border-border bg-background"
                  autoFocus
                />
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground gap-1 px-4">
                  <Send className="h-3.5 w-3.5" />
                  Reply
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

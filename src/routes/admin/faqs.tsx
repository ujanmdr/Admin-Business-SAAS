import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { FAQItem, getFaqs, addFaq, deleteFaq } from "@/lib/support";
import { toast } from "sonner";
import { DataTable } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQ Manager · BRG Admin" }] }),
  component: FaqManager,
});

function FaqManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Payment issue");

  const loadFaqs = () => {
    setFaqs(getFaqs());
  };

  useEffect(() => {
    loadFaqs();
    const handleSync = () => loadFaqs();
    window.addEventListener("storage_faqs_updated", handleSync);
    window.addEventListener("storage", (e) => {
      if (e.key === "brg_faqs") loadFaqs();
    });
    return () => {
      window.removeEventListener("storage_faqs_updated", handleSync);
    };
  }, []);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    addFaq({
      category: newCategory,
      question: newQuestion,
      answer: newAnswer,
    });

    setNewQuestion("");
    setNewAnswer("");
    setIsAddOpen(false);
    toast.success("FAQ added successfully");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteFaq(id);
      toast.success("FAQ deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Knowledge Base" description="Manage FAQs that power the support bot." />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddFaq} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment issue">Payment issue</SelectItem>
                    <SelectItem value="Booking issue">Booking issue</SelectItem>
                    <SelectItem value="Refund request">Refund request</SelectItem>
                    <SelectItem value="Business complaint">Business complaint</SelectItem>
                    <SelectItem value="Customer complaint">Customer complaint</SelectItem>
                    <SelectItem value="Review issue">Review issue</SelectItem>
                    <SelectItem value="Gift card issue">Gift card issue</SelectItem>
                    <SelectItem value="Package issue">Package issue</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How long do refunds take?"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer (Bot Response)</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                  placeholder="The text the bot will reply with..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save FAQ</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        getKey={(r) => r.id}
        rows={faqs}
        columns={[
          {
            key: "category",
            header: "Category",
            render: (r) => (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                {r.category}
              </span>
            ),
          },
          {
            key: "question",
            header: "Question",
            render: (r) => <span className="font-medium">{r.question}</span>,
          },
          {
            key: "answer",
            header: "Answer",
            render: (r) => <span className="text-sm text-muted-foreground line-clamp-2">{r.answer}</span>,
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (r) => (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

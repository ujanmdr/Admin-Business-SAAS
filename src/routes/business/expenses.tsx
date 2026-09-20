import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, TrendingUp, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { NewExpenseModal } from "@/components/NewExpenseModal";

export const Route = createFileRoute("/business/expenses")({
  head: () => ({ meta: [{ title: "Expenses Â· BRG Suite" }] }),
  component: ExpensesPage,
});

const INITIAL_EXPENSE_DATA = [
  { id: "EXP-1001", date: "Oct 24, 2024", category: "Rent", amount: 45000, description: "Monthly shop rent", status: "Paid" },
  { id: "EXP-1002", date: "Oct 23, 2024", category: "Office Supplies", amount: 15500, description: "Hair products restock", status: "Paid" },
  { id: "EXP-1003", date: "Oct 21, 2024", category: "Utilities", amount: 3200, description: "Electricity bill", status: "Paid" },
  { id: "EXP-1004", date: "Oct 20, 2024", category: "Marketing", amount: 5000, description: "Facebook ads", status: "Paid" },
  { id: "EXP-1005", date: "Oct 18, 2024", category: "Payroll", amount: 80000, description: "Staff salaries - mid month", status: "Paid" },
];

// More aesthetic colors
const CATEGORY_COLORS: Record<string, string> = {
  Rent: "#E6B8A2",               // Soft Terracotta
  "Office Supplies": "#A8DADC",  // Soft Teal
  Utilities: "#D4E09B",          // Soft Olive
  Marketing: "#F4A261",          // Warm Orange
  Payroll: "#E29578",            // Dusty Rose
  Maintenance: "#8A9A5B",        // Moss Green
  Miscellaneous: "#D3D3D3",      // Light Gray
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(amount);
}

export function ExpensesPage() {
  const [q, setQ] = useState("");
  const [expenses, setExpenses] = useState(INITIAL_EXPENSE_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = Object.keys(CATEGORY_COLORS).map(name => ({
    name,
    value: expenses.filter(e => e.category === name).reduce((acc, curr) => acc + curr.amount, 0)
  })).filter(c => c.value > 0);

  const totalExpenses = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Track and manage all your business expenses."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Expense
            </Button>
          </>
        }
      />

      <NewExpenseModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onAddExpense={(newExpense) => setExpenses([newExpense, ...expenses])} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-center shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1 font-semibold">Total Expenses (This Month)</div>
          <div className="font-serif text-5xl mb-4">{fmt(totalExpenses)}</div>
          
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 text-xs text-rose font-medium bg-rose-soft/50 px-2 py-1 rounded-md">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
            <div className="text-xs text-muted-foreground">Highest spend: <b>Payroll</b></div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 h-[220px] flex flex-col relative shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 font-semibold">Spending by Category</div>
          <div className="flex-1 min-h-0 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#ccc"} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search expenses by description or category..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 rounded-xl"><Filter className="h-4 w-4 mr-2" /> Categories</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-soft/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Expense ID</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.filter(e => e.description.toLowerCase().includes(q.toLowerCase()) || e.category.toLowerCase().includes(q.toLowerCase())).map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-sand-soft/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{e.id}</td>
                  <td className="px-5 py-3.5 text-xs font-medium">{e.date}</td>
                  <td className="px-5 py-3.5">
                    <span 
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: (CATEGORY_COLORS[e.category] || "#D3D3D3") + '20', 
                        color: (CATEGORY_COLORS[e.category] || "#D3D3D3").replace('#', '#9') 
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span>{e.description}</span>
                      {(e as any).hasReceipt && <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><ImageIcon className="h-3 w-3"/> Receipt attached</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                      e.status === "Pending Reimbursement" ? "bg-rose-soft/50 text-rose border-rose/20" : "bg-sage/10 text-deep-olive border-sage/20"
                    )}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-serif text-[15px] text-right">{fmt(e.amount)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-1.5 hover:bg-sand-soft transition">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {e.status === "Pending Reimbursement" && (
                          <>
                            <DropdownMenuItem 
                              className="text-primary font-medium"
                              onClick={() => setExpenses(expenses.map(x => x.id === e.id ? { ...x, status: "Paid" } : x))}
                            >
                              Mark as Reimbursed
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                        <DropdownMenuItem>View Receipt</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-header";
import { DataTable, KpiCard, SectionCard, StatusBadge } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, Lock } from "lucide-react";
import { adminUsers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/admins")({
  head: () => ({ meta: [{ title: "Admins & Roles · BRG Admin" }] }),
  component: Admins,
});

const permissions = [
  "Manage businesses","Manage customers","Manage payments","Manage settlements",
  "Manage reviews","Manage support","Manage content","Manage reports","Manage settings",
];

const roleMatrix: Record<string, boolean[]> = {
  "Super Admin":      Array(9).fill(true),
  "Operations Admin": [true,true,false,false,true,true,true,true,false],
  "Finance Admin":    [false,false,true,true,false,false,false,true,false],
  "Support Admin":    [false,true,false,false,true,true,false,false,false],
  "Content Moderator":[false,false,false,false,true,false,true,false,false],
  "Sales Admin":      [true,false,false,false,false,false,true,true,false],
};

function Admins() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Users & Roles" description="Manage internal team access and permissions."
        actions={<Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5"><UserPlus className="h-4 w-4" />Invite admin</Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total admins" value={adminUsers.length} icon={ShieldCheck} />
        <KpiCard label="Active" value={adminUsers.filter(a=>a.status==="Active").length} icon={ShieldCheck} />
        <KpiCard label="Roles" value={Object.keys(roleMatrix).length} icon={ShieldCheck} />
        <KpiCard label="2FA enabled" value="100%" icon={Lock} />
      </div>

      <DataTable getKey={(r)=>r.email} rows={adminUsers} columns={[
        { key: "n", header: "Name", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div> },
        { key: "r", header: "Role", render: (r) => <StatusBadge status={r.role === "Super Admin" ? "Featured" : "Active"} /> },
        { key: "rn", header: "", render: (r) => <span className="text-sm text-muted-foreground">{r.role}</span> },
        { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { key: "la", header: "Last active", render: (r) => <span className="text-muted-foreground">{r.lastActive}</span> },
        { key: "act", header: "", align:"right", render: () => (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" className="h-7 border-border">Edit</Button>
            <Button size="sm" variant="outline" className="h-7 border-destructive/40 text-destructive">Suspend</Button>
          </div>
        )},
      ]} />

      <SectionCard title="Role permission matrix" description="Default permissions for each admin role">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Permission</th>
                {Object.keys(roleMatrix).map(r => (
                  <th key={r} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p} className="border-b border-border/60">
                  <td className="py-2.5 font-medium">{p}</td>
                  {Object.values(roleMatrix).map((row, j) => (
                    <td key={j} className="py-2.5 text-center">
                      {row[i] ? <span className="inline-block h-2 w-2 rounded-full bg-primary" /> : <span className="inline-block h-2 w-2 rounded-full bg-border" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

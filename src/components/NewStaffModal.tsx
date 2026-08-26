import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Users, Mail, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Staff, StaffRole } from "@/lib/staff-data";
import { cn } from "@/lib/utils";

const ROLES: StaffRole[] = [
  "Senior Stylist", "Nail Artist", "Makeup Artist", "Bridal Specialist",
  "Skin Therapist", "Massage Therapist", "Dental Consultant", "Trainer", "Receptionist",
];

const BRANCHES = ["Jhamsikhel", "Lazimpat", "Baneshwor", "Patan", "Thamel", "Pokhara"];

const SMART_SERVICES: Record<string, string[]> = {
  "Senior Stylist": ["Signature Balayage", "Keratin Treatment", "Haircut", "Hair Coloring"],
  "Nail Artist": ["Gel Extensions", "Manicure", "Pedicure", "Nail Art"],
  "Makeup Artist": ["Party Makeup", "Bridal Makeup", "Photoshoot Makeup"],
  "Bridal Specialist": ["Bridal Package", "Pre-bridal Care"],
  "Skin Therapist": ["HydraFacial", "Chemical Peel", "Dermaplaning"],
  "Massage Therapist": ["Deep Tissue", "Aromatherapy", "Swedish Massage"],
};

export function NewStaffModal({ 
  open, 
  onOpenChange,
  onAddStaff
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  onAddStaff: (s: Staff) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Senior Stylist" as StaffRole,
    branch: "Jhamsikhel",
    experienceYears: "3",
    baseSalary: "25000",
    commissionRate: "15",
    specialisations: [] as string[],
  });

  const availableServices = SMART_SERVICES[formData.role] || ["Consultation", "General Service"];

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (service: string) => {
    setFormData(prev => {
      const isSelected = prev.specialisations.includes(service);
      if (isSelected) {
        return { ...prev, specialisations: prev.specialisations.filter(s => s !== service) };
      } else {
        return { ...prev, specialisations: [...prev.specialisations, service] };
      }
    });
  };

  const handleSave = () => {
    const newStaff: Staff = {
      id: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name || "New Staff",
      role: formData.role,
      branch: formData.branch,
      experienceYears: Number(formData.experienceYears) || 0,
      baseSalary: Number(formData.baseSalary) || 0,
      advancesTaken: 0,
      commissionRate: Number(formData.commissionRate) || 0,
      specialisations: formData.specialisations.length ? formData.specialisations : ["General"],
      status: "Available",
      rating: 5.0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      nextSlot: "Today, 10:00 AM",
      utilization: 0,
      bio: "New staff member",
      email: formData.email,
      phone: "+977 ",
      joinedYear: new Date().getFullYear(),
      permissions: [],
    };
    onAddStaff(newStaff);
    onOpenChange(false);
    
    setTimeout(() => {
      setFormData({
        name: "", email: "", role: "Senior Stylist", branch: "Jhamsikhel", experienceYears: "3", baseSalary: "25000", commissionRate: "15", specialisations: []
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-background">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sand-soft grid place-items-center text-deep-olive">
              <Users className="h-4 w-4" />
            </div>
            Onboard New Staff
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Create their profile, assign services, and send them an invite to the staff app.
          </p>
        </DialogHeader>

        <div className="py-2 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Full Name</label>
              <Input className="mt-1.5" placeholder="e.g. Ayesha Shrestha" value={formData.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Mail className="h-3 w-3" />Email (For Invite)
              </label>
              <Input className="mt-1.5" placeholder="ayesha@example.com" value={formData.email} onChange={e => update("email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Role</label>
              <select 
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                value={formData.role}
                onChange={e => {
                  update("role", e.target.value);
                  update("specialisations", []); // Reset specializations when role changes
                }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Branch</label>
              <select 
                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                value={formData.branch}
                onChange={e => update("branch", e.target.value)}
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium">Experience (Years)</label>
              <Input type="number" className="mt-1.5" placeholder="3" value={formData.experienceYears} onChange={e => update("experienceYears", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Base Salary</label>
              <Input type="number" className="mt-1.5" placeholder="25000" value={formData.baseSalary} onChange={e => update("baseSalary", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Commission Rate (%)</label>
              <Input type="number" className="mt-1.5" placeholder="15" value={formData.commissionRate} onChange={e => update("commissionRate", e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-sand-soft/30 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <LinkIcon className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Smart Service Linking</div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Select the services they can perform based on their role ({formData.role}). This will make them available in the booking calendar for these services.</p>
            
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => {
                const isSelected = formData.specialisations.includes(service);
                return (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5",
                      isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-white"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="h-3 w-3" />}
                    {service}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={handleSave}>
            <Mail className="h-4 w-4 mr-2" />Save & Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

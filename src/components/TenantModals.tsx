import { useState } from "react";
import { 
  Building, MapPin, Store, ChevronRight 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { mockBusinesses, mockBranches, addBusiness, addBranch } from "@/lib/tenant-data";

export function TenantModals({ 
  openBusiness, setOpenBusiness, 
  openBranch, setOpenBranch 
}: { 
  openBusiness: boolean, setOpenBusiness: (v: boolean) => void,
  openBranch: boolean, setOpenBranch: (v: boolean) => void
}) {
  const [bName, setBName] = useState("");
  const [bCategory, setBCategory] = useState("");
  const [brName, setBrName] = useState("");
  const [brLoc, setBrLoc] = useState("");
  const [brBiz, setBrBiz] = useState(mockBusinesses[0]?.id || "");

  const handleAddBusiness = () => {
    if (bName) {
      addBusiness({ id: 'b' + Date.now(), name: bName, category: bCategory || 'Other' });
      setOpenBusiness(false);
      setBName("");
      setBCategory("");
    }
  };

  const handleAddBranch = () => {
    if (brName && brBiz) {
      addBranch({ id: 'br' + Date.now(), businessId: brBiz, name: brName, location: brLoc });
      setOpenBranch(false);
      setBrName("");
      setBrLoc("");
    }
  };

  return (
    <>
      <Dialog open={openBusiness} onOpenChange={setOpenBusiness}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Business Name</Label>
              <Input placeholder="e.g. Aura Wellness Spa" value={bName} onChange={e => setBName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input placeholder="e.g. Hair Salon, Dental" value={bCategory} onChange={e => setBCategory(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBusiness}>Create Business</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openBranch} onOpenChange={setOpenBranch}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Parent Business</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={brBiz} onChange={e => setBrBiz(e.target.value)}>
                {mockBusinesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Branch Name</Label>
              <Input placeholder="e.g. Patan Branch" value={brName} onChange={e => setBrName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Lalitpur" value={brLoc} onChange={e => setBrLoc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBranch}>Create Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

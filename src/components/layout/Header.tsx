import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu, Plus, Search, MapPin, Building2, LayoutDashboard, ShieldAlert, Scissors, Building } from "lucide-react";
import { useTenantStore } from "@/store/tenant-store";
import { mockBusinesses, mockBranches } from "@/lib/tenant-data";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { NewBookingModal } from "@/components/NewBookingModal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { TenantModals } from "@/components/TenantModals";
import { useAuth } from "@/lib/auth";
import { useRouterState } from "@tanstack/react-router";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isStaff = pathname.startsWith("/staff");
  const { user, isReceptionist, logout } = useAuth();
  
  const { activeBusinessId, activeBranchId, setActiveBusiness, setActiveBranch } = useTenantStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [openBizModal, setOpenBizModal] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);

  useEffect(() => {
    const handleOpenBooking = () => setBookingOpen(true);
    window.addEventListener("open-new-booking", handleOpenBooking);
    return () => window.removeEventListener("open-new-booking", handleOpenBooking);
  }, []);

  const activeBiz = mockBusinesses.find(b => b.id === activeBusinessId) || mockBusinesses[0];
  const activeBr = activeBranchId === 'OVERALL' ? null : mockBranches.find(b => b.id === activeBranchId);
  const currentLabel = activeBr ? activeBr.name : 'Overall Dashboard';
  
  const isSuspended = activeBiz?.status === 'suspended';

  const staffDisplayName = user?.name || (isReceptionist ? "Priya (Front Desk)" : "Anisha");
  const staffDisplayRole = isReceptionist ? "Receptionist" : "Senior Stylist";
  const initials = staffDisplayName
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {isSuspended && !isStaff && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium sticky top-0 z-40">
          <ShieldAlert className="h-4 w-4" />
          Account Suspended: Please update billing. System is in Read-Only mode.
        </div>
      )}
      <header className={`sticky z-30 bg-background/85 backdrop-blur border-b border-border ${isSuspended && !isStaff ? 'top-9' : 'top-0'}`}>
        <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-muted">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Business / Branch Display for Staff vs Owner */}
          {isStaff ? (
            <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
                {isReceptionist ? <Building className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
              </div>
              <div className="text-left leading-tight">
                <div className="font-medium text-xs text-foreground">{activeBiz?.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3 inline text-primary" /> Jhamsikhel Branch
                </div>
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center font-serif">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-medium">{activeBiz?.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 inline" /> {currentLabel}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Your Empire</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {mockBusinesses.map((b) => {
                  const bBranches = mockBranches.filter(br => br.businessId === b.id);
                  return (
                    <DropdownMenuSub key={b.id}>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{b.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-48">
                        <DropdownMenuItem onClick={() => { setActiveBusiness(b.id); setActiveBranch('OVERALL'); }}>
                          <LayoutDashboard className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">Overall Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Branches</DropdownMenuLabel>
                        {bBranches.map(br => (
                          <DropdownMenuItem key={br.id} onClick={() => { setActiveBusiness(b.id); setActiveBranch(br.id); }}>
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {br.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  );
                })}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenBizModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Business
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenBranchModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add New Branch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex-1 max-w-md ml-2 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder={isStaff ? "Search today's bookings, clients..." : "Search bookings, customers, services..."}
                className="w-full rounded-xl bg-card border border-border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setBookingOpen(true)} 
              disabled={isSuspended && !isStaff}
              className={`hidden sm:inline-flex items-center gap-2 rounded-xl text-primary-foreground px-3.5 py-2 text-sm font-medium transition ${
                isSuspended && !isStaff ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' : 'bg-primary shadow-luxe hover:opacity-95'
              }`}
            >
              <Plus className="h-4 w-4" /> New Booking
            </button>
            <ThemeSwitcher />
            <button className="relative h-10 w-10 grid place-items-center rounded-xl border border-border bg-card hover:bg-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-border bg-card pl-1 pr-3 py-1 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {isStaff ? initials : "PS"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-sm font-medium">
                    {isStaff ? staffDisplayName : "Pratiksha S."}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isStaff ? staffDisplayRole : "Owner"}
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {isStaff ? `${staffDisplayName} (${staffDisplayRole})` : "Pratiksha Shrestha"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                {!isStaff && <DropdownMenuItem>Account settings</DropdownMenuItem>}
                {!isStaff && <DropdownMenuItem>Billing</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={logout}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <NewBookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
        {!isStaff && (
          <TenantModals 
            openBusiness={openBizModal} setOpenBusiness={setOpenBizModal}
            openBranch={openBranchModal} setOpenBranch={setOpenBranchModal}
          />
        )}
      </header>
    </>
  );
}


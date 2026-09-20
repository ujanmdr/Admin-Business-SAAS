import { Outlet, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";

export function StaffAppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex bg-ivory-grain">
      {/* Tablet & Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-[72px] md:pb-0">
        <Header />
        <main key={pathname} className="flex-1 px-3 sm:px-4 lg:px-8 py-6 lg:py-10 fade-rise">
          <Outlet />
        </main>
      </div>

      {/* Mobile-Only Bottom Navigation (< 768px) */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

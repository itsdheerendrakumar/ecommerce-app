import { AdminPartnerSidebar } from "@/components/AdminPartnerSidebar";
import { ProtectedRouteProvider } from "@/components/providers/ProtectedRouteProvider";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRouteProvider>
      <SidebarProvider>
        <AdminPartnerSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRouteProvider>
  );
}

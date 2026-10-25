import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRouteProvider } from "@/components/providers/ProtectedRouteProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRouteProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ProtectedHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRouteProvider>
  );
}

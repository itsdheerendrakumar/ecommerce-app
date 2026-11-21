"use client";

import React, { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { ProtectedRouteProvider } from "@/components/providers/ProtectedRouteProvider";

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Auth pages: /login, /signup have their own dedicated AuthLayout
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  // Admin routes: protected, admin sidebar and protected header
  if (pathname.startsWith("/admin")) {
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

  // Delivery partner routes: protected, delivery sidebar and protected header
  if (pathname.startsWith("/delivery")) {
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

  // Customer account routes: protected (requires authentication), customer sidebar and store header
  if (pathname.startsWith("/customer")) {
    return (
      <ProtectedRouteProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <StoreHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRouteProvider>
    );
  }

  // Storefront & public shopping routes: /, /shop, /cart, /product/*
  // Accessible to all users (guests & authenticated customers alike), with consistent customer sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <StoreHeader />
        <main className="flex flex-1 flex-col min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

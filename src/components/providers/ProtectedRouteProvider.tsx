"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProtectedRouteProvider({ children }: { children: ReactNode }) {
  const { profileQuery, user: meUser } = useMe();
  const { user: storeUser, setUser, clearUser } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  const user = meUser || profileQuery.data?.user || storeUser;
  const role = user?.role;

  // Sync profile data to Zustand store
  useEffect(() => {
    const fetchedUser = meUser || profileQuery.data?.user;
    if (fetchedUser) {
      setUser(fetchedUser);
    } else if (profileQuery.isError) {
      clearUser();
    }
  }, [meUser, profileQuery.data?.user, profileQuery.isError, setUser, clearUser]);

  useEffect(() => {
    if (profileQuery.isError || (profileQuery.isSuccess && !user)) {
      router.replace("/login");
    }
  }, [profileQuery.isError, profileQuery.isSuccess, user, router]);

  if (profileQuery.isLoading && !storeUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (profileQuery.isError && !storeUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // const isAdminRoute = pathname.startsWith("/admin");
  // if (isAdminRoute && role !== "admin") {
  //   return (
  //     <AccessDenied
  //       userRole={role || "customer"}
  //       targetPortal="Admin Console"
  //       redirectPath={role === "delivery-partner" ? "/delivery" : "/customer"}
  //     />
  //   );
  // }

  // const isDeliveryRoute = pathname.startsWith("/delivery");
  // if (isDeliveryRoute && role !== "delivery-partner") {
  //   return (
  //     <AccessDenied
  //       userRole={role || "customer"}
  //       targetPortal="Delivery Hub"
  //       redirectPath={role === "admin" ? "/admin" : "/customer"}
  //     />
  //   );
  // }

  // const isCustomerRoute = pathname.startsWith("/customer");
  // if (isCustomerRoute && role === "admin") {
  //   return <AccessDenied userRole="admin" targetPortal="Customer Portal" redirectPath="/admin" />;
  // }
  // if (isCustomerRoute && role === "delivery-partner") {
  //   return (
  //     <AccessDenied
  //       userRole="delivery-partner"
  //       targetPortal="Customer Portal"
  //       redirectPath="/delivery"
  //     />
  //   );
  // }

  return <>{children}</>;
}

function AccessDenied({
  userRole,
  targetPortal,
  redirectPath = "/customer",
}: {
  userRole: string;
  targetPortal: string;
  redirectPath?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(redirectPath);
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, redirectPath]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-6 shadow-xs">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Access Restricted</h2>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        Your account role (<span className="font-semibold capitalize text-foreground">{userRole}</span>) is not permitted to view the {targetPortal}.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Redirecting you to your portal shortly...
      </p>
      <Button
        className="mt-6 rounded-full px-6 font-semibold"
        onClick={() => router.replace(redirectPath)}
      >
        Go to Dashboard Now
      </Button>
    </div>
  );
}

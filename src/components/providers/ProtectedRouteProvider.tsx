"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";

export function ProtectedRouteProvider({ children }: { children: ReactNode }) {
  const { profileQuery, user } = useMe();
  const { setUser, clearUser } = useAppStore();
  const router = useRouter();

  // Sync profile data to Zustand store
  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (profileQuery.isError) {
      clearUser();
    }
  }, [user, profileQuery.isError, setUser, clearUser]);

  // If unauthenticated, redirect to /
  useEffect(() => {
    if (profileQuery.isError || (profileQuery.isSuccess && !user)) {
      router.replace("/");
    }
  }, [profileQuery.isError, profileQuery.isSuccess, user, router]);

  // Strict conditional rendering: do NOT render protected content until user is verified!
  if (profileQuery.isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

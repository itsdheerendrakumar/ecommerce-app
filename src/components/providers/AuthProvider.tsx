"use client";

import { ReactNode, useEffect } from "react";
import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { profileQuery, user } = useMe();
  const { setUser, clearUser } = useAppStore();

  // Sync user state into Zustand store on app startup
  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (profileQuery.isError) {
      clearUser();
    }
  }, [user, profileQuery.isError, setUser, clearUser]);

  return <>{children}</>;
}

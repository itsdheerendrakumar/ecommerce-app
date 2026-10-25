"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/store/useAppStore";
import { getInitials } from "@/lib/utils";

export function ProtectedHeader() {
  const user = useAppStore((state) => state.user);
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div
              title={user.name}
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs ring-1 ring-primary/20 overflow-hidden"
            >
              <span className="tracking-tighter select-none">{initials}</span>
            </div>

            <span className="text-sm font-semibold text-foreground">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

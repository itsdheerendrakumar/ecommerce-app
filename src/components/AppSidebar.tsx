"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import {
  SIDEBAR_ROLE_CONFIGS,
  NavItem,
} from "@/constants/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/client-api/auth";
import { useRouter } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const clearUser = useAppStore(state => state.clearUser)
  const router = useRouter();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.clear();
      clearUser()
      router.push("/login")
    }
  })
  const role = user?.role;
  const { cart, wishlist } = useAppStore();
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = wishlist ? wishlist.length : 0;

  const isDeliveryPartner = role === "delivery-partner";
  const isAdmin = role === "admin";
  const isCustomer = role === "customer" || (!isAdmin && !isDeliveryPartner);

  const activeConfig = isAdmin
    ? SIDEBAR_ROLE_CONFIGS.admin
    : isDeliveryPartner
      ? SIDEBAR_ROLE_CONFIGS["delivery-partner"]
      : SIDEBAR_ROLE_CONFIGS.customer;

  const HeaderIcon = activeConfig.headerIcon;

  const isItemActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    if (path === "/delivery") {
      return pathname === "/delivery";
    }
    if (path === "/customer") {
      return pathname === "/customer";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs">
            <HeaderIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm truncate">{activeConfig.headerTitle}</span>
            <span className="text-[11px] text-muted-foreground capitalize truncate">
              {activeConfig.headerSubtitle}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{activeConfig.sectionLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            {profileQuery.isLoading ? (
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <SidebarMenu>
                {activeConfig.items.map((item: NavItem) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.path);

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.name}
                        render={<Link href={item.path} />}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                      {isCustomer && item.badge === "cart" && cartCount > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-primary text-primary-foreground font-bold text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center">
                          {cartCount}
                        </SidebarMenuBadge>
                      )}
                      {isCustomer && item.badge === "wishlist" && wishlistCount > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-rose-500 text-white font-bold text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center">
                          {wishlistCount}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user ? (
          <Button className="bg-destructive" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            <LogOut /> Logout
          </Button>
        ) : (
          <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {profileQuery.isLoading ? "Loading..." : "Not logged in"}
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

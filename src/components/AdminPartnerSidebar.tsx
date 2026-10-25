"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  History,
  DollarSign,
  User,
  Shield,
  Truck,
} from "lucide-react";

import { useMe } from "@/hooks/useMe";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from "@/components/ui/sidebar";

const adminNavItems = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

const deliveryNavItems = [
  { name: "Active Deliveries", path: "/delivery", icon: LayoutDashboard },
  { name: "Order History", path: "/delivery/history", icon: History },
  { name: "Earnings", path: "/delivery/earnings", icon: DollarSign },
  { name: "Profile", path: "/delivery/profile", icon: User },
];

export function AdminPartnerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const role = user?.role;

  const isDeliveryPartner = role === "delivery-partner";

  const isItemActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    if (path === "/delivery") {
      return pathname === "/delivery";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const currentNavItems = isDeliveryPartner ? deliveryNavItems : adminNavItems;
  const sectionLabel = isDeliveryPartner ? "Rider App" : "Admin Console";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs">
            {isDeliveryPartner ? (
              <Truck className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm truncate">
              {isDeliveryPartner ? "Delivery Hub" : "Admin Portal"}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize truncate">
              {role ? role.replace("-", " ") : (isDeliveryPartner ? "delivery partner" : "admin")}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            {profileQuery.isLoading ? (
              <SidebarMenu>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <SidebarMenu>
                {currentNavItems.map((item) => {
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
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-xs text-foreground">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : user.email
                ? user.email.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-medium text-foreground">
                {user.name || "User"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
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

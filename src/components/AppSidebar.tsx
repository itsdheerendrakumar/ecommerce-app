"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import {
  NavItem,
  NavSection,
  getSidebarRoleConfig,
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { LogOut, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/client-api/auth";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const storeUser = useAppStore((state) => state.user);
  const clearUser = useAppStore((state) => state.clearUser);
  const router = useRouter();
  const { profileQuery } = useMe();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rawUser = storeUser ?? profileQuery.data?.user ?? null;
  const user = mounted ? rawUser : null;
  const isAuthenticated = !!user;
  const role = user?.role;

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.clear();
      clearUser();
      window.location.href = "/login";
    },
  });

  const { cart, wishlist } = useAppStore();
  const cartCount = mounted && cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = mounted && wishlist ? wishlist.length : 0;

  // Smartly resolve sidebar configuration based on auth status and role
  // Non-logged-in users will automatically receive the guest configuration with protected routes excluded
  const activeConfig = getSidebarRoleConfig(role, isAuthenticated);
  const isCustomerOrGuest = !role || role === "customer";
  const HeaderIcon = activeConfig.headerIcon;

  // Smart active route matching
  const isItemActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    if (path === "/shop") {
      return pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/product/");
    }
    if (path === "/cart") {
      return pathname === "/cart" || pathname === "/customer/checkout";
    }
    if (path === "/customer") {
      return pathname === "/customer";
    }
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    if (path === "/admin/users") {
      return pathname === "/admin/users" || pathname === "/admin/customers";
    }
    if (path === "/delivery") {
      return pathname === "/delivery";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.path);

    // Dynamic tooltip text for collapsed icon rail
    let tooltipText = item.name;
    if (isCustomerOrGuest && item.badge === "cart" && cartCount > 0) {
      tooltipText = `${item.name} (${cartCount} ${cartCount === 1 ? "item" : "items"})`;
    } else if (isCustomerOrGuest && item.badge === "wishlist" && wishlistCount > 0) {
      tooltipText = `${item.name} (${wishlistCount} saved)`;
    }

    return (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={tooltipText}
          render={<Link href={item.path} />}
          className={cn(
            "transition-all duration-150",
            isActive &&
              "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 hover:text-primary-foreground"
          )}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
            {/* Visual badge indicators in collapsed icon mode */}
            {isCustomerOrGuest && item.badge === "cart" && cartCount > 0 && (
              <span className="hidden group-data-[collapsible=icon]:flex absolute -top-1.5 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold items-center justify-center ring-2 ring-sidebar">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
            {isCustomerOrGuest && item.badge === "wishlist" && wishlistCount > 0 && (
              <span className="hidden group-data-[collapsible=icon]:flex absolute -top-1.5 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold items-center justify-center ring-2 ring-sidebar">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </div>
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>

        {/* Badges in expanded mode */}
        {isCustomerOrGuest && item.badge === "cart" && cartCount > 0 && (
          <SidebarMenuBadge
            className={cn(
              "rounded-full font-bold text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center transition-colors",
              isActive
                ? "bg-primary-foreground text-primary"
                : "bg-primary text-primary-foreground"
            )}
          >
            {cartCount}
          </SidebarMenuBadge>
        )}
        {isCustomerOrGuest && item.badge === "wishlist" && wishlistCount > 0 && (
          <SidebarMenuBadge
            className={cn(
              "rounded-full font-bold text-[10px] h-5 min-w-5 px-1.5 flex items-center justify-center transition-colors",
              isActive
                ? "bg-white text-rose-600"
                : "bg-rose-500 text-white"
            )}
          >
            {wishlistCount}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );
  };

  const avatarUrl = user?.profile_picture || user?.image || user?.avatar;
  const initials = getInitials(user?.name || user?.email);

  // Determine top header link target based on role
  const headerHref =
    role === "admin"
      ? "/admin"
      : role === "delivery-partner"
        ? "/delivery"
        : "/";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-2">
        <Link
          href={headerHref}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors group"
          title={`${activeConfig.headerTitle} - Home`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs group-hover:scale-105 transition-transform">
            <HeaderIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span suppressHydrationWarning className="font-semibold text-sm truncate leading-tight">
              {activeConfig.headerTitle}
            </span>
            <span suppressHydrationWarning className="text-[11px] text-muted-foreground capitalize truncate leading-tight mt-0.5">
              {activeConfig.headerSubtitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {activeConfig.sections && activeConfig.sections.length > 0 ? (
          // Grouped navigation (Customer or Guest)
          activeConfig.sections.map((section: NavSection) => (
            <SidebarGroup key={section.label} className="py-1">
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item: NavItem) => renderNavItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        ) : (
          // Flat navigation (Admin or Delivery Partner)
          <SidebarGroup>
            <SidebarGroupLabel>{activeConfig.sectionLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activeConfig.items.map((item: NavItem) => renderNavItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {user ? (
          <div className="flex flex-col gap-2">
            {/* Authenticated User Profile Summary */}
            <Link
              href={
                role === "admin"
                  ? "/admin/settings"
                  : role === "delivery-partner"
                    ? "/delivery/profile"
                    : "/customer/profile"
              }
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              title={user.name || user.email}
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="tracking-tighter select-none">{initials}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-xs text-foreground truncate">
                  {user.name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 justify-start text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
              <span className="ml-2 truncate group-data-[collapsible=icon]:hidden">
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </span>
            </Button>
          </div>
        ) : (
          /* Unauthenticated Guest Sign In Button */
          <Link href="/login" className="w-full">
            <Button
              size="sm"
              className="w-full h-8 justify-start text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              title="Sign In / Register"
            >
              <LogIn className="h-3.5 w-3.5 shrink-0 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
              <span className="ml-2 truncate group-data-[collapsible=icon]:hidden">Sign In</span>
            </Button>
          </Link>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

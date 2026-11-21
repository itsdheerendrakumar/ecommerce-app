"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppStore } from "@/store/useAppStore";
import { getInitials, cn } from "@/lib/utils";
import { Heart, ShoppingCart, LogIn, LayoutDashboard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function StoreHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { cart, wishlist, user: storeUser } = useAppStore();
  const user = mounted ? storeUser : null;
  const role = user?.role;

  const cartCount = mounted && cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = mounted && wishlist ? wishlist.length : 0;
  const initials = getInitials(user?.name || user?.email);
  const avatarUrl = user?.profile_picture || user?.image || user?.avatar;

  const isCartActive = pathname === "/cart" || pathname === "/customer/checkout";
  const isWishlistActive = pathname === "/customer/wishlist";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-extrabold text-base tracking-tight hidden sm:inline">
            StoreFront<span className="text-primary">.</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Portal Switch for Admin */}
        {role === "admin" && (
          <Link href="/admin">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs font-semibold border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1" /> Admin
            </Button>
          </Link>
        )}

        {/* Quick Portal Switch for Delivery Partner */}
        {role === "delivery-partner" && (
          <Link href="/delivery">
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs font-semibold border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <Truck className="w-3.5 h-3.5 mr-1" /> Courier Hub
            </Button>
          </Link>
        )}

        {/* Wishlist Button */}
        <Link href={user ? "/customer/wishlist" : "/login"}>
          <Button
            variant={isWishlistActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "relative rounded-full h-8 px-2.5 sm:px-3 text-xs font-semibold transition-all",
              isWishlistActive && "bg-primary text-primary-foreground shadow-xs"
            )}
          >
            <Heart className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center",
                  isWishlistActive ? "bg-white text-rose-600" : "bg-rose-500 text-white"
                )}
              >
                {wishlistCount}
              </span>
            )}
          </Button>
        </Link>

        {/* Cart Button */}
        <Link href="/cart">
          <Button
            variant={isCartActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "relative rounded-full h-8 px-2.5 sm:px-3 text-xs font-semibold transition-all",
              isCartActive && "bg-primary text-primary-foreground shadow-xs"
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center",
                  isCartActive ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                )}
              >
                {cartCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User Profile / Sign In */}
        {user ? (
          <Link href="/customer" className="flex items-center gap-2 group pl-1">
            <div
              title={user.name || user.email}
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20 overflow-hidden group-hover:scale-105 transition-transform"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name || "User Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="tracking-tighter select-none">{initials}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-foreground hidden md:inline truncate max-w-[120px]">
              {user.name ? user.name.split(" ")[0] : "Account"}
            </span>
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm" className="rounded-full h-8 px-3.5 text-xs font-bold shadow-xs">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

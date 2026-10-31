"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, User as UserIcon, LayoutDashboard, Truck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getInitials, cn } from "@/lib/utils";

export function PublicNavbar() {
  const pathname = usePathname();
  // Read state directly from Zustand
  const { cart, wishlist, user } = useAppStore();
  const role = user?.role;

  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = wishlist ? wishlist.length : 0;
  const initials = getInitials(user?.name || user?.email);

  const isShopActive = pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/product/");
  const isWishlistActive = pathname === "/customer/wishlist";
  const isCartActive = pathname === "/cart";
  const isAdminActive = pathname.startsWith("/admin");
  const isDeliveryActive = pathname.startsWith("/delivery");
  const isCustomerActive = pathname.startsWith("/customer") && !isWishlistActive;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-sm">
            S
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            StoreFront<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/shop">
            <Button
              variant={isShopActive ? "default" : "ghost"}
              className={cn(
                "rounded-full text-sm font-semibold transition-all",
                isShopActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Shop Catalog
            </Button>
          </Link>

          {/* Wishlist Link */}
          <Link href={user ? "/customer/wishlist" : "/login"}>
            <Button
              variant={isWishlistActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "relative rounded-full px-2.5 sm:px-3 transition-all",
                isWishlistActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span
                  className={cn(
                    "ml-1 sm:ml-1.5 rounded-full text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center transition-colors",
                    isWishlistActive
                      ? "bg-white text-rose-600"
                      : "bg-rose-500 text-white"
                  )}
                >
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Cart Link */}
          <Link href="/cart">
            <Button
              variant={isCartActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "relative rounded-full px-2.5 sm:px-3 transition-all",
                isCartActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShoppingCart className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {cartCount > 0 && (
                <span
                  className={cn(
                    "ml-1 sm:ml-1.5 rounded-full text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center transition-colors",
                    isCartActive
                      ? "bg-white text-primary"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Account Button with Initials Avatar */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              {role === "admin" ? (
                <Link href="/admin">
                  <Button
                    size="sm"
                    className={cn(
                      "rounded-full px-3.5 text-xs font-bold transition-all",
                      isAdminActive
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 hover:bg-primary/90"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              ) : role === "delivery-partner" ? (
                <Link href="/delivery">
                  <Button
                    size="sm"
                    className={cn(
                      "rounded-full px-3.5 text-xs font-bold transition-all",
                      isDeliveryActive
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 hover:bg-primary/90"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    <Truck className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Courier Hub</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/customer">
                  <Button
                    size="sm"
                    className={cn(
                      "rounded-full px-3.5 text-xs font-bold transition-all",
                      isCustomerActive
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 hover:bg-primary/90"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    <UserIcon className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">{user.name ? user.name.split(" ")[0] : "Account"}</span>
                  </Button>
                </Link>
              )}

              {/* Avatar circle with initials */}
              <Link
                href={role === "admin" ? "/admin" : role === "delivery-partner" ? "/delivery" : "/customer"}
                title={user.name || user.email}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-[11px] ring-2 hover:scale-105 transition-transform overflow-hidden",
                    (role === "admin" ? isAdminActive : role === "delivery-partner" ? isDeliveryActive : isCustomerActive)
                      ? "bg-primary text-primary-foreground ring-primary shadow-xs"
                      : "bg-primary/10 text-primary ring-primary/20"
                  )}
                >
                  {user.image || user.avatar ? (
                    <img
                      src={user.image || user.avatar}
                      alt={user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="rounded-full px-4 text-xs font-bold">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

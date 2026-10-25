"use client";

import Link from "next/link";
import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, PackageCheck, Heart, User, ArrowRight } from "lucide-react";

export default function CustomerDashboardPage() {
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const { orders, wishlist, cart } = useAppStore();

  const myOrders = orders.filter((o) => o.customerId === user?._id || o.customerId === "1");
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, <span className="font-semibold text-foreground">{user?.name || "Shopper"}</span>! Manage your orders, wishlist, and account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-2xl border shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">My Orders</CardTitle>
            <PackageCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-black text-foreground">{myOrders.length}</p>
            <Link href="/customer/orders">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-xs font-semibold text-primary hover:underline">
                View Order History <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Saved Wishlist</CardTitle>
            <Heart className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-black text-foreground">{wishlist.length}</p>
            <Link href="/customer/wishlist">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-xs font-semibold text-primary hover:underline">
                View Saved Items <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs hover:border-primary/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Cart Items</CardTitle>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-black text-foreground">{cartCount}</p>
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-xs font-semibold text-primary hover:underline">
                Open Cart <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border bg-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">Explore Our Latest Collection</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Discover newly added electronics, wearables, and lifestyle gear.</p>
        </div>
        <Link href="/shop">
          <Button className="rounded-full px-6 font-semibold">
            Browse Store <ShoppingBag className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

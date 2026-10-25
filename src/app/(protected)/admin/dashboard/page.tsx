"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Package } from "lucide-react";

export default function AdminPage() {
  const { orders, products, updateOrderStatus } = useAppStore();

  const assignToRider = (orderId: string) => {
    updateOrderStatus(orderId, "out_for_delivery", "3");
  };

  const totalSales = orders.reduce((a, b) => a + b.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform analytics, store metrics, and order fulfillment dispatch.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-primary">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">{orders.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Products</CardTitle>
            <Package className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">{products.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold tracking-tight">Recent Orders Queue</h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="rounded-2xl border shadow-xs">
              <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center p-5 gap-4">
                <div>
                  <p className="font-bold text-base text-foreground">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Amount: <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span> • Status:{" "}
                    <span className="uppercase text-primary font-bold">{order.status}</span>
                  </p>
                </div>
                <div>
                  {order.status === "pending" ? (
                    <Button size="sm" className="rounded-xl font-semibold" onClick={() => assignToRider(order.id)}>
                      Dispatch to Courier
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-xl" disabled>
                      Dispatched
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

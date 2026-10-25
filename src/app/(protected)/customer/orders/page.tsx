"use client";

import { useAppStore } from "@/store/useAppStore";
import { useMe } from "@/hooks/useMe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package, Truck, CheckCircle, PackageCheck } from "lucide-react";

export default function CustomerOrdersPage() {
  const { orders, products } = useAppStore();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;

  const myOrders = orders.filter((o) => o.customerId === user?._id || o.customerId === "1");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "out_for_delivery":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage your customer purchase history.</p>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">No orders found</h2>
          <p className="text-muted-foreground text-sm">When you complete an order, your tracking details will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-2xl border shadow-xs">
              <CardHeader className="bg-muted/40 border-b p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Order #{order.id}</CardTitle>
                    <p className="text-xs text-muted-foreground">Placed on {order.date}</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-card px-3.5 py-1.5 rounded-full border shadow-2xs text-xs">
                    {getStatusIcon(order.status)}
                    <span className="font-semibold capitalize text-foreground">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="divide-y divide-border/60">
                  {order.products.map((op) => {
                    const product = products.find((p) => p.id === op.productId);
                    if (!product) return null;
                    return (
                      <div key={op.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl border bg-muted shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">Quantity: {op.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-foreground">
                          ${(product.price * op.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Destination</p>
                    <p className="font-medium text-xs text-foreground mt-0.5">{order.address}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                    <p className="text-xl font-black text-primary">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

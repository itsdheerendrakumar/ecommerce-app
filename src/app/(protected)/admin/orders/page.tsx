"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review all customer orders and adjust status.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-2xl border shadow-xs">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="font-bold text-base">Order #{order.id}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{order.address} • ${order.total.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  {order.status}
                </span>
                {order.status === "pending" && (
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "processing")}>
                    Process
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

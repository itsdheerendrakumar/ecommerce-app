"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function DeliveryHistoryPage() {
  const { orders } = useAppStore();
  const pastOrders = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Delivery History</h1>
        <p className="text-sm text-muted-foreground mt-1">Completed delivery orders and performance logs.</p>
      </div>

      <div className="space-y-4">
        {pastOrders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <p className="text-muted-foreground text-sm">No completed deliveries yet.</p>
          </div>
        ) : (
          pastOrders.map((order) => (
            <Card key={order.id} className="rounded-2xl border shadow-xs">
              <CardContent className="flex justify-between items-center p-5">
                <div>
                  <p className="font-bold text-base text-foreground">Order #{order.id}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.address} • {order.date}</p>
                </div>
                <div className="flex items-center text-emerald-600 font-bold text-xs gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

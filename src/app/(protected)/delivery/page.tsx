"use client";

import { useAppStore } from "@/store/useAppStore";
import { useMe } from "@/hooks/useMe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Truck, CheckCircle2, Package } from "lucide-react";

export default function DeliveryDashboardPage() {
  const { orders, updateOrderStatus } = useAppStore();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;

  // Filter assigned orders
  const assignedOrders = orders.filter(
    (o) => (o.deliveryPartnerId === user?._id || o.deliveryPartnerId === "3" || o.status === "out_for_delivery") && o.status !== "delivered"
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Active Deliveries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and fulfill your assigned live deliveries.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Courier Online</span>
        </div>
      </div>

      <div className="space-y-4">
        {assignedOrders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-3">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-foreground">No active deliveries right now</p>
            <p className="text-sm text-muted-foreground">New pickup requests will appear here in real-time.</p>
          </div>
        ) : (
          assignedOrders.map((order) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-l-4 border-l-primary rounded-2xl shadow-xs overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-lg text-foreground">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground mt-1">📍 Destination: {order.address}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                      {order.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-3 border-t">
                    <span className="text-muted-foreground">Items: {order.products.length} product(s)</span>
                    <span className="font-bold text-foreground">Order Total: ${order.total.toFixed(2)}</span>
                  </div>

                  <div className="flex space-x-3 mt-4 pt-3 border-t">
                    {order.status === "out_for_delivery" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                        className="flex-1 rounded-xl"
                      >
                        <Truck className="w-4 h-4 mr-2" /> Pick Up Package
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Complete & Mark Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

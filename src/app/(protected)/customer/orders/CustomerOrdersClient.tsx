"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomerOrdersApi, ICustomerOrder } from "@/lib/client-api/order";
import { queryKeys } from "@/constants/query-key";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, Package, Truck, CheckCircle2, PackageCheck, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function CustomerOrdersClient() {
  const router = useRouter();

  const {
    data: ordersResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.customerOrders],
    queryFn: getCustomerOrdersApi,
  });

  const orders: ICustomerOrder[] = ordersResponse?.data?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "confirmed":
      case "processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "shipped":
      case "out_for_delivery":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            PAID
          </span>
        );
      case "failed":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400">
            FAILED
          </span>
        );
      case "refunded":
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
            REFUNDED
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your order and delivery history.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl h-9 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-2xl border p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-destructive/20 space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <h3 className="font-bold text-lg">Failed to load orders</h3>
          <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl mt-2">
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">No orders found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            When you complete a purchase, your real-time tracking and delivery updates will appear here.
          </p>
          <Button onClick={() => router.push("/shop")} className="rounded-xl h-11 px-6 font-semibold">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = order.createdAt
              ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
              : "Recent";

            const currencySymbol = order.currency?.toLowerCase() === "inr" ? "₹" : "$";

            return (
              <Card key={order._id} className="overflow-hidden rounded-2xl border shadow-xs">
                <CardHeader className="bg-muted/30 border-b p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-foreground font-mono">
                          {order.order_number}
                        </CardTitle>
                        {getPaymentBadge(order.payment_status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Placed on {formattedDate}</p>
                    </div>

                    <div className="flex items-center space-x-2 bg-card px-3.5 py-1.5 rounded-full border shadow-2xs text-xs">
                      {getStatusIcon(order.order_status)}
                      <span className="font-semibold capitalize text-foreground">
                        {order.order_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Items snapshot */}
                  <div className="divide-y divide-border/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-xl border bg-muted shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl border bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-foreground">
                          {currencySymbol}{item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Destination & Total */}
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery Destination</p>
                      <p className="font-medium text-xs text-foreground mt-0.5">
                        {order.shipping_address.recipient_name} • {order.shipping_address.address_line_1}
                        {order.shipping_address.address_line_2 ? `, ${order.shipping_address.address_line_2}` : ""},{" "}
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pin_code}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-black text-primary">
                        {currencySymbol}{order.pricing.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

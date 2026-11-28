"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryOrderDetailsModal } from "@/components/delivery/DeliveryOrderDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { queryKeys } from "@/constants/query-key";
import { DELIVERY_PAYOUT_PER_ORDER_INR } from "@/constants/delivery";
import { cn } from "@/lib/utils";
import { getDeliveryOrdersApi, type IDeliveryOrder } from "@/lib/client-api/delivery";
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  History,
  MapPin,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type HistoryStatusFilter = "all" | "delivered" | "cancelled" | "returned";

function getHistoryBadgeConfig(status: string) {
  if (status === "delivered") {
    return {
      label: "Delivered",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60",
    };
  }
  if (status === "returned") {
    return {
      label: "Returned",
      className:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60",
    };
  }
  return {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60",
  };
}

export default function DeliveryHistoryClient() {
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IDeliveryOrder | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 350);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      queryKeys.deliveryOrders,
      "history",
      statusFilter,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      getDeliveryOrdersApi({
        scope: "history",
        status: statusFilter,
        search: debouncedSearch,
        page,
        limit: 10,
      }),
  });

  const orders: IDeliveryOrder[] = response?.data?.data || [];
  const meta = response?.meta;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Delivery History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completed drops, timestamps, and past assigned order records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="rounded-2xl border shadow-xs p-4 bg-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search past deliveries by Order #, Recipient, City, or PIN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-9 h-10 rounded-xl text-xs bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as HistoryStatusFilter);
              setPage(1);
            }}
            className="h-10 px-3 text-xs rounded-xl border bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">All Completed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </Card>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <Card key={idx} className="rounded-2xl border p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-44 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-bold text-base text-foreground">Unable to load delivery history</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-3">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <History className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-foreground">No past deliveries found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Completed and closed deliveries assigned to your account will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = getHistoryBadgeConfig(order.order_status);
            const totalUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);
            const completedAt = order.delivered_at || order.cancelled_at || order.updatedAt;

            return (
              <Card
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className="rounded-2xl border shadow-xs hover:border-primary/40 transition-all cursor-pointer"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-sm text-foreground">
                        {order.order_number}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                          badge.className
                        )}
                      >
                        {order.order_status === "delivered" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {order.order_status !== "delivered" && <Ban className="w-3 h-3" />}
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-foreground truncate">
                      {order.shipping_address.recipient_name}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {order.shipping_address.city} ({order.shipping_address.pin_code})
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {totalUnits} unit(s)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(completedAt), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {order.order_status === "delivered" && (
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Drop Payout</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          +₹{DELIVERY_PAYOUT_PER_ORDER_INR}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total}{" "}
            records)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-lg text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              className="h-8 rounded-lg text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <DeliveryOrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

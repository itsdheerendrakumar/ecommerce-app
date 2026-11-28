"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryOrderDetailsModal } from "@/components/delivery/DeliveryOrderDetailsModal";
import { ConfirmDeliveryModal } from "@/components/delivery/ConfirmDeliveryModal";
import { useDebounce } from "@/hooks/useDebounce";
import { queryKeys } from "@/constants/query-key";
import { getDutyStatusConfig } from "@/constants/delivery";
import { cn } from "@/lib/utils";
import {
  getDeliveryOrdersApi,
  getDeliveryStatsApi,
  getOrderItemImages,
  updateDeliveryDutyStatusApi,
  updateDeliveryOrderStatusApi,
  type IDeliveryOrder,
} from "@/lib/client-api/delivery";
import {
  AlertCircle,
  Bike,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  StickyNote,
  Truck,
  X,
} from "lucide-react";

type ActiveStatusFilter = "all" | "shipped" | "out_for_delivery";

function getCardAccentClass(status: string) {
  if (status === "out_for_delivery") {
    return "border-l-4 border-l-sky-500";
  }
  return "border-l-4 border-l-purple-500";
}

function getStatusPillConfig(status: string) {
  if (status === "out_for_delivery") {
    return {
      label: "Out for Delivery",
      className:
        "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800/60",
    };
  }
  return {
    label: "Ready for Pickup",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
  };
}

export default function DeliveryDashboardClient() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<ActiveStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IDeliveryOrder | null>(null);
  const [confirmDeliveryOrder, setConfirmDeliveryOrder] = useState<IDeliveryOrder | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 350);

  const {
    data: statsRes,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: [queryKeys.deliveryStats],
    queryFn: getDeliveryStatsApi,
  });

  const {
    data: ordersRes,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: [
      queryKeys.deliveryOrders,
      "active",
      statusFilter,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      getDeliveryOrdersApi({
        scope: "active",
        status: statusFilter,
        search: debouncedSearch,
        page,
        limit: 10,
      }),
  });

  const stats = statsRes?.data?.data;
  const orders: IDeliveryOrder[] = ordersRes?.data?.data || [];
  const meta = ordersRes?.meta;
  const dutyCfg = getDutyStatusConfig(stats?.dutyStatus);

  const invalidateDeliveryQueries = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.deliveryOrders] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.deliveryStats] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.adminOrders] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.adminOverview] });
    queryClient.invalidateQueries({ queryKey: [queryKeys.me] });
  };

  const dutyMutation = useMutation({
    mutationFn: (targetStatus: "on-duty" | "off-duty") =>
      updateDeliveryDutyStatusApi(targetStatus),
    onSuccess: (res) => {
      const updatedStatus = res?.data?.data?.duty_status || "on-duty";
      toast.success(
        updatedStatus === "on-duty"
          ? "You are now On Duty and ready for dispatch"
          : "You are now Off Duty"
      );
      invalidateDeliveryQueries();
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errObj?.response?.data?.message || errObj?.message || "Failed to update duty status");
    },
  });

  const orderStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "out_for_delivery" | "delivered";
    }) => updateDeliveryOrderStatusApi(orderId, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "out_for_delivery"
          ? "Package picked up — order is now Out for Delivery"
          : "Order delivered successfully"
      );
      setConfirmDeliveryOrder(null);
      invalidateDeliveryQueries();
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errObj?.response?.data?.message || errObj?.message || "Failed to update order status");
    },
  });

  const handleRefresh = () => {
    refetchStats();
    refetchOrders();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="border-b pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">Active Deliveries</h1>
            {stats?.vehicle?.number && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border">
                <Bike className="w-3.5 h-3.5 text-primary" />
                {stats.vehicle.name} ({stats.vehicle.number})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up packed store dispatches and complete doorstep deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold",
              dutyCfg.badgeClass
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", dutyCfg.dotClass)} />
            <span>{dutyCfg.label}</span>
          </div>

          {stats?.dutyStatus === "off-duty" && (
            <Button
              size="sm"
              className="rounded-xl h-9 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              disabled={dutyMutation.isPending}
              onClick={() => dutyMutation.mutate("on-duty")}
            >
              {dutyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {!dutyMutation.isPending && <Power className="w-3.5 h-3.5" />}
              Go On Duty
            </Button>
          )}

          {stats?.dutyStatus === "on-duty" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5"
              disabled={dutyMutation.isPending}
              onClick={() => dutyMutation.mutate("off-duty")}
            >
              {dutyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {!dutyMutation.isPending && <Power className="w-3.5 h-3.5" />}
              Go Off Duty
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5"
            onClick={handleRefresh}
            disabled={isOrdersFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOrdersFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ready for Pickup
            </span>
            <Package className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">
              {!isStatsLoading && (stats?.readyForPickupCount ?? 0)}
              {isStatsLoading && <Skeleton className="h-8 w-14" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Packed at store counter</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Out for Delivery
            </span>
            <Truck className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {!isStatsLoading && (stats?.inTransitCount ?? 0)}
              {isStatsLoading && <Skeleton className="h-8 w-14" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Currently with you</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivered Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {!isStatsLoading && (stats?.deliveredTodayCount ?? 0)}
              {isStatsLoading && <Skeleton className="h-8 w-14" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total lifetime: {stats?.totalDeliveredCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Earnings
            </span>
            <IndianRupee className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">
              {!isStatsLoading && `₹${(stats?.todayEarnings ?? 0).toLocaleString("en-IN")}`}
              {isStatsLoading && <Skeleton className="h-8 w-20" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ₹{stats?.payoutPerDelivery ?? 50} per completed drop
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border shadow-xs p-4 bg-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Order #, Customer Name, City, or PIN..."
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

          <div className="flex p-1 bg-muted rounded-xl border border-border/60 w-fit">
            {[
              { value: "all" as const, label: "All Active" },
              { value: "shipped" as const, label: "Pickup Ready" },
              { value: "out_for_delivery" as const, label: "In Transit" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  statusFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {isOrdersLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <Card key={idx} className="rounded-2xl border p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-44 rounded-lg" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {!isOrdersLoading && isOrdersError && (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-bold text-base text-foreground">Unable to load active deliveries</p>
          <p className="text-xs text-muted-foreground">Please check your connection and retry.</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh}>
            Retry
          </Button>
        </Card>
      )}

      {!isOrdersLoading && !isOrdersError && orders.length === 0 && (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-3">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Package className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-foreground">No active deliveries assigned</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Keep your status On Duty so the store manager can dispatch ready orders to you.
          </p>
        </div>
      )}

      {!isOrdersLoading && !isOrdersError && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const pill = getStatusPillConfig(order.order_status);
            const fullAddress = [
              order.shipping_address.address_line_1,
              order.shipping_address.address_line_2,
              order.shipping_address.city,
              order.shipping_address.state,
              order.shipping_address.pin_code,
            ]
              .filter(Boolean)
              .join(", ");
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            const phone = order.shipping_address.phone || order.customer_phone || "";
            const totalUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);
            const dispatchedTime = order.shipped_at
              ? format(new Date(order.shipped_at), "dd MMM, hh:mm a")
              : format(new Date(order.createdAt), "dd MMM, hh:mm a");

            return (
              <Card
                key={order._id}
                className={cn(
                  "rounded-2xl border shadow-xs overflow-hidden",
                  getCardAccentClass(order.order_status)
                )}
              >
                <div className="bg-muted/30 border-b px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-sm text-foreground">
                      {order.order_number}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border",
                        pill.className
                      )}
                    >
                      {pill.label}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Prepaid
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Dispatched {dispatchedTime}
                  </span>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-7 space-y-1.5">
                      <p className="text-sm font-bold text-foreground">
                        {order.shipping_address.recipient_name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{fullAddress}</span>
                      </p>
                      {order.notes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-5 flex items-center md:justify-end gap-2.5 flex-wrap">
                      {order.items.slice(0, 3).map((item, idx) => {
                        const images = getOrderItemImages(item);
                        const thumbUrl = images[0]?.url || item.image;
                        return (
                          <div key={idx} className="relative shrink-0" title={item.name}>
                            {thumbUrl && (
                              <img
                                src={thumbUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border bg-muted"
                              />
                            )}
                            {!thumbUrl && (
                              <div className="w-12 h-12 rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                        );
                      })}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {totalUnits} unit(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call
                        </a>
                      )}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-primary" /> Directions
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-semibold"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.order_status === "shipped" && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto rounded-xl h-9 px-4 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white"
                          disabled={orderStatusMutation.isPending}
                          onClick={() =>
                            orderStatusMutation.mutate({
                              orderId: order._id,
                              status: "out_for_delivery",
                            })
                          }
                        >
                          <Truck className="w-3.5 h-3.5 mr-1.5" /> Pick Up & Start Delivery
                        </Button>
                      )}

                      {order.order_status === "out_for_delivery" && (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto rounded-xl h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={orderStatusMutation.isPending}
                          onClick={() => setConfirmDeliveryOrder(order)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark Delivered
                        </Button>
                      )}
                    </div>
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
            Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total}{" "}
            active)
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

      <ConfirmDeliveryModal
        order={confirmDeliveryOrder}
        isOpen={Boolean(confirmDeliveryOrder)}
        isPending={orderStatusMutation.isPending}
        onClose={() => setConfirmDeliveryOrder(null)}
        onConfirm={(orderId) =>
          orderStatusMutation.mutate({ orderId, status: "delivered" })
        }
      />
    </div>
  );
}

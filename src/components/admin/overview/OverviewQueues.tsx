"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminOverviewData, OverviewQueueOrder } from "@/types/admin-overview";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Flame,
  Package,
  ShieldAlert,
  Truck,
  UserCheck,
  Users,
  Webhook,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DUTY_STATUS_STYLE_MAP,
  formatCurrency,
  ORDER_STATUS_STYLE_MAP,
} from "./overview-utils";

interface OverviewQueuesProps {
  data?: AdminOverviewData;
  isLoading: boolean;
  onViewOrder: (orderId: string) => void;
  onAssignPartner: (order: OverviewQueueOrder) => void;
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        <Package className="w-4 h-4" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-10 h-10 rounded-lg object-cover border bg-muted shrink-0"
    />
  );
}

export function OverviewQueues({
  data,
  isLoading,
  onViewOrder,
  onAssignPartner,
}: OverviewQueuesProps) {
  const [catalogTab, setCatalogTab] = useState<"low-stock" | "top-sellers">("low-stock");

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 rounded-2xl border p-6 space-y-4">
            <Skeleton className="h-6 w-52" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </Card>
          <Card className="lg:col-span-5 rounded-2xl border p-6 space-y-4">
            <Skeleton className="h-6 w-44" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </Card>
        </div>
      </div>
    );
  }

  const { actionQueues, usersAndFleet, systemHealth, currency } = data;
  const { ordersNeedingAction, lowStockProducts, topSellingProducts, activeRiders } =
    actionQueues;

  const hasSystemIssues =
    systemHealth.failedWebhooks > 0 ||
    systemHealth.failedPayments > 0 ||
    systemHealth.expiredUploadSessions > 0;

  return (
    <div className="space-y-6">
      {/* Row 1: Actionable Dispatch Queue + Inventory / Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Orders Queue */}
        <Card className="lg:col-span-7 rounded-2xl border shadow-xs flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4 border-b">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Orders Needing Attention
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Active queue prioritized by dispatch and rider assignment readiness
              </CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold rounded-xl">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            {ordersNeedingAction.length === 0 ? (
              <div className="h-full min-h-[240px] rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center p-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-foreground">Queue is all caught up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No pending or unfulfilled orders waiting right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ordersNeedingAction.map((order) => {
                  const statusCfg = ORDER_STATUS_STYLE_MAP[order.order_status];
                  const relativeAge = formatDistanceToNow(new Date(order.createdAt), {
                    addSuffix: true,
                  });

                  return (
                    <div
                      key={order._id}
                      onClick={() => onViewOrder(order._id)}
                      className="p-3.5 rounded-xl border bg-card hover:bg-muted/30 hover:border-primary/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {order.order_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}
                          >
                            {statusCfg.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              order.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                            }`}
                          >
                            {order.payment_method.toUpperCase()} • {order.payment_status}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-semibold text-foreground">
                            {order.recipient_name}
                          </span>
                          {order.city ? ` • ${order.city}` : ""} • {order.items_count} item(s) •{" "}
                          {relativeAge}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <span className="text-sm font-black text-primary mr-1">
                          {formatCurrency(order.total_amount, order.currency || currency)}
                        </span>

                        <Button
                          size="sm"
                          variant={order.delivery_partner ? "outline" : "default"}
                          className="h-8 rounded-xl text-xs font-semibold px-2.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignPartner(order);
                          }}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          {order.delivery_partner
                            ? order.delivery_partner.name.split(" ")[0]
                            : "Assign Rider"}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-xl"
                          title="Inspect order"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOrder(order._id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Alerts & Top Sellers */}
        <Card className="lg:col-span-5 rounded-2xl border shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                {catalogTab === "low-stock" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <Flame className="w-4 h-4 text-primary" />
                )}
                {catalogTab === "low-stock" ? "Inventory Alerts" : "Top Selling Products"}
              </CardTitle>

              <Link
                href={
                  catalogTab === "low-stock"
                    ? "/admin/products?sortBy=stock-low"
                    : "/admin/products"
                }
              >
                <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold rounded-lg">
                  Catalog <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex p-1 bg-muted rounded-xl border border-border/60 w-fit">
              <button
                type="button"
                onClick={() => setCatalogTab("low-stock")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  catalogTab === "low-stock"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Low Stock ({lowStockProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab("top-sellers")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  catalogTab === "top-sellers"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Top Sellers ({topSellingProducts.length})
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            {catalogTab === "low-stock" && (
              <>
                {lowStockProducts.length === 0 ? (
                  <div className="h-full min-h-[220px] rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-foreground">Inventory levels healthy</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All published products have more than 10 units in stock.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lowStockProducts.map((product) => {
                      const isOut = product.stock <= 0;
                      return (
                        <div
                          key={product._id}
                          className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ProductThumbnail src={product.image} alt={product.name} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {product.category} • {formatCurrency(product.price, currency)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              isOut
                                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                                : product.stock <= 5
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                                  : "bg-muted text-foreground"
                            }`}
                          >
                            {isOut ? "Out of stock" : `${product.stock} left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {catalogTab === "top-sellers" && (
              <>
                {topSellingProducts.length === 0 ? (
                  <div className="h-full min-h-[220px] rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center p-6">
                    <Package className="w-8 h-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-bold text-foreground">No product sales yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best-selling items in this timeframe will rank here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topSellingProducts.map((item, idx) => (
                      <div
                        key={item.productId}
                        className="p-3 rounded-xl border bg-card flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-black text-muted-foreground w-4 text-center shrink-0">
                            {idx + 1}
                          </span>
                          <ProductThumbnail src={item.image} alt={item.name} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.category} • {item.unitsSold} sold
                              {item.currentStock !== null ? ` • ${item.currentStock} in stock` : ""}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-primary shrink-0">
                          {formatCurrency(item.revenue, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Delivery Fleet Readiness, Customers & Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Fleet Readiness */}
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Delivery Fleet
            </CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold rounded-lg">
                Manage <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  On Duty
                </p>
                <p className="text-base font-black">{usersAndFleet.onDutyRiders}</p>
              </div>
              <div className="p-2 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40">
                <p className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400">
                  In Delivery
                </p>
                <p className="text-base font-black">{usersAndFleet.inDeliveryRiders}</p>
              </div>
              <div className="p-2 rounded-xl bg-muted/60 border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Off Duty</p>
                <p className="text-base font-black">{usersAndFleet.offDutyRiders}</p>
              </div>
            </div>

            {activeRiders.length > 0 ? (
              <div className="space-y-2 pt-1">
                {activeRiders.slice(0, 3).map((rider) => {
                  const duty = DUTY_STATUS_STYLE_MAP[rider.duty_status];
                  return (
                    <div
                      key={rider._id}
                      className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{rider.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {rider.city || "Local"} • {rider.completed_deliveries} deliveries
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${duty.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${duty.dotClass}`} />
                        {duty.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No delivery partners registered yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Customer & Store Pulse
            </CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold rounded-lg">
                Directory <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {usersAndFleet.totalCustomers}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  +{usersAndFleet.newCustomersInRange} in range
                </p>
              </div>
              <div className="p-3 rounded-xl border bg-muted/20">
                <p className="text-[11px] font-semibold text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-black text-foreground mt-0.5">
                  {usersAndFleet.activeCustomers}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {usersAndFleet.totalCompletedDeliveries} rider deliveries
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Catalog Stock Value</span>
              <span className="font-black text-foreground">
                {formatCurrency(data.catalogSummary.catalogValue, currency)}
              </span>
            </div>
            <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Cancellation / Return Rate</span>
              <span
                className={`font-black ${
                  data.kpis.cancellationRate > 15
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                {data.kpis.cancellationRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* System & Webhook Health */}
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" /> Platform Health
            </CardTitle>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                hasSystemIssues
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
              }`}
            >
              {hasSystemIssues ? "Needs Review" : "Operational"}
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
                Failed Stripe Webhooks
              </span>
              <span
                className={`font-black ${
                  systemHealth.failedWebhooks > 0 ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {systemHealth.failedWebhooks}
              </span>
            </div>

            <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                Failed Payments (Range)
              </span>
              <span
                className={`font-black ${
                  systemHealth.failedPayments > 0 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {systemHealth.failedPayments}
              </span>
            </div>

            <div className="p-3 rounded-xl border bg-card flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                Expired Upload Sessions
              </span>
              <span className="font-black text-foreground">
                {systemHealth.expiredUploadSessions}
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <Link href="/admin/orders?payment_status=failed">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs font-semibold">
                  Audit Failed Payments <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

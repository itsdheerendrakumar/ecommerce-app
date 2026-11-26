"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminOverviewData } from "@/types/admin-overview";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { formatCurrency } from "./overview-utils";

interface OverviewKpisProps {
  data?: AdminOverviewData;
  isLoading: boolean;
}

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="text-[11px] font-medium text-muted-foreground">
        Lifetime view
      </span>
    );
  }

  const isPositive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
        isPositive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? `+${delta}%` : `${delta}%`}
    </span>
  );
}

export function OverviewKpis({ data, isLoading }: OverviewKpisProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <Card
            key={idx}
            className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30"
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3.5 w-44" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { kpis, catalogSummary, usersAndFleet, currency } = data;
  const stockAlertsCount = catalogSummary.outOfStockCount + catalogSummary.lowStockCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Net Revenue */}
      <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Net Revenue
          </CardTitle>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(kpis.netRevenue, currency)}
            </p>
            <DeltaPill delta={kpis.revenueDeltaPercent} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Gross {formatCurrency(kpis.grossRevenue, currency)} • Refunded{" "}
            {formatCurrency(kpis.refundedAmount, currency)}
          </p>
        </CardContent>
      </Card>

      {/* 2. Orders & AOV */}
      <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Orders
          </CardTitle>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {kpis.totalOrders.toLocaleString("en-IN")}
            </p>
            <DeltaPill delta={kpis.ordersDeltaPercent} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Paid: <span className="font-semibold text-foreground">{kpis.paidOrders}</span> • AOV{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(kpis.averageOrderValue, currency)}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* 3. Live Fulfillment & Dispatch Queue */}
      <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Needs Fulfillment
          </CardTitle>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {kpis.needsFulfillment}
            </p>
            {kpis.unassignedActive > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                <AlertTriangle className="w-3 h-3" /> {kpis.unassignedActive} unassigned
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                <Truck className="w-3 h-3" /> {kpis.inTransitCount} in transit
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            In transit: <span className="font-semibold text-foreground">{kpis.inTransitCount}</span> •
            Delivered rate{" "}
            <span className="font-semibold text-foreground">{kpis.fulfillmentRate}%</span>
          </p>
        </CardContent>
      </Card>

      {/* 4. Published Catalog & Fleet */}
      <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Products
          </CardTitle>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {catalogSummary.publishedProducts}
            </p>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                stockAlertsCount > 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
              }`}
            >
              {stockAlertsCount > 0 ? `${stockAlertsCount} stock alerts` : "Stock healthy"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Drafts: <span className="font-semibold text-foreground">{catalogSummary.draftProducts}</span> •
            Riders on-duty:{" "}
            <span className="font-semibold text-foreground">
              {usersAndFleet.onDutyRiders + usersAndFleet.inDeliveryRiders}/{usersAndFleet.totalRiders}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

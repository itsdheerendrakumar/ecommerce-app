"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminOverviewApi } from "@/lib/client-api/admin/overview";
import type { OverviewQueueOrder, OverviewRange } from "@/types/admin-overview";
import { queryKeys } from "@/constants/query-key";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OverviewKpis } from "@/components/admin/overview/OverviewKpis";
import { OverviewCharts } from "@/components/admin/overview/OverviewCharts";
import { OverviewQueues } from "@/components/admin/overview/OverviewQueues";
import { OrderDetailsModal } from "@/components/admin/orders/OrderDetailsModal";
import { AssignPartnerModal } from "@/components/admin/orders/AssignPartnerModal";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const RANGE_OPTIONS: { value: OverviewRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "all", label: "All Time" },
];

export default function AdminOverviewClient() {
  const [range, setRange] = useState<OverviewRange>("30d");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assignModalOrder, setAssignModalOrder] = useState<{
    orderId: string;
    orderNumber: string;
    currentPartnerId?: string;
  } | null>(null);

  const { data: response, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [queryKeys.adminOverview, range],
    queryFn: () => getAdminOverviewApi(range),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const overview = response?.data?.data;

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsOpen(true);
  };

  const handleAssignFromQueue = (order: OverviewQueueOrder) => {
    setAssignModalOrder({
      orderId: order._id,
      orderNumber: order.order_number,
      currentPartnerId: order.delivery_partner?._id,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="border-b pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Overview</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Executive Console
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Live revenue analytics, order fulfillment pipeline, inventory alerts, and fleet readiness.
            {overview?.generatedAt && (
              <span className="ml-2 text-xs text-muted-foreground/80">
                • Updated {format(new Date(overview.generatedAt), "hh:mm a")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe Selector */}
          <div className="flex p-1 bg-muted rounded-xl border border-border/60 w-fit">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  range === opt.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-10 px-4 text-xs font-semibold gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && !overview && (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Unable to load admin overview analytics
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please verify your connection or admin session and try again.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Executive KPIs */}
      <OverviewKpis data={overview} isLoading={isLoading} />

      {/* React ApexCharts Section */}
      <OverviewCharts data={overview} isLoading={isLoading} />

      {/* Live Actionable Queues & Fleet Health */}
      <OverviewQueues
        data={overview}
        isLoading={isLoading}
        onViewOrder={handleViewOrder}
        onAssignPartner={handleAssignFromQueue}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrderId(null);
        }}
        onAssignPartner={(order) => {
          setAssignModalOrder({
            orderId: order._id,
            orderNumber: order.order_number,
            currentPartnerId:
              typeof order.delivery_partner_id === "object"
                ? order.delivery_partner_id?._id
                : undefined,
          });
        }}
      />

      {/* Assign Rider Modal */}
      {assignModalOrder && (
        <AssignPartnerModal
          orderId={assignModalOrder.orderId}
          orderNumber={assignModalOrder.orderNumber}
          currentPartnerId={assignModalOrder.currentPartnerId}
          isOpen={!!assignModalOrder}
          onClose={() => setAssignModalOrder(null)}
        />
      )}
    </div>
  );
}

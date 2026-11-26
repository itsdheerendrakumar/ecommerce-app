"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ApexOptions } from "apexcharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminOverviewData } from "@/types/admin-overview";
import { BarChart3, CreditCard, Layers, TrendingUp } from "lucide-react";
import { AdminApexChart } from "./ApexChart";
import {
  formatCompactCurrency,
  formatCurrency,
  ORDER_STATUS_STYLE_MAP,
} from "./overview-utils";

interface OverviewChartsProps {
  data?: AdminOverviewData;
  isLoading: boolean;
}

const CATEGORY_COLORS = [
  "#4f46e5",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
];

function ChartSkeletonCard({
  className,
  height = 280,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <Card className={`rounded-2xl border shadow-xs ${className || ""}`}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-3.5 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full rounded-xl" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function OverviewCharts({ data, isLoading }: OverviewChartsProps) {
  const router = useRouter();
  const currency = data?.currency || "inr";

  const paymentMethods = useMemo(
    () => data?.charts.paymentBreakdown.byMethod ?? [],
    [data]
  );
  const statusItems = useMemo(
    () => data?.charts.orderStatusBreakdown ?? [],
    [data]
  );
  const categoryItems = useMemo(
    () => data?.charts.categoryRevenue ?? [],
    [data]
  );

  // 1. Revenue & Order Volume Mixed Combo Chart
  const revenueSeries = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "Paid Revenue",
        type: "area",
        data: data.charts.revenueTrend.revenue,
      },
      {
        name: "Orders",
        type: "column",
        data: data.charts.revenueTrend.orders,
      },
    ];
  }, [data]);

  const revenueOptions: ApexOptions = useMemo(() => {
    const labels = data?.charts.revenueTrend.labels || [];
    return {
      chart: {
        id: "admin-revenue-trend",
        type: "line",
        stacked: false,
      },
      colors: ["#4f46e5", "#10b981"],
      stroke: {
        width: [3, 0],
        curve: "smooth",
      },
      plotOptions: {
        bar: {
          columnWidth: labels.length > 20 ? "45%" : "36%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      fill: {
        type: ["gradient", "solid"],
        opacity: [0.35, 0.85],
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.35,
          opacityTo: 0.03,
          stops: [0, 95, 100],
        },
      },
      dataLabels: { enabled: false },
      labels,
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickAmount: labels.length > 12 ? 8 : undefined,
        labels: {
          style: { fontSize: "11px" },
        },
      },
      yaxis: [
        {
          title: {
            text: "Revenue",
            style: { fontSize: "11px", fontWeight: 600 },
          },
          labels: {
            formatter: (val) => formatCompactCurrency(val ?? 0, currency),
          },
        },
        {
          opposite: true,
          title: {
            text: "Orders",
            style: { fontSize: "11px", fontWeight: 600 },
          },
          min: 0,
          forceNiceScale: true,
          labels: {
            formatter: (val) => `${Math.round(val ?? 0)}`,
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: [
          {
            formatter: (val) => formatCurrency(val ?? 0, currency),
          },
          {
            formatter: (val) => `${Math.round(val ?? 0)} order(s)`,
          },
        ],
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
    };
  }, [data, currency]);

  // 2. Payment Methods Donut Chart
  const totalMethodOrders = paymentMethods.reduce((acc, m) => acc + m.count, 0);
  const paymentDonutSeries = useMemo(
    () => paymentMethods.map((m) => m.count),
    [paymentMethods]
  );

  const paymentDonutOptions: ApexOptions = useMemo(() => {
    const labels = paymentMethods.map((m) => m.label);
    return {
      chart: {
        id: "admin-payment-methods",
        type: "donut",
      },
      labels,
      colors: ["#4f46e5", "#f59e0b"],
      stroke: { width: 2 },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${Math.round(Number(val ?? 0))}%`,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { show: true, fontSize: "12px", fontWeight: 600 },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 800,
                formatter: (val) => `${val}`,
              },
              total: {
                show: true,
                label: "Orders",
                fontSize: "11px",
                fontWeight: 600,
                formatter: () => `${totalMethodOrders}`,
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val, opts) => {
            const idx = opts?.seriesIndex ?? -1;
            const method = idx >= 0 ? paymentMethods[idx] : undefined;
            const rev = method ? formatCurrency(method.revenue, currency) : "";
            return `${val ?? 0} orders (${rev})`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    };
  }, [paymentMethods, totalMethodOrders, currency]);

  // 3. Order Fulfillment Pipeline (Horizontal Bar Chart)
  const totalStatusOrders = statusItems.reduce((acc, s) => acc + s.count, 0);
  const statusSeries = useMemo(
    () => [
      {
        name: "Orders",
        data: statusItems.map((s) => s.count),
      },
    ],
    [statusItems]
  );

  const statusOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "admin-order-pipeline",
        type: "bar",
        events: {
          dataPointSelection: (_event, _ctx, config) => {
            const idx = config?.dataPointIndex ?? -1;
            const item = idx >= 0 ? statusItems[idx] : undefined;
            if (item) {
              router.push(`/admin/orders?order_status=${item.status}`);
            }
          },
        },
      },
      colors: statusItems.map(
        (s) => ORDER_STATUS_STYLE_MAP[s.status]?.chartColor || "#6366f1"
      ),
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: "60%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: "11px", fontWeight: 700 },
      },
      legend: { show: false },
      xaxis: {
        categories: statusItems.map((s) => s.label),
        labels: {
          formatter: (val) => `${Math.round(Number(val ?? 0))}`,
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", fontWeight: 600 },
        },
      },
      tooltip: {
        y: {
          formatter: (val, opts) => {
            const idx = opts?.dataPointIndex ?? -1;
            const item = idx >= 0 ? statusItems[idx] : undefined;
            const rev = item ? formatCurrency(item.revenue, currency) : "";
            return `${val ?? 0} orders • ${rev}`;
          },
        },
      },
    };
  }, [statusItems, currency, router]);

  // 4. Revenue by Category (Horizontal Bar Chart)
  const categorySeries = useMemo(
    () => [
      {
        name: "Revenue",
        data: categoryItems.map((c) => Number(c.revenue.toFixed(2))),
      },
    ],
    [categoryItems]
  );

  const categoryOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        id: "admin-category-revenue",
        type: "bar",
        events: {
          dataPointSelection: (_event, _ctx, config) => {
            const idx = config?.dataPointIndex ?? -1;
            const item = idx >= 0 ? categoryItems[idx] : undefined;
            if (item && item.category !== "Uncategorized") {
              router.push(
                `/admin/products?category=${encodeURIComponent(item.category)}`
              );
            }
          },
        },
      },
      colors: CATEGORY_COLORS,
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: "58%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => formatCompactCurrency(Number(val ?? 0), currency),
        style: { fontSize: "11px", fontWeight: 700 },
      },
      legend: { show: false },
      xaxis: {
        categories: categoryItems.map((c) => c.category),
        labels: {
          formatter: (val) => formatCompactCurrency(Number(val ?? 0), currency),
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px", fontWeight: 600 },
        },
      },
      tooltip: {
        y: {
          formatter: (val, opts) => {
            const safeVal = val ?? 0;
            const idx = opts?.dataPointIndex ?? -1;
            const item = idx >= 0 ? categoryItems[idx] : undefined;
            if (!item) return formatCurrency(safeVal, currency);
            return `${formatCurrency(safeVal, currency)} (${item.unitsSold} units • ${item.orderCount} orders)`;
          },
        },
      },
    };
  }, [categoryItems, currency, router]);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ChartSkeletonCard className="lg:col-span-8" height={310} />
        <ChartSkeletonCard className="lg:col-span-4" height={310} />
        <ChartSkeletonCard className="lg:col-span-7" height={290} />
        <ChartSkeletonCard className="lg:col-span-5" height={290} />
      </div>
    );
  }

  const tx = data.charts.paymentBreakdown.transactionsSummary;
  const hasTrendActivity =
    data.charts.revenueTrend.revenue.some((v) => v > 0) ||
    data.charts.revenueTrend.orders.some((v) => v > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart 1: Revenue & Order Volume Over Time */}
      <Card className="lg:col-span-8 rounded-2xl border shadow-xs">
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Revenue & Order Volume
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Settled Stripe & paid order revenue vs total placed orders
            </CardDescription>
          </div>
          {!hasTrendActivity && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              No orders in range
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[310px] w-full">
            <AdminApexChart
              type="line"
              series={revenueSeries}
              options={revenueOptions}
              height={310}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Payment Mix & Stripe Health */}
      <Card className="lg:col-span-4 rounded-2xl border shadow-xs flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Mix & Checkout
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Online Stripe vs Cash on Delivery split
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-2">
          {totalMethodOrders > 0 ? (
            <div className="h-[230px] w-full">
              <AdminApexChart
                type="donut"
                series={paymentDonutSeries}
                options={paymentDonutOptions}
                height={230}
              />
            </div>
          ) : (
            <div className="h-[230px] rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center p-4">
              <CreditCard className="w-7 h-7 text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">No payment records yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Orders placed in this window will appear here.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
            <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-2 border border-emerald-200/60 dark:border-emerald-800/40">
              <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                Succeeded
              </p>
              <p className="text-sm font-black text-foreground">{tx.succeeded}</p>
            </div>
            <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 p-2 border border-amber-200/60 dark:border-amber-800/40">
              <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                Pending
              </p>
              <p className="text-sm font-black text-foreground">{tx.pending}</p>
            </div>
            <div className="rounded-xl bg-red-50/70 dark:bg-red-950/30 p-2 border border-red-200/60 dark:border-red-800/40">
              <p className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400">
                Failed
              </p>
              <p className="text-sm font-black text-foreground">{tx.failed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Order Fulfillment Funnel */}
      <Card className="lg:col-span-7 rounded-2xl border shadow-xs">
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Order Fulfillment Pipeline
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Click any status bar to filter orders in the pipeline
            </CardDescription>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {totalStatusOrders} total
          </span>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[290px] w-full">
            <AdminApexChart
              type="bar"
              series={statusSeries}
              options={statusOptions}
              height={290}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart 4: Revenue by Category */}
      <Card className="lg:col-span-5 rounded-2xl border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Top Categories by Revenue
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Active sales excluding cancelled and returned orders
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {categoryItems.length > 0 ? (
            <div className="h-[290px] w-full">
              <AdminApexChart
                type="bar"
                series={categorySeries}
                options={categoryOptions}
                height={290}
              />
            </div>
          ) : (
            <div className="h-[290px] rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center text-center p-6">
              <Layers className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">No category sales yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Category performance will populate once orders are placed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

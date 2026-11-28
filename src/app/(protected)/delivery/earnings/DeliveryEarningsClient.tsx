"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/constants/query-key";
import { getDeliveryStatsApi } from "@/lib/client-api/delivery";
import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export default function DeliveryEarningsClient() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.deliveryStats],
    queryFn: getDeliveryStatsApi,
  });

  const stats = response?.data?.data;
  const recentOrders = stats?.recentCompletedOrders || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Earnings & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completed store deliveries and payout breakdown in INR.
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

      {isError && (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-bold text-base text-foreground">Unable to load earnings data</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {!isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Earnings
                </CardTitle>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {!isLoading && stats && `₹${stats.totalEarnings.toLocaleString("en-IN")}`}
                  {isLoading && <Skeleton className="h-9 w-28" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Lifetime store payouts</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  This Month
                </CardTitle>
                <CalendarDays className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {!isLoading && stats && `₹${stats.monthEarnings.toLocaleString("en-IN")}`}
                  {isLoading && <Skeleton className="h-9 w-24" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {stats?.deliveredMonthCount ?? 0} deliveries completed
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Completed Runs
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {!isLoading && stats && stats.totalDeliveredCount}
                  {isLoading && <Skeleton className="h-9 w-16" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {stats?.deliveredTodayCount ?? 0} today • {stats?.deliveredWeekCount ?? 0} this week
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Per Delivery Rate
                </CardTitle>
                <Award className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {!isLoading && stats && `₹${stats.payoutPerDelivery}`}
                  {isLoading && <Skeleton className="h-9 w-16" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Standard per-drop payout</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border shadow-2xs p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Today</p>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {!isLoading && stats && `₹${stats.todayEarnings.toLocaleString("en-IN")}`}
                  {isLoading && <Skeleton className="h-6 w-16" />}
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                {stats?.deliveredTodayCount ?? 0} drops
              </span>
            </Card>

            <Card className="rounded-2xl border shadow-2xs p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Last 7 Days</p>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {!isLoading && stats && `₹${stats.weekEarnings.toLocaleString("en-IN")}`}
                  {isLoading && <Skeleton className="h-6 w-16" />}
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {stats?.deliveredWeekCount ?? 0} drops
              </span>
            </Card>

            <Card className="rounded-2xl border shadow-2xs p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">This Month</p>
                <div className="text-lg font-black text-foreground mt-0.5">
                  {!isLoading && stats && `₹${stats.monthEarnings.toLocaleString("en-IN")}`}
                  {isLoading && <Skeleton className="h-6 w-16" />}
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
                {stats?.deliveredMonthCount ?? 0} drops
              </span>
            </Card>
          </div>

          <Card className="rounded-2xl border shadow-xs overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-base font-bold">Recent Completed Deliveries</CardTitle>
              <CardDescription className="text-xs">
                Latest 10 settled prepaid deliveries credited to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading && (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              )}

              {!isLoading && recentOrders.length === 0 && (
                <div className="py-14 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No completed drops yet</p>
                  <p className="text-xs text-muted-foreground">
                    Your earnings ledger will populate as soon as you complete deliveries.
                  </p>
                </div>
              )}

              {!isLoading && recentOrders.length > 0 && (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Recipient & Area</TableHead>
                      <TableHead className="text-center">Items</TableHead>
                      <TableHead>Delivered On</TableHead>
                      <TableHead className="text-right">Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono font-bold text-xs">
                          {item.order_number}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-semibold text-foreground">
                            {item.recipient_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.city} ({item.pin_code})
                          </p>
                        </TableCell>
                        <TableCell className="text-center text-xs font-medium">
                          {item.items_count}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.delivered_at &&
                            format(new Date(item.delivered_at), "dd MMM yyyy, hh:mm a")}
                          {!item.delivered_at && "—"}
                        </TableCell>
                        <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400 text-xs">
                          +₹{item.payout_amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAdminOrdersApi,
  updateAdminOrderStatusApi,
  getOrderItemImages,
  IAdminOrder,
} from "@/lib/client-api/admin/order";
import { queryKeys } from "@/constants/query-key";
import { useDebounce } from "@/hooks/useDebounce";
import { OrderDetailsModal } from "@/components/admin/orders/OrderDetailsModal";
import { AssignPartnerModal } from "@/components/admin/orders/AssignPartnerModal";
import { CancelOrderModal } from "@/components/admin/orders/CancelOrderModal";
import type { OrderStatus } from "@/models/order.model";
import {
  Search,
  RefreshCw,
  PackageCheck,
  Package,
  Truck,
  Clock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  UserCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminOrdersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlSearch = searchParams.get("search") || "";
  const urlOrderStatus = searchParams.get("order_status") || "all";
  const urlPaymentStatus = searchParams.get("payment_status") || "all";
  const urlSortBy = searchParams.get("sortBy") || "newest";
  const urlPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [orderStatus, setOrderStatus] = useState(urlOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(urlPaymentStatus);
  const [sortBy, setSortBy] = useState(urlSortBy);
  const [page, setPage] = useState(urlPage);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [assignModalOrder, setAssignModalOrder] = useState<IAdminOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<IAdminOrder | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    const s = searchParams.get("search") || "";
    const os = searchParams.get("order_status") || "all";
    const ps = searchParams.get("payment_status") || "all";
    const sb = searchParams.get("sortBy") || "newest";
    const p = parseInt(searchParams.get("page") || "1", 10) || 1;

    if (s !== searchQuery && s !== debouncedSearch) setSearchQuery(s);
    if (os !== orderStatus) setOrderStatus(os);
    if (ps !== paymentStatus) setPaymentStatus(ps);
    if (sb !== sortBy) setSortBy(sb);
    if (p !== page) setPage(p);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch && debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (orderStatus && orderStatus !== "all") params.set("order_status", orderStatus);
    if (paymentStatus && paymentStatus !== "all") params.set("payment_status", paymentStatus);
    if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", String(page));

    const newQuery = params.toString();
    const targetUrl = newQuery ? `/admin/orders?${newQuery}` : "/admin/orders";
    router.replace(targetUrl, { scroll: false });
  }, [debouncedSearch, orderStatus, paymentStatus, sortBy, page, router]);

  const { data: response, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKeys.adminOrders, debouncedSearch, orderStatus, paymentStatus, sortBy, page],
    queryFn: () =>
      getAdminOrdersApi({
        search: debouncedSearch,
        order_status: orderStatus,
        payment_status: paymentStatus,
        sortBy,
        page,
        limit: 10,
      }),
  });

  const orders: IAdminOrder[] = response?.data?.data || [];
  const meta = response?.meta;
  const stats = meta?.stats;

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status, cancelReason }: { orderId: string; status: OrderStatus; cancelReason?: string }) =>
      updateAdminOrderStatusApi(orderId, status, cancelReason),
    onSuccess: (_, variables) => {
      toast.success(`Order status changed to "${variables.status.replace(/_/g, " ")}"`);
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminOrders] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminOverview] });
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail", variables.orderId] });
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to update order status";
      toast.error(msg);
    },
  });

  const copyToClipboard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    toast.success("Order number copied");
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const openOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailsOpen(true);
  };

  const handleCancelOrder = (e: React.MouseEvent, order: IAdminOrder) => {
    e.stopPropagation();
    setCancelModalOrder(order);
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200";
      case "processing":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200";
      case "out_for_delivery":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time ecommerce order fulfillment, dispatch pipelines, and payment audit tracking.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-10 px-4 text-xs font-semibold self-start sm:self-auto gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">
              {stats && `₹${stats.totalRevenue.toLocaleString("en-IN")}`}
              {!stats && <Skeleton className="h-8 w-24" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Settled Stripe payments
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-foreground">
              {stats && stats.totalOrders}
              {!stats && <Skeleton className="h-8 w-16" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">All-time lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Needs Fulfillment</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats && stats.pendingFulfillment}
              {!stats && <Skeleton className="h-8 w-16" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Confirmed / Processing</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
              <Truck className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats && stats.inTransit}
              {!stats && <Skeleton className="h-8 w-16" />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">With delivery courier</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border shadow-xs p-4 bg-card">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Order #, Customer Email, Phone, Recipient..."
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

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs rounded-xl border bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Order Status: All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed (Paid)</option>
              <option value="processing">Processing (Packing)</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs rounded-xl border bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 text-xs rounded-xl border bg-background font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">No orders found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query, filter options, or clearing the status selector.
          </p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const hasRider = !!order.delivery_partner_id;
            const hasAssignedRiderObject = Boolean(
              order.delivery_partner_id &&
                typeof order.delivery_partner_id === "object" &&
                order.delivery_partner_id.name
            );
            const isTerminalStatus = ["delivered", "cancelled", "returned"].includes(
              order.order_status
            );
            const currencySymbol = order.currency?.toLowerCase() === "inr" ? "₹" : "$";
            const formattedDate = order.createdAt
              ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
              : "Recent";

            const canBeCancelled = [
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "out_for_delivery",
            ].includes(order.order_status);

            return (
              <Card
                key={order._id}
                onClick={() => openOrderDetails(order._id)}
                className="rounded-2xl border shadow-xs overflow-hidden transition-all hover:shadow-md hover:border-primary/40 cursor-pointer"
              >
                <div className="bg-muted/30 border-b p-4 px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-sm text-foreground hover:underline">
                      {order.order_number}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(e, order.order_number, order._id)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                    >
                      {copiedOrderId === order._id && (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {copiedOrderId !== order._id && <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getOrderStatusBadge(
                        order.order_status
                      )}`}
                    >
                      {order.order_status.replace(/_/g, " ")}
                    </span>

                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        order.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      {order.payment_status}
                    </span>

                    <span className="text-xs text-muted-foreground pl-1">• Placed on {formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <span className="text-base font-black text-primary">
                      {currencySymbol}{order.pricing.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    <div className="lg:col-span-4 space-y-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        👤 {order.shipping_address.recipient_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        ✉️ {order.customer_email}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        📍 {order.shipping_address.address_line_1}, {order.shipping_address.city} (
                        {order.shipping_address.pin_code})
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex items-center gap-3 flex-wrap py-1">
                      {order.items.map((item, idx) => {
                        const itemImages = getOrderItemImages(item);
                        const primaryUrl = itemImages[0]?.url || item.image;

                        return (
                          <div key={idx} className="relative shrink-0" title={item.name}>
                            {primaryUrl && (
                              <img
                                src={primaryUrl}
                                alt={item.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border bg-muted"
                              />
                            )}
                            {!primaryUrl && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-xs">
                              {item.quantity}
                            </span>
                            {itemImages.length > 1 && (
                              <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                                {itemImages.length} photos
                              </span>
                            )}
                          </div>
                        );
                      })}
                      <div className="text-xs text-muted-foreground pl-1 font-medium">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} unit(s)
                      </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 flex-wrap">
                      {hasAssignedRiderObject &&
                        typeof order.delivery_partner_id === "object" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl text-xs border-purple-200 bg-purple-50/50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
                            disabled={isTerminalStatus}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignModalOrder(order);
                            }}
                          >
                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                            {order.delivery_partner_id.name.split(" ")[0]}
                          </Button>
                        )}

                      {!hasAssignedRiderObject && !isTerminalStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-xs text-amber-700 bg-amber-50/50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignModalOrder(order);
                          }}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Assign Rider
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-xl text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderDetails(order._id);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>

                      {order.order_status === "pending" && order.payment_method === "cod" && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          disabled={statusMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ orderId: order._id, status: "confirmed" });
                          }}
                        >
                          Confirm Order
                        </Button>
                      )}

                      {order.order_status === "pending" && order.payment_method !== "cod" && (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center px-2 py-1">
                          <Clock className="w-3.5 h-3.5 mr-1" /> Awaiting Payment
                        </span>
                      )}

                      {order.order_status === "confirmed" && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          disabled={statusMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ orderId: order._id, status: "processing" });
                          }}
                        >
                          Start Packing
                        </Button>
                      )}

                      {order.order_status === "processing" && hasRider && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                          disabled={statusMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ orderId: order._id, status: "shipped" });
                          }}
                        >
                          Dispatch (Shipped)
                        </Button>
                      )}

                      {order.order_status === "processing" && !hasRider && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 rounded-xl text-xs font-bold shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Please select a delivery partner to dispatch this package");
                            setAssignModalOrder(order);
                          }}
                        >
                          <Truck className="w-3.5 h-3.5 mr-1.5" /> Assign Driver to Dispatch
                        </Button>
                      )}

                      {order.order_status === "shipped" && hasRider && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                          disabled={statusMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ orderId: order._id, status: "out_for_delivery" });
                          }}
                        >
                          Out for Delivery
                        </Button>
                      )}

                      {order.order_status === "shipped" && !hasRider && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 rounded-xl text-xs font-bold shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Please assign a delivery partner for this order");
                            setAssignModalOrder(order);
                          }}
                        >
                          <Truck className="w-3.5 h-3.5 mr-1.5" /> Assign Driver
                        </Button>
                      )}

                      {order.order_status === "out_for_delivery" && hasRider && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          disabled={statusMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            statusMutation.mutate({ orderId: order._id, status: "delivered" });
                          }}
                        >
                          Mark Delivered
                        </Button>
                      )}

                      {order.order_status === "out_for_delivery" && !hasRider && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9 rounded-xl text-xs font-bold shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Please assign a delivery partner for this order");
                            setAssignModalOrder(order);
                          }}
                        >
                          <Truck className="w-3.5 h-3.5 mr-1.5" /> Assign Driver
                        </Button>
                      )}

                      {order.order_status === "delivered" && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center px-2 py-1">
                          <Check className="w-4 h-4 mr-1" /> Delivered
                        </span>
                      )}

                      {order.order_status === "cancelled" && (
                        <span className="text-xs font-bold text-destructive flex items-center px-2 py-1">
                          <Ban className="w-3.5 h-3.5 mr-1" /> Cancelled
                        </span>
                      )}

                      {order.order_status === "returned" && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center px-2 py-1">
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Returned
                        </span>
                      )}

                      {canBeCancelled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handleCancelOrder(e, order)}
                          title="Cancel order"
                        >
                          Cancel
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{(page - 1) * meta.limit + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * meta.limit, meta.total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{meta.total}</span> orders
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
            <span className="text-xs font-semibold px-2">
              Page {page} of {meta.totalPages}
            </span>
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

      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrderId(null);
        }}
        onAssignPartner={(order) => {
          setAssignModalOrder(order);
        }}
      />

      {assignModalOrder && (
        <AssignPartnerModal
          orderId={assignModalOrder._id}
          orderNumber={assignModalOrder.order_number}
          currentPartnerId={
            typeof assignModalOrder.delivery_partner_id === "object"
              ? assignModalOrder.delivery_partner_id?._id
              : undefined
          }
          isOpen={!!assignModalOrder}
          onClose={() => setAssignModalOrder(null)}
        />
      )}

      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          isOpen={!!cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
        />
      )}
    </div>
  );
}

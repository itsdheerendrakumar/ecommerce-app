import "server-only";
import type { Types } from "mongoose";
import { connectDb } from "@/lib/db";
import Order, { OrderStatus, PaymentMethod, PaymentStatus } from "@/models/order.model";
import Product, { IProductImage } from "@/models/product.model";
import User from "@/models/user.model";
import DeliveryPartner from "@/models/delivery-partner.model";
import PaymentTransaction from "@/models/payment.model";
import StripeWebhookEvent from "@/models/stripe-event.model";
import UploadSession from "@/models/upload-session.model";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

import type {
  AdminOverviewData,
  OverviewLowStockProduct,
  OverviewOrderStatusItem,
  OverviewPaymentMethodItem,
  OverviewPaymentStatusItem,
  OverviewQueueOrder,
  OverviewRange,
  OverviewTopProduct,
} from "@/types/admin-overview";

export * from "@/types/admin-overview";

interface LeanQueueOrderDoc {
  _id: Types.ObjectId | string;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  currency?: string;
  pricing?: { total_amount?: number };
  shipping_address?: { recipient_name?: string; city?: string };
  customer_email: string;
  items?: { quantity?: number }[];
  delivery_partner_id?:
    | { _id: Types.ObjectId | string; name: string; phone?: string }
    | Types.ObjectId
    | null;
  createdAt?: Date | string;
}

interface LeanLowStockProductDoc {
  _id: Types.ObjectId | string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images?: IProductImage[];
}

interface TopProductAggRow {
  productId: string;
  name: string;
  category: string;
  image?: string;
  productImages?: IProductImage[];
  unitsSold: number;
  revenue: number;
  currentStock: number | null;
}

const ORDER_STATUS_ORDER: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
  { status: "cancelled", label: "Cancelled" },
  { status: "returned", label: "Returned" },
];

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

function getDateWindow(range: OverviewRange) {
  const now = new Date();
  const end = endOfDay(now);

  if (range === "all") {
    return {
      start: null as Date | null,
      end,
      prevStart: null as Date | null,
      prevEnd: null as Date | null,
    };
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = startOfDay(subDays(now, days - 1));
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = startOfDay(subDays(start, days));

  return { start, end, prevStart, prevEnd };
}

function calcDeltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? 100 : null;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function resolvePrimaryImage(images?: { secureUrl?: string; isPrimary?: boolean; position?: number }[]) {
  if (!images || images.length === 0) return undefined;
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  return sorted[0]?.secureUrl;
}

export async function getAdminOverviewService(
  range: OverviewRange = "30d"
): Promise<AdminOverviewData> {
  await connectDb();

  const { start, end, prevStart, prevEnd } = getDateWindow(range);
  const rangeMatch = start ? { createdAt: { $gte: start, $lte: end } } : {};
  const prevRangeMatch =
    prevStart && prevEnd ? { createdAt: { $gte: prevStart, $lte: prevEnd } } : null;

  const granularity: "day" | "week" | "month" =
    range === "7d" || range === "30d" ? "day" : range === "90d" ? "week" : "month";

  const dateFormatStr =
    granularity === "day"
      ? "%Y-%m-%d"
      : granularity === "week"
        ? "%G-%V"
        : "%Y-%m";

  const productCollection = Product.collection.name;
  const deliveryPartnerCollection = DeliveryPartner.collection.name;
  const now = new Date();

  const [
    orderSummaryAgg,
    prevOrderSummaryAgg,
    refundsAgg,
    liveOpsAgg,
    latestOrderDoc,
    orderStatusAgg,
    trendAgg,
    categoryAgg,
    paymentMethodAgg,
    paymentStatusAgg,
    paymentTxAgg,
    catalogAgg,
    customerStatsAgg,
    riderStatsAgg,
    ordersQueueDocs,
    lowStockDocs,
    topProductsAgg,
    riderUsersDocs,
    failedWebhooksCount,
    failedPaymentsCount,
    expiredSessionsCount,
  ] = await Promise.all([
    // 1. Orders & Gross Revenue in range
    Order.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] },
          },
          grossRevenue: {
            $sum: {
              $cond: [{ $eq: ["$payment_status", "paid"] }, "$pricing.total_amount", 0],
            },
          },
          deliveredCount: {
            $sum: { $cond: [{ $eq: ["$order_status", "delivered"] }, 1, 0] },
          },
          cancelledReturnedCount: {
            $sum: {
              $cond: [{ $in: ["$order_status", ["cancelled", "returned"]] }, 1, 0],
            },
          },
        },
      },
    ]),

    // 2. Previous period orders & revenue (for delta %)
    prevRangeMatch
      ? Order.aggregate([
          { $match: prevRangeMatch },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              grossRevenue: {
                $sum: {
                  $cond: [{ $eq: ["$payment_status", "paid"] }, "$pricing.total_amount", 0],
                },
              },
            },
          },
        ])
      : Promise.resolve([]),

    // 3. Succeeded refunds in range
    PaymentTransaction.aggregate([
      { $unwind: "$refunds" },
      { $match: { "refunds.status": "succeeded" } },
      ...(start
        ? [{ $match: { "refunds.created_at": { $gte: start, $lte: end } } }]
        : []),
      {
        $group: {
          _id: null,
          refundedAmount: { $sum: "$refunds.amount" },
        },
      },
    ]),

    // 4. Live operational counts (always all-time active)
    Order.aggregate([
      {
        $group: {
          _id: null,
          needsFulfillment: {
            $sum: {
              $cond: [{ $in: ["$order_status", ["confirmed", "processing"]] }, 1, 0],
            },
          },
          unassignedActive: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $in: [
                        "$order_status",
                        ["confirmed", "processing", "shipped", "out_for_delivery"],
                      ],
                    },
                    { $eq: [{ $ifNull: ["$delivery_partner_id", null] }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          inTransitCount: {
            $sum: {
              $cond: [{ $in: ["$order_status", ["shipped", "out_for_delivery"]] }, 1, 0],
            },
          },
        },
      },
    ]),

    // 5. Latest order currency
    Order.findOne().sort({ createdAt: -1 }).select("currency").lean(),

    // 6. Order status breakdown in range
    Order.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total_amount" },
        },
      },
    ]),

    // 7. Revenue & Order trend buckets
    Order.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormatStr,
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$payment_status", "paid"] }, "$pricing.total_amount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 8. Category revenue breakdown
    Order.aggregate([
      {
        $match: {
          ...rangeMatch,
          order_status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: productCollection,
          localField: "items.product_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      {
        $unwind: {
          path: "$productDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$productDoc.category", "Uncategorized"] },
          revenue: { $sum: "$items.total_price" },
          unitsSold: { $sum: "$items.quantity" },
          orderIds: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          revenue: 1,
          unitsSold: 1,
          orderCount: { $size: "$orderIds" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),

    // 9. Payment method breakdown
    Order.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total_amount" },
        },
      },
    ]),

    // 10. Payment status breakdown
    Order.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: "$payment_status",
          count: { $sum: 1 },
          amount: { $sum: "$pricing.total_amount" },
        },
      },
    ]),

    // 11. Stripe PaymentTransaction statuses
    PaymentTransaction.aggregate([
      { $match: rangeMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // 12. Catalog & inventory summary
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          publishedProducts: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          outOfStockCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "published"] }, { $lte: ["$stock", 0] }] },
                1,
                0,
              ],
            },
          },
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "published"] },
                    { $gt: ["$stock", 0] },
                    { $lte: ["$stock", 5] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalInventoryUnits: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, "$stock", 0] },
          },
          catalogValue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "published"] },
                { $multiply: ["$price", "$stock"] },
                0,
              ],
            },
          },
        },
      },
    ]),

    // 13. Customer stats
    User.aggregate([
      { $match: { role: "customer" } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ["$is_active", true] }, 1, 0] },
          },
          newCustomersInRange: {
            $sum: {
              $cond: [
                start ? { $gte: ["$createdAt", start] } : { $literal: true },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    // 14. Delivery partner fleet stats
    DeliveryPartner.aggregate([
      {
        $group: {
          _id: null,
          totalRiders: { $sum: 1 },
          onDutyRiders: {
            $sum: { $cond: [{ $eq: ["$duty_status", "on-duty"] }, 1, 0] },
          },
          inDeliveryRiders: {
            $sum: { $cond: [{ $eq: ["$duty_status", "in-delivery"] }, 1, 0] },
          },
          offDutyRiders: {
            $sum: { $cond: [{ $eq: ["$duty_status", "off-duty"] }, 1, 0] },
          },
          totalCompletedDeliveries: {
            $sum: { $ifNull: ["$completed_deliveries", 0] },
          },
        },
      },
    ]),

    // 15. Active Orders Queue needing admin attention / dispatch
    Order.find({
      order_status: { $in: ["pending", "confirmed", "processing", "shipped", "out_for_delivery"] },
    })
      .populate("delivery_partner_id", "name phone")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),

    // 16. Low-stock published products
    Product.find({ status: "published", stock: { $lte: 10 } })
      .sort({ stock: 1, updatedAt: -1 })
      .limit(6)
      .select("name category price stock images")
      .lean(),

    // 17. Top selling products in range
    Order.aggregate([
      {
        $match: {
          ...rangeMatch,
          order_status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total_price" },
        },
      },
      { $sort: { revenue: -1, unitsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: productCollection,
          localField: "_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      {
        $unwind: {
          path: "$productDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: "$_id" },
          name: { $ifNull: ["$productDoc.name", "$name"] },
          category: { $ifNull: ["$productDoc.category", "General"] },
          image: "$image",
          productImages: "$productDoc.images",
          unitsSold: 1,
          revenue: 1,
          currentStock: { $ifNull: ["$productDoc.stock", null] },
        },
      },
    ]),

    // 18. Active delivery riders snapshot
    User.aggregate([
      { $match: { role: "delivery-partner", is_active: true } },
      {
        $lookup: {
          from: deliveryPartnerCollection,
          localField: "_id",
          foreignField: "user_id",
          as: "dp",
        },
      },
      { $unwind: { path: "$dp", preserveNullAndEmptyArrays: false } },
      {
        $addFields: {
          dutyPriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$dp.duty_status", "on-duty"] }, then: 0 },
                { case: { $eq: ["$dp.duty_status", "in-delivery"] }, then: 1 },
              ],
              default: 2,
            },
          },
        },
      },
      { $sort: { dutyPriority: 1, "dp.completed_deliveries": -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          phone: 1,
          duty_status: { $ifNull: ["$dp.duty_status", "off-duty"] },
          completed_deliveries: { $ifNull: ["$dp.completed_deliveries", 0] },
          vehicle_number: "$dp.vehicle_number",
          city: "$dp.address.city",
        },
      },
    ]),

    // 19. System Health: Failed Stripe Webhooks
    StripeWebhookEvent.countDocuments({ status: "failed" }),

    // 20. System Health: Failed payments in range
    PaymentTransaction.countDocuments({ ...rangeMatch, status: "failed" }),

    // 21. System Health: Expired/abandoned upload sessions
    UploadSession.countDocuments({
      $or: [
        { status: "expired" },
        { status: { $in: ["pending", "uploading"] }, expiresAt: { $lt: now } },
      ],
    }),
  ]);

  const orderSummary = orderSummaryAgg[0] || {
    totalOrders: 0,
    paidOrders: 0,
    grossRevenue: 0,
    deliveredCount: 0,
    cancelledReturnedCount: 0,
  };
  const prevSummary = prevOrderSummaryAgg[0] || {
    totalOrders: 0,
    grossRevenue: 0,
  };
  const refundedAmount = refundsAgg[0]?.refundedAmount || 0;
  const netRevenue = Math.max(0, orderSummary.grossRevenue - refundedAmount);
  const liveOps = liveOpsAgg[0] || {
    needsFulfillment: 0,
    unassignedActive: 0,
    inTransitCount: 0,
  };

  const totalOrders = orderSummary.totalOrders || 0;
  const paidOrders = orderSummary.paidOrders || 0;
  const averageOrderValue = paidOrders > 0 ? orderSummary.grossRevenue / paidOrders : 0;
  const fulfillmentRate =
    totalOrders > 0
      ? Number(((orderSummary.deliveredCount / totalOrders) * 100).toFixed(1))
      : 0;
  const cancellationRate =
    totalOrders > 0
      ? Number(((orderSummary.cancelledReturnedCount / totalOrders) * 100).toFixed(1))
      : 0;

  // Build Order Status Breakdown preserving full lifecycle order
  const statusMap = new Map<string, { count: number; revenue: number }>();
  for (const row of orderStatusAgg) {
    statusMap.set(row._id, { count: row.count, revenue: row.revenue });
  }
  const orderStatusBreakdown: OverviewOrderStatusItem[] = ORDER_STATUS_ORDER.map(
    ({ status, label }) => ({
      status,
      label,
      count: statusMap.get(status)?.count || 0,
      revenue: statusMap.get(status)?.revenue || 0,
    })
  );

  // Build continuous time-series buckets for ApexCharts
  const trendMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of trendAgg) {
    trendMap.set(row._id, {
      revenue: Number((row.revenue || 0).toFixed(2)),
      orders: row.orders || 0,
    });
  }

  const trendCategories: string[] = [];
  const trendLabels: string[] = [];
  const trendRevenue: number[] = [];
  const trendOrders: number[] = [];

  if (granularity === "day" && start) {
    const days = eachDayOfInterval({ start, end });
    for (const d of days) {
      const key = format(d, "yyyy-MM-dd");
      const label = format(d, range === "7d" ? "EEE, dd MMM" : "dd MMM");
      const entry = trendMap.get(key);
      trendCategories.push(key);
      trendLabels.push(label);
      trendRevenue.push(entry?.revenue ?? 0);
      trendOrders.push(entry?.orders ?? 0);
    }
  } else if (granularity === "week" && start) {
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    for (const w of weeks) {
      const weekStart = startOfWeek(w, { weekStartsOn: 1 });
      const key = format(weekStart, "RRRR-II");
      const label = `Wk ${format(weekStart, "dd MMM")}`;
      const entry = trendMap.get(key);
      trendCategories.push(key);
      trendLabels.push(label);
      trendRevenue.push(entry?.revenue ?? 0);
      trendOrders.push(entry?.orders ?? 0);
    }
  } else {
    // All-time monthly buckets
    const keys = Array.from(trendMap.keys()).sort();
    const earliest = keys.length > 0 ? new Date(`${keys[0]}-01T00:00:00`) : startOfMonth(now);
    const months = eachMonthOfInterval({
      start: startOfMonth(earliest),
      end: startOfMonth(now),
    });
    for (const m of months) {
      const key = format(m, "yyyy-MM");
      const label = format(m, "MMM yyyy");
      const entry = trendMap.get(key);
      trendCategories.push(key);
      trendLabels.push(label);
      trendRevenue.push(entry?.revenue ?? 0);
      trendOrders.push(entry?.orders ?? 0);
    }
  }

  // Payment breakdown
  const methodMap = new Map<string, { count: number; revenue: number }>();
  for (const row of paymentMethodAgg) {
    methodMap.set(row._id, { count: row.count, revenue: row.revenue });
  }
  const byMethod: OverviewPaymentMethodItem[] = [
    {
      method: "stripe",
      label: "Stripe Online",
      count: methodMap.get("stripe")?.count || 0,
      revenue: methodMap.get("stripe")?.revenue || 0,
    },
    {
      method: "cod",
      label: "Cash on Delivery",
      count: methodMap.get("cod")?.count || 0,
      revenue: methodMap.get("cod")?.revenue || 0,
    },
  ];

  const byStatus: OverviewPaymentStatusItem[] = paymentStatusAgg.map((row) => ({
    status: row._id,
    label: PAYMENT_STATUS_LABELS[row._id] || row._id,
    count: row.count,
    amount: row.amount,
  }));

  const txMap = new Map<string, number>();
  for (const row of paymentTxAgg) {
    txMap.set(row._id, row.count);
  }
  const transactionsSummary = {
    succeeded: txMap.get("succeeded") || 0,
    failed: txMap.get("failed") || 0,
    pending:
      (txMap.get("requires_payment_method") || 0) +
      (txMap.get("requires_confirmation") || 0) +
      (txMap.get("requires_action") || 0) +
      (txMap.get("processing") || 0) +
      (txMap.get("requires_capture") || 0),
    canceled: txMap.get("canceled") || 0,
  };

  // Prioritize confirmed/processing/unassigned orders at the top of the dispatch queue
  const priorityScore = (order: LeanQueueOrderDoc) => {
    const unassigned = !order.delivery_partner_id ? 0 : 1;
    if (order.order_status === "confirmed") return unassigned;
    if (order.order_status === "processing") return 2 + unassigned;
    if (order.order_status === "pending") return 4 + unassigned;
    if (order.order_status === "shipped") return 6 + unassigned;
    return 8;
  };

  const typedQueueDocs = ordersQueueDocs as unknown as LeanQueueOrderDoc[];
  const sortedQueue = [...typedQueueDocs]
    .sort((a, b) => priorityScore(a) - priorityScore(b))
    .slice(0, 6);

  const ordersNeedingAction: OverviewQueueOrder[] = sortedQueue.map((o) => {
    const populatedPartner =
      o.delivery_partner_id &&
      typeof o.delivery_partner_id === "object" &&
      "name" in o.delivery_partner_id
        ? o.delivery_partner_id
        : null;

    return {
      _id: String(o._id),
      order_number: o.order_number,
      order_status: o.order_status,
      payment_status: o.payment_status,
      payment_method: o.payment_method,
      currency: o.currency || "inr",
      total_amount: o.pricing?.total_amount || 0,
      recipient_name: o.shipping_address?.recipient_name || "Customer",
      city: o.shipping_address?.city || "",
      customer_email: o.customer_email,
      items_count: Array.isArray(o.items)
        ? o.items.reduce((acc, item) => acc + (item.quantity || 0), 0)
        : 0,
      delivery_partner: populatedPartner
        ? {
            _id: String(populatedPartner._id),
            name: populatedPartner.name,
            phone: populatedPartner.phone,
          }
        : null,
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : now.toISOString(),
    };
  });

  const typedLowStockDocs = lowStockDocs as unknown as LeanLowStockProductDoc[];
  const lowStockProducts: OverviewLowStockProduct[] = typedLowStockDocs.map((p) => ({
    _id: String(p._id),
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    image: resolvePrimaryImage(p.images),
  }));

  const typedTopProducts = topProductsAgg as TopProductAggRow[];
  const topSellingProducts: OverviewTopProduct[] = typedTopProducts.map((p) => ({
    productId: p.productId,
    name: p.name,
    category: p.category,
    image: resolvePrimaryImage(p.productImages) || p.image,
    unitsSold: p.unitsSold,
    revenue: p.revenue,
    currentStock: p.currentStock,
  }));

  const catalog = catalogAgg[0] || {
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    totalInventoryUnits: 0,
    catalogValue: 0,
  };

  const customerStats = customerStatsAgg[0] || {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersInRange: 0,
  };

  const riderStats = riderStatsAgg[0] || {
    totalRiders: 0,
    onDutyRiders: 0,
    inDeliveryRiders: 0,
    offDutyRiders: 0,
    totalCompletedDeliveries: 0,
  };

  const latestCurrency =
    latestOrderDoc && typeof latestOrderDoc === "object" && "currency" in latestOrderDoc
      ? String((latestOrderDoc as { currency?: string }).currency || "inr")
      : "inr";

  return {
    range,
    currency: latestCurrency,
    generatedAt: now.toISOString(),
    kpis: {
      netRevenue,
      grossRevenue: orderSummary.grossRevenue,
      refundedAmount,
      revenueDeltaPercent: prevRangeMatch
        ? calcDeltaPercent(orderSummary.grossRevenue, prevSummary.grossRevenue)
        : null,
      totalOrders,
      paidOrders,
      ordersDeltaPercent: prevRangeMatch
        ? calcDeltaPercent(totalOrders, prevSummary.totalOrders)
        : null,
      averageOrderValue,
      needsFulfillment: liveOps.needsFulfillment,
      unassignedActive: liveOps.unassignedActive,
      inTransitCount: liveOps.inTransitCount,
      deliveredCount: orderSummary.deliveredCount,
      cancelledReturnedCount: orderSummary.cancelledReturnedCount,
      fulfillmentRate,
      cancellationRate,
    },
    catalogSummary: {
      totalProducts: catalog.totalProducts,
      publishedProducts: catalog.publishedProducts,
      draftProducts: catalog.draftProducts,
      outOfStockCount: catalog.outOfStockCount,
      lowStockCount: catalog.lowStockCount,
      totalInventoryUnits: catalog.totalInventoryUnits,
      catalogValue: catalog.catalogValue,
    },
    usersAndFleet: {
      totalCustomers: customerStats.totalCustomers,
      activeCustomers: customerStats.activeCustomers,
      newCustomersInRange: customerStats.newCustomersInRange,
      totalRiders: riderStats.totalRiders,
      onDutyRiders: riderStats.onDutyRiders,
      inDeliveryRiders: riderStats.inDeliveryRiders,
      offDutyRiders: riderStats.offDutyRiders,
      totalCompletedDeliveries: riderStats.totalCompletedDeliveries,
    },
    charts: {
      revenueTrend: {
        categories: trendCategories,
        labels: trendLabels,
        revenue: trendRevenue,
        orders: trendOrders,
      },
      orderStatusBreakdown,
      categoryRevenue: categoryAgg,
      paymentBreakdown: {
        byMethod,
        byStatus,
        transactionsSummary,
      },
    },
    actionQueues: {
      ordersNeedingAction,
      lowStockProducts,
      topSellingProducts,
      activeRiders: riderUsersDocs,
    },
    systemHealth: {
      failedWebhooks: failedWebhooksCount,
      failedPayments: failedPaymentsCount,
      expiredUploadSessions: expiredSessionsCount,
    },
  };
}

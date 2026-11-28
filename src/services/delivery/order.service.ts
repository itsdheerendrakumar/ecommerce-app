import "server-only";
import mongoose from "mongoose";
import { startOfDay, startOfMonth, subDays } from "date-fns";
import { connectDb } from "@/lib/db";
import ApiError from "@/lib/api-error";
import { DELIVERY_PAYOUT_PER_ORDER_INR } from "@/constants/delivery";
import DeliveryPartner from "@/models/delivery-partner.model";
import Order from "@/models/order.model";
import { syncDeliveryPartnerDutyStatus } from "./rider-state.service";

export interface GetDeliveryOrdersParams {
  scope?: "active" | "history";
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetDeliveryOrdersResult {
  orders: unknown[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getDeliveryOrdersService(
  userId: string,
  params: GetDeliveryOrdersParams = {}
): Promise<GetDeliveryOrdersResult> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const {
    scope = "active",
    status,
    search,
    page = 1,
    limit = 10,
  } = params;

  const pageNumber = Math.max(1, page);
  const limitNumber = Math.max(1, Math.min(50, limit));
  const skip = (pageNumber - 1) * limitNumber;

  const query: Record<string, unknown> = {
    delivery_partner_id: new mongoose.Types.ObjectId(userId),
  };

  if (scope === "history") {
    const historyStatuses = ["delivered", "cancelled", "returned"];
    query.order_status =
      status && historyStatuses.includes(status)
        ? status
        : { $in: historyStatuses };
  } else {
    const activeStatuses = ["shipped", "out_for_delivery"];
    query.order_status =
      status && activeStatuses.includes(status)
        ? status
        : { $in: activeStatuses };
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [
      { order_number: regex },
      { "shipping_address.recipient_name": regex },
      { "shipping_address.city": regex },
      { "shipping_address.pin_code": regex },
      { "shipping_address.phone": regex },
    ];
  }

  // Ascending order_status places "out_for_delivery" ahead of "shipped"
  const sortOption: Record<string, 1 | -1> =
    scope === "history"
      ? { delivered_at: -1, updatedAt: -1 }
      : { order_status: 1, shipped_at: 1, createdAt: 1 };

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("items.product_id", "images name category")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNumber) || 1;

  return {
    orders,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
}

export async function updateDeliveryOrderStatusService(
  userId: string,
  orderId: string,
  newStatus: "out_for_delivery" | "delivered"
) {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID format");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (!order.delivery_partner_id || order.delivery_partner_id.toString() !== userId) {
    throw new ApiError(403, "Unauthorized: This order is not assigned to you");
  }

  if (order.payment_status !== "paid") {
    throw new ApiError(
      400,
      `Order cannot be fulfilled because payment status is "${order.payment_status}".`
    );
  }

  if (order.order_status === newStatus) {
    return order;
  }

  if (newStatus === "out_for_delivery" && order.order_status !== "shipped") {
    throw new ApiError(
      400,
      `Cannot start delivery for an order in "${order.order_status}" state. Order must be shipped first.`
    );
  }

  if (newStatus === "delivered" && order.order_status !== "out_for_delivery") {
    throw new ApiError(
      400,
      `Cannot mark delivered from "${order.order_status}". Start delivery pickup first.`
    );
  }

  order.order_status = newStatus;

  if (newStatus === "delivered") {
    order.delivered_at = new Date();
  }

  await order.save();

  if (newStatus === "delivered") {
    await DeliveryPartner.updateOne(
      { user_id: order.delivery_partner_id },
      { $inc: { completed_deliveries: 1 } }
    );
  }

  const dutyStatus = await syncDeliveryPartnerDutyStatus(userId);

  return {
    order,
    duty_status: dutyStatus,
  };
}

export async function updateDeliveryDutyStatusService(
  userId: string,
  targetStatus: "on-duty" | "off-duty"
) {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (targetStatus === "off-duty") {
    const activeDeliveries = await Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "out_for_delivery",
    });

    if (activeDeliveries > 0) {
      throw new ApiError(
        400,
        "Please complete your active out-for-delivery orders before going off duty."
      );
    }
  }

  const partner = await DeliveryPartner.findOneAndUpdate(
    { user_id: userObjectId },
    { $set: { duty_status: targetStatus } },
    { new: true }
  ).lean();

  if (!partner) {
    throw new ApiError(404, "Delivery partner profile not found");
  }

  return partner;
}

export async function getDeliveryPartnerStatsService(userId: string) {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfDay(subDays(now, 6));
  const monthStart = startOfMonth(now);

  const [
    partner,
    readyForPickupCount,
    inTransitCount,
    deliveredTodayCount,
    deliveredWeekCount,
    deliveredMonthCount,
    totalDeliveredCount,
    recentCompletedOrders,
  ] = await Promise.all([
    DeliveryPartner.findOne({ user_id: userObjectId })
      .select("duty_status completed_deliveries total_ratings vehicle_name vehicle_number address")
      .lean(),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "shipped",
    }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "out_for_delivery",
    }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "delivered",
      delivered_at: { $gte: todayStart },
    }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "delivered",
      delivered_at: { $gte: weekStart },
    }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "delivered",
      delivered_at: { $gte: monthStart },
    }),
    Order.countDocuments({
      delivery_partner_id: userObjectId,
      order_status: "delivered",
    }),
    Order.find({
      delivery_partner_id: userObjectId,
      order_status: "delivered",
    })
      .select("order_number shipping_address pricing currency delivered_at shipped_at items")
      .sort({ delivered_at: -1, updatedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const effectiveTotalDelivered = Math.max(
    totalDeliveredCount,
    partner?.completed_deliveries ?? 0
  );

  return {
    dutyStatus: partner?.duty_status ?? "off-duty",
    vehicle: {
      name: partner?.vehicle_name ?? "",
      number: partner?.vehicle_number ?? "",
    },
    operatingCity: partner?.address?.city ?? "",
    totalRatings: partner?.total_ratings ?? 0,
    readyForPickupCount,
    inTransitCount,
    deliveredTodayCount,
    deliveredWeekCount,
    deliveredMonthCount,
    totalDeliveredCount: effectiveTotalDelivered,
    payoutPerDelivery: DELIVERY_PAYOUT_PER_ORDER_INR,
    todayEarnings: deliveredTodayCount * DELIVERY_PAYOUT_PER_ORDER_INR,
    weekEarnings: deliveredWeekCount * DELIVERY_PAYOUT_PER_ORDER_INR,
    monthEarnings: deliveredMonthCount * DELIVERY_PAYOUT_PER_ORDER_INR,
    totalEarnings: effectiveTotalDelivered * DELIVERY_PAYOUT_PER_ORDER_INR,
    recentCompletedOrders: recentCompletedOrders.map((order) => ({
      _id: String(order._id),
      order_number: order.order_number,
      recipient_name: order.shipping_address?.recipient_name ?? "Customer",
      city: order.shipping_address?.city ?? "",
      pin_code: order.shipping_address?.pin_code ?? "",
      items_count: Array.isArray(order.items)
        ? order.items.reduce((acc, item) => acc + (item.quantity || 0), 0)
        : 0,
      order_total: order.pricing?.total_amount ?? 0,
      currency: order.currency || "inr",
      delivered_at: order.delivered_at ? new Date(order.delivered_at).toISOString() : null,
      payout_amount: DELIVERY_PAYOUT_PER_ORDER_INR,
    })),
  };
}

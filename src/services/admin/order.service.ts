import "server-only";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import ApiError from "@/lib/api-error";
import Order, { IOrder, OrderStatus } from "@/models/order.model";
import PaymentTransaction from "@/models/payment.model";
import Product from "@/models/product.model";
import User from "@/models/user.model";
import { syncDeliveryPartnerDutyStatus } from "@/services/delivery/rider-state.service";

export interface GetAdminOrdersParams {
  search?: string;
  order_status?: string;
  payment_status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingFulfillment: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

export interface GetAdminOrdersResult {
  orders: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: AdminOrderStats;
}

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["cancelled", "returned"],
  out_for_delivery: ["cancelled", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export async function getAdminOrdersService(
  params: GetAdminOrdersParams = {}
): Promise<GetAdminOrdersResult> {
  await connectDb();

  const {
    search,
    order_status,
    payment_status,
    sortBy = "newest",
    page = 1,
    limit = 10,
  } = params;

  const query: Record<string, any> = {};

  if (order_status && order_status !== "all") {
    query.order_status = order_status;
  }

  if (payment_status && payment_status !== "all") {
    query.payment_status = payment_status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    query.$or = [
      { order_number: { $regex: q, $options: "i" } },
      { customer_email: { $regex: q, $options: "i" } },
      { customer_phone: { $regex: q, $options: "i" } },
      { "shipping_address.recipient_name": { $regex: q, $options: "i" } },
      { "shipping_address.city": { $regex: q, $options: "i" } },
    ];
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sortBy === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sortBy === "amount-high") {
    sortOption = { "pricing.total_amount": -1 };
  } else if (sortBy === "amount-low") {
    sortOption = { "pricing.total_amount": 1 };
  }

  const skip = (page - 1) * limit;

  const [orders, total, stats] = await Promise.all([
    Order.find(query)
      .populate("delivery_partner_id", "name email phone profile_picture")
      .populate("user_id", "name email phone")
      .populate("items.product_id", "images name category")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
    getAdminOrderStatsInternal(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    stats,
  };
}

async function getAdminOrderStatsInternal(): Promise<AdminOrderStats> {
  const [counts, revenueResult] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: { payment_status: "paid" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total_amount" },
        },
      },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  let totalOrders = 0;

  for (const item of counts) {
    statusMap[item._id] = item.count;
    totalOrders += item.count;
  }

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  const pendingFulfillment =
    (statusMap["confirmed"] || 0) + (statusMap["processing"] || 0) + (statusMap["pending"] || 0);
  const inTransit =
    (statusMap["shipped"] || 0) + (statusMap["out_for_delivery"] || 0);
  const delivered = statusMap["delivered"] || 0;
  const cancelled = (statusMap["cancelled"] || 0) + (statusMap["returned"] || 0);

  return {
    totalOrders,
    totalRevenue,
    pendingFulfillment,
    inTransit,
    delivered,
    cancelled,
  };
}

export async function getAdminOrderDetailService(orderId: string): Promise<any> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID format");
  }

  const order = await Order.findById(orderId)
    .populate("delivery_partner_id", "name email phone profile_picture")
    .populate("user_id", "name email phone")
    .populate("items.product_id", "images name category")
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const payment = await PaymentTransaction.findOne({ order_id: order._id }).lean();

  return {
    ...order,
    payment,
  };
}

export async function updateAdminOrderStatusService(
  orderId: string,
  newStatus: OrderStatus,
  cancelReason?: string
): Promise<IOrder> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID format");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const currentStatus = order.order_status;

  if (currentStatus === newStatus) {
    return order;
  }

  if (currentStatus === "delivered" && newStatus !== "returned") {
    throw new ApiError(400, "Order is already marked as Delivered. Delivered orders cannot be modified.");
  }
  if (currentStatus === "cancelled") {
    throw new ApiError(400, "Order is already Cancelled. Cancelled orders cannot be resumed.");
  }
  if (currentStatus === "returned") {
    throw new ApiError(400, "Order is already Returned. Returned orders cannot be modified.");
  }

  const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(newStatus)) {
    if (newStatus === "out_for_delivery" || newStatus === "delivered") {
      throw new ApiError(
        400,
        `Status "${newStatus.replace(/_/g, " ")}" can only be updated by the assigned delivery partner.`
      );
    }
    throw new ApiError(
      400,
      `Invalid order status progression. Cannot transition from "${currentStatus}" to "${newStatus}".`
    );
  }

  if (newStatus === "shipped" && !order.delivery_partner_id) {
    throw new ApiError(
      400,
      'Cannot change status to "shipped". A delivery partner must be assigned before dispatching.'
    );
  }

  if (newStatus === "processing" || newStatus === "shipped") {
    if (order.payment_status !== "paid") {
      throw new ApiError(
        400,
        `Cannot fulfill unpaid order. Payment status is currently "${order.payment_status}".`
      );
    }
  }

  if (newStatus === "cancelled") {
    order.cancelled_at = new Date();
    if (cancelReason) {
      order.cancel_reason = cancelReason;
    }

    if (
      ["confirmed", "processing", "shipped", "out_for_delivery"].includes(currentStatus) ||
      order.payment_status === "paid"
    ) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product_id },
          { $inc: { stock: item.quantity } }
        );
      }
    }
  }

  order.order_status = newStatus;

  if (newStatus === "shipped" && !order.shipped_at) {
    order.shipped_at = new Date();
  }

  await order.save();

  if (
    order.delivery_partner_id &&
    (newStatus === "cancelled" || newStatus === "returned")
  ) {
    await syncDeliveryPartnerDutyStatus(order.delivery_partner_id);
  }

  return order;
}

export async function assignDeliveryPartnerService(
  orderId: string,
  deliveryPartnerUserId: string
): Promise<IOrder> {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid Order ID format");
  }
  if (!mongoose.Types.ObjectId.isValid(deliveryPartnerUserId)) {
    throw new ApiError(400, "Invalid Delivery Partner ID format");
  }

  const [order, deliveryPartner] = await Promise.all([
    Order.findById(orderId),
    User.findOne({ _id: deliveryPartnerUserId, role: "delivery-partner" }),
  ]);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (!deliveryPartner) {
    throw new ApiError(404, "Delivery partner account not found or user is not a delivery partner");
  }
  if (deliveryPartner.is_active === false) {
    throw new ApiError(400, "Cannot assign inactive or suspended delivery partner");
  }

  if (
    ["out_for_delivery", "delivered", "cancelled", "returned"].includes(
      order.order_status
    )
  ) {
    throw new ApiError(
      400,
      `Cannot assign driver to an order that is already ${order.order_status.replace(/_/g, " ")}.`
    );
  }

  order.delivery_partner_id = deliveryPartner._id;

  if (order.order_status === "confirmed") {
    order.order_status = "processing";
  }

  await order.save();
  return order;
}

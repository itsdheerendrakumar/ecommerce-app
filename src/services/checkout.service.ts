import "server-only";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import ApiError from "@/lib/api-error";
import stripe from "@/lib/stripe";
import Order, { IOrderItem } from "@/models/order.model";
import PaymentTransaction from "@/models/payment.model";
import Product, { IProductImage } from "@/models/product.model";
import User from "@/models/user.model";
import type { CreatePaymentIntentInput } from "@/lib/validations/checkout";

export interface CreatePaymentIntentResult {
  client_secret: string;
  order_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
}

/**
 * Generates an enterprise-standard human-readable order number.
 * Example output: ORD-20261124-8F3E
 */
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${dateStr}-${randomSuffix}`;
}

/**
 * Service to handle checkout validation, database price snapshotting,
 * Order creation, and Stripe PaymentIntent creation.
 */
export async function createPaymentIntentService(
  payload: CreatePaymentIntentInput,
  userId: string
): Promise<CreatePaymentIntentResult> {
  await connectDb();

  // 1. Fetch user account details
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const { items, shipping_address, billing_address, notes } = payload;

  // 2. Validate MongoDB ObjectIds for cart products
  const productIds = items.map((item) => {
    if (!mongoose.Types.ObjectId.isValid(item.product_id)) {
      throw new ApiError(400, `Invalid product ID format: ${item.product_id}`);
    }
    return new mongoose.Types.ObjectId(item.product_id);
  });

  // 3. Fetch products from Database (prevents client price/stock tampering)
  const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
  if (dbProducts.length !== productIds.length) {
    throw new ApiError(404, "One or more products in your cart could not be found");
  }

  const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
  const orderItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const dbProduct = productMap.get(item.product_id);
    if (!dbProduct) {
      throw new ApiError(404, `Product not found: ${item.product_id}`);
    }

    // Verify published status
    if (dbProduct.status !== "published") {
      throw new ApiError(400, `Product "${dbProduct.name}" is currently unavailable for purchase`);
    }

    // Verify inventory availability
    if (dbProduct.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient inventory for "${dbProduct.name}". Only ${dbProduct.stock} unit(s) left in stock.`
      );
    }

    // Primary image resolution
    const primaryImg = (dbProduct.images || [])
      .slice()
      .sort((a: IProductImage, b: IProductImage) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.position || 0) - (b.position || 0);
      })[0]?.secureUrl || "";

    const itemTotalPrice = dbProduct.price * item.quantity;
    subtotal += itemTotalPrice;

    orderItems.push({
      product_id: dbProduct._id,
      name: dbProduct.name,
      image: primaryImg,
      price: dbProduct.price,
      quantity: item.quantity,
      total_price: itemTotalPrice,
    });
  }

  // 4. Calculate transparent pricing breakdown
  const shipping_fee = subtotal >= 500 ? 0 : 50;
  const tax = 0;
  const discount = 0;
  const total_amount = subtotal + shipping_fee + tax - discount;

  if (total_amount <= 0) {
    throw new ApiError(400, "Invalid order total amount");
  }

  const currency = "inr";
  const amountInSmallestUnit = Math.round(total_amount * 100);

  // 5. Generate unique human-readable order number
  let order_number = generateOrderNumber();
  let existingOrder = await Order.findOne({ order_number }).lean();
  while (existingOrder) {
    order_number = generateOrderNumber();
    existingOrder = await Order.findOne({ order_number }).lean();
  }

  // 6. Persist draft Order in Database
  const newOrder = await Order.create({
    order_number,
    user_id: user._id,
    customer_email: user.email,
    customer_phone: shipping_address.phone || user.phone,
    items: orderItems,
    shipping_address,
    billing_address: billing_address || shipping_address,
    pricing: {
      subtotal,
      shipping_fee,
      tax,
      discount,
      total_amount,
    },
    currency,
    order_status: "pending",
    payment_status: "pending",
    payment_method: "stripe",
    notes: notes || undefined,
  });

  // 7. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency,
    description: `Order ${newOrder.order_number} by ${user.email}`,
    metadata: {
      order_id: newOrder._id.toString(),
      order_number: newOrder.order_number,
      user_id: user._id.toString(),
      customer_email: user.email || "",
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // 8. Link PaymentIntent to Order & create PaymentTransaction record
  newOrder.stripe_payment_intent_id = paymentIntent.id;
  await newOrder.save();

  await PaymentTransaction.create({
    order_id: newOrder._id,
    user_id: user._id,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_client_secret: paymentIntent.client_secret || undefined,
    amount: total_amount,
    amount_received: 0,
    currency,
    status: "requires_payment_method",
    payment_method_type: "card",
    metadata: {
      order_id: newOrder._id.toString(),
      order_number: newOrder.order_number,
    },
  });

  return {
    client_secret: paymentIntent.client_secret || "",
    order_id: newOrder._id.toString(),
    order_number: newOrder.order_number,
    total_amount,
    currency,
  };
}

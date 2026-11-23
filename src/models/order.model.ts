import { Schema, model, models, Model, Types, Document } from "mongoose";

export type OrderStatus =
  | "pending"          // Order initiated, payment pending
  | "confirmed"        // Payment confirmed / COD verified
  | "processing"       // Being packed and prepped for dispatch
  | "shipped"          // Picked up by courier / logistics
  | "out_for_delivery" // In transit with delivery partner
  | "delivered"        // Successfully delivered to customer
  | "cancelled"        // Order cancelled
  | "returned";        // Order returned/refunded

export type PaymentStatus =
  | "pending"          // Awaiting payment capture / webhook confirmation
  | "paid"             // Funds settled
  | "failed"           // Card/payment attempt failed
  | "refunded"         // Fully refunded
  | "partially_refunded"; // Partial refund processed

export type PaymentMethod = "stripe" | "cod";

export interface IOrderItem {
  product_id: Types.ObjectId;
  name: string;
  image: string;
  price: number;        // Unit price locked at checkout time
  quantity: number;     // Quantity ordered
  total_price: number;  // (price * quantity)
}

export interface IOrderAddress {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
}

export interface IOrderPricing {
  subtotal: number;      // Sum of items total
  shipping_fee: number;  // Courier / delivery charges
  tax: number;           // Estimated sales tax / VAT
  discount: number;      // Promotional / coupon discount applied
  total_amount: number;  // Final amount payable (subtotal + shipping_fee + tax - discount)
}

export interface IOrder extends Document {
  /**
   * Purpose of order_number:
   * 1. Human-Readable Identifier: Avoids exposing raw MongoDB _id (e.g., 6742fb48...) to clients, preventing security enumeration risks.
   * 2. Customer Tracking & Invoicing: Standardized, memorable reference code (e.g., ORD-20261124-7A9B) used across invoices, packing slips, SMS updates, and customer support inquiries.
   */
  order_number: string;

  user_id: Types.ObjectId; // Buyer account reference

  /**
   * Purpose of customer_email & customer_phone:
   * 1. Immutable Contact Snapshot: If a customer updates or deletes their profile email/phone later, the historical and legal contact record of this specific order remains preserved.
   * 2. Zero-Join Fast Access: Eliminates the overhead of joining or querying the User table when sending transactional emails, generating PDF invoices, or dispatching SMS notifications to riders.
   */
  customer_email: string;
  customer_phone?: string;
  items: IOrderItem[];                   // Immutable items snapshot
  shipping_address: IOrderAddress;       // Immutable address snapshot
  billing_address?: IOrderAddress;
  pricing: IOrderPricing;                // Financial breakdown
  currency: string;                      // ISO currency code in lowercase (e.g. 'usd', 'inr')
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_partner_id?: Types.ObjectId;  // Assigned rider/courier
  stripe_payment_intent_id?: string;     // Active Stripe PaymentIntent ID (pi_...)
  notes?: string;
  paid_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  cancel_reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    recipient_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address_line_1: {
      type: String,
      required: true,
      trim: true,
    },
    address_line_2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pin_code: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: "US",
      trim: true,
    },
  },
  { _id: false }
);

const orderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping_fee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    // order_number: Human-readable unique identifier (e.g. ORD-20261124-7A9B).
    // Prevents exposing raw MongoDB ObjectIds on public invoices, packing slips, and customer support channels.
    order_number: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // customer_email & customer_phone: Immutable contact snapshot at checkout.
    // Preserves invoice accuracy even if user profile changes later, and eliminates extra DB joins for notifications.
    customer_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    customer_phone: {
      type: String,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items: IOrderItem[]) => items.length > 0,
        "An order must have at least one item",
      ],
    },
    shipping_address: {
      type: orderAddressSchema,
      required: true,
    },
    billing_address: {
      type: orderAddressSchema,
    },
    pricing: {
      type: orderPricingSchema,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
      lowercase: true,
      trim: true,
    },
    order_status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
      index: true,
    },
    payment_status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
      index: true,
    },
    payment_method: {
      type: String,
      enum: ["stripe", "cod"],
      default: "stripe",
      required: true,
    },
    delivery_partner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    stripe_payment_intent_id: {
      type: String,
      sparse: true,
      trim: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paid_at: {
      type: Date,
    },
    shipped_at: {
      type: Date,
    },
    delivered_at: {
      type: Date,
    },
    cancelled_at: {
      type: Date,
    },
    cancel_reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for production queries
orderSchema.index({ user_id: 1, createdAt: -1 });
orderSchema.index({ order_status: 1, createdAt: -1 });
orderSchema.index({ delivery_partner_id: 1, order_status: 1 });

const Order: Model<IOrder> =
  (models.Order as Model<IOrder>) || model<IOrder>("Order", orderSchema);

export default Order;

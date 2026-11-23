import { Schema, model, models, Model, Types, Document } from "mongoose";

export type StripePaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded"
  | "failed";

export interface IStripeRefund {
  stripe_refund_id: string;
  amount: number;         // Amount in standard currency units (e.g. 15.50)
  currency: string;
  status: string;         // 'succeeded', 'failed', 'pending'
  reason?: string;
  created_at: Date;
}

export interface ICardDetails {
  brand?: string;         // 'visa', 'mastercard', 'amex'
  last4?: string;         // e.g. '4242'
  exp_month?: number;
  exp_year?: number;
  funding?: string;       // 'credit', 'debit', 'prepaid'
}

export interface IPaymentTransaction extends Document {
  order_id: Types.ObjectId;
  user_id: Types.ObjectId;
  stripe_payment_intent_id: string;    // Unique Stripe PaymentIntent identifier (pi_...)
  stripe_client_secret?: string;       // Client secret (pi_..._secret_...) for frontend confirmation
  stripe_charge_id?: string;           // Associated charge ID (ch_...)
  stripe_customer_id?: string;         // Stripe Customer ID (cus_...) if saved
  amount: number;                      // Total amount billed
  amount_received: number;              // Actual amount collected by Stripe
  currency: string;                    // e.g., 'usd', 'inr'
  status: StripePaymentIntentStatus;   // Real-time status matching Stripe
  payment_method_type?: string;        // e.g., 'card', 'apple_pay', 'google_pay'
  card_details?: ICardDetails;         // Non-sensitive card metadata for receipt rendering
  receipt_url?: string;                // Hosted Stripe customer receipt
  failure_code?: string;               // Error code on decline (e.g. 'card_declined')
  failure_message?: string;            // Human-readable decline reason
  refunds: IStripeRefund[];            // Track partial or full refunds
  metadata?: Record<string, string>;   // Custom metadata synced with Stripe
  createdAt: Date;
  updatedAt: Date;
}

const stripeRefundSchema = new Schema<IStripeRefund>(
  {
    stripe_refund_id: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cardDetailsSchema = new Schema<ICardDetails>(
  {
    brand: { type: String, trim: true },
    last4: { type: String, trim: true },
    exp_month: { type: Number },
    exp_year: { type: Number },
    funding: { type: String, trim: true },
  },
  { _id: false }
);

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stripe_payment_intent_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    stripe_client_secret: {
      type: String,
      trim: true,
    },
    stripe_charge_id: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    stripe_customer_id: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amount_received: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
        "requires_capture",
        "canceled",
        "succeeded",
        "failed",
      ],
      default: "requires_payment_method",
      index: true,
    },
    payment_method_type: {
      type: String,
      default: "card",
      trim: true,
    },
    card_details: {
      type: cardDetailsSchema,
    },
    receipt_url: {
      type: String,
      trim: true,
    },
    failure_code: {
      type: String,
      trim: true,
    },
    failure_message: {
      type: String,
      trim: true,
    },
    refunds: {
      type: [stripeRefundSchema],
      default: [],
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

paymentTransactionSchema.index({ user_id: 1, createdAt: -1 });

const PaymentTransaction: Model<IPaymentTransaction> =
  (models.PaymentTransaction as Model<IPaymentTransaction>) ||
  model<IPaymentTransaction>("PaymentTransaction", paymentTransactionSchema);

export default PaymentTransaction;

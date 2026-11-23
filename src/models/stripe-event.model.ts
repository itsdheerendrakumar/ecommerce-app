import { Schema, model, models, Model, Document } from "mongoose";

export type WebhookProcessStatus = "pending" | "processing" | "processed" | "failed";

export interface IStripeWebhookEvent extends Document {
  stripe_event_id: string;          // Stripe event ID (e.g. evt_1N...) - Enforces DB-level Idempotency
  event_type: string;               // e.g. 'payment_intent.succeeded', 'payment_intent.payment_failed'
  status: WebhookProcessStatus;     // Processing status of the incoming event
  processing_attempts: number;      // How many times processed/retried
  payload: Record<string, unknown>; // Raw event payload stored for forensic audit & replayability
  last_error?: string;              // Error stack or message if processing failed
  processed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stripeWebhookEventSchema = new Schema<IStripeWebhookEvent>(
  {
    stripe_event_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    event_type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "processed", "failed"],
      default: "pending",
      index: true,
    },
    processing_attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    last_error: {
      type: String,
    },
    processed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge old processed webhook logs after 90 days to prevent infinite collection bloat
stripeWebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const StripeWebhookEvent: Model<IStripeWebhookEvent> =
  (models.StripeWebhookEvent as Model<IStripeWebhookEvent>) ||
  model<IStripeWebhookEvent>("StripeWebhookEvent", stripeWebhookEventSchema);

export default StripeWebhookEvent;

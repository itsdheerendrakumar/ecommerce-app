import "server-only";
import Stripe from "stripe";
import { connectDb } from "@/lib/db";
import Order from "@/models/order.model";
import PaymentTransaction, { ICardDetails } from "@/models/payment.model";
import Product from "@/models/product.model";
import StripeWebhookEvent from "@/models/stripe-event.model";

/**
 * Service to process verified Stripe webhook events.
 * Implements strict database-level idempotency, order fulfillment,
 * stock decrement, and payment transaction updates.
 */
export async function handleStripeWebhookService(event: Stripe.Event): Promise<{ handled: boolean; reason?: string }> {
  await connectDb();

  const stripeEventId = event.id;
  const eventType = event.type;

  // 1. Idempotency Check: Prevent duplicate processing if Stripe retries this event
  const existingEvent = await StripeWebhookEvent.findOne({ stripe_event_id: stripeEventId });
  if (existingEvent && existingEvent.status === "processed") {
    console.log(`[Stripe Webhook] Event ${stripeEventId} (${eventType}) was already processed. Skipping.`);
    return { handled: true, reason: "already_processed" };
  }

  // 2. Register/Update event record as 'processing'
  let eventRecord = existingEvent;
  if (!eventRecord) {
    eventRecord = await StripeWebhookEvent.create({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      status: "processing",
      processing_attempts: 1,
      payload: event.data.object as unknown as Record<string, unknown>,
    });
  } else {
    eventRecord.processing_attempts += 1;
    eventRecord.status = "processing";
    await eventRecord.save();
  }

  try {
    // 3. Handle specific Stripe event types
    switch (eventType) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    // 4. Mark event as successfully processed
    eventRecord.status = "processed";
    eventRecord.processed_at = new Date();
    await eventRecord.save();

    return { handled: true };
  } catch (error: unknown) {
    console.error(`[Stripe Webhook] Error processing event ${stripeEventId}:`, error);

    // Save failure trace for diagnostics & replay
    const errorMessage = error instanceof Error ? error.message : String(error);
    eventRecord.status = "failed";
    eventRecord.last_error = errorMessage;
    await eventRecord.save();

    throw error;
  }
}

/**
 * Handles successful payment:
 * 1. Updates Order to 'confirmed' and 'paid'
 * 2. Safely decrements product stock
 * 3. Updates PaymentTransaction with receipt & card metadata
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.order_id;
  const paymentIntentId = paymentIntent.id;

  // Find order by metadata order_id or stripe_payment_intent_id
  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({ stripe_payment_intent_id: paymentIntentId });

  if (!order) {
    console.warn(`[Stripe Webhook] Order not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  // If order was already confirmed/paid, skip fulfillment
  if (order.payment_status === "paid") {
    console.log(`[Stripe Webhook] Order ${order.order_number} already marked as paid.`);
    return;
  }

  // 1. Update Order status
  order.order_status = "confirmed";
  order.payment_status = "paid";
  order.paid_at = new Date();
  await order.save();

  // 2. Decrement inventory stock safely for all purchased items
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product_id, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  // 3. Extract safe card metadata if available
  const latestCharge = paymentIntent.latest_charge;
  let chargeId: string | undefined;
  let receiptUrl: string | undefined;
  let cardDetails: ICardDetails | undefined = undefined;

  if (typeof latestCharge === "object" && latestCharge !== null) {
    chargeId = latestCharge.id;
    receiptUrl = latestCharge.receipt_url || undefined;
    if (latestCharge.payment_method_details?.card) {
      const card = latestCharge.payment_method_details.card;
      cardDetails = {
        brand: card.brand || undefined,
        last4: card.last4 || undefined,
        exp_month: card.exp_month || undefined,
        exp_year: card.exp_year || undefined,
        funding: card.funding || undefined,
      };
    }
  }

  // 4. Update PaymentTransaction ledger
  await PaymentTransaction.findOneAndUpdate(
    { stripe_payment_intent_id: paymentIntentId },
    {
      status: "succeeded",
      amount_received: paymentIntent.amount_received / 100,
      stripe_charge_id: chargeId,
      receipt_url: receiptUrl,
      card_details: cardDetails,
    },
    { new: true }
  );

  console.log(`[Stripe Webhook] Successfully fulfilled Order: ${order.order_number}`);
}

/**
 * Handles failed payment:
 * 1. Updates Order payment_status to 'failed'
 * 2. Records failure reason on PaymentTransaction
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id;
  const orderId = paymentIntent.metadata?.order_id;

  const order = orderId
    ? await Order.findById(orderId)
    : await Order.findOne({ stripe_payment_intent_id: paymentIntentId });

  if (order) {
    order.payment_status = "failed";
    await order.save();
  }

  const lastPaymentError = paymentIntent.last_payment_error;

  await PaymentTransaction.findOneAndUpdate(
    { stripe_payment_intent_id: paymentIntentId },
    {
      status: "failed",
      failure_code: lastPaymentError?.code || "payment_failed",
      failure_message: lastPaymentError?.message || "Payment attempt failed",
    }
  );

  console.warn(`[Stripe Webhook] Payment failed for PaymentIntent: ${paymentIntentId}`);
}

/**
 * Handles refunds:
 * 1. Appends refund record to PaymentTransaction
 * 2. Updates Order payment_status ('refunded' or 'partially_refunded')
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return;

  const order = await Order.findOne({ stripe_payment_intent_id: paymentIntentId });
  if (!order) return;

  const isFullRefund = charge.refunded;
  order.payment_status = isFullRefund ? "refunded" : "partially_refunded";
  if (isFullRefund) {
    order.order_status = "returned";
  }
  await order.save();

  const refundDetails = charge.refunds?.data.map((r) => ({
    stripe_refund_id: r.id,
    amount: r.amount / 100,
    currency: r.currency,
    status: r.status || "succeeded",
    reason: r.reason || undefined,
    created_at: new Date(r.created * 1000),
  })) || [];

  await PaymentTransaction.findOneAndUpdate(
    { stripe_payment_intent_id: paymentIntentId },
    {
      status: isFullRefund ? "canceled" : "succeeded",
      refunds: refundDetails,
    }
  );

  console.log(`[Stripe Webhook] Processed refund for Order: ${order.order_number}`);
}

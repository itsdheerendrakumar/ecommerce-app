import "server-only";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import { handleStripeWebhookService } from "@/services/webhook.service";

/**
 * Controller: Handles incoming Stripe Webhook HTTP requests.
 * 1. Reads raw text body (required for cryptographic HMAC validation).
 * 2. Validates 'stripe-signature' header using STRIPE_WEBHOOK_SECRET.
 * 3. Delegates verified event to handleStripeWebhookService.
 * Zero database access happens in this controller.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("⚠️ STRIPE_WEBHOOK_SECRET is not configured in environment variables.");
    return Response.json(
      { error: "Webhook secret is unconfigured on the server" },
      { status: 500 }
    );
  }

  // 1. Read raw payload as text (Do NOT use request.json() because stringification breaks HMAC signature)
  const rawBody = await request.text();

  // 2. Extract Stripe signature header
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    // 3. Cryptographically verify that the event originated from Stripe
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Stripe webhook signature verification failed: ${err.message}`);
    return Response.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // 4. Delegate verified event to Service Layer
  try {
    await handleStripeWebhookService(event);
    return Response.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`⚠️ Webhook service processing error: ${err.message}`);
    // Return 500 so Stripe knows to retry if an internal error occurred
    return Response.json(
      { error: "Webhook processing encountered an internal error" },
      { status: 500 }
    );
  }
}

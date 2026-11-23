import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("⚠️ Warning: STRIPE_SECRET_KEY is not defined in environment variables.");
}

// Global declaration for singleton in Next.js development (prevents multiple instances on hot-reload)
declare global {
  var stripe: Stripe | undefined;
}

export const stripe =
  globalThis.stripe ??
  new Stripe(stripeSecretKey || "", {
    typescript: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.stripe = stripe;
}

export default stripe;

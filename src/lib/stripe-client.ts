import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Returns a cached singleton promise of the Stripe.js object.
 * Prevents re-instantiating Stripe.js on every re-render.
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn("⚠️ Warning: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined.");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;

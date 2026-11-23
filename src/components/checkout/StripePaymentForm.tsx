"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, AlertCircle } from "lucide-react";

interface StripePaymentFormProps {
  totalAmount: number;
  orderNumber: string;
  currency?: string;
  onSuccess: () => void;
}

export function StripePaymentForm({
  totalAmount,
  orderNumber,
  currency = "inr",
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/customer/orders`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment processing.");
        setIsProcessing(false);
      } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        onSuccess();
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment submission failed. Please try again.";
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  const currencySymbol = currency.toLowerCase() === "inr" ? "₹" : "$";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 rounded-xl font-bold text-base shadow-md shadow-primary/25 transition-all"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" /> Pay {currencySymbol}{totalAmount.toFixed(2)} Securely
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3 h-3 text-emerald-600" />
        <span>PCI-DSS compliant encrypted checkout powered by Stripe</span>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Loader2,
  Lock,
  ShoppingBag,
  CreditCard,
  Edit3,
} from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "@/lib/stripe-client";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { createPaymentIntentApi } from "@/lib/client-api/checkout";
import { toast } from "sonner";

interface AddressState {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pin_code: string;
}

export default function CustomerCheckoutClient() {
  const { cart, clearCart } = useAppStore();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const router = useRouter();

  // Address state
  const [address, setAddress] = useState<AddressState>({
    recipient_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    pin_code: "",
  });

  // Sync user profile data into address once loaded
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Payment state
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleInputChange = (field: keyof AddressState, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    if (!address.recipient_name.trim()) {
      toast.error("Please enter recipient name");
      return false;
    }
    if (!address.phone.trim() || address.phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit contact number");
      return false;
    }
    if (!address.address_line_1.trim()) {
      toast.error("Please enter flat, house or street address");
      return false;
    }
    if (!address.city.trim()) {
      toast.error("Please enter city");
      return false;
    }
    if (!address.state.trim()) {
      toast.error("Please enter state");
      return false;
    }
    if (!address.pin_code.trim()) {
      toast.error("Please enter PIN code");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateAddress()) return;

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsInitializingPayment(true);

    try {
      const formattedItems = cart.map((item) => ({
        product_id: item.product._id || item.product.id,
        quantity: item.quantity,
      }));

      const res = await createPaymentIntentApi({
        items: formattedItems,
        shipping_address: {
          recipient_name: address.recipient_name.trim(),
          phone: address.phone.trim(),
          address_line_1: address.address_line_1.trim(),
          address_line_2: address.address_line_2.trim() || undefined,
          city: address.city.trim(),
          state: address.state.trim(),
          pin_code: address.pin_code.trim(),
        },
      });

      const paymentData = res.data?.data;
      if (paymentData?.client_secret) {
        setClientSecret(paymentData.client_secret);
        setConfirmedOrderNumber(paymentData.order_number);
      } else {
        toast.error("Failed to initialize payment gateway. Please try again.");
      }
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to initiate payment";
      toast.error(msg);
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card border rounded-3xl p-8 shadow-lg space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-foreground">Payment Successful!</h1>
            <p className="text-sm text-muted-foreground">
              Your order has been confirmed and placed with the merchant.
            </p>
          </div>

          {confirmedOrderNumber && (
            <div className="p-4 rounded-2xl bg-muted/50 border text-center space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Order Tracking Number
              </span>
              <p className="text-lg font-mono font-black text-primary">{confirmedOrderNumber}</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/20"
              onClick={() => router.push("/customer/orders")}
            >
              Track Order Status <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl"
              onClick={() => router.push("/shop")}
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0 && !clientSecret) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button onClick={() => router.push("/shop")} className="rounded-xl h-11 px-6 font-semibold">
          Explore Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Express Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your delivery address and pay securely via Stripe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address & Payment Gateway */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delivery Address Card */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-primary" /> 1. Shipping Address
                </CardTitle>
                {clientSecret && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary"
                    onClick={() => setClientSecret(null)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Address
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="recipient_name" className="text-xs font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="recipient_name"
                    placeholder="Recipient's Name"
                    disabled={!!clientSecret}
                    value={address.recipient_name}
                    onChange={(e) => handleInputChange("recipient_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="10-digit mobile number"
                    disabled={!!clientSecret}
                    value={address.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_line_1" className="text-xs font-semibold">
                  House / Flat / Street Address *
                </Label>
                <Input
                  id="address_line_1"
                  placeholder="e.g. Flat 402, Building A, Main Road"
                  disabled={!!clientSecret}
                  value={address.address_line_1}
                  onChange={(e) => handleInputChange("address_line_1", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_line_2" className="text-xs font-semibold">
                  Landmark / Area (Optional)
                </Label>
                <Input
                  id="address_line_2"
                  placeholder="e.g. Near Metro Station"
                  disabled={!!clientSecret}
                  value={address.address_line_2}
                  onChange={(e) => handleInputChange("address_line_2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City *
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    disabled={!!clientSecret}
                    value={address.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-semibold">
                    State *
                  </Label>
                  <Input
                    id="state"
                    placeholder="State"
                    disabled={!!clientSecret}
                    value={address.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pin_code" className="text-xs font-semibold">
                    PIN Code *
                  </Label>
                  <Input
                    id="pin_code"
                    placeholder="PIN"
                    disabled={!!clientSecret}
                    value={address.pin_code}
                    onChange={(e) => handleInputChange("pin_code", e.target.value)}
                  />
                </div>
              </div>

              {!clientSecret && (
                <Button
                  className="w-full h-11 rounded-xl font-bold mt-2"
                  disabled={isInitializingPayment}
                  onClick={handleProceedToPayment}
                >
                  {isInitializingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting Up Secure Payment...
                    </>
                  ) : (
                    <>
                      Proceed to Payment <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 2. Payment Gateway Card (Stripe Elements) */}
          <AnimatePresence>
            {clientSecret && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <Card className="rounded-2xl border shadow-sm ring-2 ring-primary/20">
                  <CardHeader className="border-b bg-muted/20 pb-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-primary" /> 2. Complete Payment via Stripe
                      </span>
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                        Secure
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#0f172a",
                            borderRadius: "12px",
                          },
                        },
                      }}
                    >
                      <StripePaymentForm
                        totalAmount={total}
                        orderNumber={confirmedOrderNumber || ""}
                        currency="inr"
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border shadow-xs sticky top-20">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Items Preview */}
              <div className="divide-y max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border bg-muted shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Add ₹{(500 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                )}
                <div className="border-t pt-2.5 flex justify-between font-black text-base text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/10 border-t p-4 flex items-center justify-center text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" /> 100% Buyer Protection & Safe Delivery
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

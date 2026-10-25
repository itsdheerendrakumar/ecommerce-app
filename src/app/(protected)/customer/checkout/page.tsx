"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Truck } from "lucide-react";

export default function CustomerCheckoutPage() {
  const { cart, placeOrder } = useAppStore();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const router = useRouter();

  const [address, setAddress] = useState("123 Main St, Apt 4B, New York, NY 10001");
  const [isSuccess, setIsSuccess] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    placeOrder(user?._id || "1", address);
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/customer/orders");
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Order Placed Successfully!</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Thank you for shopping with us! Redirecting you to your Order History to track delivery...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Express Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">Review shipping details and confirm your order.</p>
      </div>

      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Truck className="w-4 h-4 mr-2 text-primary" /> Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-card"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" /> Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-xl bg-muted/40 space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="radio" checked readOnly className="h-4 w-4 accent-primary" />
              <span className="font-semibold text-sm">Cash on Delivery (COD)</span>
            </label>
            <p className="text-xs text-muted-foreground pl-7">
              Pay upon safe receipt of your package at your doorstep.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Final Payable Amount:</span>
            <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full h-12 rounded-full font-bold text-base shadow-md shadow-primary/20"
            disabled={cart.length === 0}
            onClick={handlePlaceOrder}
          >
            Confirm & Place Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

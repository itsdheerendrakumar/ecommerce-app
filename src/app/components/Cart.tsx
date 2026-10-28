"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/layout/Navbar";

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useAppStore();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 max-w-5xl space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">Review your selected items and proceed to checkout.</p>
          </div>
          <span className="text-sm font-semibold bg-muted px-3 py-1 rounded-full">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </span>
        </div>

        {cart.length === 0 ? (
          <Card className="text-center p-14 border-dashed rounded-3xl">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Your cart is currently empty</CardTitle>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                Looks like you haven't added anything to your cart yet. Explore our collection of premium items.
              </p>
            </CardHeader>
            <CardFooter className="justify-center pt-4">
              <Button size="lg" className="rounded-full px-8" onClick={() => router.push("/shop")}>
                Start Shopping
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-2xl overflow-hidden border">
                    <CardContent className="flex flex-col sm:flex-row items-center p-5 gap-5">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl border shrink-0 bg-muted"
                      />
                      <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {item.product.category}
                        </span>
                        <h3 className="font-bold text-base truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} each</p>

                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                          <button
                            type="button"
                            className="w-7 h-7 rounded-md border flex items-center justify-center text-sm font-bold hover:bg-muted"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            className="w-7 h-7 rounded-md border flex items-center justify-center text-sm font-bold hover:bg-muted"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch gap-2">
                        <p className="font-extrabold text-lg text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 text-xs h-8"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <Card className="sticky top-20 rounded-2xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                  <div className="border-t pt-3.5 flex justify-between font-black text-xl">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full h-12 rounded-full font-bold shadow-md shadow-primary/20 text-base"
                    onClick={() => router.push("/customer/checkout")}
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

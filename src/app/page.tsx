"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, ShieldCheck, Truck, Star, ShoppingBag, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useMe } from "@/hooks/useMe";

export default function Home() {
  const { products, wishlist, toggleWishlist } = useAppStore();
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const trending = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-lg shadow-sm">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              StoreFront<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/shop">
              <Button variant="ghost" className="rounded-full text-sm font-semibold">
                Shop Collection
              </Button>
            </Link>
            {user ? (
              <Link href="/shop">
                <Button className="rounded-full px-5 text-sm font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="rounded-full px-5 text-sm font-semibold">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center bg-muted/20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 lg:grid lg:grid-cols-2 gap-12 items-center relative z-10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
              Elevate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                Lifestyle.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Explore our handpicked curation of flagship electronics, ergonomic furniture, and modern essentials. Fast delivery and certified quality.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop">
                <Button size="lg" className="h-12 px-8 rounded-full font-bold shadow-md shadow-primary/20">
                  Shop Collection <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full font-semibold border-2">
                  Browse Catalog
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                Trusted by 50,000+ satisfied customers worldwide
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-2">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
                alt="Store Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-xl border flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Swift Delivery</h4>
                <p className="text-xs text-muted-foreground">Doorstep fulfillment</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20 bg-background border-t">
        <div className="container mx-auto px-4 md:px-8 space-y-10">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Trending Now</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Featured Products</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-primary hover:underline flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((product) => {
              const isWished = wishlist.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                        isWished
                          ? "bg-rose-500 text-white"
                          : "bg-background/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase text-primary mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-sm line-clamp-1 mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <span className="font-black text-base">${product.price.toFixed(2)}</span>
                      <Link href={`/product/${product.id}`}>
                        <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold h-7 px-3">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Free Delivery Worldwide</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complimentary shipping on orders over $200 with real-time package tracking.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Official Brand Warranty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                100% authentic merchandise backed by a 2-year comprehensive defect warranty.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">Hassle-Free Returns</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                30-day money-back guarantee with complimentary courier pickup from your address.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

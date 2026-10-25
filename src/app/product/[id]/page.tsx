"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, ArrowLeft, Heart, Check, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/Navbar";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { products, addToCart, toggleWishlist, wishlist } = useAppStore();

  const product = products.find((p) => p.id === id);
  const [mainImage, setMainImage] = useState(product?.images[0] || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground text-sm">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14">
          {/* Images Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-muted rounded-3xl overflow-hidden border relative group shadow-sm"
            >
              <img
                src={mainImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-sm ${
                  isWished
                    ? "bg-rose-500 text-white"
                    : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWished ? "fill-current" : ""}`} />
              </button>
            </motion.div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      (mainImage || product.images[0]) === img
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setMainImage(img)}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  {product.rating} ({product.reviews.length} reviews)
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">3-5 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Official Warranty</p>
                  <p className="text-xs text-muted-foreground">2-Year full coverage</p>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="flex items-center border rounded-full h-12 px-2 bg-card">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-muted"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-muted"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                className="w-full sm:flex-1 h-12 rounded-full font-bold shadow-md shadow-primary/20"
                onClick={handleAddToCart}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart - $
                    {(product.price * qty).toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {/* Extended Description */}
            <div className="pt-8 space-y-4">
              <h3 className="font-bold text-lg text-foreground">Overview & Features</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted/40 p-3 rounded-xl border">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

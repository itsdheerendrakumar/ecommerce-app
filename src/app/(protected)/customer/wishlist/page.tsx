"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, Heart } from "lucide-react";

export default function CustomerWishlistPage() {
  const { products, wishlist, toggleWishlist, addToCart } = useAppStore();
  const router = useRouter();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Saved Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Keep track of items you wish to purchase later.</p>
        </div>
        <span className="text-sm font-semibold bg-muted px-3 py-1 rounded-full">
          {wishlistProducts.length} saved
        </span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/30">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Explore our curated collections and click the heart icon on any product to save it here.
          </p>
          <div className="pt-2">
            <Button className="rounded-full px-8" onClick={() => router.push("/shop")}>
              Explore Collection
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-2xl overflow-hidden bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-square bg-muted relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-md p-2 rounded-full hover:bg-rose-500 hover:text-white transition-colors text-rose-500 shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  {product.category}
                </span>
                <h3 className="font-bold text-base line-clamp-1 mb-2 text-foreground">{product.name}</h3>
                <p className="font-extrabold text-xl text-primary mb-4">
                  ${product.price.toFixed(2)}
                </p>
                <Button
                  className="w-full mt-auto rounded-xl font-semibold"
                  onClick={() => {
                    addToCart(product);
                    toggleWishlist(product.id);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Move to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Search, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/layout/Navbar";

export default function Shop() {
  const { products, toggleWishlist, wishlist } = useAppStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <PublicNavbar />

      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 space-y-8 max-w-7xl">
        {/* Banner from image with Public Catalog removed */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 p-8 md:p-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">The Curated Collection</h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Discover precision-engineered electronics, timeless wearables, and ergonomic essentials designed for peak modern performance.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Horizontal Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isActive
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-background/20 text-background" : "bg-background text-muted-foreground"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-7 rounded-full border bg-card text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 h-9">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed bg-card space-y-3">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-muted-foreground" />
            <h3 className="font-bold text-base text-foreground">No matching products found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any products matching your filters. Try clearing your search query or choosing another category.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full mt-2"
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const isWished = wishlist.includes(product.id);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: (index % 8) * 0.04 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border/80 hover:border-foreground/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                        Sale
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${isWished
                        ? "bg-rose-500 text-white"
                        : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
                        }`}
                      title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${isWished ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                      {product.category}
                    </span>

                    <h3
                      className="font-bold text-sm line-clamp-1 cursor-pointer hover:text-primary transition-colors mb-1"
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {product.shortDescription}
                    </p>

                    {/* Price & Action */}
                    <div className="flex items-baseline justify-between mt-auto pt-3 border-t">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full text-xs font-semibold h-8 px-3.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/product/${product.id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, Image as ImageIcon, Sparkles, Search, ArrowUpDown, X, SlidersHorizontal } from "lucide-react";
import { AddProductModal } from "@/components/admin/products/AddProductModal";
import { ProductDetailsModal } from "@/components/admin/products/ProductDetailsModal";
import { getAdminProductsApi, publishProductApi } from "@/lib/client-api/admin";
import type { GetAdminProductsParams } from "@/lib/client-api/admin/product";
import { queryKeys } from "@/constants/query-key";
import { toast } from "sonner";
import { ProductItem } from "@/lib/client-api/admin/types";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "all";
  const urlCategory = searchParams.get("category") || "All";
  const urlSortBy = searchParams.get("sortBy") || "newest";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [sortBy, setSortBy] = useState(urlSortBy);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Sync state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const s = searchParams.get("search") || "";
    const c = searchParams.get("category") || "All";
    const st = searchParams.get("status") || "all";
    const b = searchParams.get("sortBy") || "newest";
    if (s !== searchQuery && s !== debouncedSearch) setSearchQuery(s);
    if (c !== categoryFilter) setCategoryFilter(c);
    if (st !== statusFilter) setStatusFilter(st);
    if (b !== sortBy) setSortBy(b);
  }, [searchParams]);

  // Keep search, category, status, and sort in the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch && debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    if (categoryFilter && categoryFilter !== "All") {
      params.set("category", categoryFilter);
    } else {
      params.delete("category");
    }

    if (statusFilter && statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }

    if (sortBy && sortBy !== "newest") {
      params.set("sortBy", sortBy);
    } else {
      params.delete("sortBy");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
    }
  }, [debouncedSearch, categoryFilter, statusFilter, sortBy, pathname, router, searchParams]);

  const filterParams: GetAdminProductsParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "All" ? categoryFilter : undefined,
    sortBy: sortBy !== "newest" ? sortBy : undefined,
  }), [debouncedSearch, statusFilter, categoryFilter, sortBy]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKeys.adminProducts, filterParams],
    queryFn: () => getAdminProductsApi(filterParams),
  });

  // Fetch all products once (unfiltered) to derive the category list
  const { data: allData } = useQuery({
    queryKey: [queryKeys.adminProducts, "__all_categories__"],
    queryFn: () => getAdminProductsApi(),
    staleTime: 60_000,
  });

  const allProducts: ProductItem[] = allData?.data?.data || [];
  const dbProducts: ProductItem[] = data?.data?.data || [];
  const hasDbProducts = dbProducts.length > 0;

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allProducts.map((p) => p.category))).sort()],
    [allProducts]
  );

  const hasActiveFilters = debouncedSearch || statusFilter !== "all" || categoryFilter !== "All" || sortBy !== "newest";

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("All");
    setSortBy("newest");
  }, []);

  const publishMutation = useMutation({
    mutationFn: (productId: string) => publishProductApi(productId),
    onSuccess: () => {
      toast.success("Product published successfully!");
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminProducts] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to publish product");
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Production workflow with drafts, direct Cloudinary uploads, and CDN distribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-full" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add New Item
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name, description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-full border bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 h-9">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 h-9">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-card border rounded-lg px-2.5 py-1.5 h-9">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs h-9 px-3"
              onClick={clearAllFilters}
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Result count + loading indicator */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {dbProducts.length} product{dbProducts.length !== 1 ? "s" : ""} found
            </span>
            {isFetching && (
              <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>

      <AddProductModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <ProductDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        product={selectedProduct}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : hasDbProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbProducts.map((product) => {
            const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
            const isDraft = product.status === "draft";

            return (
              <Card
                key={product._id}
                className="rounded-2xl overflow-hidden border shadow-xs flex flex-col justify-between cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => {
                  setSelectedProduct(product);
                  setIsDetailsModalOpen(true);
                }}
              >
                <div>
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {primaryImg ? (
                      <img
                        src={primaryImg.secureUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shadow-xs ${
                          isDraft
                            ? "bg-amber-500/90 text-white backdrop-blur-xs"
                            : "bg-emerald-500/90 text-white backdrop-blur-xs"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-primary uppercase">{product.category}</span>
                    <h3 className="font-bold text-base truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-black text-foreground">${product.price.toFixed(2)}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          ${product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">In Stock: {product.stock} units</p>
                    <p className="text-[11px] text-muted-foreground">
                      Images: {product.images.length} verified
                    </p>
                  </CardContent>
                </div>

                {isDraft && (
                  <div className="p-3 bg-muted/30 border-t flex items-center justify-between">
                    <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Ready to publish
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        publishMutation.mutate(product._id);
                      }}
                      disabled={publishMutation.isPending}
                      className="h-7 text-xs rounded-lg gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Publish
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {hasActiveFilters ? <SlidersHorizontal className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold">
            {hasActiveFilters ? "No matching products" : "No Products Found"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {hasActiveFilters
              ? "No products match your current filters. Try adjusting your search or clearing the filters."
              : "Your product catalog is currently empty. Click \"Add New Item\" to create a product draft and upload images."}
          </p>
          <div className="pt-2">
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" className="rounded-full" onClick={clearAllFilters}>
                Reset Filters
              </Button>
            ) : (
              <Button className="rounded-full" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add New Item
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

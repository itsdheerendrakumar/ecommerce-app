"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import { AddProductModal } from "@/components/admin/products/AddProductModal";
import { getAdminProductsApi, publishProductApi } from "@/lib/client-api/admin";
import { queryKeys } from "@/constants/query-key";
import { toast } from "sonner";
import { ProductItem } from "@/lib/client-api/admin/types";

export default function AdminProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.adminProducts],
    queryFn: getAdminProductsApi,
  });

  const dbProducts: ProductItem[] = data?.data?.data || [];
  const hasDbProducts = dbProducts.length > 0;

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

      <AddProductModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

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
              <Card key={product._id} className="rounded-2xl overflow-hidden border shadow-xs flex flex-col justify-between">
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
                      onClick={() => publishMutation.mutate(product._id)}
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
            <ImageIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">No Products Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your product catalog is currently empty. Click &quot;Add New Item&quot; to create a product draft and upload images.
          </p>
          <div className="pt-2">
            <Button className="rounded-full" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add New Item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

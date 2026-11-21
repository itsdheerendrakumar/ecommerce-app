"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  Layers,
  Sparkles,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Copy,
  Check,
  Tag,
  Box,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publishProductApi } from "@/lib/client-api/admin";
import { queryKeys } from "@/constants/query-key";
import type { ProductItem } from "@/lib/client-api/admin/types";

interface ProductDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductItem | null;
  onPublishSuccess?: () => void;
}

function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

export function ProductDetailsModal({
  open,
  onOpenChange,
  product,
  onPublishSuccess,
}: ProductDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const queryClient = useQueryClient();

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setCopiedId(false);
    }
  }, [product]);

  const publishMutation = useMutation({
    mutationFn: (productId: string) => publishProductApi(productId),
    onSuccess: () => {
      toast.success("Product published successfully!");
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminProducts] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
      onPublishSuccess?.();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to publish product"
      );
    },
  });

  if (!product) return null;

  const isDraft = product.status === "draft";
  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0];
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(product._id);
    setCopiedId(true);
    toast.success("Product ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
        <DialogHeader className="space-y-2 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {product.category}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize shadow-xs flex items-center gap-1 ${
                  isDraft
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isDraft ? (
                  <Sparkles className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {product.status}
              </span>
            </div>

            <button
              type="button"
              onClick={copyIdToClipboard}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono bg-muted/60 px-2.5 py-1 rounded-md transition-colors"
              title="Copy ID"
            >
              <span>ID: {product._id.slice(-8)}</span>
              {copiedId ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {product.name}
          </DialogTitle>
          {product.shortDescription && (
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {product.shortDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Main Top Grid: Gallery & Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="aspect-square bg-muted/40 rounded-2xl overflow-hidden border relative flex items-center justify-center">
                {currentImage ? (
                  <img
                    src={currentImage.secureUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="w-12 h-12 opacity-30" />
                    <span className="text-xs">No image available</span>
                  </div>
                )}

                {currentImage?.isPrimary && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                    Primary
                  </span>
                )}
              </div>

              {/* Thumbnails row if more than 1 image */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={img.publicId || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20 scale-102"
                          : "border-border hover:border-muted-foreground/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.secureUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {img.isPrimary && (
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing, Inventory & Highlights Card */}
            <div className="space-y-4">
              <div className="bg-muted/30 border rounded-2xl p-5 space-y-4">
                {/* Price Display */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    Price
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-base text-muted-foreground line-through">
                          ${product.originalPrice!.toFixed(2)}
                        </span>
                        <span className="bg-rose-600/10 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  {/* Stock Level */}
                  <div className="bg-card border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Box className="w-3.5 h-3.5" />
                      <span>Stock Inventory</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-foreground">
                        {product.stock}
                      </span>
                      <span className="text-xs text-muted-foreground">units</span>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
                        product.stock > 10
                          ? "bg-emerald-500/15 text-emerald-600"
                          : product.stock > 0
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-rose-500/15 text-rose-600"
                      }`}
                    >
                      {product.stock > 10
                        ? "In Stock"
                        : product.stock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                    </span>
                  </div>

                  {/* Verified Media Count */}
                  <div className="bg-card border rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Verified Images</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-foreground">
                        {images.length}
                      </span>
                      <span className="text-xs text-muted-foreground">uploaded</span>
                    </div>
                    <span className="inline-block text-[10px] font-medium text-muted-foreground mt-1">
                      Cloudinary CDN
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-muted/20 border rounded-xl p-3.5 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Created Date
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Last Updated
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Detailed Description
              </h4>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-4 rounded-xl border">
                {product.description}
              </p>
            </div>
          )}

          {/* Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Key Product Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-foreground bg-card border rounded-xl p-2.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-5 mt-6">
          <div className="text-xs text-muted-foreground">
            {isDraft ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                This product is currently in draft mode and not visible to public customers.
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                This product is published and live on the storefront.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-xs h-9 px-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>

            {isDraft && (
              <Button
                type="button"
                size="sm"
                className="rounded-full text-xs h-9 px-4 gap-1.5 shadow-sm"
                onClick={() => publishMutation.mutate(product._id)}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Publish Product
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsModal;

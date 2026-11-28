"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  getAdminOrderDetailApi,
  getOrderItemImages,
  ResolvedOrderItemImage,
} from "@/lib/client-api/admin/order";
import { queryKeys } from "@/constants/query-key";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignPartner?: (order: any) => void;
}

export function OrderDetailsModal({
  orderId,
  isOpen,
  onClose,
  onAssignPartner,
}: OrderDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewGallery, setPreviewGallery] = useState<{
    productName: string;
    images: ResolvedOrderItemImage[];
    activeIndex: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewGallery(null);
    }
  }, [isOpen, orderId]);

  const { data: response, isLoading } = useQuery({
    queryKey: [queryKeys.adminOrderDetail, orderId],
    queryFn: () => getAdminOrderDetailApi(orderId!),
    enabled: !!orderId && isOpen,
  });

  const order = response?.data?.data;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currencySymbol = order?.currency?.toLowerCase() === "inr" ? "₹" : "$";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl gap-0 border">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-black font-mono flex items-center gap-2">
                {order && order.order_number}
                {!order && (
                  <span className="inline-block h-6 w-36 animate-pulse rounded-md bg-muted" />
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {order?.createdAt &&
                  `Placed on ${format(new Date(order.createdAt), "dd MMM yyyy 'at' hh:mm a")}`}
                {!order?.createdAt && "Loading details..."}
              </DialogDescription>
            </div>
            {order && (
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {order.order_status.replace(/_/g, " ")}
                </span>
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full ${
                    order.payment_status === "paid"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        {(isLoading || !order) && (
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}

        {!isLoading && order && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border bg-card space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Destination
                </h4>
                <p className="font-semibold text-sm">{order.shipping_address.recipient_name}</p>
                <p className="text-xs text-muted-foreground">
                  {order.shipping_address.address_line_1}
                  {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`},{" "}
                  {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                  {order.shipping_address.pin_code}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  📞 {order.shipping_address.phone || order.customer_phone || "No phone"}
                </p>
              </div>

              <div className="p-4 rounded-2xl border bg-card space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payment & Billing
                </h4>
                <p className="text-xs text-muted-foreground">
                  Customer Email: <span className="font-semibold text-foreground">{order.customer_email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Method: <span className="font-bold uppercase text-foreground">{order.payment_method}</span>
                </p>
                {order.payment?.card_details && (
                  <p className="text-xs text-muted-foreground">
                    Card:{" "}
                    <span className="font-semibold capitalize text-foreground">
                      {order.payment.card_details.brand} •••• {order.payment.card_details.last4}
                    </span>
                  </p>
                )}
                {order.stripe_payment_intent_id && (
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[170px]">
                      {order.stripe_payment_intent_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.stripe_payment_intent_id!, "pi")}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                    >
                      {copiedKey === "pi" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      {copiedKey !== "pi" && <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {order.payment?.receipt_url && (
                      <a
                        href={order.payment.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center text-[11px] font-semibold"
                      >
                        Receipt <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {order.delivery_partner_id && typeof order.delivery_partner_id === "object" && (
              <div className="p-4 rounded-2xl border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Rider / Delivery Partner
                    </span>
                    <h5 className="font-bold text-sm text-foreground">{order.delivery_partner_id.name}</h5>
                    <p className="text-xs text-muted-foreground font-mono">
                      {order.delivery_partner_id.phone || order.delivery_partner_id.email}
                    </p>
                  </div>
                </div>

                {!["out_for_delivery", "delivered", "cancelled", "returned"].includes(
                  order.order_status
                ) &&
                  onAssignPartner && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 text-xs font-semibold"
                      onClick={() => onAssignPartner(order)}
                    >
                      Change
                    </Button>
                  )}
              </div>
            )}

            {(!order.delivery_partner_id || typeof order.delivery_partner_id !== "object") && (
              <div className="p-3.5 rounded-2xl border border-dashed text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>No delivery partner assigned to this order yet.</span>
                </div>
                {!["out_for_delivery", "delivered", "cancelled", "returned"].includes(
                  order.order_status
                ) &&
                  onAssignPartner && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-8 text-xs font-semibold text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-800"
                      onClick={() => onAssignPartner(order)}
                    >
                      <Truck className="w-3.5 h-3.5 mr-1 text-amber-600" /> Assign Rider
                    </Button>
                  )}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" /> Order Items ({order.items.length})
              </h4>
              <div className="border rounded-2xl overflow-hidden divide-y divide-border">
                {order.items.map((item, idx) => {
                  const images = getOrderItemImages(item);
                  const category =
                    item.product_id && typeof item.product_id === "object"
                      ? item.product_id.category
                      : undefined;

                  return (
                    <div key={idx} className="p-4 sm:p-5 bg-card space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-base text-foreground">{item.name}</h5>
                            {category && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" /> {category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {currencySymbol}{item.price.toFixed(2)} × {item.quantity}{" "}
                            {item.quantity > 1 && "units"}
                            {item.quantity <= 1 && "unit"}
                          </p>
                        </div>
                        <p className="font-black text-base sm:text-lg text-foreground shrink-0">
                          {currencySymbol}{item.total_price.toFixed(2)}
                        </p>
                      </div>

                      {images.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Product Images ({images.length})
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {images.map((img, imgIdx) => (
                              <button
                                key={`${img.url}-${imgIdx}`}
                                type="button"
                                onClick={() =>
                                  setPreviewGallery({
                                    productName: item.name,
                                    images,
                                    activeIndex: imgIdx,
                                  })
                                }
                                className="group relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border bg-muted shrink-0 shadow-xs hover:border-primary/60 transition-all cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary/30"
                              >
                                <img
                                  src={img.url}
                                  alt={`${item.name} image ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                {img.isPrimary && images.length > 1 && (
                                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs">
                                    Primary
                                  </span>
                                )}
                                <span className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {images.length === 0 && (
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">
                  {currencySymbol}{order.pricing.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping & Delivery Fee</span>
                <span className="font-semibold text-foreground">
                  {order.pricing.shipping_fee === 0 && "FREE"}
                  {order.pricing.shipping_fee !== 0 &&
                    `${currencySymbol}${order.pricing.shipping_fee.toFixed(2)}`}
                </span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discounts Applied</span>
                  <span>-{currencySymbol}{order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-base font-black text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">{currencySymbol}{order.pricing.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {order.order_status === "cancelled" && (
              <div className="p-3.5 rounded-2xl border border-destructive/30 bg-destructive/5 text-xs space-y-1">
                <p className="font-bold text-destructive">
                  Cancelled
                  {order.cancelled_at &&
                    ` on ${format(new Date(order.cancelled_at), "dd MMM yyyy 'at' hh:mm a")}`}
                </p>
                {order.cancel_reason && (
                  <p className="text-muted-foreground">
                    Reason: <span className="text-foreground font-medium">{order.cancel_reason}</span>
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-muted-foreground border-t">
              <div>
                <span className="font-semibold text-foreground">Placed</span>
                <p>
                  {order.createdAt && format(new Date(order.createdAt), "dd/MM/yy hh:mm a")}
                  {!order.createdAt && "—"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Paid</span>
                <p>
                  {order.paid_at && format(new Date(order.paid_at), "dd/MM/yy hh:mm a")}
                  {!order.paid_at && "—"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Shipped</span>
                <p>
                  {order.shipped_at && format(new Date(order.shipped_at), "dd/MM/yy hh:mm a")}
                  {!order.shipped_at && "—"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Delivered</span>
                <p>
                  {order.delivered_at && format(new Date(order.delivered_at), "dd/MM/yy hh:mm a")}
                  {!order.delivered_at && "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" className="rounded-xl h-10 px-5 text-xs font-semibold" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {previewGallery && (
      <Dialog
        open={!!previewGallery}
        onOpenChange={(open) => {
          if (!open) setPreviewGallery(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[92vh] p-4 sm:p-6 rounded-3xl border bg-background">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-base font-bold pr-8 truncate">
              {previewGallery.productName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Image {previewGallery.activeIndex + 1} of {previewGallery.images.length}
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex items-center justify-center bg-muted/40 rounded-2xl border overflow-hidden min-h-[300px] sm:min-h-[420px]">
            <img
              src={previewGallery.images[previewGallery.activeIndex]?.url}
              alt={previewGallery.productName}
              className="max-h-[65vh] w-auto object-contain rounded-xl"
            />

            {previewGallery.images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 rounded-full h-9 w-9 shadow-md"
                  onClick={() =>
                    setPreviewGallery((prev) =>
                      prev
                        ? {
                            ...prev,
                            activeIndex:
                              (prev.activeIndex - 1 + prev.images.length) %
                              prev.images.length,
                          }
                        : null
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 rounded-full h-9 w-9 shadow-md"
                  onClick={() =>
                    setPreviewGallery((prev) =>
                      prev
                        ? {
                            ...prev,
                            activeIndex: (prev.activeIndex + 1) % prev.images.length,
                          }
                        : null
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {previewGallery.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pt-1 pb-1">
              {previewGallery.images.map((img, idx) => (
                <button
                  key={`${img.url}-thumb-${idx}`}
                  type="button"
                  onClick={() =>
                    setPreviewGallery((prev) =>
                      prev ? { ...prev, activeIndex: idx } : null
                    )
                  }
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    previewGallery.activeIndex === idx
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${previewGallery.productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

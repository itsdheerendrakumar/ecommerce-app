"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getOrderItemImages, type IDeliveryOrder } from "@/lib/client-api/delivery";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShieldCheck,
  StickyNote,
} from "lucide-react";

interface DeliveryOrderDetailsModalProps {
  order: IDeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryOrderDetailsModal({
  order,
  isOpen,
  onClose,
}: DeliveryOrderDetailsModalProps) {
  if (!order) {
    return null;
  }

  const currencySymbol = order.currency?.toLowerCase() === "inr" ? "₹" : "$";
  const fullAddress = [
    order.shipping_address.address_line_1,
    order.shipping_address.address_line_2,
    order.shipping_address.city,
    order.shipping_address.state,
    order.shipping_address.pin_code,
  ]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const customerPhone = order.shipping_address.phone || order.customer_phone || "";
  const totalUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl gap-0 border">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-black font-mono">
                {order.order_number}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Placed {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {order.order_status.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Paid Online
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl border bg-card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Customer Drop-Off
                </span>
                <p className="font-bold text-base text-foreground">
                  {order.shipping_address.recipient_name}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{fullAddress}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call {customerPhone}
                </a>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/15 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Open Directions
              </a>
            </div>
          </div>

          {order.notes && (
            <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs">
              <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-300">Delivery Instructions</p>
                <p className="text-amber-800 dark:text-amber-200 mt-0.5">{order.notes}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" /> Package Contents ({totalUnits} units)
            </h4>
            <div className="border rounded-2xl divide-y divide-border overflow-hidden">
              {order.items.map((item, idx) => {
                const images = getOrderItemImages(item);
                const thumbUrl = images[0]?.url || item.image;

                return (
                  <div key={idx} className="p-3.5 bg-card flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {thumbUrl && (
                        <img
                          src={thumbUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border bg-muted shrink-0"
                        />
                      )}
                      {!thumbUrl && (
                        <div className="w-14 h-14 rounded-xl border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: <span className="font-bold text-foreground">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">
                      {currencySymbol}{item.total_price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Order Value (Prepaid)</span>
            </div>
            <span className="font-black text-foreground">
              {currencySymbol}{order.pricing.total_amount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t text-[11px] text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground block">Placed</span>
              <span>{format(new Date(order.createdAt), "dd MMM, hh:mm a")}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground block">Dispatched</span>
              {order.shipped_at && (
                <span>{format(new Date(order.shipped_at), "dd MMM, hh:mm a")}</span>
              )}
              {!order.shipped_at && <span>—</span>}
            </div>
            <div>
              <span className="font-semibold text-foreground block">Delivered</span>
              {order.delivered_at && (
                <span>{format(new Date(order.delivered_at), "dd MMM, hh:mm a")}</span>
              )}
              {!order.delivered_at && <span>—</span>}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" className="rounded-xl h-10 px-5 text-xs font-semibold" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

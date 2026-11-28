"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IDeliveryOrder } from "@/lib/client-api/delivery";
import { CheckCircle2, Loader2, MapPin, ShieldCheck, User } from "lucide-react";

interface ConfirmDeliveryModalProps {
  order: IDeliveryOrder | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
}

export function ConfirmDeliveryModal({
  order,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: ConfirmDeliveryModalProps) {
  if (!order) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-0 rounded-3xl gap-0 border">
        <DialogHeader className="p-6 pb-4 border-b bg-emerald-50/50 dark:bg-emerald-950/20">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" /> Confirm Parcel Delivery
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Verify handover before completing Order{" "}
            <span className="font-mono font-bold text-foreground">{order.order_number}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl border bg-muted/30 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <User className="w-4 h-4 text-primary shrink-0" />
              <span>Recipient: {order.shipping_address.recipient_name}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                {order.shipping_address.address_line_1}, {order.shipping_address.city} -{" "}
                {order.shipping_address.pin_code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Prepaid order settled online — no payment collection needed.</span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 px-4 text-xs font-semibold"
              onClick={onClose}
              disabled={isPending}
            >
              Not Yet
            </Button>
            <Button
              type="button"
              className="rounded-xl h-10 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              disabled={isPending}
              onClick={() => onConfirm(order._id)}
            >
              {isPending && (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Completing...
                </>
              )}
              {!isPending && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete Delivery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateAdminOrderStatusApi, IAdminOrder } from "@/lib/client-api/admin/order";
import { queryKeys } from "@/constants/query-key";
import { Ban, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PRESET_CANCEL_REASONS = [
  "Cancelled by customer request",
  "Out of stock / inventory unavailable",
  "Customer unreachable or refused delivery",
  "Duplicate order placed",
  "Incorrect shipping address or details",
];

interface CancelOrderModalProps {
  order: IAdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CancelOrderModal({ order, isOpen, onClose }: CancelOrderModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("Cancelled by customer request");

  useEffect(() => {
    if (isOpen) {
      setReason("Cancelled by customer request");
    }
  }, [isOpen, order?._id]);

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, cancelReason }: { orderId: string; cancelReason: string }) =>
      updateAdminOrderStatusApi(orderId, "cancelled", cancelReason),
    onSuccess: (_, variables) => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminOrders] });
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail", variables.orderId] });
      onClose();
    },
    onError: (err: unknown) => {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errObj?.response?.data?.message || errObj?.message || "Failed to cancel order";
      toast.error(msg);
    },
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error("Please provide a reason for cancelling this order");
      return;
    }

    cancelMutation.mutate({
      orderId: order._id,
      cancelReason: trimmedReason,
    });
  };

  if (!order) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !cancelMutation.isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 rounded-3xl gap-0 border">
        <DialogHeader className="p-6 pb-4 border-b bg-destructive/5">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
            <Ban className="w-5 h-5" /> Cancel Order
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Confirm cancellation for Order{" "}
            <span className="font-mono font-bold text-foreground">#{order.order_number}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmCancel} className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="font-semibold">This action is irreversible once confirmed.</p>
              <p className="text-[11px] opacity-90">
                Stock quantities for all ordered items will be automatically restored to inventory.
                {order.payment_method === "stripe" && order.payment_status === "paid"
                  ? " Please ensure Stripe refund processing is handled if required."
                  : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Reasons
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_CANCEL_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    reason === preset
                      ? "bg-destructive/10 text-destructive border-destructive/40"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cancel-reason-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cancellation Reason
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {reason.length}/500
              </span>
            </div>
            <textarea
              id="cancel-reason-input"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter detailed reason for cancellation..."
              className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 resize-none"
              disabled={cancelMutation.isPending}
              required
            />
          </div>

          <div className="pt-2 border-t flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 px-4 text-xs font-semibold"
              onClick={onClose}
              disabled={cancelMutation.isPending}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="rounded-xl h-10 px-5 text-xs font-bold shadow-md shadow-destructive/20"
              disabled={cancelMutation.isPending || !reason.trim()}
            >
              {cancelMutation.isPending && (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Cancelling...
                </>
              )}
              {!cancelMutation.isPending && (
                <>
                  <Ban className="w-3.5 h-3.5 mr-1.5" /> Confirm Cancellation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

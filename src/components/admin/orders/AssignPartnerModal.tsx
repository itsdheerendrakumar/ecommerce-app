"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDeliveryPartners } from "@/lib/client-api/admin";
import { assignDeliveryPartnerApi } from "@/lib/client-api/admin/order";
import { queryKeys } from "@/constants/query-key";
import { Truck, Check, Loader2, AlertCircle, Phone, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface AssignPartnerModalProps {
  orderId: string | null;
  orderNumber: string;
  currentPartnerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignPartnerModal({
  orderId,
  orderNumber,
  currentPartnerId,
  isOpen,
  onClose,
}: AssignPartnerModalProps) {
  const queryClient = useQueryClient();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(currentPartnerId || "");

  const { data: response, isLoading } = useQuery({
    queryKey: [queryKeys.deliveryPartners, "list"],
    queryFn: () => getDeliveryPartners({ role: "delivery-partner", limit: 50 }),
    enabled: isOpen,
  });

  const partners = response?.data?.data || [];

  const assignMutation = useMutation({
    mutationFn: (partnerId: string) => assignDeliveryPartnerApi(orderId!, partnerId),
    onSuccess: () => {
      toast.success("Delivery partner assigned successfully");
      queryClient.invalidateQueries({ queryKey: [queryKeys.adminOrders] });
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail", orderId] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Failed to assign delivery partner";
      toast.error(msg);
    },
  });

  const handleAssign = () => {
    if (!selectedPartnerId) {
      toast.error("Please select a delivery partner");
      return;
    }
    assignMutation.mutate(selectedPartnerId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 rounded-3xl gap-0 border">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> Assign Delivery Partner
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Assign a rider for Order <span className="font-mono font-bold text-foreground">#{orderNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs">Loading delivery partners...</p>
            </div>
          )}

          {!isLoading && partners.length === 0 && (
            <div className="py-10 text-center space-y-2 text-muted-foreground border border-dashed rounded-2xl">
              <AlertCircle className="w-6 h-6 mx-auto text-amber-500" />
              <p className="text-xs font-semibold">No registered delivery partners found</p>
              <p className="text-[11px]">Add delivery partners under Admin ➔ Users section.</p>
            </div>
          )}

          {!isLoading && partners.length > 0 && (
            <div className="space-y-2">
              {partners.map((p: any) => {
                const partnerUserId = p._id || p.user_id?._id || p.user_id;
                const isSelected = selectedPartnerId === partnerUserId;

                return (
                  <button
                    key={partnerUserId}
                    type="button"
                    onClick={() => setSelectedPartnerId(partnerUserId)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center justify-center text-sm shrink-0">
                        {p.name?.slice(0, 1)?.toUpperCase() || "R"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3" /> {p.phone || "No phone"}
                        </p>
                        {p.deliveryPartner?.vehicle_number && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Vehicle: {p.deliveryPartner.vehicle_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {!isSelected && (
                        <div className="w-6 h-6 rounded-full border border-muted-foreground/30" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2.5">
          <Button variant="outline" className="rounded-xl h-10 px-4 text-xs font-semibold" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-xl h-10 px-5 text-xs font-bold shadow-md shadow-primary/20"
            disabled={!selectedPartnerId || assignMutation.isPending}
            onClick={handleAssign}
          >
            {assignMutation.isPending && (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Assigning...
              </>
            )}
            {!assignMutation.isPending && (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Confirm Assignment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

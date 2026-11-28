"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Bike,
  CreditCard,
  Landmark,
  HeartPulse,
  MapPin,
  Star,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import { getDeliveryPartnerById } from "@/lib/client-api/admin";
import { queryKeys } from "@/constants/query-key";

interface DeliveryPartnerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string | null;
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
    });
  } catch {
    return "N/A";
  }
}

export function DeliveryPartnerDetailModal({
  open,
  onOpenChange,
  partnerId,
}: DeliveryPartnerDetailModalProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [queryKeys.deliveryPartnerDetail, partnerId],
    queryFn: () => getDeliveryPartnerById(partnerId!),
    enabled: Boolean(open && partnerId),
  });

  const partner = data?.data?.data;
  const dp = partner?.deliveryPartner;
  const displayName = partner?.name || partner?.email?.split("@")[0] || "Delivery Partner";
  const isOnline = dp?.duty_status === "on-duty";
  const rating = dp?.total_ratings ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                Delivery Partner Details
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive profile, operational vehicle, verification documents, and banking information.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading partner details...</span>
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-44 bg-muted/40 rounded-2xl animate-pulse" />
                <div className="h-44 bg-muted/40 rounded-2xl animate-pulse" />
                <div className="h-44 bg-muted/40 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="py-8 text-center space-y-3 bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h3 className="font-semibold text-base text-destructive">
              Failed to load partner details
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {(error as Error)?.message || "An unexpected error occurred while fetching details."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
              <span>Retry</span>
            </Button>
          </div>
        ) : !partner ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">No details found for this partner.</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Top Overview Banner */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                  {getInitials(displayName)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-foreground">
                      {displayName}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full",
                        isOnline
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isOnline ? "bg-emerald-500" : "bg-zinc-400"
                        )}
                      />
                      {isOnline ? "On Duty" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account Status:{" "}
                    <span className="font-semibold text-foreground">
                      {partner.is_active ? "Active" : "Suspended"}
                    </span>
                    {" • "}
                    Role: <span className="font-medium capitalize">{partner.role}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-2 rounded-xl text-sm font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{Number(rating).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3.5 py-2 rounded-xl text-sm font-semibold">
                  <PackageCheck className="w-4 h-4" />
                  <span>{dp?.completed_deliveries ?? 0} Orders</span>
                </div>
              </div>
            </div>

            {/* Information Grid: 3 columns on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Personal & Contact Information */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>Contact & Profile</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Email Address</span>
                      <span className="font-medium text-foreground break-all">{partner.email}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Phone Number</span>
                      <span className="font-medium text-foreground">{partner.phone || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Date of Birth</span>
                        <span className="font-medium text-foreground">{formatDate(partner.dob)}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Joined Date</span>
                        <span className="font-medium text-foreground">{formatDate(partner.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Address */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Operating Address</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Street Address</span>
                      <span className="font-medium text-foreground">
                        {dp?.address?.address || "Address not provided"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">City / Region</span>
                        <span className="font-medium text-foreground">{dp?.address?.city || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Postal / PIN Code</span>
                        <span className="font-mono font-medium text-foreground">{dp?.address?.pin_code || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Vehicle */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-foreground">
                    <Bike className="w-4 h-4 text-primary" />
                    <span>Assigned Vehicle</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Vehicle Model / Name</span>
                      <span className="font-medium text-foreground inline-flex items-center gap-1.5 mt-0.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                          {dp?.vehicle_name || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Registration / Plate</span>
                      <span className="font-mono font-semibold text-foreground uppercase tracking-wide">
                        {dp?.vehicle_number || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Duty Status</span>
                      <span className="font-medium text-foreground capitalize">
                        {dp?.duty_status || "off-duty"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Verification */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-foreground">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Official Identification</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Aadhaar Card Number</span>
                      <span className="font-mono font-medium text-foreground tracking-wide">
                        {dp?.aadhar_number || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Driving License Number</span>
                      <span className="font-mono font-medium text-foreground uppercase tracking-wide">
                        {dp?.license_number || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Verification Status</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Payout Details */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-foreground">
                    <Landmark className="w-4 h-4 text-primary" />
                    <span>Bank Payout Details</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Bank Name</span>
                      <span className="font-semibold text-foreground">{dp?.bank_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Account Number</span>
                      <span className="font-mono font-medium text-foreground">
                        {dp?.account_number || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">IFSC Code</span>
                      <span className="font-mono font-semibold text-foreground uppercase">
                        {dp?.ifsc_code || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl border border-border/70 space-y-3 bg-card flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-border/50 text-xs font-semibold text-rose-500">
                    <HeartPulse className="w-4 h-4" />
                    <span className="text-foreground">Emergency Contact</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Contact Person</span>
                      <span className="font-semibold text-foreground">
                        {dp?.emergency_contact_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Emergency Phone</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {dp?.emergency_contact_phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-5 text-xs font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

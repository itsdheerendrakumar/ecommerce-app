"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  deliveryPartnerSchema,
  type DeliveryPartnerFormData,
  type DeliveryPartner,
} from "@/lib/validations/delivery-partner";
import {
  User,
  Mail,
  Phone,
  Bike,
  CreditCard,
  Truck,
  Shield,
  Landmark,
  Building2,
  HeartPulse,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface AddDeliveryPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartnerAdded: (partner: DeliveryPartner) => void;
}

export function AddDeliveryPartnerModal({
  open,
  onOpenChange,
  onPartnerAdded,
}: AddDeliveryPartnerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliveryPartnerFormData>({
    resolver: zodResolver(deliveryPartnerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      aadharNumber: "",
      vehicleName: "",
      vehicleNumber: "",
      licenseNumber: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  const onSubmit = async (data: DeliveryPartnerFormData) => {
    try {
      setIsSubmitting(true);
      // Simulate quick UI response delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      const newPartner: DeliveryPartner = {
        id: `dp-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        aadharNumber: data.aadharNumber,
        vehicleName: data.vehicleName,
        vehicleNumber: data.vehicleNumber,
        licenseNumber: data.licenseNumber,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode.toUpperCase(),
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        status: "active",
        completedDeliveries: 0,
        rating: 5.0,
        joinedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };

      onPartnerAdded(newPartner);
      toast.success("Delivery partner registered successfully!", {
        description: `${data.name} has been added to active courier dispatch.`,
      });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to register delivery partner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Add Delivery Partner
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Onboard a new motorcycle courier with verified credentials and payout details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Section 1: Basic Information */}
          <div className="space-y-1.5">
            <Label htmlFor="dp-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="dp-name"
                type="text"
                placeholder="Enter full name"
                {...register("name")}
                className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                  errors.name
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-email"
                  type="email"
                  placeholder="Enter email address"
                  {...register("email")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.email
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-phone"
                  type="text"
                  placeholder="Enter mobile number"
                  {...register("phone")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.phone
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Vehicle & Government IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-vehicleName">Vehicle Name</Label>
              <div className="relative">
                <Bike className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-vehicleName"
                  type="text"
                  placeholder="Enter vehicle name"
                  {...register("vehicleName")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.vehicleName
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.vehicleName && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.vehicleName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-vehicleNumber">Motorcycle Registration / Plate</Label>
              <div className="relative">
                <input
                  id="dp-vehicleNumber"
                  type="text"
                  placeholder="Enter motorcycle plate number"
                  {...register("vehicleNumber")}
                  className={`w-full h-10 px-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.vehicleNumber
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.vehicleNumber && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Aadhaar & Driving License Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-aadharNumber">Aadhaar Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-aadharNumber"
                  type="text"
                  placeholder="Enter Aadhaar card number"
                  maxLength={14}
                  {...register("aadharNumber")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.aadharNumber
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.aadharNumber && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.aadharNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-licenseNumber">Driving License / ID</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-licenseNumber"
                  type="text"
                  placeholder="Enter driving license number"
                  {...register("licenseNumber")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.licenseNumber
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.licenseNumber && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.licenseNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Bank Account Payout Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-bankName">Bank Name</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-bankName"
                  type="text"
                  placeholder="Enter bank name"
                  {...register("bankName")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.bankName
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.bankName && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-ifscCode">IFSC Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-ifscCode"
                  type="text"
                  placeholder="Enter IFSC code"
                  maxLength={11}
                  {...register("ifscCode")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm uppercase text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.ifscCode
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.ifscCode && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.ifscCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dp-accountNumber">Bank Account Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="dp-accountNumber"
                type="text"
                placeholder="Enter bank account number"
                maxLength={18}
                {...register("accountNumber")}
                className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                  errors.accountNumber
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.accountNumber && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          {/* Section 4: Emergency Contact */}
          <div className="p-3.5 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-foreground">
                Emergency Contact (On-Road Safety)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dp-emergencyName" className="text-[11px]">Contact Person Name</Label>
                <input
                  id="dp-emergencyName"
                  type="text"
                  placeholder="Enter emergency contact name"
                  {...register("emergencyContactName")}
                  className={`w-full h-9 px-3 rounded-lg border bg-background text-xs text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.emergencyContactName
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.emergencyContactName && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emergencyContactName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dp-emergencyPhone" className="text-[11px]">Emergency Phone</Label>
                <input
                  id="dp-emergencyPhone"
                  type="text"
                  placeholder="Enter emergency phone number"
                  {...register("emergencyContactPhone")}
                  className={`w-full h-9 px-3 rounded-lg border bg-background text-xs text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.emergencyContactPhone
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emergencyContactPhone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-1.5 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Add Partner
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

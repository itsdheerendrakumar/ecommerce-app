"use client";

import { useState, useEffect } from "react";
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
  type DeliveryPartner,
} from "@/lib/validations/delivery-partner";
import {
  User,
  Mail,
  Phone,
  Calendar,
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
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { DeliveryPartnerFormData } from "@/lib/client-api/admin/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeliveryPartner } from "@/lib/client-api/admin";
import { queryKeys } from "@/constants/query-key";

interface AddDeliveryPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartnerAdded?: (partner: DeliveryPartner) => void;
}

export function AddDeliveryPartnerModal({
  open,
  onOpenChange,
  onPartnerAdded,
}: AddDeliveryPartnerModalProps) {
  const queryClient = useQueryClient();

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
      dob: "",
      address: "",
      city: "",
      pin_code: "",
      vehicle_name: "",
      vehicle_number: "",
      aadhar_number: "",
      license_number: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
  });

  const [maxDobDate, setMaxDobDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    setMaxDobDate(date.toISOString().split("T")[0]);
  }, []);

  const createDeliveryPartnerMutation = useMutation({
    mutationFn: createDeliveryPartner,
    onSuccess: (data) => {
      toast.success(data.message || "Delivery partner created successfully");
      reset();
      queryClient.invalidateQueries({ queryKey: [queryKeys.deliveryPartners] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create delivery partner");
    },
  });

  const onSubmit = async (data: DeliveryPartnerFormData) => {
    createDeliveryPartnerMutation.mutate(data);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-dob"
                  type="date"
                  max={maxDobDate}
                  placeholder="Enter date of birth"
                  {...register("dob")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.dob
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.dob && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>

          {/* Section: Address Details */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="dp-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-address"
                  type="text"
                  placeholder="Enter address"
                  {...register("address")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.address
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dp-city">City</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    id="dp-city"
                    type="text"
                    placeholder="Enter city"
                    {...register("city")}
                    className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                      errors.city
                        ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                        : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.city && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dp-pin_code">PIN / Postal Code</Label>
                <div className="relative">
                  <input
                    id="dp-pin_code"
                    type="text"
                    placeholder="Enter PIN / postal code"
                    maxLength={10}
                    {...register("pin_code")}
                    className={`w-full h-10 px-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                      errors.pin_code
                        ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                        : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.pin_code && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.pin_code.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle & Government IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-vehicle_name">Vehicle Name</Label>
              <div className="relative">
                <Bike className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-vehicle_name"
                  type="text"
                  placeholder="Enter vehicle name"
                  {...register("vehicle_name")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.vehicle_name
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.vehicle_name && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.vehicle_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-vehicle_number">Motorcycle Registration / Plate</Label>
              <div className="relative">
                <input
                  id="dp-vehicle_number"
                  type="text"
                  placeholder="Enter motorcycle plate number"
                  {...register("vehicle_number")}
                  className={`w-full h-10 px-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.vehicle_number
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.vehicle_number && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.vehicle_number.message}
                </p>
              )}
            </div>
          </div>

          {/* Aadhaar & Driving License Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-aadhar_number">Aadhaar Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-aadhar_number"
                  type="text"
                  placeholder="Enter Aadhaar card number"
                  maxLength={14}
                  {...register("aadhar_number")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.aadhar_number
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.aadhar_number && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.aadhar_number.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-license_number">Driving License / ID</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-license_number"
                  type="text"
                  placeholder="Enter driving license number"
                  {...register("license_number")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.license_number
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.license_number && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.license_number.message}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Bank Account Payout Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dp-bank_name">Bank Name</Label>
              <div className="relative">
                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-bank_name"
                  type="text"
                  placeholder="Enter bank name"
                  {...register("bank_name")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.bank_name
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.bank_name && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bank_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dp-ifsc_code">IFSC Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="dp-ifsc_code"
                  type="text"
                  placeholder="Enter IFSC code"
                  maxLength={11}
                  {...register("ifsc_code")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm uppercase text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.ifsc_code
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.ifsc_code && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.ifsc_code.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dp-account_number">Bank Account Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="dp-account_number"
                type="text"
                placeholder="Enter bank account number"
                maxLength={18}
                {...register("account_number")}
                className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                  errors.account_number
                    ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                    : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.account_number && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.account_number.message}
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
                <Label htmlFor="dp-emergency_contact_name" className="text-[11px]">Contact Person Name</Label>
                <input
                  id="dp-emergency_contact_name"
                  type="text"
                  placeholder="Enter emergency contact name"
                  {...register("emergency_contact_name")}
                  className={`w-full h-9 px-3 rounded-lg border bg-background text-xs text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.emergency_contact_name
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.emergency_contact_name && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emergency_contact_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dp-emergency_contact_phone" className="text-[11px]">Emergency Phone</Label>
                <input
                  id="dp-emergency_contact_phone"
                  type="text"
                  placeholder="Enter emergency phone number"
                  {...register("emergency_contact_phone")}
                  className={`w-full h-9 px-3 rounded-lg border bg-background text-xs text-foreground transition-all placeholder:text-muted-foreground/60 outline-none ${
                    errors.emergency_contact_phone
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-border hover:border-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.emergency_contact_phone && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emergency_contact_phone.message}
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
              disabled={createDeliveryPartnerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDeliveryPartnerMutation.isPending}
              className="gap-1.5 min-w-[140px]"
            >
              {createDeliveryPartnerMutation.isPending ? (
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


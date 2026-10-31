import { z } from "zod";

export const deliveryPartnerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\s()-]{10,16}$/, "Please enter a valid phone number")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Phone number must have between 10 and 15 digits" }
    ),
  aadharNumber: z
    .string()
    .min(1, "Aadhaar card number is required")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 12;
      },
      { message: "Aadhaar card number must be exactly 12 digits" }
    ),
  vehicleName: z
    .string()
    .min(1, "Vehicle name is required")
    .min(2, "Vehicle name must be at least 2 characters")
    .max(50, "Vehicle name must not exceed 50 characters"),
  vehicleNumber: z
    .string()
    .min(1, "Motorcycle plate or registration is required")
    .max(25, "Registration number must not exceed 25 characters"),
  licenseNumber: z
    .string()
    .min(1, "Driver license or partner ID is required")
    .min(4, "License must be at least 4 characters")
    .max(30, "License must not exceed 30 characters"),
  bankName: z
    .string()
    .min(1, "Bank name is required")
    .min(2, "Bank name must be at least 2 characters")
    .max(60, "Bank name must not exceed 60 characters"),
  accountNumber: z
    .string()
    .min(1, "Bank account number is required")
    .regex(/^\d{9,18}$/, "Account number must be between 9 and 18 digits"),
  ifscCode: z
    .string()
    .min(1, "IFSC code is required")
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, "Please enter a valid 11-character IFSC code"),
  emergencyContactName: z
    .string()
    .min(1, "Emergency contact name is required")
    .min(2, "Name must be at least 2 characters"),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required")
    .regex(/^[0-9+\s()-]{10,16}$/, "Please enter a valid phone number")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Emergency phone must have between 10 and 15 digits" }
    ),
});

export type DeliveryPartnerFormData = z.infer<typeof deliveryPartnerSchema>;

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  licenseNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: "active" | "inactive";
  completedDeliveries: number;
  rating: number;
  joinedDate: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  spent: number;
  status: "active" | "inactive";
  joinedDate: string;
}

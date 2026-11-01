import { z } from "zod";

// Helper for date of birth validation (min 18 years old, valid past date)
const validateAge = (dateString: string): boolean => {
  if (!dateString) return false;
  const birthDate = new Date(dateString);
  if (isNaN(birthDate.getTime())) return false;

  const today = new Date();
  if (birthDate >= today) return false;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18 && age <= 100;
};

export const deliveryPartnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must not exceed 60 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\s()-]{10,16}$/, "Please enter a valid phone number")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Phone number must have between 10 and 15 digits" }
    ),
  dob: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine(validateAge, {
      message: "Delivery partner must be at least 18 years old with a valid date of birth",
    }),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(150, "Address must not exceed 150 characters"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  pin_code: z
    .string()
    .trim()
    .min(1, "PIN / Postal code is required")
    .regex(/^[0-9A-Za-z\s-]{4,10}$/, "Please enter a valid PIN or postal code"),
  vehicle_name: z
    .string()
    .trim()
    .min(1, "Vehicle name is required")
    .min(2, "Vehicle name must be at least 2 characters")
    .max(50, "Vehicle name must not exceed 50 characters"),
  vehicle_number: z
    .string()
    .trim()
    .min(1, "Motorcycle plate or registration is required")
    .max(25, "Registration number must not exceed 25 characters"),
  aadhar_number: z
    .string()
    .trim()
    .min(1, "Aadhaar card number is required")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 12;
      },
      { message: "Aadhaar card number must be exactly 12 digits" }
    ),
  license_number: z
    .string()
    .trim()
    .min(1, "Driver license or partner ID is required")
    .min(4, "License must be at least 4 characters")
    .max(30, "License must not exceed 30 characters"),
  bank_name: z
    .string()
    .trim()
    .min(1, "Bank name is required")
    .min(2, "Bank name must be at least 2 characters")
    .max(60, "Bank name must not exceed 60 characters"),
  account_number: z
    .string()
    .trim()
    .min(1, "Bank account number is required")
    .regex(/^\d{9,18}$/, "Account number must be between 9 and 18 digits"),
  ifsc_code: z
    .string()
    .trim()
    .min(1, "IFSC code is required")
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, "Please enter a valid 11-character IFSC code"),
  emergency_contact_name: z
    .string()
    .trim()
    .min(1, "Emergency contact name is required")
    .min(2, "Name must be at least 2 characters"),
  emergency_contact_phone: z
    .string()
    .trim()
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

export interface DeliveryPartnerPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  address: string;
  city: string;
  pin_code: string;
  vehicle_name: string;
  vehicle_number: string;
  aadhar_number: string;
  license_number: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  duty_status: "on-duty" | "off-duty" | "in-delivery";
  completed_deliveries: number;
  rating: number;
  joinedDate: string;
}

export type DeliveryPartner = DeliveryPartnerPayload;

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

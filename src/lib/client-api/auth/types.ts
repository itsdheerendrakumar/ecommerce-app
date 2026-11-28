import { signupSchema, loginSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import type { IDeliveryPartnerProfile } from "../admin/types";

export type SignupPayload = z.infer<typeof signupSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;

export type UserRole = "admin" | "customer" | "delivery-partner";

export interface SignupResponse {
  message: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface LoginResponse {
  data?: {
    message: string;
  };
  message?: string;
}

export interface UserProfile {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  image?: string;
  avatar?: string;
  profile_picture?: string;
  dob?: string | Date;
  phone?: string;
  deliveryPartner?: IDeliveryPartnerProfile | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProfileResponse {
  message?: string;
  data?: {
    data: UserProfile;
  };
  meta?: unknown;
  user?: UserProfile | null;
}

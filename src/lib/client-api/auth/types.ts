import { signupSchema, loginSchema } from "@/lib/validations/auth";
import type { z } from "zod";

export type SignupPayload = z.infer<typeof signupSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;

export type UserRole = "admin" | "customer" | "delivery-partner";

export interface SignupResponse {
  message: string;
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
  dob?: string | Date;
  phone?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProfileResponse {
  user: UserProfile | null;
}
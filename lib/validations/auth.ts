import { z } from "zod";

/**
 * Authentication Validation Schemas
 * Exported separately from UI components for maintainability and modularity.
 */

// Password strength evaluation utility
export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Medium" | "Strong" | "Very Strong";
  color: string;
  checks: {
    length: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.length) score += 1;
  if (checks.hasUppercase && checks.hasLowercase) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  if (password.length === 0) {
    return {
      score: 0,
      label: "Too Weak",
      color: "bg-muted",
      checks,
    };
  }

  const levels: Record<number, { label: PasswordStrengthResult["label"]; color: string }> = {
    1: { label: "Weak", color: "bg-red-500" },
    2: { label: "Medium", color: "bg-amber-500" },
    3: { label: "Strong", color: "bg-emerald-500" },
    4: { label: "Very Strong", color: "bg-primary" },
  };

  return {
    score,
    label: levels[score]?.label || "Weak",
    color: levels[score]?.color || "bg-red-500",
    checks,
  };
}

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Helper for date of birth validation (min 13 years old, valid past date)
const validateAge = (dateString: string): boolean => {
  if (!dateString) return false;
  const birthDate = new Date(dateString);
  if (isNaN(birthDate.getTime())) return false;
  
  const today = new Date();
  // Must be in the past
  if (birthDate >= today) return false;

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 13 && age <= 120;
};

// Signup validation schema
export const signupSchema = z
  .object({
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
    mobile: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^[0-9+\s()-]{10,16}$/, "Please enter a valid phone number")
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          return digits.length >= 10 && digits.length <= 15;
        },
        { message: "Mobile number must have between 10 and 15 digits" }
      ),
    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine(validateAge, {
        message: "You must be at least 13 years old with a valid date of birth",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

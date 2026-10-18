import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account | STOREFRONT Luxe E-Commerce",
  description:
    "Join STOREFRONT today. Enjoy exclusive welcome perks, seamless order tracking, express deliveries, and curated luxury collections.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}

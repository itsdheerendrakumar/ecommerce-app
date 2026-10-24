import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | STOREFRONT E-Commerce",
  description:
    "Sign in to your STOREFRONT account to access your personal wishlist, track current orders, and explore members-only curated deals.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

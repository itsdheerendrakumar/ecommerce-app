"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/client-api/auth";
import type { LoginPayload } from "@/lib/client-api/auth/types";
import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { profileQuery } = useMe();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload)
  })

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data)
  };

  const getInputClasses = (hasError?: boolean, isPassword?: boolean) =>
    `w-full h-11.5 pl-10 ${isPassword ? "pr-11" : "pr-3.5"} rounded-xl border bg-background text-sm text-foreground transition-all placeholder:text-muted-foreground/50 outline-none disabled:opacity-50 ${hasError
      ? "border-destructive focus:border-transparent focus:ring-2 focus:ring-destructive/60"
      : "border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-transparent focus:ring-2 focus:ring-primary/70"
    }`;

  useEffect(() => {
    if(profileQuery.isSuccess)
    if(profileQuery.isSuccess) router.push("/")
  }, [profileQuery.data, profileQuery.isSuccess, router])

  return (
    <div className="w-full space-y-5">
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your StoreFront account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email Address</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="size-4" />
            </div>
            <input
              id="login-email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              disabled={loginMutation.isPending}
              {...register("email")}
              className={getInputClasses(Boolean(errors.email))}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive flex items-center gap-1 font-medium mt-1"
            >
              <AlertCircle className="size-3.5" />
              {errors.email.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              {...register("password")}
              className={getInputClasses(Boolean(errors.password), true)}
            />
            <button
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4.5" />
              ) : (
                <Eye className="size-4.5" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive flex items-center gap-1 font-medium mt-1"
            >
              <AlertCircle className="size-3.5" />
              {errors.password.message}
            </motion.p>
          )}
        </div>

        <div className="flex items-center space-x-2.5 pt-1">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue("rememberMe", Boolean(checked))}
            disabled={loginMutation.isPending}
          />
          <label
            htmlFor="remember-me"
            className="text-xs text-muted-foreground select-none cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Keep me signed in for 30 days
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={loginMutation.isPending}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/35 transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </motion.button>

        <div className="space-y-3 pt-1">
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-border/80" />
            <span className="absolute bg-background px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              or
            </span>
          </div>

          <button
            type="button"
            disabled={loginMutation.isPending}
            className="w-full h-11.5 flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-3">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground overflow-x-hidden">
      <div className="relative hidden lg:flex lg:w-[56%] xl:w-[58%] 2xl:w-[60%] flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-border/40">
        <img
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop"
          alt="StoreFront Lifestyle E-Commerce"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 transition-transform hover:scale-[1.02]"
          >
            <div className="size-11 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg shadow-black/30 transition-transform group-hover:rotate-6">
              <ShoppingBag className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
                StoreFront
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="size-3.5" />
            Back to store
          </Link>
        </div>

        <div className="relative z-10 space-y-2 max-w-lg">
          <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow">
            Experience the next generation of online shopping with bespoke curations and fast delivery.
          </p>
          <p className="text-white/60 text-xs">
            &copy; 2026 StoreFront Inc. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex-1 lg:w-[44%] xl:w-[42%] 2xl:w-[40%] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-12 xl:px-16 py-10 lg:py-16 bg-background">
        <div className="w-full max-w-lg lg:hidden flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <ShoppingBag className="size-4.5" />
            </div>
            <span className="font-extrabold">StoreFront</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="size-3" /> Store
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-lg mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { Users, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomersTab } from "@/components/admin/users/CustomersTab";
import { DeliveryPartnersTab } from "@/components/admin/users/DeliveryPartnersTab";

function AdminUsersContent() {
  const [activeTab, setActiveTab] = useState<"customers" | "delivery">("customers");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="border-b pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">User Directory</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            Management
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your registered customer accounts and on-demand delivery fleet.
        </p>
      </div>

      <div className="flex p-1 bg-muted rounded-xl border border-border/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
            activeTab === "customers"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
            activeTab === "delivery"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Delivery Partners</span>
        </button>
      </div>

      {activeTab === "customers" && <CustomersTab />}
      {activeTab === "delivery" && <DeliveryPartnersTab />}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse">
          <div className="h-10 bg-muted/50 rounded-xl w-1/4" />
          <div className="h-12 bg-muted/40 rounded-xl" />
          <div className="h-64 bg-muted/30 rounded-2xl" />
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}

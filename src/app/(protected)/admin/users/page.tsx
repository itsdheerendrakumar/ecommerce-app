"use client";

import { useState } from "react";
import { Users, Truck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomersTab } from "@/components/admin/users/CustomersTab";
import { DeliveryPartnersTab } from "@/components/admin/users/DeliveryPartnersTab";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "delivery">("customers");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Page Title & Header */}
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

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Two Tabs: Customer and Delivery Partner */}
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

        {/* Search bar */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              activeTab === "customers"
                ? "Search by name, email, city..."
                : "Search by name, vehicle, plate, bank..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Tab 1: Customers View */}
      {activeTab === "customers" && <CustomersTab searchQuery={searchQuery} />}

      {/* Tab 2: Delivery Partner View */}
      {activeTab === "delivery" && <DeliveryPartnersTab searchQuery={searchQuery} />}
    </div>
  );
}

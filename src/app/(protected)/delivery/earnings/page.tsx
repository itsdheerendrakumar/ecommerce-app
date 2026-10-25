"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Award } from "lucide-react";

export default function DeliveryEarningsPage() {
  const { orders } = useAppStore();
  const delivered = orders.filter((o) => o.status === "delivered");
  const baseRate = 8.5; // $8.50 per delivery
  const totalEarned = delivered.length * baseRate;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Earnings & Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">Your courier earnings, bonuses, and completed deliveries.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Earned</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">${totalEarned.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Completed Runs</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">{delivered.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Per Delivery Rate</CardTitle>
            <Award className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">${baseRate.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

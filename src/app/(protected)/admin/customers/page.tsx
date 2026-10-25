"use client";

import { Card, CardContent } from "@/components/ui/card";

const mockCustomers = [
  { id: "1", name: "Alice Freeman", email: "alice@example.com", totalOrders: 4, spent: 840 },
  { id: "2", name: "David Kim", email: "david@example.com", totalOrders: 2, spent: 320 },
  { id: "3", name: "Sophia Zhang", email: "sophia@example.com", totalOrders: 7, spent: 1450 },
];

export default function AdminCustomersPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Database</h1>
        <p className="text-sm text-muted-foreground mt-1">Directory of registered shoppers and order histories.</p>
      </div>

      <div className="space-y-4">
        {mockCustomers.map((c) => (
          <Card key={c.id} className="rounded-2xl border shadow-xs">
            <CardContent className="flex justify-between items-center p-5">
              <div>
                <p className="font-bold text-base text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-foreground">{c.totalOrders} Orders</p>
                <p className="text-muted-foreground mt-0.5">Total: ${c.spent.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

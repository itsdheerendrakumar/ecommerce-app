"use client";

import { useMe } from "@/hooks/useMe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeliveryProfilePage() {
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Rider Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your courier verification details and vehicle info.</p>
      </div>

      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Courier Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Courier Name</p>
              <p className="font-semibold text-foreground">{user?.name || "Rider Partner"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vehicle Type</p>
              <p className="font-semibold text-foreground">Motorcycle / E-Bike</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Partner Status</p>
              <p className="font-semibold text-emerald-600">Active & Verified</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button className="rounded-xl">Update Courier Info</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

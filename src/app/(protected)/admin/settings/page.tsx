"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure global store preferences, currency, and notifications.</p>
      </div>

      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Store Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Store Front Name</label>
            <input type="text" defaultValue="StoreFront Online" className="w-full p-2.5 border rounded-xl bg-card outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Currency Code</label>
            <input type="text" defaultValue="USD ($)" className="w-full p-2.5 border rounded-xl bg-card outline-none" />
          </div>
          <div className="pt-2">
            <Button className="rounded-xl font-semibold">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

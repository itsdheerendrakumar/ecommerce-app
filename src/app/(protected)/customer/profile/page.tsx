"use client";

import { useState } from "react";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Bell, Shield, Edit, Trash2 } from "lucide-react";

export default function CustomerProfilePage() {
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your customer profile, preferences, and addresses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-1.5">
          <Button
            variant={activeTab === "personal" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-xl font-semibold text-sm"
            onClick={() => setActiveTab("personal")}
          >
            <User className="w-4 h-4 mr-2" /> Personal Info
          </Button>
          <Button
            variant={activeTab === "addresses" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-xl font-semibold text-sm"
            onClick={() => setActiveTab("addresses")}
          >
            <MapPin className="w-4 h-4 mr-2" /> Addresses
          </Button>
          <Button
            variant={activeTab === "notifications" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-xl font-semibold text-sm"
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
          <Button
            variant={activeTab === "security" ? "secondary" : "ghost"}
            className="w-full justify-start rounded-xl font-semibold text-sm"
            onClick={() => setActiveTab("security")}
          >
            <Shield className="w-4 h-4 mr-2" /> Security
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === "personal" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center space-x-5">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{user?.name || "Customer User"}</h3>
                    <p className="text-xs text-muted-foreground capitalize">Role: {user?.role || "customer"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || "Customer User"}
                      className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email || "customer@store.com"}
                      className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || "+1 (555) 234-5678"}
                      className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="rounded-xl font-semibold">Save Profile</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "addresses" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Saved Shipping Addresses</CardTitle>
                <Button size="sm" className="rounded-full">Add New</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-xl border-primary/40 bg-primary/5 flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="font-bold text-sm">Home (Default)</span>
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                        Primary
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      123 Main St, Apt 4B<br />New York, NY 10001<br />United States
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between p-3 border rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Order Updates</p>
                    <p className="text-xs text-muted-foreground">Receive real-time tracking updates when status changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">Promotions & Discounts</p>
                    <p className="text-xs text-muted-foreground">Be the first to hear about seasonal sales</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Security & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Keep your account secure with strong credentials.
                </p>
                <div className="space-y-3 max-w-sm">
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <Button className="rounded-xl font-semibold">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

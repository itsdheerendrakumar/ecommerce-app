"use client";

import { useState, useRef } from "react";
import { useMe } from "@/hooks/useMe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Shield,
  Bell,
  Lock,
  Mail,
  Phone,
  Key,
  Camera,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/lib/client-api/common";
import { queryKeys } from "@/constants/query-key";
import { useAppStore } from "@/store/useAppStore";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">("personal");

  // Profile image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const profilePictureMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res: any) => {
      setSelectedFile(null);
      if (fileInputRef?.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrl(null);
      const newPic = res?.data?.data?.profile_picture || res?.data?.profile_picture || res?.profile_picture;
      if (newPic && user) {
        setUser({ ...user, profile_picture: newPic });
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.me] });
      toast.success("Profile picture updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update profile picture"
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handlePhotoAction = () => {
    if (!selectedFile) {
      // Trigger hidden file input
      fileInputRef.current?.click();
    } else {
      const formData = new FormData();
      formData.append("profile_picture", selectedFile);
      profilePictureMutation.mutate(formData);
    }
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password updated successfully!");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences saved!");
  };

  const currentAvatarSrc =
    previewUrl || user?.profile_picture || (user as any)?.avatar || (user as any)?.image;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Profile Settings</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            Administrator
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your administrator profile, security credentials, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          <Button
            variant={activeTab === "personal" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start rounded-xl font-semibold text-sm transition-all",
              activeTab === "personal"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveTab("personal")}
          >
            <User className="w-4 h-4 mr-2" /> Personal Info
          </Button>

          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start rounded-xl font-semibold text-sm transition-all",
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveTab("security")}
          >
            <Shield className="w-4 h-4 mr-2" /> Security
          </Button>

          <Button
            variant={activeTab === "notifications" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start rounded-xl font-semibold text-sm transition-all",
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3 space-y-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture & User Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Avatar Display */}
                  <div
                    onClick={() =>
                      !selectedFile &&
                      !profilePictureMutation.isPending &&
                      fileInputRef.current?.click()
                    }
                    className={cn(
                      "relative w-20 h-20 rounded-full flex items-center justify-center ring-2 ring-primary/20 overflow-hidden shrink-0 group transition-all",
                      !selectedFile && !profilePictureMutation.isPending && "cursor-pointer hover:ring-primary/40"
                    )}
                    title={!selectedFile ? "Click to change photo" : undefined}
                  >
                    {currentAvatarSrc ? (
                      <img
                        src={currentAvatarSrc}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                        {user?.name
                          ? user.name.charAt(0).toUpperCase()
                          : user?.email
                          ? user.email.charAt(0).toUpperCase()
                          : "A"}
                      </div>
                    )}

                    {/* Hover overlay hint when no pending file */}
                    {!selectedFile && !profilePictureMutation.isPending && (
                      <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5" />
                        <span className="text-[9px] font-medium mt-0.5">Change</span>
                      </div>
                    )}
                  </div>

                  {/* Info and Actions */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base truncate">{user?.name || "Administrator"}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      Role: {user?.role || "admin"} (Superuser)
                    </p>

                    {/* Change / Update button */}
                    <div className="flex items-center gap-2 pt-1.5">
                      <Button
                        type="button"
                        size="sm"
                        disabled={profilePictureMutation.isPending}
                        variant={selectedFile ? "default" : "outline"}
                        className={cn(
                          "rounded-xl h-8 px-3.5 text-xs font-semibold gap-1.5 transition-all",
                          selectedFile && "bg-primary text-primary-foreground shadow-xs"
                        )}
                        onClick={handlePhotoAction}
                      >
                        {profilePictureMutation.isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </>
                        ) : selectedFile ? (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Update
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            Change
                          </>
                        )}
                      </Button>

                      {selectedFile && !profilePictureMutation.isPending && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="rounded-xl h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={handleCancelPhoto}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || "System Admin"}
                        className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || "admin@store.com"}
                        className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || "+1 (555) 019-2834"}
                        className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" /> Admin Title / Designation
                      </label>
                      <input
                        type="text"
                        defaultValue="Senior Store Administrator"
                        className="w-full p-2.5 border rounded-xl bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="rounded-xl font-semibold">
                      Save Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="rounded-2xl border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg">Security & Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-xs text-muted-foreground">
                    Ensure your administrator account is using a strong password and up-to-date credentials.
                  </p>

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Minimum 8 characters"
                        className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="pt-1">
                      <Button type="submit" className="rounded-xl font-semibold">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication Info */}
              <Card className="rounded-2xl border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Two-Factor Authentication (2FA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between p-3.5 border rounded-xl bg-muted/20">
                    <div>
                      <p className="font-semibold text-sm">Authenticator App (TOTP)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Use apps like Google Authenticator or 1Password for an added layer of login security.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                      Enabled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">Order Placed Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Receive instant alerts whenever a new order is received
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">Delivery Fleet Dispatch</p>
                      <p className="text-xs text-muted-foreground">
                        Get notified when couriers accept, pick up, or deliver orders
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">Low Inventory Warnings</p>
                      <p className="text-xs text-muted-foreground">
                        Receive warning notifications when product stock falls below 10 units
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">New User & Courier Registrations</p>
                      <p className="text-xs text-muted-foreground">
                        Notify when new customers register or delivery partners apply
                      </p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 rounded accent-primary cursor-pointer" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">Security & System Log Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        Critical notices regarding system logins and configuration updates
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary cursor-pointer" />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="rounded-xl font-semibold">
                      Save Notification Preferences
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

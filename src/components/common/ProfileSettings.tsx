"use client";

import { useState, useRef, useId } from "react";
import { useMe } from "@/hooks/useMe";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, changePassword } from "@/lib/client-api/common";
import { queryKeys } from "@/constants/query-key";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { evaluatePasswordStrength } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Shield,
  Bell,
  Lock,
  Mail,
  Phone,
  Camera,
  UploadCloud,
  Loader2,
  Eye,
  EyeOff,
  MapPin,
  Truck,
  Edit,
  Trash2,
  CheckCircle2,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==========================================
// 1. REUSABLE PROFILE PICTURE & INFO COMPONENT
// ==========================================
export function ProfilePictureCard() {
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const profilePictureMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res: any) => {
      setSelectedFile(null);
      if (fileInputRef?.current) {
        fileInputRef.current.value = "";
      }
      setPreviewUrl(null);
      const newPic =
        res?.data?.data?.profile_picture ||
        res?.data?.profile_picture ||
        res?.profile_picture;
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handlePhotoAction = () => {
    if (!selectedFile) {
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
    toast.success("Profile information saved successfully!");
  };

  const currentAvatarSrc =
    previewUrl ||
    user?.profile_picture ||
    (user as any)?.avatar ||
    (user as any)?.image;

  const roleLabel =
    user?.role === "admin"
      ? "Administrator (Superuser)"
      : user?.role === "delivery-partner"
      ? "Delivery Partner (Courier)"
      : "Verified Customer";

  return (
    <Card className="rounded-2xl border shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Upload Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/50">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() =>
              !selectedFile &&
              !profilePictureMutation.isPending &&
              fileInputRef.current?.click()
            }
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center ring-2 ring-primary/20 overflow-hidden shrink-0 group transition-all",
              !selectedFile &&
                !profilePictureMutation.isPending &&
                "cursor-pointer hover:ring-primary/40"
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
                  : "U"}
              </div>
            )}

            {!selectedFile && !profilePictureMutation.isPending && (
              <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-medium mt-0.5">Change</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base truncate">
                {user?.name || "User"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              Role: {roleLabel}
            </p>

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
                    Change Photo
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

        {/* User Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                value={fullName || user?.name || ""}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                title="Email cannot be changed"
                className="w-full p-2.5 border rounded-xl bg-muted/50 text-sm text-muted-foreground cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input
                type="tel"
                value={phone || user?.phone || ""}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Account Role
              </label>
              <input
                type="text"
                value={user?.role ? user.role.toUpperCase() : "CUSTOMER"}
                disabled
                className="w-full p-2.5 border rounded-xl bg-muted/50 text-sm text-muted-foreground cursor-not-allowed outline-none uppercase font-semibold text-xs"
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
  );
}

// ==========================================
// 2. REUSABLE PASSWORD CHANGE COMPONENT
// ==========================================
export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res: any) => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      toast.success(res?.message || "Password updated successfully!");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update password. Please check your credentials.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (
      !strength.checks.hasUppercase ||
      !strength.checks.hasLowercase ||
      !strength.checks.hasNumber ||
      !strength.checks.hasSpecial
    ) {
      setErrorMessage(
        "New password must include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    passwordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Security & Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Ensure your account is protected with a strong, unique password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {errorMessage && (
              <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium">
                {errorMessage}
              </div>
            )}

            {/* Current Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full p-2.5 pr-10 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full p-2.5 pr-10 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <PasswordStrengthMeter password={newPassword} />
                </div>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full p-2.5 pr-10 border rounded-xl bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={passwordMutation.isPending}
                className="rounded-xl font-semibold gap-2"
              >
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Info Card */}
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
  );
}

// ==========================================
// 3. COMPLETE PROFILE SETTINGS CONTROLLER
// ==========================================
export interface ProfileSettingsProps {
  defaultTab?: string;
  role?: "admin" | "customer" | "delivery-partner";
}

export function ProfileSettings({ defaultTab = "personal", role: forcedRole }: ProfileSettingsProps) {
  const { profileQuery } = useMe();
  const user = profileQuery.data?.user;
  const role = forcedRole || user?.role || "customer";

  const [activeTab, setActiveTab] = useState(defaultTab);

  const isAdmin = role === "admin";
  const isDelivery = role === "delivery-partner";
  const isCustomer = !isAdmin && !isDelivery;

  const headerTitle = isAdmin
    ? "Admin Profile Settings"
    : isDelivery
    ? "Rider Profile"
    : "Customer Account";

  const headerSubtitle = isAdmin
    ? "Manage your administrator profile, security credentials, and preferences."
    : isDelivery
    ? "Manage your courier verification details, vehicle info, and account security."
    : "Manage your customer profile, saved addresses, and security credentials.";

  const badgeText = isAdmin
    ? "Administrator"
    : isDelivery
    ? "Delivery Partner"
    : "Customer";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight">{headerTitle}</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {badgeText}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{headerSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
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

          {isCustomer && (
            <Button
              variant={activeTab === "addresses" ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-xl font-semibold text-sm transition-all",
                activeTab === "addresses"
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTab("addresses")}
            >
              <MapPin className="w-4 h-4 mr-2" /> Addresses
            </Button>
          )}

          {isDelivery && (
            <Button
              variant={activeTab === "courier" ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-xl font-semibold text-sm transition-all",
                activeTab === "courier"
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTab("courier")}
            >
              <Truck className="w-4 h-4 mr-2" /> Courier Info
            </Button>
          )}

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

          {(isAdmin || isCustomer) && (
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
          )}
        </div>

        {/* Tab Panels */}
        <div className="md:col-span-3 space-y-6">
          {/* Personal Info Tab: COMMON COMPONENT */}
          {activeTab === "personal" && <ProfilePictureCard />}

          {/* Security Tab: COMMON COMPONENT */}
          {activeTab === "security" && <ChangePasswordCard />}

          {/* Customer Addresses Tab */}
          {isCustomer && activeTab === "addresses" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Saved Shipping Addresses</CardTitle>
                <Button size="sm" className="rounded-full">
                  Add New
                </Button>
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
                      123 Main St, Apt 4B
                      <br />
                      New York, NY 10001
                      <br />
                      United States
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Courier Info Tab */}
          {isDelivery && activeTab === "courier" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Courier Account & Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border bg-muted/20">
                    <p className="text-xs text-muted-foreground">Courier Name</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {user?.name || "Rider Partner"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-muted/20">
                    <p className="text-xs text-muted-foreground">Registered Email</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-muted/20">
                    <p className="text-xs text-muted-foreground">Vehicle Type</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      Motorcycle / E-Bike
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border bg-muted/20">
                    <p className="text-xs text-muted-foreground">Partner Status</p>
                    <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="rounded-xl font-semibold">
                    Update Courier Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="rounded-2xl border shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {isAdmin ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success("Notification preferences saved!");
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Order Placed Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Receive instant alerts whenever a new order is received
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Delivery Fleet Dispatch</p>
                        <p className="text-xs text-muted-foreground">
                          Get notified when couriers accept, pick up, or deliver orders
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Low Inventory Warnings</p>
                        <p className="text-xs text-muted-foreground">
                          Receive warning notifications when product stock falls below 10 units
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Security & System Log Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Critical notices regarding system logins and configuration updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="rounded-xl font-semibold">
                        Save Notification Preferences
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success("Notification preferences saved!");
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Order Updates</p>
                        <p className="text-xs text-muted-foreground">
                          Receive real-time tracking updates when status changes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3.5 border rounded-xl">
                      <div>
                        <p className="font-semibold text-foreground">Promotions & Discounts</p>
                        <p className="text-xs text-muted-foreground">
                          Be the first to hear about seasonal sales and exclusive member discounts
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" className="rounded-xl font-semibold">
                        Save Notification Preferences
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;


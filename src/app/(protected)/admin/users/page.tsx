"use client";

import { useState } from "react";
import {
  Users,
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  Bike,
  MapPin,
  Star,
  CheckCircle,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  CreditCard,
  Landmark,
  HeartPulse,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getInitials, cn } from "@/lib/utils";
import { AddDeliveryPartnerModal } from "./AddDeliveryPartnerModal";
import type { DeliveryPartner, CustomerUser } from "@/lib/validations/delivery-partner";

const initialCustomers: CustomerUser[] = [
  {
    id: "c1",
    name: "Alice Freeman",
    email: "alice@example.com",
    phone: "+1 (555) 234-5678",
    city: "Manhattan, NY",
    totalOrders: 4,
    spent: 840,
    status: "active",
    joinedDate: "Oct 2023",
  },
  {
    id: "c2",
    name: "David Kim",
    email: "david@example.com",
    phone: "+1 (555) 876-5432",
    city: "Brooklyn, NY",
    totalOrders: 2,
    spent: 320,
    status: "active",
    joinedDate: "Sep 2023",
  },
  {
    id: "c3",
    name: "Sophia Zhang",
    email: "sophia@example.com",
    phone: "+1 (555) 432-1098",
    city: "Queens, NY",
    totalOrders: 7,
    spent: 1450,
    status: "active",
    joinedDate: "Nov 2023",
  },
  {
    id: "c4",
    name: "Marcus Vance",
    email: "marcus.v@example.com",
    phone: "+1 (555) 654-3210",
    city: "Jersey City, NJ",
    totalOrders: 11,
    spent: 2890,
    status: "active",
    joinedDate: "Jan 2024",
  },
  {
    id: "c5",
    name: "Elena Rostova",
    email: "elena.r@example.com",
    phone: "+1 (555) 987-6543",
    city: "Bronx, NY",
    totalOrders: 3,
    spent: 510,
    status: "active",
    joinedDate: "Feb 2024",
  },
];

const initialDeliveryPartners: DeliveryPartner[] = [
  {
    id: "dp-1",
    name: "Alex Rivera",
    email: "alex.rider@fastdrop.com",
    phone: "+1 (555) 345-6789",
    aadharNumber: "5421 9802 3412",
    vehicleName: "Honda Shine",
    vehicleNumber: "NY-8429",
    licenseNumber: "DL-90214",
    bankName: "HDFC Bank",
    accountNumber: "50100429182341",
    ifscCode: "HDFC0001234",
    emergencyContactName: "Priya Rivera (Spouse)",
    emergencyContactPhone: "+1 (555) 999-1122",
    status: "active",
    completedDeliveries: 184,
    rating: 4.9,
    joinedDate: "Aug 2023",
  },
  {
    id: "dp-2",
    name: "Brian Chen",
    email: "brian.c@fastdrop.com",
    phone: "+1 (555) 789-0123",
    aadharNumber: "7812 3490 1256",
    vehicleName: "Yamaha FZ-S",
    vehicleNumber: "NY-2041",
    licenseNumber: "DL-45129",
    bankName: "Axis Bank",
    accountNumber: "91802004512988",
    ifscCode: "UTIB0000456",
    emergencyContactName: "Mei Chen (Mother)",
    emergencyContactPhone: "+1 (555) 999-3344",
    status: "active",
    completedDeliveries: 92,
    rating: 4.8,
    joinedDate: "Oct 2023",
  },
  {
    id: "dp-3",
    name: "Samantha Miller",
    email: "sam.miller@fastdrop.com",
    phone: "+1 (555) 210-9876",
    aadharNumber: "9012 4589 6723",
    vehicleName: "Bajaj Pulsar 150",
    vehicleNumber: "NY-5510",
    licenseNumber: "DL-33812",
    bankName: "ICICI Bank",
    accountNumber: "001205008921",
    ifscCode: "ICIC0000012",
    emergencyContactName: "John Miller (Father)",
    emergencyContactPhone: "+1 (555) 999-5566",
    status: "active",
    completedDeliveries: 310,
    rating: 5.0,
    joinedDate: "Jun 2023",
  },
  {
    id: "dp-4",
    name: "Carlos Gomez",
    email: "carlos.g@fastdrop.com",
    phone: "+1 (555) 678-9012",
    aadharNumber: "3489 1278 9034",
    vehicleName: "Hero Splendor Plus",
    vehicleNumber: "NY-7740",
    licenseNumber: "ID-77401",
    bankName: "State Bank of India",
    accountNumber: "308912789034",
    ifscCode: "SBIN0004512",
    emergencyContactName: "Rosa Gomez (Sister)",
    emergencyContactPhone: "+1 (555) 999-7788",
    status: "inactive",
    completedDeliveries: 67,
    rating: 4.7,
    joinedDate: "Dec 2023",
  },
];

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"customers" | "delivery">("customers");
  const [customerViewMode, setCustomerViewMode] = useState<"card" | "table">("card");
  const [partnerViewMode, setPartnerViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers] = useState<CustomerUser[]>(initialCustomers);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(initialDeliveryPartners);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePartnerAdded = (newPartner: DeliveryPartner) => {
    setDeliveryPartners((prev) => [newPartner, ...prev]);
  };

  // Filtered lists
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPartners = deliveryPartners.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.aadharNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ifscCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.emergencyContactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRidersCount = deliveryPartners.filter((p) => p.status === "active").length;
  const totalCustomerSpend = customers.reduce((acc, c) => acc + c.spent, 0);

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

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Customers</p>
              <p className="text-xl font-bold tracking-tight">{customers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fleet Partners</p>
              <p className="text-xl font-bold tracking-tight">{deliveryPartners.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Couriers</p>
              <p className="text-xl font-bold tracking-tight">
                {activeRidersCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">on duty</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Customer Spend</p>
              <p className="text-xl font-bold tracking-tight">${totalCustomerSpend.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
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
            <span
              className={cn(
                "text-[11px] px-1.5 py-0.2 rounded-full transition-colors",
                activeTab === "customers"
                  ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                  : "bg-muted-foreground/15 text-muted-foreground"
              )}
            >
              {customers.length}
            </span>
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
            <span
              className={cn(
                "text-[11px] px-1.5 py-0.2 rounded-full transition-colors",
                activeTab === "delivery"
                  ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                  : "bg-muted-foreground/15 text-muted-foreground"
              )}
            >
              {deliveryPartners.length}
            </span>
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
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Subheader with View Switcher (Card View vs Table View) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Showing registered customer directory and transaction records.
            </p>

            <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60 w-fit self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCustomerViewMode("card")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  customerViewMode === "card"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  customerViewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <Card className="rounded-2xl border text-center py-12">
              <CardContent className="space-y-3">
                <Users className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
                <h3 className="font-semibold text-base">No customers found</h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          ) : customerViewMode === "card" ? (
            /* Customer Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className="rounded-2xl border border-border/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            {customer.city}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {customer.joinedDate}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{customer.phone}</span>
                      </p>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Total Orders</p>
                        <p className="font-bold text-foreground text-sm flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                          {customer.totalOrders}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Lifetime Spent</p>
                        <p className="font-bold text-foreground text-sm">
                          ${customer.spent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Customer Table View */
            <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[280px]">Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead className="text-center">Total Orders</TableHead>
                    <TableHead className="text-right">Lifetime Spent</TableHead>
                    <TableHead className="text-center">Joined</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {customer.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {customer.city}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-foreground font-medium">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{customer.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{customer.phone}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                          <ShoppingBag className="w-3 h-3" />
                          {customer.totalOrders}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-foreground">
                        ${customer.spent.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground font-medium">
                        {customer.joinedDate}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Delivery Partner View */}
      {activeTab === "delivery" && (
        <div className="space-y-4">
          {/* Subheader with View Switcher & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing active delivery partners and payout credentials.
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Card / Table Switcher */}
              <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setPartnerViewMode("card")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    partnerViewMode === "card"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Card View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerViewMode("table")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    partnerViewMode === "table"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Table View"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
              </div>

              {/* Add Delivery Partner Button */}
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-1.5 rounded-xl text-xs h-8 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Delivery Partner</span>
              </Button>
            </div>
          </div>

          {filteredPartners.length === 0 ? (
            <Card className="rounded-2xl border text-center py-12">
              <CardContent className="space-y-3">
                <Truck className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
                <h3 className="font-semibold text-base">No delivery partners found</h3>
                <p className="text-xs text-muted-foreground">
                  Get started by adding a new delivery partner to your fleet.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-xl gap-1.5 mt-2"
                >
                  <Plus className="w-4 h-4" /> Add Delivery Partner
                </Button>
              </CardContent>
            </Card>
          ) : partnerViewMode === "card" ? (
            /* Delivery Partner Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPartners.map((partner) => {
                const isOnline = partner.status === "active";

                return (
                  <Card
                    key={partner.id}
                    className="rounded-2xl border border-border/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {getInitials(partner.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-base text-foreground truncate">
                                {partner.name}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isOnline
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isOnline ? "bg-emerald-500" : "bg-zinc-400"
                                  }`}
                                />
                                {isOnline ? "On Duty" : "Offline"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {partner.phone}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{partner.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                        <p className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{partner.email}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{partner.phone}</span>
                        </p>
                      </div>

                      {/* Vehicle & Identity Info */}
                      <div className="bg-muted/40 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Vehicle Name</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <Bike className="w-3 h-3" />
                              {partner.vehicleName}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-foreground mt-1 truncate">
                            Plate: {partner.vehicleNumber}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">Aadhaar Card No.</p>
                          <p className="font-semibold text-foreground mt-0.5 truncate tracking-wide">
                            {partner.aadharNumber}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            DL: <span className="font-medium text-foreground">{partner.licenseNumber}</span>
                          </p>
                        </div>
                      </div>

                      {/* Payout & Emergency Contact Snippet */}
                      <div className="p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-primary" />
                            Bank Payout
                          </span>
                          <span className="font-semibold text-foreground">
                            {partner.bankName} • A/C: ••••{partner.accountNumber.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-1.5">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                            Emergency
                          </span>
                          <span className="text-foreground truncate max-w-[200px]" title={`${partner.emergencyContactName} (${partner.emergencyContactPhone})`}>
                            {partner.emergencyContactName} • {partner.emergencyContactPhone}
                          </span>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                        <span>Joined: {partner.joinedDate}</span>
                        <span className="font-medium text-foreground">
                          {partner.completedDeliveries} completed deliveries
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Delivery Partner Table View */
            <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[240px]">Courier</TableHead>
                    <TableHead>Vehicle & Plate</TableHead>
                    <TableHead>Government IDs</TableHead>
                    <TableHead>Bank Account & IFSC</TableHead>
                    <TableHead>Emergency Contact</TableHead>
                    <TableHead className="text-center">Deliveries</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => {
                    const isOnline = partner.status === "active";

                    return (
                      <TableRow key={partner.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {getInitials(partner.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {partner.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {partner.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <Bike className="w-3 h-3" />
                              {partner.vehicleName}
                            </span>
                            <p className="font-semibold text-foreground">{partner.vehicleNumber}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <p className="text-foreground font-medium flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                              {partner.aadharNumber}
                            </p>
                            <p className="text-[11px] text-muted-foreground">DL: {partner.licenseNumber}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <p className="font-medium text-foreground flex items-center gap-1.5">
                              <Landmark className="w-3.5 h-3.5 text-primary shrink-0" />
                              {partner.bankName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              A/C: {partner.accountNumber}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono">
                              IFSC: {partner.ifscCode}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <p className="font-medium text-foreground flex items-center gap-1">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                              {partner.emergencyContactName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{partner.emergencyContactPhone}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-center font-bold text-sm text-foreground">
                          {partner.completedDeliveries}
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            {partner.rating.toFixed(1)}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              isOnline
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? "bg-emerald-500" : "bg-zinc-400"
                              }`}
                            />
                            {isOnline ? "On Duty" : "Offline"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* Add Delivery Partner Modal */}
      <AddDeliveryPartnerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onPartnerAdded={handlePartnerAdded}
      />
    </div>
  );
}

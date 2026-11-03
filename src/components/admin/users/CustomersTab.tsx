"use client";

import { useState } from "react";
import {
  Users,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getInitials, cn } from "@/lib/utils";
import type { CustomerUser } from "@/lib/validations/delivery-partner";

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

export function CustomersTab() {
  const [customerViewMode, setCustomerViewMode] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers] = useState<CustomerUser[]>(initialCustomers);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing registered customer directory and transaction records.
        </p>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60">
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
  );
}

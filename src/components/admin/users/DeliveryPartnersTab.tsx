"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Truck,
  Plus,
  Mail,
  Phone,
  Bike,
  MapPin,
  Star,
  CreditCard,
  Landmark,
  HeartPulse,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Calendar,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
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
import { useQuery } from "@tanstack/react-query";
import { getDeliveryPartners } from "@/lib/client-api/admin";
import { queryKeys } from "@/constants/query-key";
import type { DeliveryPartnerUserItem } from "@/lib/client-api/admin/types";

function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Recently";
  }
}

export function DeliveryPartnersTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [partnerViewMode, setPartnerViewMode] = useState<"card" | "table">("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const limit = 10;

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        updateParams({ search: searchInput || null, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, updateParams]);

  const handleClearFilters = () => {
    setSearchInput("");
    updateParams({
      search: null,
      startDate: null,
      endDate: null,
      page: 1,
    });
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [queryKeys.deliveryPartners, { page, limit, search: urlSearch, startDate, endDate }],
    queryFn: () =>
      getDeliveryPartners({
        role: "delivery-partner",
        page,
        limit,
        search: urlSearch,
        startDate,
        endDate,
      }),
  });

  const rawList = data?.data?.data ?? (data?.data as unknown as DeliveryPartnerUserItem[]) ?? [];
  const deliveryPartners: DeliveryPartnerUserItem[] = Array.isArray(rawList) ? rawList : [];

  const meta = data?.meta ?? {
    page,
    limit,
    total: deliveryPartners.length,
    totalPages: Math.max(1, Math.ceil(deliveryPartners.length / limit)),
  };

  const onDutyCount = deliveryPartners.filter(
    (p) => p.deliveryPartner?.duty_status === "on-duty"
  ).length;

  const hasActiveFilters = Boolean(urlSearch || startDate || endDate);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="rounded-xl border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total In Fleet</p>
              <p className="text-lg font-bold tracking-tight">{meta.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">On Duty (Page)</p>
              <p className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {onDutyCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-2xs col-span-2 sm:col-span-1">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Offline (Page)</p>
              <p className="text-lg font-bold tracking-tight">
                {Math.max(0, deliveryPartners.length - onDutyCount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 bg-muted/30 border border-border/60 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs flex-1">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courier, vehicle, city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: null, page: 1 });
                }}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground font-medium pl-1">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Joined:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              onChange={(e) =>
                updateParams({ startDate: e.target.value || null, page: 1 })
              }
              className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={(e) =>
                updateParams({ endDate: e.target.value || null, page: 1 })
              }
              className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          )}

          {isFetching && !isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />
          )}
        </div>

        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
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

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5 rounded-xl text-xs h-8 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Partner</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <Card
              key={idx}
              className="rounded-2xl border border-border/80 shadow-xs p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
              <div className="h-10 bg-muted/50 rounded-xl" />
              <div className="h-16 bg-muted/40 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 text-center py-10">
          <CardContent className="space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h3 className="font-semibold text-base text-destructive">
              Failed to load delivery partners
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {(error as Error)?.message || "An unexpected error occurred while fetching delivery partners."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 rounded-xl text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </CardContent>
        </Card>
      ) : deliveryPartners.length === 0 ? (
        <Card className="rounded-2xl border text-center py-12">
          <CardContent className="space-y-3">
            <Truck className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
            <h3 className="font-semibold text-base">
              {hasActiveFilters ? "No matching delivery partners" : "No delivery partners found"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "Get started by adding a new delivery partner to your fleet."}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="rounded-xl text-xs"
                >
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Delivery Partner
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : partnerViewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryPartners.map((partner) => {
            const dp = partner.deliveryPartner;
            const displayName = partner.name || partner.email.split("@")[0] || "Delivery Partner";
            const isOnline = dp?.duty_status === "on-duty";
            const rating = dp?.total_ratings || 5.0;
            const fullAddress = dp?.address?.address || "Address not provided";
            const cityPin = [dp?.address?.city, dp?.address?.pin_code].filter(Boolean).join(" - ");

            return (
              <Card
                key={partner._id || partner.id}
                className="rounded-2xl border border-border/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base text-foreground truncate">
                            {displayName}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              isOnline
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isOnline ? "bg-emerald-500" : "bg-zinc-400"
                              )}
                            />
                            {isOnline ? "On Duty" : "Offline"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {partner.phone || "No phone"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{Number(rating).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{partner.email}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{partner.phone || "N/A"}</span>
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {fullAddress}
                      {cityPin ? `, ${cityPin}` : ""}
                    </span>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Vehicle Name</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Bike className="w-3 h-3" />
                          {dp?.vehicle_name || "N/A"}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground mt-1 truncate">
                        Plate: {dp?.vehicle_number || "N/A"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Aadhaar Card No.</p>
                      <p className="font-semibold text-foreground mt-0.5 truncate tracking-wide">
                        {dp?.aadhar_number || "N/A"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        DL: <span className="font-medium text-foreground">{dp?.license_number || "N/A"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-primary" />
                        Bank Payout
                      </span>
                      <span className="font-semibold text-foreground">
                        {dp?.bank_name || "Bank"} • A/C: ••••
                        {dp?.account_number ? dp.account_number.slice(-4) : "••••"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-1.5">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                        Emergency
                      </span>
                      <span
                        className="text-foreground truncate max-w-[200px]"
                        title={`${dp?.emergency_contact_name || "N/A"} (${dp?.emergency_contact_phone || "N/A"})`}
                      >
                        {dp?.emergency_contact_name || "N/A"} • {dp?.emergency_contact_phone || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span>Joined: {formatJoinedDate(partner.createdAt)}</span>
                    <span className="font-medium text-foreground">
                      {dp?.completed_deliveries ?? 0} completed deliveries
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[220px]">Courier</TableHead>
                <TableHead>Address & Hub</TableHead>
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
              {deliveryPartners.map((partner) => {
                const dp = partner.deliveryPartner;
                const displayName = partner.name || partner.email.split("@")[0] || "Delivery Partner";
                const isOnline = dp?.duty_status === "on-duty";
                const rating = dp?.total_ratings || 5.0;

                return (
                  <TableRow key={partner._id || partner.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {getInitials(displayName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {partner.phone || partner.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs max-w-[200px]">
                        <p
                          className="font-medium text-foreground flex items-center gap-1.5 truncate"
                          title={dp?.address?.address}
                        >
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{dp?.address?.address || "N/A"}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate pl-5">
                          {[dp?.address?.city, dp?.address?.pin_code].filter(Boolean).join(" - ") || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Bike className="w-3 h-3" />
                          {dp?.vehicle_name || "N/A"}
                        </span>
                        <p className="font-semibold text-foreground">{dp?.vehicle_number || "N/A"}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <p className="text-foreground font-medium flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          {dp?.aadhar_number || "N/A"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">DL: {dp?.license_number || "N/A"}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-primary shrink-0" />
                          {dp?.bank_name || "N/A"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          A/C: {dp?.account_number || "N/A"}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-mono">
                          IFSC: {dp?.ifsc_code || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                          {dp?.emergency_contact_name || "N/A"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {dp?.emergency_contact_phone || "N/A"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-bold text-sm text-foreground">
                      {dp?.completed_deliveries ?? 0}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {Number(rating).toFixed(1)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                          isOnline
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isOnline ? "bg-emerald-500" : "bg-zinc-400"
                          )}
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

      {meta.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(meta.page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(meta.page * limit, meta.total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{meta.total}</span> partners
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isFetching}
              onClick={() => updateParams({ page: meta.page - 1 })}
              className="h-8 px-2.5 text-xs rounded-lg gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === meta.totalPages ||
                    Math.abs(p - meta.page) <= 1
                )
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-1 text-xs text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={p === meta.page ? "default" : "outline"}
                        size="sm"
                        disabled={isFetching}
                        onClick={() => updateParams({ page: p })}
                        className={cn(
                          "w-8 h-8 p-0 text-xs rounded-lg",
                          p === meta.page && "font-bold"
                        )}
                      >
                        {p}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isFetching}
              onClick={() => updateParams({ page: meta.page + 1 })}
              className="h-8 px-2.5 text-xs rounded-lg gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <AddDeliveryPartnerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
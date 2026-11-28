import type { OrderStatus } from "@/models/order.model";
import { DUTY_STATUS_CONFIG } from "@/constants/delivery";

export function formatCurrency(amount: number, currency: string = "inr"): string {
  const isInr = currency?.toLowerCase() === "inr";
  const symbol = isInr ? "₹" : "$";
  const locale = isInr ? "en-IN" : "en-US";
  const formatted = Number(amount || 0).toLocaleString(locale, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, currency: string = "inr"): string {
  const isInr = currency?.toLowerCase() === "inr";
  const symbol = isInr ? "₹" : "$";
  const val = Number(amount || 0);

  if (isInr) {
    if (val >= 10000000) return `${symbol}${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${symbol}${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(1)}k`;
    return `${symbol}${Math.round(val)}`;
  }

  if (val >= 1000000) return `${symbol}${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${symbol}${(val / 1000).toFixed(1)}k`;
  return `${symbol}${Math.round(val)}`;
}

export const ORDER_STATUS_STYLE_MAP: Record<
  OrderStatus,
  { label: string; badgeClass: string; chartColor: string }
> = {
  pending: {
    label: "Pending",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    chartColor: "#f59e0b",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
    chartColor: "#3b82f6",
  },
  processing: {
    label: "Processing",
    badgeClass:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
    chartColor: "#6366f1",
  },
  shipped: {
    label: "Shipped",
    badgeClass:
      "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
    chartColor: "#8b5cf6",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    badgeClass:
      "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200 dark:border-sky-800/60",
    chartColor: "#0ea5e9",
  },
  delivered: {
    label: "Delivered",
    badgeClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    chartColor: "#10b981",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass:
      "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800/60",
    chartColor: "#ef4444",
  },
  returned: {
    label: "Returned",
    badgeClass:
      "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-800/60",
    chartColor: "#f97316",
  },
};

export const DUTY_STATUS_STYLE_MAP = DUTY_STATUS_CONFIG;

import type { OrderStatus } from "@/models/order.model";

export const DELIVERY_PAYOUT_PER_ORDER_INR = 50;

export type DutyStatus = "on-duty" | "in-delivery" | "off-duty";

export const DUTY_STATUS_CONFIG: Record<
  DutyStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  "on-duty": {
    label: "On Duty",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60",
  },
  "in-delivery": {
    label: "In Delivery",
    dotClass: "bg-sky-500",
    badgeClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60",
  },
  "off-duty": {
    label: "Off Duty",
    dotClass: "bg-zinc-400",
    badgeClass:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800",
  },
};

export function getDutyStatusConfig(status?: string | null) {
  if (status === "on-duty" || status === "in-delivery" || status === "off-duty") {
    return DUTY_STATUS_CONFIG[status];
  }
  return DUTY_STATUS_CONFIG["off-duty"];
}

export const RIDER_NEXT_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  shipped: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

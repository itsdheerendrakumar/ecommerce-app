import instance from "./axios";
import type { OrderStatus } from "@/models/order.model";
import type { IAdminOrder } from "./admin/order";
import type { DutyStatus } from "@/constants/delivery";

export { getOrderItemImages } from "./admin/order";
export type {
  IAdminOrderItem as IDeliveryOrderItem,
  IAdminOrderAddress as IDeliveryOrderAddress,
  ResolvedOrderItemImage,
} from "./admin/order";

export type IDeliveryOrder = Omit<IAdminOrder, "delivery_partner_id"> & {
  delivery_partner_id?: string | IAdminOrder["delivery_partner_id"];
};

export interface IDeliveryCompletedOrderSummary {
  _id: string;
  order_number: string;
  recipient_name: string;
  city: string;
  pin_code: string;
  items_count: number;
  order_total: number;
  currency: string;
  delivered_at: string | null;
  payout_amount: number;
}

export interface IDeliveryStats {
  dutyStatus: DutyStatus;
  vehicle: {
    name: string;
    number: string;
  };
  operatingCity: string;
  totalRatings: number;
  readyForPickupCount: number;
  inTransitCount: number;
  deliveredTodayCount: number;
  deliveredWeekCount: number;
  deliveredMonthCount: number;
  totalDeliveredCount: number;
  payoutPerDelivery: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  recentCompletedOrders: IDeliveryCompletedOrderSummary[];
}

export interface GetDeliveryOrdersParams {
  scope?: "active" | "history";
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetDeliveryOrdersResponse {
  message: string;
  data?: {
    data: IDeliveryOrder[];
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetDeliveryStatsResponse {
  message: string;
  data?: {
    data: IDeliveryStats;
  };
}

export interface UpdateDeliveryStatusResponse {
  message: string;
  data?: {
    data: {
      order: IDeliveryOrder;
      duty_status: DutyStatus | null;
    };
  };
}

export interface UpdateDutyStatusResponse {
  message: string;
  data?: {
    data: {
      duty_status: DutyStatus;
    };
  };
}

export async function getDeliveryOrdersApi(
  params: GetDeliveryOrdersParams = {}
): Promise<GetDeliveryOrdersResponse> {
  const query = new URLSearchParams();
  if (params.scope) query.set("scope", params.scope);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  const url = queryString ? `/delivery/orders?${queryString}` : "/delivery/orders";
  const response = await instance.get<GetDeliveryOrdersResponse>(url);
  return response.data;
}

export async function updateDeliveryOrderStatusApi(
  orderId: string,
  status: Extract<OrderStatus, "out_for_delivery" | "delivered">
): Promise<UpdateDeliveryStatusResponse> {
  const response = await instance.patch<UpdateDeliveryStatusResponse>(
    `/delivery/orders/${orderId}/status`,
    { status }
  );
  return response.data;
}

export async function getDeliveryStatsApi(): Promise<GetDeliveryStatsResponse> {
  const response = await instance.get<GetDeliveryStatsResponse>("/delivery/stats");
  return response.data;
}

export async function updateDeliveryDutyStatusApi(
  duty_status: "on-duty" | "off-duty"
): Promise<UpdateDutyStatusResponse> {
  const response = await instance.patch<UpdateDutyStatusResponse>(
    "/delivery/duty-status",
    { duty_status }
  );
  return response.data;
}

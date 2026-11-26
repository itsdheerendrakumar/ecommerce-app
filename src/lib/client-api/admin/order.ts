import instance from "../axios";
import type { OrderStatus, PaymentStatus } from "@/models/order.model";

export interface IAdminProductImage {
  publicId?: string;
  secureUrl: string;
  isPrimary?: boolean;
  position?: number;
}

export interface IAdminPopulatedProduct {
  _id: string;
  name?: string;
  category?: string;
  images?: IAdminProductImage[];
}

export interface IAdminOrderItem {
  product_id: string | IAdminPopulatedProduct | null;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface ResolvedOrderItemImage {
  url: string;
  isPrimary: boolean;
}

export function getOrderItemImages(item: IAdminOrderItem): ResolvedOrderItemImage[] {
  const seen = new Set<string>();
  const resolved: ResolvedOrderItemImage[] = [];

  const populated =
    item.product_id && typeof item.product_id === "object" ? item.product_id : null;

  if (populated?.images && populated.images.length > 0) {
    const sorted = [...populated.images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.position ?? 0) - (b.position ?? 0);
    });

    for (const img of sorted) {
      if (img.secureUrl && !seen.has(img.secureUrl)) {
        seen.add(img.secureUrl);
        resolved.push({
          url: img.secureUrl,
          isPrimary: Boolean(img.isPrimary),
        });
      }
    }
  }

  if (item.image && !seen.has(item.image)) {
    seen.add(item.image);
    resolved.unshift({
      url: item.image,
      isPrimary: resolved.length === 0,
    });
  }

  return resolved;
}

export interface IAdminOrderAddress {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pin_code: string;
}

export interface IAdminOrderPricing {
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total_amount: number;
}

export interface IAdminDeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
}

export interface IAdminCustomerUser {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
}

export interface IAdminOrder {
  _id: string;
  order_number: string;
  user_id?: IAdminCustomerUser | string;
  customer_email: string;
  customer_phone?: string;
  items: IAdminOrderItem[];
  shipping_address: IAdminOrderAddress;
  billing_address?: IAdminOrderAddress;
  pricing: IAdminOrderPricing;
  currency: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: "stripe" | "cod";
  delivery_partner_id?: IAdminDeliveryPartner;
  stripe_payment_intent_id?: string;
  notes?: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingFulfillment: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

export interface GetAdminOrdersParams {
  search?: string;
  order_status?: string;
  payment_status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminOrdersResponse {
  message: string;
  data?: {
    data: IAdminOrder[];
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    stats: AdminOrderStats;
  };
}

export interface GetAdminOrderDetailResponse {
  message: string;
  data?: {
    data: IAdminOrder & {
      payment?: {
        stripe_payment_intent_id: string;
        stripe_charge_id?: string;
        amount: number;
        amount_received: number;
        currency: string;
        status: string;
        payment_method_type?: string;
        card_details?: {
          brand?: string;
          last4?: string;
          exp_month?: number;
          exp_year?: number;
        };
        receipt_url?: string;
        failure_code?: string;
        failure_message?: string;
      };
    };
  };
}

export async function getAdminOrdersApi(
  params: GetAdminOrdersParams = {}
): Promise<GetAdminOrdersResponse> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.order_status && params.order_status !== "all") query.set("order_status", params.order_status);
  if (params.payment_status && params.payment_status !== "all") query.set("payment_status", params.payment_status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const queryString = query.toString();
  const url = queryString ? `/admin/orders?${queryString}` : "/admin/orders";
  const response = await instance.get<GetAdminOrdersResponse>(url);
  return response.data;
}

export async function getAdminOrderDetailApi(orderId: string): Promise<GetAdminOrderDetailResponse> {
  const response = await instance.get<GetAdminOrderDetailResponse>(`/admin/orders/${orderId}`);
  return response.data;
}

export async function updateAdminOrderStatusApi(
  orderId: string,
  status: OrderStatus,
  cancel_reason?: string
): Promise<{ message: string; data?: { data: IAdminOrder } }> {
  const response = await instance.patch(`/admin/orders/${orderId}/status`, {
    status,
    cancel_reason,
  });
  return response.data;
}

export async function assignDeliveryPartnerApi(
  orderId: string,
  delivery_partner_id: string
): Promise<{ message: string; data?: { data: IAdminOrder } }> {
  const response = await instance.patch(`/admin/orders/${orderId}/assign`, {
    delivery_partner_id,
  });
  return response.data;
}

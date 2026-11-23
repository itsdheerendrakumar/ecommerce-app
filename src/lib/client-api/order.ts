import instance from "./axios";

export interface ICustomerOrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface ICustomerOrderAddress {
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pin_code: string;
}

export interface ICustomerOrderPricing {
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total_amount: number;
}

export interface ICustomerOrder {
  _id: string;
  order_number: string;
  user_id: string;
  customer_email: string;
  customer_phone?: string;
  items: ICustomerOrderItem[];
  shipping_address: ICustomerOrderAddress;
  pricing: ICustomerOrderPricing;
  currency: string;
  order_status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned";
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  payment_method: "stripe" | "cod";
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomerOrdersResponse {
  message: string;
  data?: {
    data: ICustomerOrder[];
  };
}

export async function getCustomerOrdersApi(): Promise<GetCustomerOrdersResponse> {
  const response = await instance.get<GetCustomerOrdersResponse>("/customer/orders");
  return response.data;
}

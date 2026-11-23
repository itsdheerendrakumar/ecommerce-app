import instance from "./axios";
import type { CreatePaymentIntentInput } from "@/lib/validations/checkout";

export interface PaymentIntentData {
  client_secret: string;
  order_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
}

export interface CreatePaymentIntentResponse {
  message: string;
  data?: {
    data: PaymentIntentData;
  };
}

export async function createPaymentIntentApi(
  payload: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResponse> {
  const response = await instance.post<CreatePaymentIntentResponse>(
    "/checkout/create-payment-intent",
    payload
  );
  return response.data;
}

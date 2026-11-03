import { deliveryPartnerSchema } from "@/lib/validations/delivery-partner";
import * as z from "zod";

export type DeliveryPartnerFormData = z.infer<typeof deliveryPartnerSchema>;

export interface IDeliveryPartnerAddress {
  address: string;
  city: string;
  pin_code: string;
}

export interface IDeliveryPartnerProfile {
  _id: string;
  user_id: string;
  address: IDeliveryPartnerAddress;
  vehicle_name: string;
  vehicle_number: string;
  aadhar_number: string;
  license_number: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  duty_status: "on-duty" | "off-duty" | "in-delivery";
  completed_deliveries?: number;
  total_ratings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryPartnerUserItem {
  _id: string;
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  dob?: string;
  role: "delivery-partner" | "customer" | "admin";
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deliveryPartner?: IDeliveryPartnerProfile | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetDeliveryPartnersResponse {
  message: string;
  data?: {
    data: DeliveryPartnerUserItem[];
  };
  meta?: PaginationMeta;
}

export interface GetDeliveryPartnersParams {
  role?: "customer" | "delivery-partner";
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

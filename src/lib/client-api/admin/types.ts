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

export interface GetDeliveryPartnerDetailResponse {
  message: string;
  data?: {
    data: DeliveryPartnerUserItem;
  };
}

export interface GetDeliveryPartnersParams {
  role?: "customer" | "delivery-partner";
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProductImageItem {
  publicId: string;
  secureUrl: string;
  isPrimary: boolean;
  position: number;
}

export interface ProductItem {
  _id: string;
  name: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  features?: string[];
  images: ProductImageItem[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDraftResponse {
  message: string;
  data?: {
    data: {
      productId: string;
      uploadSessionId: string;
      expiresAt: string;
      product: ProductItem;
    };
  };
}

export interface CloudinarySignedConfig {
  apiKey: string;
  cloudName: string;
  signature: string;
  timestamp: number;
  folder: string;
  publicId: string;
  tags?: string;
  context?: string;
}

export interface SignatureItem {
  id: string;
  signatureConfig: CloudinarySignedConfig;
}

export interface GenerateSignaturesResponse {
  message: string;
  data?: {
    data: {
      sessionId: string;
      signatures: SignatureItem[];
    };
  };
}

export interface RegisterAssetResponse {
  message: string;
  data?: {
    data: {
      publicId: string;
      secureUrl: string;
      bytes?: number;
      format?: string;
      width?: number;
      height?: number;
    };
  };
}

export interface UpdateProductImagesResponse {
  message: string;
  data?: {
    data: ProductItem;
  };
}

export interface PublishProductResponse {
  message: string;
  data?: {
    data: ProductItem;
  };
}

export interface GetAdminProductsResponse {
  message: string;
  data?: {
    data: ProductItem[];
  };
}

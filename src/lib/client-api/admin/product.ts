import axios from "axios";
import instance from "../axios";
import type {
  CreateProductDraftResponse,
  GenerateSignaturesResponse,
  RegisterAssetResponse,
  UpdateProductImagesResponse,
  PublishProductResponse,
  GetAdminProductsResponse,
  CloudinarySignedConfig,
} from "./types";
import {
  CreateProductDraftInput,
  GenerateUploadSignaturesInput,
  RegisterUploadedAssetInput,
  UpdateProductImagesInput,
} from "@/lib/validations/product";

export async function createProductDraftApi(
  payload: CreateProductDraftInput
): Promise<CreateProductDraftResponse> {
  const response = await instance.post<CreateProductDraftResponse>(
    "/admin/products/draft",
    payload
  );
  return response.data;
}

export async function generateUploadSignaturesApi(
  sessionId: string,
  payload?: GenerateUploadSignaturesInput
): Promise<GenerateSignaturesResponse> {
  const response = await instance.post<GenerateSignaturesResponse>(
    `/admin/upload-sessions/${sessionId}/signatures`,
    payload || {}
  );
  return response.data;
}

export async function registerUploadedAssetApi(
  sessionId: string,
  payload: RegisterUploadedAssetInput
): Promise<RegisterAssetResponse> {
  const response = await instance.post<RegisterAssetResponse>(
    `/admin/upload-sessions/${sessionId}/assets`,
    payload
  );
  return response.data;
}

export async function updateProductImagesApi(
  productId: string,
  payload: UpdateProductImagesInput
): Promise<UpdateProductImagesResponse> {
  const response = await instance.patch<UpdateProductImagesResponse>(
    `/admin/products/${productId}/images`,
    payload
  );
  return response.data;
}

export async function publishProductApi(
  productId: string
): Promise<PublishProductResponse> {
  const response = await instance.patch<PublishProductResponse>(
    `/admin/products/${productId}/publish`
  );
  return response.data;
}

export async function getAdminProductsApi(): Promise<GetAdminProductsResponse> {
  const response = await instance.get<GetAdminProductsResponse>("/admin/products");
  return response.data;
}

export async function cleanupAbandonedUploadsApi(): Promise<{ message: string; data?: any }> {
  const response = await instance.post("/admin/upload-sessions/cleanup");
  return response.data;
}

export async function uploadDirectToCloudinary(
  file: File,
  config: CloudinarySignedConfig,
  onProgress?: (progressPercent: number) => void
): Promise<{
  public_id: string;
  secure_url: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(config.timestamp));
  formData.append("signature", config.signature);
  formData.append("folder", config.folder);
  formData.append("public_id", config.publicId);

  if (config.tags) {
    formData.append("tags", config.tags);
  }
  if (config.context) {
    formData.append("context", config.context);
  }

  const endpoint =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL ||
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  const response = await axios.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
}

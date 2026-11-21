import instance from "./axios";
import type { Product } from "@/store/useAppStore";

export interface GetProductsParams {
  category?: string;
  search?: string;
  sortBy?: string;
}

export interface GetProductsResponse {
  message: string;
  data?: {
    data: Product[];
  };
}

export interface GetProductResponse {
  message: string;
  data?: {
    data: Product;
  };
}

export async function getProductsApi(params?: GetProductsParams): Promise<GetProductsResponse> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.search && params.search.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString ? `/products?${queryString}` : "/products";
  const response = await instance.get<GetProductsResponse>(url);
  return response.data;
}

export async function getProductByIdApi(id: string): Promise<GetProductResponse> {
  const response = await instance.get<GetProductResponse>(`/products/${id}`);
  return response.data;
}

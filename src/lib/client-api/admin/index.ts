import instance from "../axios";
import type {
    DeliveryPartnerFormData,
    GetDeliveryPartnersParams,
    GetDeliveryPartnersResponse,
    GetDeliveryPartnerDetailResponse,
} from "./types";

export async function createDeliveryPartner(payload: DeliveryPartnerFormData): Promise<{ message: string }> {
    const response = await instance.post("/admin/delivery-partner", payload);
    return response.data;
}

export async function getDeliveryPartners(params: GetDeliveryPartnersParams = {}): Promise<GetDeliveryPartnersResponse> {
    const { role = "delivery-partner", page = 1, limit = 10, search, startDate, endDate } = params;

    const query = new URLSearchParams();
    query.set("role", role);
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search && search.trim()) query.set("search", search.trim());
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);

    const response = await instance.get<GetDeliveryPartnersResponse>(
        `/admin/delivery-partner?${query.toString()}`
    );
    return response.data;
}

export async function getDeliveryPartnerById(id: string): Promise<GetDeliveryPartnerDetailResponse> {
    const response = await instance.get<GetDeliveryPartnerDetailResponse>(
        `/admin/delivery-partner/${id}`
    );
    return response.data;
}

export const getDeliveryPartner = getDeliveryPartners;
export const getDeliveryPartnerDetail = getDeliveryPartnerById;

export * from "./product";
export * from "./order";

import instance from "../axios";
import type { DeliveryPartnerFormData, GetDeliveryPartnersResponse } from "./types";

export async function createDeliveryPartner(payload: DeliveryPartnerFormData): Promise<{ message: string }> {
    const response = await instance.post("/admin/delivery-partner", payload);
    return response.data;
}

export async function getDeliveryPartners(role = "delivery-partner"): Promise<GetDeliveryPartnersResponse> {
    const response = await instance.get<GetDeliveryPartnersResponse>(`/admin/delivery-partner?role=${role}`);
    return response.data;
}
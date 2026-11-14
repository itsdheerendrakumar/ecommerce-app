import instance from "../axios";
import type { ChangePasswordPayload, ChangePasswordResponse } from "./types";

export async function updateProfile(payload: FormData) {
    const response = await instance.post("/profile-picture", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const response = await instance.post<ChangePasswordResponse>("/change-password", payload);
    return response.data;
}

export * from "./types";

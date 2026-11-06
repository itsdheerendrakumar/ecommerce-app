import instance from "../axios";

export async function updateProfile(payload: FormData) {
    const response = await instance.post("/profile-picture", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
}
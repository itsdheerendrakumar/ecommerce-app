import { asyncHandler } from "@/lib/api-async-handler";
import { apiResponse } from "@/lib/api-response";
import { generateJwtToken, verifyToken } from "@/lib/jsonwebtoken";
import ApiError from "@/lib/api-error";
import { cookies } from "next/headers";

export const POST = asyncHandler(async () => {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get("refresh_token")?.value;

    if (!refresh_token) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        throw new ApiError(401, "Refresh token not found");
    }

    const decoded = verifyToken(refresh_token);
    if (!decoded) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        throw new ApiError(401, "Invalid refresh token");
    }

    const access_token = generateJwtToken(decoded.data, "accessToken");
    const mode = process.env.MODE;

    cookieStore.set({ name: "access_token", value: access_token, httpOnly: mode !== "dev" });

    return Response.json(apiResponse("Token refreshed successfully"), { status: 200 });
});
